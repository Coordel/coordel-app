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
    	  
    	  if(this.responsible === this.db.username()){
    	    //console.log("isUserOwner called", this.responsible, this.db.user._id, this.name);
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
    		
    		project.users.push(username);
    		
    		if (!project.assignments){
    		  project.assignments = [];
    		}
    		
    		project.assignments.push({
    		  username: username,
    		  role: "FOLLOWER",
    		  status: "INVITE"
    		});
    		
    		p.addActivity({
    			object: {id: username, name: p.db.contactFullName(username), type: "PERSON"},
    			target: {id: project._id, name: project.name, type: "PROJECT"},
    			verb: "INVITE",
    			icon: p.icon.invite
    		}, project);
    		
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
        var res = db.projectStore.store.add(project, {username: username});
    	},
    	
    	update: function(project){
    	  var db = this.db,
    	      username = db.username();
    	  project.isNew = false;
    	  db.projectStore.store.put(project, {username: username});
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
  	        def = new dojo.Deferred();
  	        
  	    //console.debug("updating project assignments", p, task.username);
  	    //make sure this task's user is part of the project
  	    var hasUser = false;
  	    dojo.forEach(p.users, function(user){
  	      if (task.username === user){
  	        hasUser = true;
  	      }
  	    });
  	    
  	    if (!hasUser){
  	      //console.debug("inviting user to project", task.username);
  	      p = self.invite(task.username, p);
  	      //p.users.push(task.username);
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
    				status: "INVITE"
    			});
    			doUpdate = true;
  	    }

  	    //update the role's responsibilities
  	    rm.updateResponsibilities(roleid, task, p.isMyPrivate);
  	  
      	//save project if an assignment was added or updated for a follower or responsible
      	if (doUpdate){
      	  //console.debug("saving project, assignment was added or updated", task.username);
      	  dojo.when(this.update(p), function(){
      	    def.callback();
      	  });
        } else {
      	  def.callback();
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
    	
    	send: function(project){
    	  
    	  var p = this,
    	      db = this.db;
    	      
    	      console.debug("project", project);
    	  
    	  /*  
    	  db.projectStore.loadProject(project._id).then(function(resp){
    	    console.debug("project db", resp);
    	    var tasks = resp.taskMemory.query({db:db});
    	    dojo.when(tasks, function(resp){
    	      
    	 
    	      dojo.forEach(resp, function(task){
    	        if (task.status === "PENDING"){
    	          task.status = "CURRENT";
    	          var t = db.getTaskModel(task, true);
    	          t.update(task, {username:db.username()});
    	        }
    	      });
    	      console.debug("tasks", resp);
    	 
    	    });
    	    
    	  });
    	  */
    	  //add the create entry into the history
  	  	project = p.addActivity({
    			verb: "POST",
    			icon: p.icon.post
    		}, project);
    		
    		project.substatus = "SENT";
    		
    		//deal with any non-follower roles
    		
    		db.projectStore.store.put(project, {username: db.username()});
    		dojo.publish("coordel/primaryNavSelect", [ {name: "project", focus: "project", id: project._id}]);
    	},
    	
    	follow: function(username, project){
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

    	  p.update(project);
    	},
    	
    	decline: function(username, project){
  
    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	    console.debug("didn't have project, loading");
    	  }
    	  
    	  console.debug("declining project", project, username);
    	  
    	  var curAssign = {},
    	      idx = dojo.indexOf(project.users, username),
    	      p = this,
    	      store = this.db.projectStore.loadProject(project._id),
    	      db = this.db;
    	  
    	  
    	  console.debug("after variables");
    	  //set the assignment to decline
    	  dojo.forEach(project.assignments, function(assign){
    	    if (assign.username === username){
    	      curAssign = assign;
    	      assign.status = "DECLINED";
    	    }
    	  });
    	  
    	  console.debug("after finding the project assignment", curAssign, "index", idx, "store", store);
    	  
    	  //need to deal with any tasks that were assigned to this user
    	  
    	  store.then(function(res){
    	    console.debug("got the project store", res);
    	    
    	    var tasks = res.taskMemory.query({db:db});
    	    tasks.forEach(function(task){
    	      console.debug("looping over tasks, current task to decline", task, db.getTaskModel(task, true));
    	      if (task.username === username) {
    	        var t = db.getTaskModel(task, true);
    	        //console.debug("task to decline", task);
      	      t.decline(task);
    	      }
    	    });
    	    
    	    //make the activity stream mode
      	  p.addActivity({
      			verb: "DECLINE",
      			icon: p.icon.decline
      		}, project);

      	  //remove this user from the users list to remove their access to the project
      	  project.users.splice(idx, 1);
          //console.debug("project to decline", project);
      	  p.update(project);
      	
    	  });
    	  
    	},
    	
    	join: function(username, project){
    	  if (!project){
    	    project = this.db.projectStore.store.get(this._id);
    	  }
    	  
    	  //console.debug("join", username, project);
    	  
    		this.addActivity({
    			verb: "JOIN",
    			icon: this.icon.join
    		}, project);
    	  
    	  return project;
    	},
    	
    	sendPendingTasks: function(username, project){
    	  var db = this.db;
    	  
    	  db.projectStore.loadProject(project._id).then(function(resp){
    	    //console.debug("project db", resp);
    	    var tasks = resp.taskMemory.query({db:db});
    	    dojo.when(tasks, function(resp){
    	      dojo.forEach(resp, function(task){
    	        if (task.status === "PENDING" && task.username === username){
    	          task.status = "CURRENT";
    	          var t = db.getTaskModel(task, true);
    	          t.update(task, {username:db.username()});
    	          console.debug("task updated from PENDING to CURRENT", task);
    	        }
    	      });
    	    });
    	  });
    	},
    	
    	participate: function(username, project, message){
    	  
    	  var p = this;

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
    			icon: this.icon.join
    		}, project);
    	  
    	  p.update(project);
    	  p.sendPendingTasks(username, project);
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

