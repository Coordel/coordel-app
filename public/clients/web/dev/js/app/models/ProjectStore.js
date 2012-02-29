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
            
            loadProject: function(project){
              
              //console.debug("loadProject called", project);
              
              var def = new dojo.Deferred(),
                  self = this;
                
              /*  
              if (project === this.currentProject){
                def.callback(self);
              } else {
              */
                //current project is the project that is currently cached. that way
                //the app can inspect it and if a different project is needed, it can be loaded
                load = new dojo.DeferredList([
                  self._loadRoles(project),
                  self._loadTasks(project),
                  self._loadBlockers(project)
                ]);

                load.then(function(resp){
                  //console.debug("loaded project", project);
                  self.currentProject = project;
                  def.callback(self);
                });
             // }
              return def;
              
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
              this.blockMemory = new mem({
                idProperty: "_id",
                queryEngine: dojo.store.util.SimpleQueryEngine});
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
            	
            	return this.blockStore.query(queryArgs);
            }
        };
        
        return projStore;
    }
);