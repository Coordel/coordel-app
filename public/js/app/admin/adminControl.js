define(
  ["dojo",
  "dijit/form/Button",
  "dijit/form/TextBox",
  "app/store/CouchDbStore",
  "app/models/CoordelStore"], function(dojo, Button, TextBox, couch, db) {
	var admin = {
	  
	  db: "/" + djConfig.couchdb + "/",
	  
	  store: null,
	  
		init: function() { 
      var self = this;
      
      this._initStore();
      
      dojo.connect(dijit.byId("removeProject"), "onClick", function(){
        console.debug("remove clicked", db);
        
        var v = dijit.byId("project").get("value");
        
        self.removeProject(v);
      });  
      
      dojo.connect(dijit.byId("clean"), "onClick", function(){
        console.debug("clean project clicked", db);
        self.cleanDirtyProjects();
      }); 
      
      dojo.connect(dijit.byId("dirty"), "onClick", function(){
        console.debug("dirty project clicked", db);
        var dirty = self.showDirtyProjects();
        dirty.then(function(projects){
          console.debug("dirty projects", projects);
        });
      }); 
      
      dojo.connect(dijit.byId("removeTask"), "onClick", function(){
        console.debug("remove task clicked", db);
        
        var v = dijit.byId("task").get("value");
        
        self.removeTask(v);
      });  
      
      dojo.connect(dijit.byId("cleanTasks"), "onClick", function(){
        console.debug("clean clicked", db);
        self.cleanDirtyTasks();
      }); 
      
      dojo.connect(dijit.byId("dirtyTasks"), "onClick", function(){
        console.debug("dirty tasks clicked", db);
        self.showDirtyTasks();
      });
      
      dojo.connect(dijit.byId("removeRole"), "onClick", function(){
        console.debug("remove role clicked", db);
        
        var v = dijit.byId("role").get("value");
        
        self.removeRole(v);
      }); 
      
      dojo.connect(dijit.byId("cleanRole"), "onClick", function(){
        console.debug("clean role clicked");
        
        var v = dijit.byId("role2").get("value");
        
        var r = self.store.get(v);
        dojo.when(r, function(role){
          self.cleanRole(role);
        });
        
      }); 
      
      dojo.connect(dijit.byId("addUser"), "onClick", function(){
        console.debug("add user clicked");
        
        var username = dijit.byId("username").get("value"),
            password = dijit.byId("password").get("value");
      });
      
      dojo.connect(dijit.byId("changePassword"), "onClick", function(){
        console.debug("change password clicked");
        
        var username = dijit.byId("username").get("value"),
            password = dijit.byId("password").get("value");
        
        var chg = db.changePassword(username, password);
        dojo.when(chg, function(userdoc){
          console.debug("password changed", userdoc);
        });
        
      });
      
      dojo.connect(dijit.byId("cleanRoles"), "onClick", function(){
        console.debug("clean roles clicked");
        self.cleanDirtyRoles();
      }); 
      
      dojo.connect(dijit.byId("dirtyRoles"), "onClick", function(){
        console.debug("dirty roles clicked", db);
        self.showDirtyRoles();
      });
		},
		
		cleanDirtyProjects: function(){
		  var self = this;
		  
		  var list = this.loadProjects();
		  
		  dojo.when(list, function(resp){
		    dojo.forEach(resp, function(p){
  		    if (self.isDirtyProject(p)){
  		      self.removeProject(p._id);
  		    }
  		  });
		  });
		  
		},
		
		isDirtyProject: function(proj){
		  var isDirty = false,
		      self = this,
		      def = new dojo.Deferred();
		  
    
		  if (!proj.substatus){
		    isDirty = true;
		  }
		  
		  var xRoles = self.testProjectXtraRoles(proj);
		  
		  
		  xRoles.then(function(res){
		    
		    if (res){
		      isDirty = true;
		    }
		    
		    var hasRole = self.testProjectRoles(proj);
		
		    hasRole.then(function(res){
		    
		      if (res){
		        isDirty = true;
		      }
		      console.debug("before isDirtyProject callback");
		      def.callback(isDirty);
		    });
		    
		  });
		  
		  return def;
		},
		
		showDirtyProjects: function(){
		  var self = this,
		      isDirty = false,
		      dirty = [],
		      def = new dojo.Deferred();
		  
		  var list = this.loadProjects();
		  
		  list.then(function(projects){
		    var count = 0;
		    dojo.forEach(projects, function(proj){
		      var test = self.isDirtyProject(proj);
		      test.then(function(res){
		        //console.debug("test result showDirty ", res);
		        if (res){
		          //console.debug("pushing dirty project ", proj);
		          dirty.push(proj);
		        }
		        
		      });
		      count +=1;
		      console.debug("project count", count, "length", projects.length);
		      if (count === projects.length){
		        console.debug("calling back in showDirtyProjects");
		        def.callback(dirty);
		      }
  		  });
  		  
		  });
		  
		  return def; 
		},
		
		testProjectRoles: function(proj){
		  //console.debug("testing existing roles");
		  //if there isn't a role for all assignments in in the project, this is dirty
		  var def = new dojo.Deferred(),
		      aList = [],
		      count = 0,
		      self = this,
		      isDirty = false;
		    
		  //get all the assignments that have a roleid  
		  dojo.forEach(proj.assignments, function(assign){
		    if (assign.role !== "RESPONSIBLE" && assign.role !== "FOLLOWER"){
		      aList.push(assign);
		    }
		  });
		  
		  dojo.forEach(aList, function(assign){
		    var test = self.store.get(assign.role);
		    
		    test.then(function(role){
		      //console.debug("got the role", proj);
		      isDirty = false;
		      count += 1;
		      console.debug("count", count, "length", aList.length);
  		    if (count === aList.length){
  		      console.debug ("callback project role test");
            def.callback(isDirty);
  		    }
		    }, function(error){
		      console.debug("got an error", proj);
		      isDirty = true;
		      count += 1;
  		    if (count === aList.length){
  		      console.debug ("callback project role test");
            def.callback(isDirty);
  		    }
		    });
		    
		    
		  });
		  return def;
		},
		
		testProjectXtraRoles: function(proj){
		  //if this project has extra roles, it's dirty
		  var def = new dojo.Deferred(),
		      self = this,
		      isDirty = false,
		      count = 0;
		  self.loadProjectRoles(proj._id).then(function(roles){
		    dojo.forEach(roles, function(role){
	        var hasAssign = false;
	        //need to see if any of the assingments in the project have this role
	        dojo.forEach(proj.assignments, function(assign){
	          //console.debug ("testing assignment", assign, role);
	          if (assign.role === role._id){
	            hasAssign = true;
	          }
	        });
	        if (!hasAssign){
	          console.debug("role exists without project assignment");
	          isDirty = true;
	        }
	        count += 1;
	        if (count === roles.length){
	          def.callback(isDirty);
	        }
	      });
	      
		  });
		  return def;
		},
		
		showDirtyTasks: function(){
		  var self = this,
		      dirty = [];
		  
		  var list = this.loadTasks();
		  
		  dojo.when(list, function(resp){
		    //console.debug("tasks loaded", resp);
		    dojo.forEach(resp, function(t){
  		    if (self.isDirtyTask(t)){
  		      //console.debug("testing task", t);
  		      dirty.push(t._id);
  		    }
  		  });
  		  
  	    console.debug("dirty tasks", dirty, dirty.length);
		  });
		  
		},
		
		showDirtyRoles: function(){
		  var self = this;
		  
		  var list = this.loadRoles();
		  
		  dojo.when(list, function(resp){
		    //console.debug("roles loaded", resp);
		    dojo.forEach(resp, function(r){
		      
		      var test = self.isDirtyRole(r);
		      dojo.when(test, function(resp){
		        if (resp.isDirty){
    		      console.debug("DIRTY role: ", r._id, resp);
    		      /*
    		      dojo.forEach(resp.errors, function(e){
    		        //console.debug(e.error, e.object.docType, e.object._id);
    		      });
    		      */
    		      //self.cleanRole(r, resp.errors);
    		    }
		      });
  		  });
		  });
		},
		
		cleanDirtyRoles: function(){
		  var self = this;
		  
		  var list = this.loadRoles();
		  
		  dojo.when(list, function(resp){
		    //console.debug("roles loaded", resp);
		    dojo.forEach(resp, function(r){
		      
		      var test = self.isDirtyRole(r);
		      dojo.when(test, function(resp){
		        if (resp.isDirty){
    		      //console.debug("DIRTY role: ", r._id);
    		      self.cleanRole(r);
    		    }
		      });
  		  });
		  });
		},
		
		cleanRole: function(role){
		  //since there were problems, all we do is reset the responsibilities
		  //console.debug("clean role", role);

		  var list = this.loadProjectTasks(role.project),
		      self = this;
		  
		  dojo.when(list, function(tasks){
		    var reset = [],
		        old = dojo.clone(role.responsibilities);
		    dojo.forEach(tasks, function(task){
		      if (task.username === role.username && task.status !== "TRASH"){
		        reset.push({
		          task: task._id,
    		      status: task.status,
    		      substatus: task.substatus,
    		      username: task.username
    		    });
		      }
		      
		      //add the role to the task
		      if (task.username === role.username){
		        if (!task.role){
		          console.debug("should update task: ", task.name, " with roleid ", role._id);
		          /*
		          task.role = role._id;
		          var put = self.store.put(task, {username: "admin"});
		          dojo.when(put, function(resp){
		            console.debug("task.role set", resp);
		          });
		          */
		        }
		      }
		    });
		    
		    role.responsibilities = reset;
		    console.debug("cleaned role", role, old);
		    var put = self.store.put(role, {username: "admin"});
		    dojo.when(put, function(resp){
		      console.debug("Role updated", resp);
		    });
		  });
		},
		
		isDirtyRole: function(role){
		  var list = this.loadProjectTasks(role.project),
		      isDirty = false,
		      def = new dojo.Deferred(),
		      errors = [];
		      
		  dojo.when(list, function(tasks){
		    dojo.forEach(tasks, function(task){
		      
		      if (role.username === task.username){
		        
		        //clean if there are TRASH responsibilities
		        //make sure each task has a corresponding role
		        var hasResp = false,
		            isTrash = false;
		        dojo.forEach(role.responsibilities, function(r){
		          
		          //don't care about trash tasks
		          if(task.status === "TRASH"){
		            hasResp = true;
		          }

  		        if (r.task === task._id && r.status === task.status && r.substatus === task.substatus){
  		          hasResp = true;
  		        }
  		        
  		        if (r.status === "TRASH"){
  		          isTrash = true;
  		        }
  		      });
  		      
  		      if (isTrash){
  		        isDirty = true;
  		        errors.push({
  		          error: "had status=TRASH",
  		          object: task
  		        });
  		      }
  		      
  		      if (!hasResp){
  		        //console.debug("didn't have responsibility", task);
  		        isDirty = true;
  		        errors.push({
  		          error: "missing responsibility",
  		          object: task
  		        });
  		      }
		      }
		    });
		    
		    //make sure each role responsibility has a corresponding task
		    dojo.forEach(role.responsibilities, function(r){
		      var hasTask = false;
		      dojo.forEach(tasks, function(task){
		        
		        if (task.username === role.username){
		          if (r.task === task._id){
		            hasTask = true;
		          }
		        }
		        
		      });
		      if (!hasTask){
		        //console.debug("missing task for responsibility", r.task);
		        isDirty = true;
		        errors.push({
		          error: "missing task",
		          object: role
		        });
		      }
		    
		    });
		    
		    def.callback({isDirty:isDirty, errors: errors});
		  });
		  return def;
		},
		
		isDirtyTask: function(task){
		  var isDirty = false;
		  if (!task.role){
		    isDirty = true;
		  }
		  return isDirty;
		},
		
		cleanDirtyTasks: function(){
		  var projList = this.loadProjects(),
		      self = this;
		  
		  dojo.when(projList, function(projects){
		    
		    dojo.forEach(projects, function(proj){
		      var roleList = self.loadProjectAssignments(proj._id);
		      dojo.when(roleList, function(roles){
		        dojo.forEach(roles, function(role){
		          dojo.forEach(role.responsibilities, function(resp){
		            var task = self.store.get(resp.task);
		            dojo.when(task, function(t){
		              if (!t.role){
		                t.role = role._id;
		                var put = self.store.put(t, {username: "admin"});
            		    dojo.when(put, function(resp){
            		      console.debug("Task updated", resp);
            		    });
		              }
		            });
		          });
		        });
		      });
		    });
		  }); 
		},
		
		removeProject: function(project){
		  //console.debug("project to remove", project);
		  var list = this.loadProject(project);
		  
		  var toRemove = [];
		  
		  dojo.when(list, function(resp){
		    dojo.forEach(resp, function(row){
		      toRemove.push(row);
		    });
		    //console.debug("project docs to remove", toRemove);
		    var bulk = db.bulkRemove({docs: toRemove});
		    
		    dojo.when(bulk, function(resp){
		      var ok = true,
		          notOk = [];
		          
		      
		      dojo.forEach(resp, function(r){
		        if (!r.ok){
		          notOk.push(r);
		        }
		      });
		      
		      if (notOk.length > 0){
		        console.debug("ERROR with project: ", project, notOk);
		      } else {
		        console.debug("SUCCESS: " + project);
		      }
		    });
		  });
		},
		
		loadProjectRoles: function(project){
		  var queryArgs = {
        view: "coordel/projectRoles",
    		startkey: [project],
    		endkey: [project,{}],
    		include_docs: true
    	};
    	
    	return this.store.query(queryArgs);
		},
		
		loadProjectTasks: function(project){
		  var queryArgs = {
        view: "coordel/projectTasks",
    		startkey: [project],
    		endkey: [project,{}],
    		include_docs: true
    	};
    	
    	return this.store.query(queryArgs);
		},
		
		loadProjectAssignments: function(project){
      var store = new couch({
        target: this.db, 
        idProperty: "_id"
      });;
      
      var queryArgs = {
        view: "coordel/projectAssignments",
    		startkey: [project],
    		endkey: [project, {}],
    		include_docs: true
    	};
    	
    	return store.query(queryArgs);
    
    },
		
		loadProjects: function(){
		  var project = "1";
		  var queryArgs = {
        view: "coordel/allProjects",
    		startkey: [project]
    	};
    	
    	return this.store.query(queryArgs);
		},
		
		loadTasks: function(){
		  var task = "1";
		  var queryArgs = {
        view: "coordel/allTasks",
    		startkey: [task]
    	};
    	
    	return this.store.query(queryArgs);
		},
		
		loadRoles: function(){
		  var role = "1";
		  var queryArgs = {
        view: "coordel/allRoles",
    		startkey: [role]
    	};
    	
    	return this.store.query(queryArgs);
		},
		
		_initStore: function(){
		
      this.store = new couch({
        target: this.db, 
        idProperty: "_id"
      });
      
      this.users =  new couch({
        target: "/_users", 
        idProperty: "_id"
      });
     
		},
		
		
		loadProject: function(project){
		  var queryArgs = {
        view: "coordel/allProjectFiles",
    		startkey: [project],
    		endkey: [project,{}],
    		"include_docs": true
    	};
    	
    	return this.store.query(queryArgs);
		}
	};
	
	return admin;
});