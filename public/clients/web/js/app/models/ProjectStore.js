define(["dojo", 
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "app/store/ObservableCache",
        "dojo/store/Observable",
        "app/store/util/TaskQueryEngine",
        "dojo/date",
        "dojo/date/stamp",
        "app/models/ProjectStatus"], function(dojo, couch, mem, cache, obsCache, obs, tqe, date, stamp, pStatus) {
        //return an object to define the "./newmodule" module.
        var projStore = {
            db: "/" + djConfig.couchdb + "/",
            username: null,
            currentProject: null,
            isCurrentProjectReady: false,
            memory: null,
            observable: null,
            remote: null,
            store: null,
            isLoaded: false,
            init: function(username){
              
              //console.debug("project store initialized");
              this.username = username;
              var def = new dojo.Deferred();
              var projDef = this._loadProjects(username);
              var self = this;
              projDef.then(function(resp){
                self.isLoaded = true;
                def.callback(self);
              });
            	return def;
            },
          
            
            getUserAssignments: function(project, username){
              var store = new couch({
                target: this.db, 
                idProperty: "_id"
              });;
              
              var queryArgs = {
                view: "coordel/projectAssignments",
            		startkey: [project, username],
            		endkey: [project, username, {}],
            		include_docs: true
            	};
            	
            	return store.query(queryArgs);
            
            },
            
            loadExtendedTasks: function(project){
              //console.log("project", project);
              //use this function to get the project tasks in execution order
              //we need to load the tasks and blockers
              //if the blockers are blocked, we need to keep loading until we find an unblocked task
              //if we don't do this, the topological sort will end up with a cycle.
              
              //load the tasks
              //load the blockers
              //test the blockers to see if they have blockers and keep loading
              
              var def = new dojo.Deferred();
              var self = this;
              var funcs = [];
              var extTasks = [];
              
              
              var defList = new dojo.DeferredList([
                self._loadTasks(project),
                self._loadBlockers(project)
              ]);
              
              dojo.when(defList, function(res){
               
                extTasks = extTasks.concat(res[0][1]);
                
                var blockers = res[1][1];
      
              
                var unblocked = dojo.filter(blockers, function(b){
                  return (b.project === self.currentProject && (!b.coordinates || (b.coordinates && b.coordinates.lengh === 0)));
                });
                var defBlockReady = new dojo.Deferred();
              
                if (unblocked.length) {
                  //all is good, there is an unblocked task in the blockers and it's in this project
                  //console.log("there were unblocked tasks in this project, return the tasks");
                  defBlockReady.callback([]);
                } else {
                  //console.log("there were no unblocked tasks in this project, extend");
                  var blockerMap = {}; //this map will list the loaded blockers that have already been tested
                  var extra = []; //this array will hold the extra tasks needed to get to an unblocked task
                  var foundUnblocked = false; //this is a flag to let us know if an unblocked task has been found
                  
                  //filter for any blockers that are external to this project
                  var external = dojo.filter(blockers, function(b){
                    return b.project !== project;
                  });
                  
                  //visit each one to see if it has blockers and if it does, keep 
                  //searching until we get to a blocker that doesn't have a blocker
                  dojo.forEach(external, function(e){
                    //console.log("visit this one (e)", e.name);
                    if (!foundUnblocked){
                      funcs.push(visit(e));
                    }
                  });

                  function visit(item){
                    //deferred to return as soon as visit is called
                    var visitDef = new dojo.Deferred();
                    //array to hold any recursive visits 
                    var visitFuncs = [];
                    //so, if this task hasn't already been visited, let's give it a look
                    if (!blockerMap[item._id]){

                      //console.log("visit", item.name, item._id);
                  	  blockerMap[item._id] = true;

                      //if this one has blockers load them
                      if (item.coordinates && item.coordinates.length > 0){
                        //console.log(item.name + "had blockers");

                        //load the blocker
                        dojo.when(self.getTaskBlockers(item._id), function(get){

                          dojo.forEach(get, function(g){
                            //console.log("visit this one (g) " + g.name + " for " + item.name);
                            //visit any of this task's blockers to see if they have blockers
                            visitFuncs.push(visit(g)); 
                          });
                          if (visitFuncs.length){
                            //console.log("waiting for visited blockers " + item.name);
                            //since there were blockers we need to test them before this visit is over
                            var visitList = new dojo.DeferredList(visitFuncs);
                            dojo.when(visitList, function(res){
                              //console.log("done waiting for visited blockers" + item.name);
                              //console.log("adding " + item.name + " to extra list");
                              //no blockers so good to add this item to the extra list
                              extra.push(item);
                              //now we're sure we're done with the original item
                              visitDef.callback();
                            });
                          } else {
                            //console.log("adding " + item.name + " to extra list");
                            //no blockers so good to add this item to the extra list
                            extra.push(item);
                            //no visits to handle, so we're done
                            visitDef.callback();
                          }
                        }); 

                      } else {
                        
                        //console.log("had unblocked");
                        foundUnblocked = true;

                        //console.log("adding " + item.name + " to extra list");
                        //no blockers so good to add this item to the extra list
                        extra.push(item);

                        //and we're done with this visit
                        visitDef.callback();
                      }
                    } else {
                      //console.log("already visited", item.name);
                      //already visited this one, so no need to bother 
                      //and we're done with the visit
                      visitDef.callback();
                    }

                    return visitDef;
                  }
                  
                  
                  //handle all the visits from the original blockers
                  var defFuncs = new dojo.DeferredList(funcs);
                  defFuncs.then(function(funcsRes){
                    //console.log("blocker functions done", funcsRes);
                    //since we're done with any originals and recursive blockers, send back any
                    //extras that we've found (extras are tasks that aren't in this project and that
                    //allow the order of execution to be determined)
                    defBlockReady.callback(extra);
                  });
                } 
                
                //deferred until a blocker is found that doesn't have a blocker
                dojo.when(defBlockReady, function(res){
                  //console.log("blockready", res);
                  if (res.length){
                    extTasks = extTasks.concat(res);
                  }

                  //return them
                  def.callback(extTasks);
                });
              });
              return def;
            },
            
            loadProject: function(project){
              
              //console.debug("loadProject called", project, this.currentProject);
              
              var def = new dojo.Deferred(),
                  self = this;
                  
              
              if (!project && !this.currentProject){
                def.errback({error: "Invalid project id", reason: "missing"});
              } else if (project && project === this.currentProject){
                def.callback(self);
              } else {
                if (!project){
                  project = this.currentProject;
                }
                //current project is the project that is currently cached. that way
                //the app can inspect it and if a different project is needed, it can be loaded
                var load = new dojo.DeferredList([
                  self._loadRoles(project),
                  self._loadTasks(project),
                  self._loadBlockers(project),
                  self._loadStream(project)
                ]);

                load.then(function(resp){
                  //console.debug("loaded project", resp);
                  self.currentProject = project;
                  def.callback(self);
                });
              }
              return def;
              
            },
            getTaskBlockers: function(task){
              //this function gets the blockers from the dbase to make sure they are completely up to date
              var def = new dojo.Deferred(),
                  blocking = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              
              var queryArgs = {
                view: "coordel/taskBlockers",
            		startkey: [task],
            		endkey: [task,{}],
            		include_docs: true
            	};
            	
            	var query = blocking.query(queryArgs);
            	
            	dojo.when(query, function(res){
            	  var map = {};
            	  var toReturn = [];
            	  dojo.forEach(res, function(b){
            	    if (!map[b._id]){
            	      //console.log("pushing", b.name);
            	      map[b._id] = true;
            	      toReturn.push(b);
            	    }
            	  });
            	  //console.log("blocking", res);
            	  def.callback(toReturn);
            	});
            	
            	//console.debug("returning getBlocking");
            	return def;
            },
            loadOpportunities: function(username){
              this.oppMemory = new mem({idProperty: "_id", queryEngine: dojo.store.util.SimpleQueryEngine});
              this.oppRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.SimpleQueryEngine});
              //this.remote = new obs(this.remote);
              this.oppMemory = new obs(this.oppMemory);
              this.oppStore = new obsCache(this.oppRemote, this.oppMemory);
              
              //latest opportunities
              this.oppMemory.latest = function(project){
                return pStatus.isLatestOpportunity(project, username);
              };
              
              var queryArgs = {
                view: "coordel/opportunities",
            		descending: "true",
            		limit: 50
            	};
            	
            	return this.oppStore.query(queryArgs);
            },
            _loadProjects: function(username){
              
              //console.debug("loading projects");
              this.memory = new mem({idProperty: "_id", queryEngine: dojo.store.util.SimpleQueryEngine});
              this.remote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.SimpleQueryEngine});
              this.memory = new obs(this.memory);
              this.store = new obsCache(this.remote, this.memory);
              
              //calendar
              this.memory.calendar = function(project){
                return (
                  pStatus.isInvitedNew(project, username) ||
                  pStatus.isResponsible(project,username) ||
                  pStatus.isParticipating(project,username) ||
                  pStatus.isPending(project, username) ||
                  pStatus.isDeferred(project) ||
                  pStatus.isPaused(project,username)
                );
              };
              
              //project invited
              this.memory.projectInvited = function(project){
                return (
                  pStatus.isInvitedNew(project, username) ||
                  pStatus.isInvitedDeclined(project, username) ||
                  pStatus.isInvitedProposed(project, username) ||
                  pStatus.isInvitedAgreed(project, username) ||
                  pStatus.isInvitedAmended(project, username) ||
                  pStatus.isInvitedLeft(project, username)
                );
              };
              
              //invitedNew
              this.memory.invitedNew = function(project){
                return pStatus.isInvitedNew(project, username);
              };
              
              //invitedDeclined
              this.memory.invitedDeclined = function(project){
                return pStatus.isInvitedDeclined(project, username);
              };
              
              //invitedProposed
              this.memory.invitedProposed = function(project){
                return pStatus.isInvitedProposed(project, username);
              };
              
              //invitedAgreed
              this.memory.invitedAgreed = function(project){
                return pStatus.isInvitedAgreed(project, username);
              };
              
              //invitedAmended
              this.memory.invitedAmended = function(project){
                return pStatus.isInvitedAmended(project, username);
              };
              
              //invitedLeft
              this.memory.invitedLeft = function(project){
                //it's invited left if the assign.status is LEFT and i'm the project responsible
                return pStatus.isInvitedLeft(project, username);
              };
              
              //active
              this.memory.active = function(project){
                return pStatus.isActive(project);
              };
              
              //responsible
              this.memory.responsible = function(project){
                return pStatus.isResponsible(project,username);
              };
              
              //partipating
              this.memory.participating = function(project){
                return pStatus.isParticipating(project,username);
              };
              
              //following
              this.memory.following = function(project){
                return pStatus.isFollowing(project, username);
              };
              
              //pending
              this.memory.pending = function(project){
                return pStatus.isPending(project, username);
              };
              
              //paused
              this.memory.paused = function(project){
                return pStatus.isPaused(project,username);
              };
              
              //deferred
              this.memory.deferred = function(project){
                return pStatus.isDeferred(project);
              };
              
              //done
              this.memory.done = function(project){
                return pStatus.isDone(project, username);
              };
                            
              //cancelled
              this.memory.cancelled = function(project){
                return pStatus.isCancelled(project, username);
              };
              
              var query = {
                view: "coordel/userProjects",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	return this.store.query(query);
            },
            _loadRoles: function(project){
              this.roleMemory = new mem({
                idProperty: "_id",
                queryEngine: dojo.store.util.SimpleQueryEngine});
              this.roleRemote = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              this.roleMemory = new obs(this.roleMemory);
              //this.remote = new obs(this.remote);
              this.roleStore = new obsCache(this.roleRemote, this.roleMemory);
              //this.roleStore = new obs(this.roleStore);
              
              
              var queryArgs = {
                view: "coordel/projectRoles",
            		startkey: [project],
            		endkey: [project,{}],
            		include_docs: true
            	};
            	
            	return this.roleStore.query(queryArgs);
            },
            _loadTasks: function(project){
              this.taskMemory = new mem({
                idProperty: "_id",
                queryEngine: tqe});
              this.taskRemote = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              //this.remote = new obs(this.remote);
              this.taskMemory = new obs(this.taskMemory);
              this.taskStore = new obsCache(this.taskRemote, this.taskMemory);
              
              var queryArgs = {
                view: "coordel/projectTasks",
            		startkey: [project],
            		endkey: [project,{}],
            		include_docs: true
            	};
            	
            	return this.taskStore.query(queryArgs);
              
            },
            _loadBlockers: function(project){
              var def = new dojo.Deferred();
              this.blockMemory = new mem({
                idProperty: "_id",
                queryEngine: tqe});
              this.blockRemote = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              //this.remote = new obs(this.remote);
              this.blockStore = new cache(this.blockRemote, this.blockMemory);
              this.blockStore = new obs(this.blockStore);
              this.blockMemory = new obs(this.blockMemory);
              
              var queryArgs = {
                view: "coordel/projectBlockers",
            		startkey: [project],
            		endkey: [project,{}],
            		include_docs: true
            	};
            	
            	dojo.when(this.blockStore.query(queryArgs), function(res){
            	  var map = {};
            	  var blockers = [];
            	  dojo.forEach(res, function(task){
            	    if (!map[task._id]){
            	      blockers.push(task);
            	    }
            	  });
            	   
            	  
            	  def.callback(blockers);
            	});
            	return def;
            	
            },
             
            _loadStream: function(project){
              //console.log("loadProjectStream called", project);
              var query = {
                view: "coordel/projectStream",
            		startkey: [project, {}],
            		endkey: [project],
            		descending: "true",
            		limit: 50
            	};
            	this.streamRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.streamMemory = new mem({idProperty: "_id"});
              this.streamMemory = new obs(this.streamMemory);
              this.streamStore = new obsCache(this.streamRemote, this.streamMemory);
            	
            	return this.streamStore.query(query);
            }
        };
        
        return projStore;
    }
);