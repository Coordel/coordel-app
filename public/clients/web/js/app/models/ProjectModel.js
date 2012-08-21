define("app/models/ProjectModel", 
  ["dojo",
  "i18n!app/nls/coordel", 
  "app/models/CoordelBase", 
  "dojo/date/stamp",
  "dojo/date",
  "app/models/RoleModel",
  "app/models/CoordelStore",
  "app/models/ProjectStatus"], function(dojo, coordel, base, stamp, date, rModel, db, pStatus) {
  dojo.declare(
    "app.models.ProjectModel", 
    [base], 
    {
      db: null,
      
      headers: {Accept: "application/json", "Content-Type": "application/json"},
      
      project: null,
      
      constructor: function(args){
        //console.debug("Project constructor called",args);
        if (!args.project){
          console.debug("ERROR: ProjectModel constructor called without a project");
        }
      },
      
      isMyPrivate: function(){
        return this.project.isMyPrivate;
      },
      
      isMyDelegated: function(){
        return this.project.isMyDelegated;
      },
      
      init: function(db){
        
        //set the database
        this.db = db;
        
        return this;
      },
      
      isDeferred: function(){
        var proj = this.project,
            has = false;
        
        if (this.project.calendar){
          has = true;
        }
        
        return has;    
      },
      
      isOpportunity: function(){
        return this.project.substatus === "OPPORTUNITY";
      },
      
      hasAttachments: function(){
        var count = 0,
    	      files = this.project._attachments;
    	      
        if (files){
          for (var key in files){
            count += 1;
          }
        }

        return (count > 0);
      },
      
      isDeclined: function(username){
        var p = this,
            isDeclined = false,
            assignments = this.assignments;
            
        if (p.status !== "ACTIVE"){
          //console.debug("not an active project, isDeclined = false");
    			return false;
    		}
            
        if (!assignments){
          assignments = [];
        }
        
        dojo.forEach(assignments, function(assign){
    		  if (assign.username === username && assign.status === "DECLINED"){
    		    isDeclined = true;
    		    //console.debug("this project was declined by ", username, p.name);
    		  }
    		});
        
        return isDeclined;
      },
      
      isInvite: function(username){
        
        //isInvite returns true if the projet assignments
        
        if (!username){
          username = this.db.username();
        }
        
        //return (pStatus.isInvited(this.project, username));
  
        
    		var p = this,
    		    isInvite = false,
    			  assignments = this.assignments;
    			  
    		if (!p.project){
    		  console.debug("ERROR: there was no project in the ProjectModel", p);
    		}
    			  
    		if (!assignments){
    		  assignments = [];
    		}
        
    		if (p.status === "TRASH" || p.status === "ARCHIVE"){
    			//$.log("it was TRASH");
    			return false;
    		}

    		if (p.isMyPrivate){
    			return false;
    		}
    		
    		isInvite = pStatus.isProjectInvite(p.project, username);
    		
    		//console.debug("isInvite value in ProjectModel", isInvite, p.project.name);

    		return isInvite;
    		
    	},
    	
    	isUserOwner: function(){
    	  //console.log("isUserOwner called", this.project.responsible, this.db.username());
    	  if(this.project.responsible === this.db.username()){
    	    return true;
    	  }
    	  return false;
    	},
    	
    	defaultDeadline: function(options){
    	  //this function returns the default deadline for a project
        //if one isn't provided. By default, they system adds seven days
        //the user can cange the value in their preferences
        
    	  var defaults = {
    	    interval: "day",
    	    amount: 7
    	  };
    	  
    	  if (options){
    	    defaults = dojo.mixin(defaults, options);
    	  }
        
        var dead = date.add(new Date(), defaults.interval, defaults.amount);
        
        return stamp.toISOString(dead, {selector: "date"});
        
      },
    	
    	invite: function(username, project){

    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    		var p = this;
    		
    		if (!project.users){
          project.users = [];
        }
    		
    		var has = (dojo.indexOf(project.users, username) > -1);
        
        if (!has){
          console.log("didn't have user in project");
          project.users.push(username);

      		if (!project.assignments){
      		  project.assignments = [];
      		}

      		project.assignments.push({
      		  username: username,
      		  role: "FOLLOWER",
      		  status: "INVITE"
      		});
      		
      		
      		//console.log("username in invite", username, p.db.contactFullName(username), this.db.contactFullName(username));
      		//NOTE: this is here because sometimes the contact isn't created yet and won't be because it's new
      		//so we need to make sure undefined doesn't get sent into the function
      		var name = p.db.contactFullName(username);
      		if (name === undefined){
      		  name = false;
      		}

      		p.addActivity({
      			object: {id: username, name: name, type: "PERSON"},
      			target: {id: project._id, name: project.name, type: "PROJECT"},
      			verb: "INVITE",
      			icon: p.icon.invite
      		}, project);
         
        }
         		
    		return project;
    	},
    	
    	addAssignment: function(roleName, username, project){
    	  //console.debug("addAssignment called in project model", roleName, username, project);
    	  
    	  var roleid = this.db.uuid();
    	  
    	  //find this user's role and create an id where it equals follower
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      if (assign.role === "FOLLOWER"){
    	        //this is just a person who has been following the project. turn the role into
    	        //a role with an id
    	        assign.role = roleid;
    	        assign.name = roleName;
    	      } else {
    	        //this user already has a role so this means create another role for this user
    	        project.assignments.push({
    	          username: username,
    	          role: roleid,
    	          name: roleName,
    	          status: "INVITE"
    	        });
    	      }
    	    }
    	  });
    	  
    	  return project;
    	},
    	
    	getDeadline: function(){
    	  return this.project.deadline;
    	},
    	
    	add: function(project){
    	  
    	  //console.log("adding project", project);
    	  
    	  var db = this.db,
  	        app = db.appStore.app(),
  	        username = db.username(),
  	        id = db.uuid(),
  	        p = this;
        
        if (!project._id){
          project._id = id;
        }
    		
  	    //default status
  	    //the responsible needs to send the project to make it "ACTIVE"
  	    //it's PENDING by default
  	    project.status = "ACTIVE"; 
  	    project.substatus = "PENDING";
  	  
        //I'm responsible for the project when it is created. If i'm creating it for someone else
	      //to own, then I need to create it then assign make someone responsible explicitly. Otherwise
	      //it would be possible to create projects and todos for others without the right authority.
	      
	      if (!project.responsible){
	        project.responsible = username;
	      }
	      
	      //just in case, create users container if there isn't one
	      if (!project.users){
	        project.users = [username];
	      }
	      
	      if (!project.assignments){
	        project.assignments = [{
	          username: username,
	          role: "RESPONSIBLE",
	          status: "ACCEPTED"
	        }];
	      }

    		
    		//if there isn't a deadline set for the project, use the default deadline
    		if (!project.deadline){
    		  project.deadline = this.defaultDeadline();
    		}
    		
  	    //this isn't my private or my delegated because they have already been created
  	    project.isMyDelegated = false;
  	    project.isMyPrivate = false;
  	    
  	    //set the docType and template info 
  	    project.docType = "project";
        project.isTemplate = false;
        
        //add any roles that were created but that aren't follower or responsible placeholders
        dojo.forEach(project.assignments, function(assign){
          if (assign.role !== "FOLLOWER" && assign.role !== "RESPONSIBLE"){
            var r = new rModel({db:db});
            var role = {};
            role._id = assign.role;
            role.name = assign.name;
            role.username = assign.username;
            role.project = project._id;
            r.add(role);
          }
        });
  	    
        //save the project
        return db.projectStore.store.add(project, {username: username});
    	},
    	
    	update: function(project){
    	  //console.log("updating project", project);
    	  var db = this.db,
    	      username = db.username();
    	  project.isNew = false;
    	  return db.projectStore.store.put(project, {username: username});
    	},
    	
    	updateAssignments: function(task){
    	  //when a task is added or updated, the project's assignments track what's happening
    	  //roles are also created (as required), and the status of the task is tracked in the role
    	  //if there's no assignment
    	  var db = this.db,
    	      self = this,
    	      rm = new rModel({db:db}),
    		    p = db.projectStore.store.get(task.project),
  	        hasAssign = false,
  	        doUpdate = false,
  	        roleid = db.uuid(),
  	        def = new dojo.Deferred(),
            status = "INVITE",
  	        hasUser = false;
  	        
  	    //console.debug("updating project assignments", p, task.username);
  	    //make sure this task's user is part of the project
      
  	    dojo.forEach(p.users, function(user){
  	      if (task.username === user){
  	        hasUser = true;
  	      }
  	    });
  	    
  	    
  	    
  	    if (!hasUser){
  	      //if this is my delegated project, the project invitation process is skipped and the
          //tasks are accepted on a task by task basis
  	      if (!p.isMyDelegated){
  	        //console.debug("inviting user to project", task.username);
    	      p = self.invite(task.username, p);
  	      } else {
  	        p.users.push(task.username);
  	        status = "ACCEPTED";
  	      }
  	      doUpdate = true;
  	    }
  	       
  	    if (!p.assignments){
  	      p.assignments = [];
  	    }

  	    //make sure this task's project has an assignment for the task's username
        //look at all the existing assignments and see if this task's user already has one
        //and if so, set the roleid = to the existing assignment's role id
        //if the user is the responsible, then the responsible role should be converted
	      dojo.forEach(p.assignments, function(assign) {
    			if (assign.username === task.username){
    			  if (assign.role === "FOLLOWER"){
    			    assign.role = roleid;
    			    assign.status = status;
    			    hasAssign = true;
    			    doUpdate = true;
    			  } else if (assign.role === "RESPONSIBLE"){
    			    assign.role = roleid;
    			    hasAssign = true;
    			    doUpdate = true;
    			  } else {
    			    hasAssign = true;
      				roleid = assign.role;
    			  }		
    			}
    		});
    		
    		//if there wasn't an assignment, then create a new one for this user using the 
    		//uuid assigned to the role on call of the function
    		if (!hasAssign) {
    		  
  	      p.assignments.push({
    				username: task.username,
    				role: roleid,
    				status: status
    			});
    			
    			doUpdate = true;
  	    }
  	    
  	    //set the roleid of the task
  	    task.role = roleid;
        
        //console.log("before updateResponsibilities in projectModel");
  	    //update the role's responsibilities
  	    rm.updateResponsibilities(roleid, task, p.isMyPrivate);
  	    
  	    //console.log("after updateResponsibilities in projectModel");
      	//save project if an assignment was added or updated for a follower or responsible
      	if (doUpdate){
      	  //console.debug("saving project, assignment was added or updated", p, task.username);
      	  dojo.when(self.update(p), function(){
      	    //console.log("updated project", p, task);
      	    def.callback(task);
      	  }, 
      	  function(err){
      	    //console.log("ERROR failed to update project", err);
      	  });
        } else {
      	  def.callback(task);
      	}
      	
      	return def;
  			 
    	},
	
    	remove: function(project){
    	  var p = this,
            db = this.db;
            
          if (db.username() !== project.responsible){
            return;
          }
          
          //console.debug("removing project", project);
          
          var def = db.projectStore.loadProject(project._id);
          
          def.then(function(store){
            
            //console.debug("project STORE", store, db);
            
            dojo.forEach(store.roleMemory.data, function(role){
              role.status = "ARCHIVE";
              role.substatus = "DELETED";
              db.roleStore.store.put(role, {username: db.username()});
            });
            
            dojo.forEach(store.taskMemory.data, function(task){
              task.status = "ARCHIVE";
              task.substatus = "";
              db.taskStore.store.put(task, {username: db.username()});
            });
          });
        
          project.status = "ARCHIVE";
          
      		p.addActivity({
      			verb: "DELETE",
      			icon: p.icon.trash
      		}, project);
          db.projectStore.store.put(project,{username: db.username()});
    	},
    	
    	send: function(project, message){
    	  
    	  var p = this,
    	      db = this.db;
    	      
    	  //console.debug("sending project", project);
    	  
    	  //add the create entry into the history
  	  	project = p.addActivity({
    			verb: "POST",
    			icon: p.icon.post,
    			body: message
    		}, project);
    		
    		project.substatus = "SENT";
    		
    		//deal with any non-follower roles
    		
    		db.projectStore.store.put(project, {username: db.username()});
    		//dojo.publish("coordel/primaryNavSelect", [ {name: "project", focus: "project", id: project._id}]);
    	},
    	
    	publish: function(project, message){
    	  var p = this,
    	      db = this.db;
    	    
    	  project = p.addActivity({
    	    verb: "POST",
    	    icon: p.icon.post,
    	    body: message
    	  }, project);
    	  
    	  project.substatus = "OPPORTUNITY";
    	  db.projectStore.store.put(project, {username: db.username()});
    	},
    	
    	unfollow: function(username, project, message){
    	  var p  = this;
    	  //follow just removes the user from the project and kills the assignment
    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    	  project.users = dojo.filter(project.users, function(u){
    	    return u !== username;
    	  });
    	  
    	  project.assignments = dojo.filter(project.assignments, function(assign){
    	    return assign.username !== username;
    	  });
    	  
    	  p.addActivity({
    			verb: "UNFOLLOW",
    			icon: this.icon.unfollow,
    			body: message
    		}, project);
    		
    		p.update(project);
    	},
    	
    	follow: function(username, project){
    	  //console.log("projectModel follow called", username, project);
    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    	  
    	  
    	  //make sure this user is in the user list
    	  var hasUser = false,
    	      p = this;
    	  dojo.forEach(project.users, function(user){
    	    if (user === username){
    	      hasUser = true;
    	    }
    	  });
    	  
    	  if (!hasUser){
    	    project.users.push(username);
    	  }
    	  
    	  //go through the assignments and set the follower role status to ACCEPTED
    	  var hasRole = false;
    	  
    	  //first check if there is already a follower role and if so, set its status
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username) {
    	      
    	      if (assign.role === "FOLLOWER"){
    	        
      	      assign.status = "ACCEPTED";
      	      
      	      this.addActivity({
          			verb: "FOLLOW",
          			icon: this.icon.follow
          		}, project);
      	    }
  
      	    hasRole = true;
    	    } 
    	  }, this);
    	  
    	  //in case there wasn't a role, create it and set its status to accepted
    	  if (!hasRole){
    	    project.assignments.push({
    	      username: username,
    	      role: "FOLLOWER",
    	      status: "ACCEPTED"
    	    });
    	    
    	    this.addActivity({
      			verb: "FOLLOW",
      			icon: this.icon.follow
      		}, project);
    	  }
        //console.log("before update in projectModel.follow");
    	  p.update(project);
    	},
    	
    	decline: function(username, project, message){
  
    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	    //console.debug("didn't have project, loading");
    	  }
    	  
    	  //console.debug("declining project", project, username, message);
    	  
    	  var curAssign = {},
    	      p = this,
    	      query = this.db.projectStore.loadProject(project._id),
    	      db = this.db,
    	      docs = [];
    	  
    	  //set the assignment to decline
    	  
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      curAssign = assign;
    	      assign.status = "DECLINED";
    	    }
    	  });
  
    	  //make the activity stream mode
    	  p.addActivity({
    			verb: "DECLINE",
    			icon: p.icon.decline,
    			body: message
    		}, project);
    		
    		//take the user out of the project
    		var newUsers = dojo.filter(project.users, function(u){
    		  return u !== username;
    		});
   	    project.users = newUsers;
    	  
    	  docs.push(project);
    	  
    	  //need to deal with any tasks that were assigned to this user
    	  
    	  query.then(function(store){
    	    //console.debug("got the project store", store);
    	    
    	    var tasks = store.taskMemory.query({db:db, filters: {username: username}}),
    	        roles = store.roleMemory.query({username:username});
    	        
    	    //console.log("decline tasks and roles", tasks, roles);
    	    
    	    tasks.forEach(function(task){
    	      //console.debug("looping over tasks, current task to decline", task, db.getTaskModel(task, true));
    	      
    	      var t = db.getTaskModel(task, true);
  	        //console.debug("task to decline", task);
    	      if (!message){
          	  message = "";
          	}

          	//if the user declines this task, it needs to go back to the person who delegated it
          	//or to the project responsible if there isn't a delegator

        		task.status = "DELEGATED";
        		task.substatus = "DECLINED";
        		task.isNew = false;
        		task = t.addActivity({
        			verb: "DECLINE",
        			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
        			icon: t.icon.decline
        		}, task);
    	      docs.push(task);
    	    });
    	    
    	    
      	  dojo.forEach(roles, function(role){
      	    var isUpdate = false;
      	    dojo.forEach(role.responsibilities, function(r){
      	      if (r.status !== "DONE" && r.status !== "ARCHIVE"){
      	        r.status = "DELEGATED";
      	        r.substatus = "DECLINED";
      	        isUpdate = true;
      	      }
      	    });
      	    if (isUpdate){
      	      role.isNew = false;
      	      docs.push(role);
      	    }
      	  });
    
      	  //console.log("DOCS for DECLINE", docs);
      	  var u = db.username();
          dojo.forEach(docs, function(doc){
            switch(doc.docType){
              case "project":
              store.store.put(doc, {username: u });
              break;
              case "role":
              store.roleStore.put(doc, {username: u});
              break;
              case "task":
              store.taskStore.put(doc, {username:u});
              break;
            }
          });
    	  });
    	  
    	},
    	
    	pause: function(project, message){
    	  var p = this,
    	      db = this.db;

    	  //console.debug("pausing project", project);
   
      	project = p.addActivity({
    			verb: "PAUSE",
    			icon: p.icon.pause,
    			body: message
    		}, project);

    		project.substatus = "PAUSED";

    		p.update(project);
    	},
    	
    	resume: function(project, message){
    	  var p = this,
    	      db = this.db;

    	  //console.debug("resuming project", project);
   
      	project = p.addActivity({
    			verb: "RESUME",
    			icon: p.icon.resume,
    			body: message
    		}, project);

    		project.substatus = "SENT";
    		p.update(project);
    	},
    	 
    	cancel: function(project, message){
    	  var p = this,
    	      db = this.db,
    	      query = this.db.projectStore.loadProject(project._id),
    	      docs = [];

    	  //console.debug("cancelling project", project);
   
      	project = p.addActivity({
    			verb: "CANCEL",
    			icon: p.icon.resume,
    			body: message
    		}, project);

    		project.substatus = "CANCELLED";
    		//p.update(project);
    		docs.push(project);
    		query.then(function(store){
    	    
    	    var tasks = store.taskMemory.query({db:db}),
    	        roles = store.roleMemory.query();
    	        
    	    //console.log("cancel tasks and roles", tasks, roles);
    	    
    	    tasks.forEach(function(task){
    	      //console.debug("looping over tasks, current task to decline", task, db.getTaskModel(task, true));
    	      
    	      var t = db.getTaskModel(task, true);
  	        //console.debug("task to decline", task);
  	        if (!t.isDone()){
  	          task.status = "DONE";
          		task.substatus = "CANCELLED";
          		task.isNew = false;
          		task = t.addActivity({
          			verb: "CANCEL",
          			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
          			icon: t.icon.cancel
          		}, task);
      	      docs.push(task);
  	        }
    	    });
    	    
    	    
      	  dojo.forEach(roles, function(role){
      	    var isUpdate = false;
      	    dojo.forEach(role.responsibilities, function(r){
      	      if (r.status !== "DONE" && r.status !== "ARCHIVE"){
      	        r.status = "DONE";
      	        r.substatus = "CANCELLED";
      	        isUpdate = true;
      	      }
      	    });
      	    if (isUpdate){
      	      role.isNew = false;
      	      docs.push(role);
      	    }
      	  });
    
      	  //console.log("DOCS for CANCEL", docs);
      	  var u = db.username();
          dojo.forEach(docs, function(doc){
            switch(doc.docType){
              case "project":
              store.store.put(doc, {username: u });
              break;
              case "role":
              store.roleStore.put(doc, {username: u});
              break;
              case "task":
              store.taskStore.put(doc, {username:u});
              break;
            }
          });
    	  });
    	},
    	
      sendPendingTasks: function(username, project){
    	  var db = this.db;
    	  
    	  //console.log("sendPendingTasks called", username, project);
    	  
    	  var q = db.projectStore.loadProject(project);
    	  
    	  q.then(function(store){
    	    //console.debug("sendPendingTasks project db", store);
    	    var qt = store.taskMemory.query({db:db});
    	    
    	    //console.log("queried qt", qt);
   
      	  dojo.when(qt, function(tasks){
      	    //console.log("got tasks", tasks);
      	    dojo.forEach(tasks, function(task){
      	      var t = db.getTaskModel(task, true);
      	      if (task.status === "PENDING" && task.username === username){
    	          t.accept(task);
    	        }
      	    });
      	  });
    	  });
    	},
    	
    	participate: function(username, project, message){
    	  
    	  var p = this,
    	      db = this.db,
    	      docs = [];

    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    	  //console.debug("participate", username, project);
    	  
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      assign.status = "ACCEPTED";
    	    }
    	  });
    	  
    		project = this.addActivity({
    			verb: "JOIN",
    			icon: this.icon.join,
    			body: message
    		}, project);
    		
    		docs.push(project);
    	  
    	  var q = db.projectStore.loadProject(project._id);
    	  
    	  q.then(function(store){
    	    //console.debug("sendPendingTasks project db", store);
    	    tasks = store.taskMemory.query({db:db, filters: {username: username}});
    	    roles = store.roleMemory.query({username: username});
    	    
    	    //console.log("tasks and roles", tasks, roles);
    	    
    	    dojo.forEach(tasks, function(task){
    	      var t = db.getTaskModel(task, true);
    	      if (task.status === "PENDING"){
    	        
  	          if (!message){
            	  message = "";
            	}

          		task.status = "CURRENT";
          		task.substatus = "ACCEPTED";
          		task.isNew = false;
          		task = t.addActivity({
          			verb: "ACCEPT",
          			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
          			icon: t.icon.accept,
          			body: message
          		}, task);
          		docs.push(task);
  	        }
    	    });
    	    
    	    dojo.forEach(roles, function(role){
    	      var isUpdate = false;
    	      dojo.forEach(role.responsibilities, function(r){
    	        if(r.status === "PENDING"){
    	          r.status = "CURRENT";
    	          r.substatus = "ACCEPTED";
    	          r.isNew = false;
    	          isUpdate = true;
    	        }
    	      });
    	      if (isUpdate){
    	        docs.push(role);
    	      }
    	    });
    	    
    	    //console.log("PARTICIPATE DOCS", docs);
          var u = db.username();
          dojo.forEach(docs, function(doc){
            switch(doc.docType){
              case "project":
              store.store.put(doc, {username: u});
              break;
              case "role":
              store.roleStore.put(doc, {username: u});
              break;
              case "task":
              store.taskStore.put(doc, {username:u});
              break;
            }
          }); 
        
    	  });
    	  
    	},
    	
    	markDone: function(project, message){
    	  
    	  var p = this,
    	      db = this.db;

    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    	  console.debug("mark Done", project);
    	  
    		project = this.addActivity({
    			verb: "COMPLETE",
    			icon: this.icon.done,
    			body: message
    		}, project);
    		
    		
    	  
    	  var q = db.projectStore.loadProject(project._id);
    	  
    	  q.then(function(store){
    	    //console.log("store", store);
    	    var docs = [];
    	    //first update the project
    	    project.status = "ARCHIVE";
      		project.substatus = "DONE";
      		docs.push(project);
      		
      	  //if there aren't more than 2 users, then just mark it done
      	  if (project.users.length < 3){
      	    dojo.forEach(project.assignments, function(assign){
      	      assign.ack = true;
      	    });
      	  }
      		
    	    //now deal with the tasks
    	    var tasks = store.taskMemory.query({db:db});
    	    dojo.forEach(tasks, function(task){
    	      var t = db.getTaskModel(task, true);
    	      if (!t.isDone()){
    	        //console.log("cancelling task", task.name);
  	          task.status = "DONE";
          		task.substatus = "CANCELLED";
          		task.isNew = false;
          		task = t.addActivity({
          			verb: "CANCEL",
          			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
          			icon: t.icon.cancel
          		}, task);
          		docs.push(task);
  	        }
    	    });
    	    
    	    //finally deal with the found roles
    	    var roles = store.roleMemory.query();
    	    //console.log("roles", roles);
    	    dojo.forEach(roles, function(role){
    	      var isUpdated = false;
    	      //console.log("testing role", role);
    	      dojo.forEach(role.responsibilities, function(r){
    	        if (r.status !== "DONE" && r.status !== "ARCHIVE"){
      	        //console.log("mark done responsibility", role, r);
      	        r.status = "DONE";
      	        r.substatus = "CANCELLED";
      	        isUpdated = true;
      	      }
    	      }); 
    	      if (isUpdated){
    	        role.isNew = false;
    	        docs.push(role);
    	      }
    	    });
    	  
    	    //we have to deal with all the docs before doing the updates 
    	    //because changes will alter the stores and revs otherwise
          //console.log("DOCS TO UPDATE", docs);
          var username = db.username();
          dojo.forEach(docs, function(doc){
            switch(doc.docType){
              case "project":
              store.store.put(doc, {username: username });
              break;
              case "role":
              store.roleStore.put(doc, {username: username});
              break;
              case "task":
              store.taskStore.put(doc, {username:username});
              break;
            }
          });
      	  
    	  });
    	  
    	},
    	
    	leave: function(username, project, message){
    	  //when a user leaves a project, they are removed from the users list, and all 
    	  //tasks that aren't done or cancelled are made unassigned
    	  
    	  //roles are actually moved between assignments. so, one user may have a reference in their
    	  //left assignment to a role that has tasks they completed and another may have a reference
    	  //to the same role that has tasks they also completed. This keeps the role as the constant
    	  //but also allows for users to keep track of what they did. for the user who left the project
    	  //their history will show they left but will show what they did before leaving. for the other
    	  //user, if they are still current when the project is completed, they will have that shown
    	  
    	  var p = this,
    	      db = this.db,
    	      docs = [];
    	  
    	  var q = db.projectStore.loadProject(project._id);
    	  q.then(function(store){
    	    //console.log("leaving project", username, project, message, store);
          
          //find the assignment for this user and mark it left
      	  dojo.forEach(project.assignments, function(assign){
      	    if (assign.username === username){
      	      assign.status = "LEFT";
      	    }
      	  });

          //make the activity entry for leaving the project
      		project = p.addActivity({
      			verb: "LEAVE",
      			icon: p.icon.leave,
      			body: message
      		}, project);
      			
          //remove the user from the project
          var newUsers = dojo.filter(project.users, function(u){
      		  return u !== username;
      		});
     	    project.users = newUsers;
          
          docs.push(project);
      	  
      	  //get the tasks for this user and role
      	  var tasks = store.taskMemory.query({db:db, filters: {username: username}});
      	  var roles = store.roleMemory.query({username: username});
      	  
      	  //console.log("leaving tasks and roles", tasks, roles);
      	  
      	  dojo.forEach(tasks, function(task){
    	      var t = db.getTaskModel(task, true);
  
    	      //leave or reassign the task if it isn't done or cancelled
    	      if (!t.isCancelled() && !t.isDone()){
    	        //if the task is submitted for approval, reassign to the responsible
    	        if (t.isSubmitted()){
    	          task.username = task.responsible;
            		task = t.addActivity({
            			verb: "REASSIGN",
            			target: {id:project._id, name: project.name, type: "PROJECT"},
            			icon: t.icon.reassign,
            			body: coordel.projectActions.reassignLeft
            		}, task);
    	        } 
    	        //make the status of the task left
    	        task.status = "CURRENT";
    	        task.substatus = "UNASSIGNED";
          		task = t.addActivity({
          			verb: "LEAVE",
          			target: {id:project._id, name: project.name, type: "PROJECT"},
          			icon: t.icon.leave
          		}, task);
    	        
    	        docs.push(task); 
    	      }
    	    });
    	    
    	    dojo.forEach(roles, function(role){
    	      dojo.forEach(role.responsibilities, function(r){
    	        if (r.username === username){
    	          if (r.status !== "DONE" && r.status !== "ARCHIVE"){
    	            r.status = "CURRENT";
    	            r.substatus = "UNASSIGNED";
    	          }
    	        }
    	      });
    	      docs.push(role);
    	    });
    	    
    	    //we have to deal with all the docs before doing the updates 
    	    //because changes will alter the stores and revs otherwise
          //console.log("DOCS TO LEAVE", docs);
          
          var u = db.username();
          dojo.forEach(docs, function(doc){
            switch(doc.docType){
              case "project":
              store.store.put(doc, {username: u });
              break;
              case "role":
              store.roleStore.put(doc, {username: u});
              break;
              case "task":
              store.taskStore.put(doc, {username:u});
              break;
            }
          }); 
          
    	  });
    	},
    	
    	reuse: function(project){
    	  //console.log("reuse project", project);
    	  
    	  var bp = {
    	    username: this.db.username(),
    	    templateType: "project",
    	    project: project
    	  };
    	  
    	  return  dojo.xhrPost({
          url: "/blueprint",
          handleAs: "json",
          putData: dojo.toJson(bp),
          headers: this.headers,
          load: function(res){
            //console.log("blueprint", res);
          }
        });
    	},
    	
    	feedback: function(username, project){
        var p = this;
    	  //console.log("feedback called", username, project);
    	  
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      assign.ack = true;
    	    }
    	  });
    	  
    	  project = this.addActivity({
    			verb: "FEEDBACK",
    			icon: this.icon.feedback
    		}, project);
    		
    		p.update(project);
    	},
    	
    	ackCancel: function(username, project){
        var p = this;
    	  //console.log("ackCancel called", username, project);
    	  
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      if (assign.status === "LEFT"){
    	        assign.status = "LEFT-ACK";
    	      } else {
    	        assign.ack = true;
    	      }
    	    }
    	  });
    	  
    	  project = this.addActivity({
    			verb: "ACK",
    			icon: this.icon.cancel
    		}, project);
    		
    		p.update(project);
    	},
    	
    	addActivity: function(opts, project){
    	  var db = this.db,
          username = db.username();
    	  
    	  var defaults = {
    			actor: {id:username, name:db.fullName(), type:"PERSON"},
    			object: {id: project._id, name: project.name, type: "PROJECT"},
    		  time: stamp.toISOString(new Date(),{milliseconds:true}),
    		  users: project.users
    		};
    		opts = dojo.mixin(defaults, opts || {});
    		
    		//make sure there is a place to put history
    		if (!project.history){
    		  project.history = [];
    		}
    		
    		project.history.unshift(opts);
    		return project;
    	}
  });
  return app.models.ProjectModel;    
}
);

