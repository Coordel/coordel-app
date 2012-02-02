define(['dojo',
        'dojo/DeferredList',
        'dijit',
        'app/layouts/main',
        'app/views/Login/Login', 
        'app/models/CoordelStore',
        'app/views/Task/Task',
        'app/views/TaskList/TaskList',
        'app/views/Project/Project',
        'app/controllers/primaryNavControl',
        'app/controllers/streamControl',
        'app/views/RightHeader/RightHeader',
        'dojox/socket',
        'dijit/Dialog',
        'app/views/TaskActionDialog/TaskActionDialog',
        "i18n!app/nls/coordel",
        "app/views/ConfirmDialog/ConfirmDialog",
        "app/views/ProjectForm/ProjectForm",
        "app/views/ProjectAction/ProjectAction"], 
        function (dojo, defList, dijit, layout, login, db, t, tl, p, pNavControl, streamControl, rh, socket, Dialog, ActionDialog, coordel, cDialog, ProjectForm, ProjectAction) {
	
	var app = {
	  username: null,//should be null and set when user logs in
	  
	  appData: null,
	  
	  navController: null,
	  
	  streamController: null,
	  
	  taskActionHandler: null,
	  
	  projectActionHandler: null,
	  
	  editProjectHandler: null,
	  
	  addObjectHandler: null,
	  
	  loggedIn: false,
	  
	  doLogoutHandler: null,
	  
	  loginForm: null,
	  
	  changesSocket: null, 
	  
	  dingSound: null,
	  
	  doneSound: null,
	  
	  reset: function(){
	    //reset the app
	    this.username = null;
	    this.appData = null;
	    this.navController = null;
	    this.streamController = null;
	    dojo.unsubscribe(this.taskActionHandler);
	    this.taskActionHandler = null;
	    dojo.unsubscribe(this.projectActionHandler);
	    this.projectActionHandler = null;
	    dojo.unsubscribe(this.editProjectHandler);
	    this.editProjectHandler = null;
	    dojo.unsubscribe(this.addObjectHandler);
	    this.addObjectHandler = null;
	    this.loggedIn = false;
	    dojo.unsubscribe(this.doLogoutHandler);
	    this.doLogoutHandler = null; 
	    
	    if (this.loginForm){
	      this.loginForm.destroy();
  	    this.loginForm = null;
	    }
	    
	    dijit.byId("outerLayout").destroyRecursive();
	  
	  },
	  
	  init: function() {
	    //step one, test if user is logged on by doing a _session request
	    //test response to see if there is userCtx
	    //if yes, login and startup
	    
	    var app = this;
	    /*
	    if (!app.loggedIn){
	      var s = db.session();
  	    s.then(function(resp){
  	      //console.debug("response from session", resp);
  	      if (resp.userCtx.name){
    	      //this is a logged on user, start the application
    	      app.username = resp.userCtx.name;
    	      djConfig.username = resp.userCtx.name;
    	      app.loggedIn = true;
    	      //console.debug("about to show the app");
    	      app.showApp();
    	    } else {
    	      //if no, this isn't a logged in user, cleanup (in case) and show the login
    	      //console.debug ("not logged in");
    	      app.doLogin();
    	    }
  	    });
	    } 
	    */
	    
	    app.username = "jeff.gorder@coordel.com";
      djConfig.username = "jeff.gorder@coordel.com";
      app.loggedIn = true;
      //console.debug("about to show the app");
      app.showApp();
	
	  },
	  
	  initSounds: function(){
	    this.doneSound = new Audio("js/app/sounds/task_completed.m4a");
	    this.doneSound.load();
	    
	    this.dingSound = new Audio("js/app/sounds/ding.mp3");
	    this.dingSound.load();
	  },
	  
	  playSound: function(sound){
	    switch (sound){
	      case "ding":
	      this.dingSound.play();
	      break;
	      case "done":
	      this.doneSound.play();
	      break;
	    }
	  },
	  
	  doLogin: function(){
	   
	    var app = this;
	    
	    dojo.removeClass(document.body, "loading");
      dojo.addClass(document.body, "login");
    
	    this.loginForm = new login().placeAt(dojo.body());
	    
	    dojo.connect(this.loginForm, "onSubmit", this, function(evt){
	      //the user pressed enter in the password input
	      this._doLogin();
	    });
	    
	    dojo.connect(dojo.byId("submitLogin"), "onclick", this,  "_doLogin");
	  
	  },
	  
	  _doLogin: function(){
	    var username = dojo.byId("username").value,
          password = dojo.byId("password").value,
          remembeMe = dijit.byId("rememberMe").get("checked");
          
      if (rememberMe){
        dojo.cookie("username", username, {expires: 14});
        dojo.cookie("password", password, {expires: 14});
      } 
          
      //console.debug("in showLogin username, password", username, password);

      db.login({
        username: username,
        password: password
      }).then(function(res){
        app.loginForm.destroy();
        app.loginForm = null;
        //console.log("login response", res);
        app.init();
      },
      function(error){
        dojo.removeClass(dojo.byId("loginError"), "hidden");
        
        var resp = dojo.fromJson(error.responseText);
        
        //console.debug("login error:", resp.reason);
        
        dojo.byId("loginErrorMessage").innerHTML = resp.reason;
      });
	  },
	  
	  doLogout: function(){
	    //console.debug("doLogout called");
	    window.location = "/logout";
	  },
	  
	  showApp: function() {
	    var ac = this;
	    
	    this.initSounds();
	    
	    //init the database
	    var def = db.init(this.username); 
	    
	    
	  	//listen for logout
	  	this.doLogoutHandler = dojo.subscribe("coordel/logout", this, "doLogout");
	  	
	  	//listen for task actions
	  	this.taskActionHandler = dojo.subscribe("coordel/taskAction", this, "doTaskAction");
	  	
	  	//listen for project actions
	  	this.projectActionHandler = dojo.subscribe("coordel/projectAction", this, "doProjectAction");
	  	
	  	//listen for project edit
	  	this.editProjectHandler = dojo.subscribe("coordel/editProject", this, "handleEditProject");
	  	
	  	//listen for addObject actions
	  	this.addObjectHandler = dojo.subscribe("coordel/addObject", this, "addObjectAction");
	  	
	  	//listen for sound requiest
	  	this.addObjectHandler = dojo.subscribe("coordel/playSound", this, "playSound");
      
      this.pollChanges();
  		
  		def.then(function(resp){
  		  console.debug("database loaded..", db);
  		  dojo.removeClass(document.body, "loading login");
  		  //console.debug("database has loaded, in the deferred function",resp);
  		      
  		  //do main layout
        layout.showLayout();
        
        //show the right header
        var contact = db.contact(ac.username);
  		  var rightHead = dijit.byId("mainLayoutHeaderRight"); 
        rightHead.addChild(new rh({
          userFullName: contact.first + " " + contact.last
        }));
  		      
        //init the primary nav controller 
        app.navController = pNavControl.init(ac.username);
      
  		});
  		
	  },
	  
	  pollChanges: function(){
	    //console.debug("in poll changes");
	    //NOTE: this is fairly fragile. Doesn't survive network disruption, etc
	    //when moved server side, might be good to investigate Follow https://github.com/iriscouch/follow
	    var self = this;
  		
  		var headers = {
		    "Accept": "application/json",
        "Content-Type": "application/json"
		  };
  		
  		dojo.xhrGet({
        url: db.db,
        headers: headers,
        handleAs: "json",
        load: function(resp){
          var since = resp.update_seq;
          //console.debug("since", since);
         	var query = {
         	  include_docs:true, 
         	  filter: "coordel/main", 
         	  feed: "longpoll", 
         	  since: since};
        	
        	var changes = socket.LongPoll({
      		  url: db.db + "_changes" + "?" + dojo.objectToQuery(query),
      		  handleAs: "json",
      		  headers: {
                "Accept": "application/json, text/javascript, */*",
                "Content-Type": "application/json"
            }
      		});

      		changes.on("open", function(evt){
      		  //console.log("socket open", evt);
      		});

      		changes.on("message", function(evt){
      		  //console.log("message received from couch", evt, changes);
      		  //get since from the message
      		  query.since = evt.data.last_seq;
      		  changes.args.url = db.db + "_changes" + "?" + dojo.objectToQuery(query);
      		  app.handleChange(evt.data);
      		});
      		
      		var once = dojo.connect(self, "reset", function(){
      		  //console.debug("here is the changes object on reset", changes);
      		  //NOTE: must call close here otherwise you get multiple sockets polling for changes, 
      		  //but not sure why it throws an error every time
      		  changes.close();
      		  dojo.disconnect(once);
      		});
        }
      });
	  },
	  
	  doTaskAction: function(args){
	    //the TaskActionMenu sends the action to do and the task this function 
	    //shows the correct dialog to capture the user's message and save the state change
      var css = "highlight-button";
      
      if (args.cssClass){
        css = args.cssClass;
      }
      
      var act = new ActionDialog({
        task: args.task,
        action: args.action,
        db: db
      });
  
	    //special dialog is raise issue. all others are 
	    //console.debug("appControl should do task action", args);
	    
	    var d = new cDialog({
	      id: "taskActionDialog",
	      confirmText: coordel.taskActions.confirmText[args.action],
	      executeCss: css,
	      executeText: coordel.taskActions[args.action],
        "class": "tasklist-titlepane",
        title:  coordel.taskActions[args.action],
        content: act,
        onCancel: function(){
          d.destroy();
        }
      });
      
      dojo.connect(act, "onValidate", function(isValid){
	      //console.debug("app control got onValidate", isValid);
	      d.validate(isValid);
	    });
	    
	    dojo.connect(d, "onConfirm", act, "save");
	    
	    if (args.validate){
  	    dojo.addClass(d.confirmTextContainer, "action-form-header");
  	    d.validate();
  	    
	    } else {
	      //not validating, so hide the projectaction
	      dojo.addClass(act.domNode, "hidden");
	    }

      d.show();
	    
	  },
	  
	  handleEditProject: function(args){
      //console.debug("handling project edit", args.project);
	    var proj = new ProjectForm({
	      project: args.project,
	      isNew: false
	    });

	    var d = new cDialog({
	      title: coordel.projDetails.editProject,
	      baseClass: "project-form",
	      executeText: coordel.save,
	      content: proj,
	      onCancel: function(){
	        d.destroy();
	      }
	    });

	    //console.debug("cDialog", d);

	    var save = dojo.connect(d, "onConfirm", proj, function(){
	      proj.save();
	      dojo.disconnect(save);
	      d.destroyRecursive();
	    }); 

	    d.show();
    },
	  
	  doProjectAction: function(args){
	    //console.debug("appControl should do project action", args);
	    var css = "highlight-button",
	        d;
	        
	    if (args.cssClass){
	      css = args.cssClass;
	    }
	    
	    //create the action for this project
	    var proj = new ProjectAction({
	      project: args.project,
	      action: args.action
	    });
    
	    d = new cDialog({
	      title: "",
	      confirmText: coordel.projectActions.confirmText[args.action],
	      executeCss: css,
	      executeText: coordel.projectActions[args.action],
	      content: proj,
	      onCancel: function(){
	        d.destroy();
	      }
	    });
    
      dojo.connect(proj, "onValidate", function(isValid){
	      //console.debug("app control got onValidate", isValid);
	      d.validate(isValid);
	    });
	    
	    dojo.connect(d, "onConfirm", proj, "save");
	    
	    if (args.validate){
  	    dojo.addClass(d.confirmTextContainer, "action-form-header");
  	    d.validate();
  	    
	    } else {
	      //not validating, so hide the projectaction
	      dojo.addClass(proj.domNode, "hidden");
	    }
	    
	    d.show();
	  },
	  
	  addObjectAction: function(args){
	    //console.debug("appControl should add an object", args);
	    switch (args.object){
	      case "project":
	      this._showProjectForm();
	      break;
	      case "contact":
	      this._showContactForm();
	      break;
	    }
	  },
	  
	  _showProjectForm: function(){
	    //console.debug("create a project");
	    
	    //when we create a new project, by default, the current user is
	    //set as the responsible and a responsible role is created for them
	    var proj = new ProjectForm({
	      project: {
	        _id: db.uuid(),
	        responsible: db.username(),
	        users: [db.username()],
	        assignments: [{
	          username: db.username(),
	          role: "RESPONSIBLE",
	          status: "ACCEPTED"
	        }]
	      }
	    });
	    
	    var d = new cDialog({
	      title: coordel.newProject,
	      baseClass: "project-form",
	      executeText: coordel.save,
	      content: proj,
	      onCancel: function(){
	        d.destroy();
	      }
	    });
	    
	    //console.debug("cDialog", d);
	    
	    var save = dojo.connect(d, "onConfirm", proj, function(){
	      proj.save();
	      dojo.disconnect(save);
	      d.destroy();
	    }); 
	    
	    d.show();
	  },
	  
	  _showContactForm: function(){
	    //console.debug("create a contact");
	    
	    var d = new cDialog({
	      title: coordel.newContact,
	      baseClass: "contact-form",
	      executeText: coordel.save
	    });
	    
	    d.show();
	  },
	  
	  handleChange: function(resp){
	    
	    //console.log("appControl handleChanges called", resp);
	  
  	  var notifications = [];
  		resp.results.map(function(r){
  			var chg = r.doc,
  			    rev = chg._rev.split("-")[0];

  			console.debug("CHANGE: ", chg.docType.toUpperCase(), chg);
  		
  			
  			//changes need to be propagated to the stores based on what they are
  			//taskStore, projectStore, streamStore, contactStore, appStore
  			
  			  //projectStore
  			    //if the item is a task or role belonging to me or anyone else in the project
  			    //and has the projectId of the currentlyLoaded project
  			    //then the project store is updated
  			    //all incoming projects need to update the projectStore
  			    //in all cases if I didn't make the change, do a notification
  			    
  			  //streamStore - if currentContext = userMessages and type = message, update stream
  			  // if currentContext = task,project,contact and change projectid,taskid,contactid = changeid update
  			  
  			  //contactStore - incoming user docs update the contact store
  			  
  			  //appStore - i'll only ever get changes to my app, update the store, no notification
  			
  			
  	    
  	    
  	    // first detect the docType (task, project, activity, comment) and notify the stores
  	    switch (chg.docType){
  				case "app":
  				  
  				  //appStore - i'll only ever get changes to my app, update the store, no notification
  				  db.appStore.store.notify(chg, chg._id);
  				  //console.log("appStore notified", chg);
  					break;
  				case "project":
  				
  				  var p = db.getProjectModel(chg, true);
  				  
  				  var isNew = true,
  				      projects = db.projects(false),
  				      assignStatus = "";
  				      
  				  console.debug("projects in change test", projects);
  				  
  				  //need to check if this is new because it may have been saved several times before it 
  				  //got to this user so its isNew property might be false
  				  dojo.forEach(projects, function(proj){
  				    if (proj._id === chg._id){
  				      isNew = false;
  				    }
  				  });
  				  
  				  //now get the status for the user
  				  
  				  dojo.forEach(chg.assignments, function(assign){
  				    if (assign.username === app.username){
  				      console.debug("project status = ", assign.status);
  				      assignStatus = assign.status;
  				    }
  				  });
  				  
  				  
  				  
  					console.debug("project change received", chg, app.username, p);
  					console.debug("STATUS:", chg.status, chg.substatus);
  					if (isNew && chg.creator !== app.username && chg.updater !== app.username && chg.status !== "ARCHIVE" && chg.status !== "TRASH" && !chg._deleted){
  					  //this is a new project that I didn't create so add
  					  console.debug("Notify Project ADD", chg._id, chg._rev);
  					  db.projectStore.store.notify(chg);
  					} else if (assignStatus === "DECLINED" || chg.substatus === "DELETED" || chg.status === "TRASH" || chg.status === "ARCHIVE" || chg._deleted){
  					  //this project was deleted
  					  console.debug("Notify Project DELETE",chg._id, chg._rev);
  					  db.projectStore.store.notify(null, chg._id);
  					  
  					} else {
  					  //this is an update
  					  console.debug("Notify Project UPDATE", chg, chg._id, chg._rev);
  					  db.projectStore.store.notify(chg, chg._id);
  					}
  					
  					break;
  				case "role":
  				  if (chg.isNew && chg.creator !== app.username && chg.updater !== app.username  && chg.status !== "TRASH" && chg.status !== "ARCHIVE" && !chg._deleted){
  				    //this is a new role that I didn't create
  				    console.debug("Notify Role ADD", app);
  				    db.roleStore.store.notify(chg);
  				  } else if (chg.status === "ARCHIVE" || chg.status === "TRASH" || chg._deleted) {
  				    //role was deleted
  				    console.debug("Notify Role DELETE");
  				    db.roleStore.store.notify(null, chg._id);
  				  } else {
  				    //this was an update
  				    console.debug("Notify Role UPDATE");
  					  db.roleStore.store.notify(chg, chg._id);
  				  }
  				  
  				  break;
  				case "task":
  				  //taskStore - incoming change to one of my tasks
  				  //console.debug("STATUS: ", chg.status);
  				  
  				  if (chg.username === app.username || 
  				        //if I'm responsible and this task is submitted, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "DONE") ||
  				        //if I'm responsible or delegator and this task is declined, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "DECLINED") ||
  				        (chg.delegator && chg.delegator === app.username && chg.substatus === "DECLINED") ||
  				        //if I'm responsible and this task is an issue, then I need to be notified
  				        (chg.responsible === app.username && chg.substatus === "ISSUE") ||
  				        //a user has proposed a change to a task I delegated or i'm responsible
  				        (chg.responsible === app.username && chg.substatus === "PROPOSED") ||
  				        (chg.delegator && chg.delegator === app.username && chg.substatus === "PROPOSED")
  				        
  				        ){
  				    if (chg.isNew && chg.creator !== app.username && chg.status !== "TRASH" && chg.status !== "ARCHIVE" && !chg._deleted){
  				      //this is a new task that I didn't create so add 
  				      db.taskStore.store.notify(chg);
  				      console.log("Notify Task ADD", chg);
  				      
  				    } else if (chg.status === "TRASH" || chg.status === "ARCHIVE" || chg._deleted){
  				      //this task was deleted
  				      db.taskStore.store.notify(null, chg._id);
  				      console.log("Notify Task DELETE", chg);
  				      
  				    } else {
  				      //this is an update
  				      db.taskStore.store.notify(chg, chg._id);
  				      console.log("Notify Task UPDATE", chg);
  				    }
  				    
  				  }
  				  
  	        //since the user could make any task in any project a blocker,
  	        //there's no way to tell if the store needs updated except to check the existing 
  	        //blockers. if it was chosed before, it will be in this store
  			    if (dojo.indexOf(db.getBlockerArray(), chg._id) > -1){
				      console.debug("Notify Blockers UPDATE");
				      db.taskStore.blockStore.notify(chg, chg._id);
				    }
  			
  				  
  				  //projectStore - if the currentProject is is the project of this task
  				  //update taskStore with the incoming task
  				  if (chg.project === db.projectStore.currentProject){
  				    console.debug("Current Project Task", chg);
  				    if (chg.isNew && chg.creator !== app.username && !chg.status === "TRASH" && !chg._deleted){
  				      console.debug("Notify Project Task ADD", chg);
  				      //this is a new task and I didn't create it so add 
  				      db.projectStore.taskMemory.notify(chg);
  				      
  				    } else if (chg.status === "TRASH" || chg._deleted){
  				      console.debug("Notify Project Task DELETE", chg);
  				      db.projectStore.taskMemory.notify(null, chg._id);
  				      
  				    } else {
  				      //this is an update
  				      console.debug("Notify Project Task UPDATE", chg);
  				      db.projectStore.taskStore.notify(chg, chg._id);
  				    }
  				  } else {
  				    console.log("Task Project Not Current", chg);
  				  }
  				  
  				  dojo.publish("coordel/taskNotify", [{task: chg}]);
  					break;
  				case "message":
  				  //a message notify the stream store
  				  //if i sent it, it's an update, if I didn't send it , it's an add
  				  if (chg.updater !== app.username ){
  				    //I didn't send this message, it's an add
  				    db.streamStore.store.notify(chg);
  				    console.log("Notify Message ADD", chg);
  				  } else {
  				    console.log("Notify Message UPDATE");
  				    //I sent it, it's an update
  				    db.streamStore.store.notify(chg, chg._id);
  				  }
  					break;
  				case "file":
  					break;
  			};
  	    
  	    //check if I made this change and capture the notifications
	      if (chg.updater !== app.username){
	        
	        console.log("CHANGED by someone else", chg);
	        //if I didn't make the change, capture notifications
	        //if this requires a notification, there will be a history array
	        if (chg.history){
  	        //get the most recent history entry and use it for the notification
	          notifications.push(chg.history.shift());
	        }
	        /*
	        //publish the change so views can react
	        dojo.publish("coordel/changeNotification", [chg]);
	        console.debug("published a change");
	        */
	      } 
	      
	      //update the counts in case
	      dojo.publish("coordel/setPrimaryBoxCounts");
  		});
  		//console.log("notifications length, array", notifications.length, notifications);
  		//if there are notifications, publish them
      if (notifications.length > 0){
        var a = db.appStore.app();
        if (!a.notifications){
          a.notifications = [];
        }
        
        //merge the notifications with the existing notifications
        a.notifications = a.notifications.concat(notifications);
        //save the notification into the app
        //console.debug("app", a);
        //db.appStore.store.put(a, {id: a._id, username: app.username});
        //update the notification count
        dojo.publish("coordel/updateNotificationCount", [{count: a.notifications.length}]);
        
        //play the sound
        dojo.publish("coordel/playSound", ["ding"]);
      }
  	}
	  
	};
	
	return app;
});