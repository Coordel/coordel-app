define("app/models/RoleModel",
  ["dojo",
  "i18n!app/nls/coordel", 
  "app/models/CoordelBase",
  "dojo/date/stamp"], function(dojo, coordel, base, stamp) {
  dojo.declare(
    "app.models.RoleModel", 
    [base], 
    {
      role: {},
      
      db: null,
      
      add: function(role){
        //console.debug("adding ROLE", role);
        this.role = role;
        this.role.docType = "role";
        var username = this.db.username();
        return this.db.roleStore.store.add(role, {username: username});
      },
      
      update: function(role){
        role.isNew = false;
        this.role = role;
        var username = this.db.username();
        return this.db.roleStore.store.put(role, {username: username});
      },
      
      updateResponsibilities: function(roleid, task, isMyPrivate){
        //console.debug("updating responsibilities", roleid, task);
        
        //when a task is added or updated, the project's assignments track what's happening
    	  //role responsibilities (tasks) are also created, and the status of the responsibility(task) is tracked in the role
    	  //if there's no assignment
    	  var db = this.db,
    	      r = {},
    	      self = this;
    	      
  		  var def = db.projectStore.loadProject(task.project);
			  dojo.when(def, function(store){
			    //try {
			      
			      //console.debug("loaded project, store", store);
			      
			      var hasRole = false;
			      
			      var resRole = db.projectStore.roleMemory.get(roleid);
			      
			      //dojo.when(updateRole, function(resRole){
			        //console.log("update role", resRole);
			        if (resRole){
			          //console.log("hasRole set to true");
			          hasRole = true;
			          r = resRole;
			          r.isNew = false;
			          //set the username of the role to the task because it might be that this 
			          //role has been assigned to a new user
			          r.username = task.username;
			        }
			        
			        //console.debug("hasRole in updateResponsibilities", hasRole);

  			      if (!hasRole){
    			      r = {};
    			      r.isNew = true;
    			      r._id = roleid;
    			      r.username = task.username;
    			      r.project = task.project;
    			      r.responsibilities = [];
    			      //console.debug("didn't find the role, it's new", r);
  			      }

       				//need to check if the responsibility exists in the role
      				//and if it does, update it with the task's new status/substatus/username
      				var hasResp = false,
      				    deleteKey = false;
      				dojo.forEach(r.responsibilities, function(resp, key) {
      					if (resp.task === task._id){
      					  //console.debug("had the responsibility, updating status: ", resp.task, task.status);
        					hasResp = true;
      					  if(task.status === "TRASH" && isMyPrivate){
      					    //since this is a private project, delete the responsibility
      					    deleteKey = key;
      					  } else {
      					    //update the status
      					    resp.status = task.status;
        						resp.substatus = task.substatus;
        						resp.username = task.username;
      					  }
      					}
      				});
              if (deleteKey){
                //console.debug("deleted the responsibility because it was in a private project");
                r.responsibilities.splice(deleteKey, 1);
              }
      				//if the responsibiity doesn't exist
      				if (!hasResp){
      					//add a new responsibility to the role (username, task, status)
      					//console.debug("adding a new responsibility to role " + r._id);
      					if (!r.responsibilities){
      					  r.responsibilities = [];
      					}
      					r.responsibilities.push({
      						username: task.username,
      						task: task._id,
      						status: task.status,
      						substatus: task.substatus
      					});		
      				}

      				if (r.isNew){
      				  //console.log("Adding role", r);
      				  self.add(r);
      				} else {
      				  //console.log("Updating role", r);
      				  self.update(r);
      				}
			        
			      //});
			    //} catch (err){
			      //didn't find the role, so this is new
			   //   console.debug("ERROR getting role in RoleModel", err);
			   // }
			 });
      },
      
      displayName: function(){
    		var fullName = "",
    			displayName = "",
    			db = this.db,
    			r = this.role;
    			
    		if (r.username === db.username()){
    			fullName = "Me"; 
    		} else {
    			fullName = db.contact(r.username);
    		}

    		displayName = fullName;

    		if (r.name !== ""){
    			fullName = r.name + " - " + fullName;
    		}

    		return displayName;
    	},
    	accept: function(username){
    		var db = this.db,
    		    r = this.role,
    		    p = db.projectStore.get(r.project),
    		    self = this;

    		if (r.responsibilities.length > 0){
    			dojo.forEach(r.responsibilities, function(resp){
    				if (resp.username == username){
    					resp.status = "CURRENT";
    					resp.substatus = "ACCEPTED";
    					self.addActivity({
    						verb: "ACCEPT",
    						object: {id:r._id, name: "Role", type:"ROLE"},
    						target: {id:p._id, name:p.name, type:"PROJECT"},
    						icon: self.icon.accept
    					});
    				}
    			});
    		}
    	},
    	decline: function(username){
        var db = this.db,
            r = this.role,
            p = db.projectStore.store.get(r.project),
            self = this;

    		if (r.responsibilities.length > 0){
    			dojo.forEach(r.responsibilities, function(resp){
    				if (resp.username == username){
    					resp.username == "UNASSIGNED";
    					resp.status = "CURRENT";
    					resp.substatus = "UNASSIGNED";
    					self.addActivity({
    						verb: "DECLINE",
    						object: {id:r._id, name: "Role", type:"ROLE"},
    						target: {id:p._id, name:p.name, type:"PROJECT"},
    						icon: self.icon.decline
    					});
    				}
    			});
    		}
    	},
    	assign: function(username){
    		//this function assigns a new user to a role and updates current responsibilities
    		//to belong to this user
    		var db = this.db,
    		    r = this.role,
    			  name = r.name,
    			  self = this;

    		r.username = username;

    		if (r.hasResponsibilities()){
    			dojo.forEach(r.responsibilities, function(resp){
    				//TODO: should probably assign responsibilities to the new user that
    				//aren't done yet
    				resp.username = username;
    				resp.status = "CURRENT";
    				resp.substatus = "DELEGATED";
    				if (username === db.username()){
    					resp.substatus = "ACCEPTED";
    				}
    				if (username === "UNASSIGNED"){
    					resp.substatus = "UNASSIGNED";
    				}
    			});
    		}
    		//show that a user was assigned to a named role. If not named, role is still under the covers
    		if (name !== ""){
    			self.addActivity({
    				target: {id:r.username, name:db.contactFullName(r.username), type:"PERSON"},
    				verb: "ASSIGN",
    				object: {id:r._id, name:name, type:"ROLE"},
    				icon: self.icon.assign
    			});
    		}
    	},
    	hasResponsibilities: function(){
    		var r = this.role;
    		return (r.responsibilities && r.responsibilities.length > 0);
    	},
    	updateResp: function(task){
    		//this function adds a reponsibility if it doesn't exist or updates it if it does
    		//set a tasks status to trash to delete
    		var r = this.role,
    		    self = this;

    		if (r.hasResponsibilities()){
    			var exists = false;
    			dojo.forEach(r.responsibilities, function(resp) {
    				if (resp._id === task._id){
    					resp.username = task.username;
    					resp.status = task.status;
    					resp.substatus = task.substatus;
    					exists = true;
    				}
    			});
    			if (!exists){
    				r.responsibilities.push({
    					username: task.username,
    					task: task._id,
    					status: task.status,
    					substatus: task.substatus
    				});
    			}

    		} else {
    			r.responsibilities.push({
    				username: task.username,
    				task: task._id,
    				status: task.status,
    				substatus: task.substatus
    			});	
    		}
    		
    		//TODO: there is no activity stream entry here yet but in time, it makes sense to 
    		//indicate that a responsibility has been added or changed. At this time, it's not 
    		//clear yet in the interface what a responsibility is
    	},
    	dismiss: function(username){
    		var r = this.role,
    		    name = r.name,
    		    self = this;

    		//when a role has a name, show that the user was dismissed from it. With no name,
    		//roles are under the covers
    		if (name !== ""){

    			self.addActivity({
    				object: {id:username, name:db.contactFullName(username), type:"PERSON"},
    				verb: "DISMISS",
    				target: {id:r._id, name:name, type:"ROLE"},
    				icon: self.icon.dismiss
    			});
    		}
    	},
    	reassign: function(username){
    
    		var r = this.role,
    		    old = r.username;

    		this.assign(username);
    		this.dismiss(old);
    	},
    	addActivity: function(opts){
    	  var db = this.db,
    	    r = this.role,
          p = db.projectStore.store.get(r.project),
          username = db.username();
    	  
    	  var defaults = {
    			actor: {id:username, name:db.fullName(), type:"PERSON"},
    			object: {id: r._id, name: r.name, type: "ROLE"},
    		  time: stamp.toISOString(new Date(),{milliseconds:true})
    		};
    		opts = dojo.mixin(defaults, opts || {});
    		
    		//make sure there is a place to put history
    		if (!r.history){
    		  r.history = [];
    		}
    		
    		r.history.unshift(opts);
    	}
  });
  return app.models.RoleModel;    
});

