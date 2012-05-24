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
    
        'dijit/Dialog',
        'app/views/TaskActionDialog/TaskActionDialog',
        "i18n!app/nls/coordel",
        "app/views/ConfirmDialog/ConfirmDialog",
        "app/views/ProjectForm/ProjectForm",
        "app/views/ProjectAction/ProjectAction",
        "app/views/PersonForm/PersonForm",
        "app/views/Dialog/Dialog",
        "app/views/Tutorial/Tutorial"], 
        function (dojo, defList, dijit, layout, login, db, t, tl, p, pNavControl, streamControl, rh, Dialog, ActionDialog, coordel, cDialog, ProjectForm, ProjectAction, PersonForm, vDialog, Tutorial) {
	
	var app = {
	  username: null,//should be null and set when user logs in
	  
	  handlers: [],
	  
	  navController: null,
	  
	  streamController: null,
	  
	  taskActionHandler: null,
	  
	  projectActionHandler: null,
	  
	  editProjectHandler: null,
	  
	  addObjectHandler: null,
	  
	  doLogoutHandler: null,
	  
	  dingSound: null,
	  
	  doneSound: null,
	  
	  expireSound: null, 
	  
	  currentAlerts: [],
	  
	  init: function() {
	    var app = this,
	        def = db.init();
	    
	    def.then(function(res){
	      console.log("DATABASE LOADED: ", res, db.appStore.username);
	      app.username = db.appStore.username;
	      app.showApp();
	      var alerts = db.getAlerts(app.username);
	      dojo.when(alerts, function(res){
	        app.currentAlerts = res;
	        //update the notification count
          dojo.publish("coordel/updateNotificationCount", [{currentAlerts: app.currentAlerts}]);
	      });
	    });
	  },
	  
	  initSounds: function(){
	    this.doneSound = new Audio("/sounds/task_completed.m4a");
	    this.doneSound.load();
	    
	    this.dingSound = new Audio("/sounds/ding.mp3");
	    this.dingSound.load();
	    
	    this.expireSound = new Audio("/sounds/timer_expire.wav");
	    this.expireSound.load();
	  },
	  
	  playSound: function(sound){
	    //console.debug("PLAYING SOUND", sound);
	    switch (sound){
	      case "ding":
	      this.dingSound.play();
	      break;
	      case "done":
	      this.doneSound.play();
	      break;
	      case "expired":
	      this.expireSound.play();
	    }
	  },
	
	  doLogout: function(){
	    //console.debug("doLogout called");
	    window.location = "/logout";
	  },
	  
	  showApp: function() {
	    var ac = this;
	    
	    var socket = io.connect(window.location.host);
	    
	    console.log("showing app", this.username);
		  
			//register for socketio events
			socket.on("changes:" + this.username.toString(), function (change) {
		    console.log("SOCKET CHANGE", change);
		    app.handleChange(change);
		  });
		  
		  socket.on("alerts:" + this.username.toString(), function(alert){
		    console.log("SOCKET ALERT", alert);
		    app.handleAlert(alert);
		  });
	    
	    this.initSounds();
	    
	    this.resetHandlers();
	    
	    this.interval = setInterval(dojo.hitch(this, this._timeUpdate), 60000);
	    
	  	//listen for logout
	  	this.handlers.push(dojo.subscribe("coordel/logout", this, "doLogout"));
	  	
	  	//listen for task actions
	  	this.handlers.push(dojo.subscribe("coordel/taskAction", this, "doTaskAction"));
	  	
	  	//listen for project actions
	  	this.handlers.push(dojo.subscribe("coordel/projectAction", this, "doProjectAction"));
	  	
	  	//listen for project edit
	  	this.handlers.push(dojo.subscribe("coordel/editProject", this, "handleEditProject"));
	  	
	  	//listen for addObject actions
	  	this.handlers.push(dojo.subscribe("coordel/addObject", this, "addObjectAction"));
	  	
	  	//listen for sound requiest
	  	this.handlers.push(dojo.subscribe("coordel/playSound", this, "playSound"));
	  	
	  	//listen for alerts clear
	  	this.handlers.push(dojo.subscribe("coordel/clearAlerts", this, "handleClearAlerts"));
	  	
	  	//listten for support actions
	  	this.handlers.push(dojo.subscribe("coordel/support", this, "handleSupport"));
	  	
  		dojo.removeClass(document.body, "loading login");
		  //console.debug("database has loaded, in the deferred function",resp);
		      
		  //do main layout
      layout.showLayout();
      
      //show the right header
		  var rightHead = dijit.byId("mainLayoutHeaderRight"); 
      rightHead.addChild(new rh({
        userFullName: db.fullName()
      }));
		      
      //init the primary nav controller 
      app.navController = pNavControl.init(ac.username);
      
      console.log("after primary nav control init");
      
	  },
	  
	  _timeUpdate: function(){
	    dojo.publish("coordel/timeUpdate");
	  },
	  
	  resetHandlers: function(){
	    if (this.handlers.length > 0){
	      dojo.forEach(this.handlers, function(h){
	        dojo.unsubscribe(h);
	      });
	      
	      this.handlers = [];
	    }
	  },
	  

	  doTaskAction: function(args){
	    
	    if (args.action === "reuse") {
	      return;
	    }
	    //the TaskActionMenu sends the action to do and the task this function 
	    //shows the correct dialog to capture the user's message and save the state change
      var css = "highlight-button",
          title = coordel.taskActions[args.action],
          executeText = coordel.taskActions[args.action];
      
      //trim reuse deliverables title and button
      /*
      if (args.action === "reuseDeliverables"){
        title = coordel.taskActions["reuse"];
        executeText = coordel.taskActions["reuse"];
      }
      */
      
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

	      confirmText: coordel.taskActions.confirmText[args.action],
	      executeCss: css,
	      executeText: executeText,
        "class": "tasklist-titlepane",
        title:  title,
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
	      
	      //if (args.action === "reuse" || args.action === "reuseDeliverables"){
	        //dojo.addClass(d.confirmTextContainer, "action-form-header");
	      //} else {
	        //not validating, and not a resue so hide the task action
    	    dojo.addClass(act.domNode, "hidden");
	      //}

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
	        d,
	        proj;
	        
	    //console.log("project action args", args);
	    
	    if (args.action === "reuse"){
	      //need to show the project form with blueprint titles
	      proj = new ProjectForm({

  	      project: args.project,
  	      isNew: false
  	    });

  	    d = new cDialog({
  	      title: coordel.projDetails.reuseProject,
  	      baseClass: "project-form",
  	      executeText: coordel.save,
  	      content: proj,
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });

  	    //console.debug("cDialog", d);

  	    var save = dojo.connect(d, "onConfirm", proj, function(){
  	      proj.reuse();
  	      dojo.disconnect(save);
  	      d.destroy();
  	    }); 

  	    d.show();
	      
	    } else {
	      //show a project action
	      if (args.cssClass){
  	      css = args.cssClass;
  	    }

  	    proj = new ProjectAction({
    	    project: args.project,
    	    action: args.action
    	  });

  	    d = new cDialog({
  	      title: "",
  	      confirmText: coordel.projectActions.confirmText[args.action],
  	      executeCss: css,
  	      executeText: coordel.projectActions[args.action],
  	      title:  coordel.projectActions[args.action],
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
  	      //not validating so hide the projectaction
  	      dojo.addClass(proj.domNode, "hidden");
  	    }

  	    d.show();
	    }
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
	  
	  handleSupport: function(args){
	    var title = "",
	        template = "support/quickStart.html",
	        d;
	    
	    switch (args){
	      case "showQuickStart":
	      title = "Welcome to Coordel!";
	      //console.log("show quick start");
	      break;
	     
	      case "showTutorial":
	      title = "Tutorial";
	      template = "support/tutorial.html";
	      //console.log("show tutorial");
	      break;
	      
	      case "showEmailIntegration":
	      title = "Email Integration";
	      template = "support/emailIntegration.html";
	      //console.log("show email integration");
	      break;
	    }
	    
	    if (args === "showTutorial"){
	      d = new vDialog({
  	      title: title,
  	      content: new Tutorial(),
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });
	    } else {
	      d = new vDialog({
  	      title: title,
  	      href: template,
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });
	    }
	    
	    
	    
	    d.show();
	  },
	  
	  
	  _showProjectForm: function(){
	    //console.debug("create a project");
	    var id = db.uuid();
	    //console.debug("create a project with this _id", id, "username", db.username());
	    //when we create a new project, by default, the current user is
	    //set as the responsible and a responsible role is created for them
	    var proj = new ProjectForm({
	      
	      project: {
	        _id: id,
	        docType: "project",
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
	    
	    var pers = new PersonForm();
	    
	    var d = new cDialog({
	      title: coordel.newContact,
	      baseClass: "contact-form",
	      executeText: coordel.save,
	      content: pers
	    });
	    
	    var save = dojo.connect(d, "onConfirm", pers, function(){
	      pers.save();
	      dojo.disconnect(save);
	      d.destroy();
	    });
	    
	    d.show();
	  },
	  
	  handleAlert: function(alert){
	    this.currentAlerts.unshift(alert);
	    
	    //update the notification count
      dojo.publish("coordel/updateNotificationCount", [{currentAlerts: this.currentAlerts}]);
      
      //play the sound
      dojo.publish("coordel/playSound", ["ding"]);
	  },
	  
	  handleClearAlerts: function(){
	    //console.log("clearing alerts");
	    this.currentAlerts = [];
	    db.clearAlerts();  
	    //update the notification count
      dojo.publish("coordel/updateNotificationCount", [{currentAlerts: this.currentAlerts}]);
	  },
	  
	  handleChange: function(resp){
	    
	    //console.log("appControl handleChanges called", resp);
	  
  	  var notifications = [];
  		//resp.results.map(function(r){
  			var chg = resp,
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
  				case "template":
  				  db.appStore.templateStore.notify(chg, chg._id);
  				  //console.log("templateStore notified", chg);
  				  break;
  				case "project":
  				
  				  var p = db.getProjectModel(chg, true);
  				  
  				  var isNew = true,
  				      projects = db.projects(false),
  				      assignStatus = "";
  				      
  				  //console.debug("projects in change test", projects);
  				  
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
  				      //console.debug("project status = ", assign.status);
  				      assignStatus = assign.status;
  				    }
  				  });

  					//console.debug("project change received", chg, app.username, p);
  					//console.debug("STATUS:", chg.status, chg.substatus);
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
  					  //console.debug("Notify Project UPDATE", chg, chg._id, chg._rev);
  					  //db.projectStore.store.notify(chg, chg._id);
  					}
  					
  					break;
  				case "role":
  				  if (chg.isNew && chg.creator !== app.username && chg.updater !== app.username  && chg.status !== "TRASH" && chg.status !== "ARCHIVE" && !chg._deleted){
  				    //this is a new role that I didn't create
  				    console.debug("Notify Role ADD", chg);
  				    db.roleStore.store.notify(chg);
  				  } else if (chg.status === "ARCHIVE" || chg.status === "TRASH" || chg._deleted) {
  				    //role was deleted
  				    console.debug("Notify Role DELETE");
  				    db.roleStore.store.notify(null, chg._id);
  				  } else {
  				    //this was an update
  				    //console.debug("Notify Role UPDATE");
  					  //db.roleStore.store.notify(chg, chg._id);
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
  				      //db.taskStore.store.notify(chg, chg._id);
  				  
  				      //console.log("Notify Task UPDATE", chg);
  				    }
  				    
  				  }
  				  
  	        //since the user could make any task in any project a blocker,
  	        //there's no way to tell if the store needs updated except to check the existing 
  	        //blockers. if it was chosen before, it will be in this store
  			    if (dojo.indexOf(db.getBlockerArray(), chg._id) > -1){
				      console.debug("Notify Blockers UPDATE");
				      db.taskStore.blockStore.notify(chg, chg._id);
				    }
  			
  				  
  				  //projectStore - if the currentProject is is the project of this task
  				  //update taskStore with the incoming task
  				  if (chg.project === db.projectStore.currentProject){
  				    console.debug("Current Project Task", chg, app.username);
  				    if (chg.isNew && chg.creator !== app.username && chg.status !== "TRASH" && !chg._deleted){
  				      console.debug("Notify Project Task ADD", chg);
  				      //this is a new task and I didn't create it so add 
  				      db.projectStore.taskStore.notify(chg);
  				      
  				    } else if (chg.status === "TRASH" || chg._deleted){
  				      console.debug("Notify Project Task DELETE", chg);
  				      db.projectStore.taskStore.notify(null, chg._id);
  				      
  				    } else {
  				      //this is an update
  				      //console.debug("Notify Project Task UPDATE", chg);
  				      //db.projectStore.taskStore.notify(chg, chg._id);
  				    }
  				  } else {
  				    console.log("Task Project Not Current", chg);
  				  }
  				  
  				  dojo.publish("coordel/taskNotify", [{task: chg}]);
  					break;
  				case "message":
  				  console.log("message", chg.updater ,app.username, db.focus);
  			
  				  //a message notify the stream store
  				  //if i sent it, it's an update, if I didn't send it , it's an add
  				  if (chg.updater !== app.username){
  				    //I didn't send this message, it's an add
  				    if (db.focus === "project" && db.projectStore.streamStore){
  				      db.projectStore.streamStore.notify(chg);
  				    }
  				    if (db.focus === "task" && db.streamStore.taskStore){
  				        db.streamStore.taskStore.notify(chg);
  				    }
  				    db.streamStore.store.notify(chg);
  				    console.log("Notify Message ADD", chg);
  				    dojo.publish("coordel/streamNotify", [{message: chg}]);
  				  } else {
  				    
  				    console.log("Notify Message UPDATE");
  				    if (db.focus === "project" && db.projectStore.streamStore && chg.project === db.projectStore.currentProject){
  				      db.projectStore.streamStore.notify(chg, chg._id);
  				    }
  				    
  				    if (db.streamStore.currentContext==="task" && db.streamStore.currentContextId === chg.task){
  				      db.streamStore.taskStore.notify(chg, chg._id);
  				    }
  				    
  				    //db.streamStore.store.notify(chg, chg._id);
  				    //I sent it, it's an update
  				    //db.streamStore.store.notify(chg, chg._id);
  				  }
  					break;
  				case "file":
  					break;
  			};
  	    
  	    /*
  	    //check if I made this change and capture the notifications
	      if (chg.updater !== app.username){
	        
	        console.log("CHANGED by someone else", chg);
	        //if I didn't make the change, capture notifications
	        //if this requires a notification, there will be a history array
	        if (chg.history){
  	        //get the most recent history entry and use it for the notification
	          notifications.push(chg.history.shift());
	        }
	        
	        //publish the change so views can react
	        //dojo.publish("coordel/changeNotification", [chg]);
	        //console.debug("published a change");
	        
	      } 
	      */
	      
	      //update the counts in case
	      dojo.publish("coordel/setPrimaryBoxCounts");
  		//});
  		//console.log("notifications length, array", notifications.length, notifications);
  		//if there are notifications, publish them
      if (notifications.length > 0){
        
        //post the new notification and set the currentAlerts = to the returned list
        
        
        
        
        /*
        var a = db.appStore.app();
        if (!a.notifications){
          a.notifications = [];
        }
      
        
        //merge the notifications with the existing notifications
        a.notifications = a.notifications.concat(notifications);
        */
        //save the notification into the app
        //console.debug("app", a);
        //db.appStore.store.put(a, {id: a._id, username: app.username});
        //update the notification count
        
        //dojo.publish("coordel/updateNotificationCount", [{count: this.currentAlerts.length}]);
        
        //play the sound
        //dojo.publish("coordel/playSound", ["ding"]);
      }
  	}
	  
	};
	
	return app;
});