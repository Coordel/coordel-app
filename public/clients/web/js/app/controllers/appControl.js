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
        "app/views/Tutorial/Tutorial",
        "app/views/Preferences/Preferences",
        "app/views/TaskForm/TaskForm",
        "app/widgets/ContainerPane",
        "app/views/OpportunityAction/OpportunityAction",
        "dojo/cookie",
        "app/views/QuickStart/QuickStart",
        "app/views/PersonalInfo/PersonalInfo",
				"app/views/DemoList/DemoList"], 
        function (dojo, defList, dijit, layout, login, db, t, tl, p, pNavControl, streamControl, rh, Dialog, ActionDialog, coordel, cDialog, ProjectForm, ProjectAction, PersonForm, vDialog, Tutorial, Preferences, TaskForm, ContainerPane, OpportunityAction, cookie, QuickStart, PersonalInfo, DemoList) {
	
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
	      //db.projectStore.loadExtendedTasks("3c0b0b22b121ab3c3ae522593cbfab6a");
	      app.username = db.appStore.username;
	      app.showApp();
	      var alerts = db.getAlerts(app.username);
	      dojo.when(alerts, function(res){
	        app.currentAlerts = res;
	        
	        //set dnd 
          if (db.appStore.app().dndActive){
            dojo.publish("coordel/doNotDisturb", [{isActive: true, app:db.appStore.app()}]); 
          }
          
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
	    console.debug("PLAYING SOUND", sound);
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
	    window.location = "/";
	  },
	  
	  showApp: function() {
	    var ac = this;
	    
	    var socket = io.connect(window.location.host);
	    
	    //console.log("showing app", this.username);
		  
			//register for socketio events
			socket.on("changes:" + this.username.toString(), function (change) {
		    //console.log("SOCKET CHANGE", change);
		    app.handleChange(change);
		  });
		  
		  socket.on("alerts:" + this.username.toString(), function(alert){
		    console.log("SOCKET ALERT", alert);
		    app.handleAlert(alert);
		  });
		  
		  socket.on("contacts:" + this.username.toString(), function(contact){
		    console.log("SOCKET CONTACT", contact);
		    app.handleContact(contact);
		  });
		  
		  var self = this;
	    
	    this.initSounds();
	    
	    this.resetHandlers();
	    
	    //any time based values (i.e. timeago) use this hearbeat
	    this.interval = setInterval(dojo.hitch(self, self._timeUpdate), 60000);
	    
      //listen for logout
      this.handlers.push(dojo.subscribe("coordel/logout", this, "doLogout"));
      
      //listen for task actions
      this.handlers.push(dojo.subscribe("coordel/taskAction", this, "doTaskAction"));
      
      //listen for project actions
      this.handlers.push(dojo.subscribe("coordel/projectAction", this, "doProjectAction"));
      //listen for opportunity actions
      this.handlers.push(dojo.subscribe("coordel/opportunityAction", this, "doOpportunityAction"));
      //listen for project edit
      this.handlers.push(dojo.subscribe("coordel/editProject", this, "handleEditProject"));
      
      //listen for addObject actions
      this.handlers.push(dojo.subscribe("coordel/addObject", this, "addObjectAction"));
			
			//listen for sound requiest
	  	this.handlers.push(dojo.subscribe("coordel/playSound", this, "playSound"));
	  	
	  	//listen for alerts clear
	  	this.handlers.push(dojo.subscribe("coordel/clearAlerts", this, "handleClearAlerts"));
	  	
	  	//listen for support actions
	  	this.handlers.push(dojo.subscribe("coordel/support", this, "handleSupport"));
	  	
	  	//listen for dnd actions
	  	this.handlers.push(dojo.subscribe("coordel/doNotDisturb", this, "handleDoNotDisturb"));
	  	
	  	//listen for app updates
	  	this.handlers.push(dojo.subscribe("coordel/appUpdate", this, "handleAppUpdate"));
	  	
  		dojo.removeClass(document.body, "loading login");
		  //console.debug("database has loaded, getting ready to show layout");
		      
		  //do main layout
      layout.showLayout();

      //console.debug("database has loaded, getting ready show right header");
      //show the right header
		  var rightHead = dijit.byId("mainLayoutHeaderRight"); 
      rightHead.addChild(new rh({
        userFullName: db.fullName()
      }));
      
      //console.debug("database has loaded, showed right header");
		      
      //init the primary nav controller 
      app.navController = pNavControl.init(ac.username);
      
      //console.log("after primary nav control init");
      var bg = dojo.cookie("bg");

    	if (!bg){
    		bg = 0;
    	}

    	if (bg <= 0){
    		bg = 1;
    	}

    	dojo.addClass(dojo.byId("outerLayout"), "bg"+bg.toString());

    	bg = parseInt(bg,10) + 1;
    	
    	if (bg > 10){
    		bg = 1;
    	}
    	
    	dojo.cookie("bg", bg);
    	//console.log(dojo.cookie("bg"));
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
	    
	    //console.log("args", args);
	    
	    if (args.action === "reuse") {
	      return;
	    }
	    
	    if (args.action === "accept"){
	      var t = db.getTaskModel(args.task, true);
	      t.accept(args.task);
	      return;
	    }
	    //the TaskActionMenu sends the action to do and the task this function 
	    //shows the correct dialog to capture the user's message and save the state change
      var css = "highlight-button",
          title = coordel.taskActions[args.action],
          executeText = coordel.ok;
      
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
    
    doOpportunityAction: function(args){
      //console.log("appControl should do opportunity action", args);
      var css = "highlight-button",
	        d,
	        proj;
	        
      //show an opportunity action
      if (args.cssClass){
	      css = args.cssClass;
	    }

	    opp = new OpportunityAction({
  	    project: args.project,
  	    action: args.action
  	  });

	    d = new cDialog({
	      title: "",
	      confirmText: coordel.opportunityActions.confirmText[args.action],
	      executeCss: css,
	      //executeText: coordel.projectActions[args.action],
	      executeText: coordel.ok,
	      title:  coordel.opportunityActions[args.action],
	      content: opp,
	      onCancel: function(){
	        d.destroy();
	      }
	    });

      dojo.connect(opp, "onValidate", function(isValid){
	      //console.debug("opportunityAction got onValidate", isValid);
	      d.validate(isValid);
	    });

	    dojo.connect(d, "onConfirm", opp, "save");

	    if (args.validate){
  	    dojo.addClass(d.confirmTextContainer, "action-form-header");
  	    d.validate();
	    } else {
	      //not validating so hide the projectaction
	      dojo.addClass(opp.domNode, "hidden");
	    }

	    d.show();
    },
	  
	  doProjectAction: function(args){
	   
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
	      
	      //console.log("showing project action", args.validate);
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
  	      //executeText: coordel.projectActions[args.action],
  	      executeText: coordel.ok,
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
  	      //not validating so hide the projectaction unless it's feedback
  	      if (args.action !== "ackDone"){
  	        dojo.addClass(proj.domNode, "hidden");
  	      }
  	      
  	    }

  	    d.show();
	    }
	  },
	  
	  addObjectAction: function(args){
	    //console.debug("appControl should add an object", args);
	    switch (args.object){
	      case "project":
	      this._showProjectForm(args);
	      break;
	      case "task":
	      this._showTaskForm(args);
	      break;
	      case "contact":
	      this._showContactForm();
	      break;
	    }
	  },
	  
	  handleAppUpdate: function(args){
	    var a = args.app;
	    var self = this;
	    //console.log("app for dnd update", a);
	    dojo.when(db.appStore.post(a), function(){
	      db.appStore._app = a;
	      dojo.publish("coordel/updateNotificationCount", [{currentAlerts: self.currentAlerts}]);
        //console.log("app updated", a);
      });
	  },
	  
	  handleSupport: function(args){
	    var title = "",
	        template = "support/quickStart.html",
	        d;
	    
	    switch (args){
	      case "showQuickStart":
	      title = "";
	      //console.log("show quick start");
	      break;
	     
	      case "showTutorial":
	      title = coordel.tutorial;
	      template = "support/tutorial.html";
	      //console.log("show tutorial");
	      break;
	      
	      case "showEmailIntegration":
	      title = "E-mail Integration";
	      template = "support/emailIntegration.html";
	      //console.log("show email integration");
	      break;
	      
	      case "showDemos":
	      title = coordel.demos;
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
	    } else if (args === "preferences"){
	      d = new vDialog({
  	      title: coordel.preferences,
  	      content: new Preferences(),
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });
	      
	    } else if (args === "personalInfo"){
	      var pers = new PersonalInfo();
	      d = new cDialog({
	        title: coordel.personalInfo,
	        content: pers,
	        style: {width: "500px"},
	        onCancel: function(){
	          d.destroy();
	        }
	      });
	      
	      dojo.connect(d, "onConfirm", pers, "save");
	    } else if (args === "showEmailIntegration"){
	      d = new vDialog({
  	      title: title,
  	      style: {width: "560px"},
  	      href: template,
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });
	    } else if (args === "showDemos") {
		
				//console.log("show demos");
				
				 d = new vDialog({
	  	      title: title,
	  	      style: {width: "560px"},
	  	      content: new DemoList(),
	  	      onCancel: function(){
	  	        d.destroy();
	  	      }
	  	    });
				
				
				
			} else {
	      d = new vDialog({
  	      title: title,
  	      content: new QuickStart(),
  	      onCancel: function(){
  	        d.destroy();
  	      }
  	    });
	    }
	    
	    
	    
	    d.show();
	  },
	  
	  handleDoNotDisturb: function(args){
	    
	    var a = db.appStore.app();
	    var self = this;
	    if (args.isActive){
	      //this means that the do no disturb has been activated
        a = args.app;
        a.dndActive = true;

        dojo.create("div", {
          id: "dndIndicator",
          "class": "dnd c-float-r",
          innerHTML: coordel.doNotDisturb
        }, "leftNavHeader", "first");

	    } else {
	      delete a.dndActive;
	      dojo.destroy("dndIndicator");
	    }
	    
	    if (a.vips && a.vips.length === 0){
        delete a.vips;
      }

	    //console.log("app for dnd update", a);
	    dojo.when(db.appStore.post(a), function(){
	      db.appStore._app = a;
	      //update the notification count
        dojo.publish("coordel/updateNotificationCount", [{currentAlerts: self.currentAlerts}]);
        //console.log("dnd updated", a);
      });
	  
	  },
	  
	  _showProjectForm: function(args){
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
	    
	    if (args.template){
	      proj._setTemplate(args.template);
	    }
	  },
	  
	  _showTaskForm: function(args){
	    //console.log("_showTaskForm", args);
	    var task = new TaskForm({
	      task: {
	        project: args.project._id
	      }, isNew: true, showTips: false});
	    
	    var c = new ContainerPane({
	      style: "padding:0"
	    });

	    
	    
	    var d = new cDialog({
	      title: coordel.newTask,
	      baseClass: "task-form",
	      executeText: coordel.save,
	      content: c
	    });
	    
	    var save = dojo.connect(d, "onConfirm", task, function(){
	      task.save();
	      dojo.disconnect(save);
	      d.destroy();
	    });
	    
	    d.show();
	    c.addChild(task);
	    task._setPills("project");
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
	  
	  handleContact: function(contact){
	    //should refresh the contact store with the contact
	    //console.log("handle the contact");
	    db.contactStore.store.notify(contact);
	  },
	  
	  handleAlert: function(alert){
	    
	    var a = db.appStore.app();
	    var self = this;
	    
	    self.currentAlerts.unshift(alert);
	    
      if (!a.dndActive){
  	    //update the notification count
        dojo.publish("coordel/updateNotificationCount", [{currentAlerts: this.currentAlerts}]);
        //play the sound
        dojo.publish("coordel/playSound", ["ding"]);
	    } else {
	      if (a.vips && a.vips.length > 0){
	        dojo.forEach(a.vips, function(vip){
	          //console.log("alert in handle alert", alert);
	          if (alert.actor.id === vip){
	            //update the notification count
              dojo.publish("coordel/updateNotificationCount", [{currentAlerts: self.currentAlerts}]);
              //play the sound
              dojo.publish("coordel/playSound", ["ding"]);
	          }
	        });
	      }
	    }
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
  			
			  if (chg._deleted){
					if (!db.deleted[chg._id]){
						db.deleted[chg._id] = true;
					}
				}
  			
  	    
  	    
  	    // first detect the docType (task, project, activity, message) and notify the stores
  	    switch (chg.docType){
  				case "app":
  				  
  				  //appStore - i'll only ever get changes to my app, update the store, no notification
  				  db.appStore.store.notify(chg, chg._id);
  				  //console.log("appStore notified", chg);
  					break;
  				case "template":
  				  db.appStore.templateStore.notify(chg, chg._id);
  				  if (chg.isNew){
  				    
  				  }
  				  //console.log("templateStore notified", chg);
  				  break;
  				case "project":
  				
  				  var p = db.getProjectModel(chg, true);
  				  
  				  var isNew = true,
  				      projects = db.projects(false),
  				      assignStatus = "";
  				      
  				  //console.debug("projects in change test", projects);
  				  
  				  //console.log("project change id", chg._id);
  				  //console.log("current project", db.projectStore.currentProject);
  				  
  				  //need to check if this is new because it may have been saved several times before it 
  				  //got to this user so its isNew property might be false
  				  dojo.forEach(projects, function(proj){
  				    if (proj._id === chg._id){
  				      isNew = false;
  				    }
  				  });
  				  
  				  //make sure everyone in the project is in my contacts list
  		
  				  var newContact = false;
  				  
  				  dojo.forEach(chg.users, function(id){
  				    var list = db.contacts();
              
  				    var test = list.filter(function(item){
  				      return item.id === id;
  				    });
  				    
  				    if (!test.length){
  				      //console.log("add new contact", id);
  				      db.contactStore.addContact(id);
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
  					  //console.debug("Notify Project ADD", chg._id, chg._rev);
  					  if (chg.substatus === "OPPORTUNITY"){
  					    if (db.isOpportunities){
  					      db.projectStore.oppStore.notify(chg);
  					      db.projectStore.store.notify(chg);
  					    } else {
  					      //need to see if this is a user of the project
  					      db.projectStore.store.notify(chg);
  					    }
  					    
  					  } else {
  					    db.projectStore.store.notify(chg);
  					  }
  					  
  					} else if (assignStatus === "DECLINED" || chg.substatus === "DELETED" || chg.status === "TRASH" || chg.status === "ARCHIVE" || chg._deleted){
  					  //this project was deleted
  					  //console.debug("Notify Project DELETE",chg._id, chg._rev);
  					  db.projectStore.store.notify(null, chg._id);
  					  
  					} else {
  					  //this is an update
  					  //console.debug("Notify Project UPDATE", chg, chg._id, chg._rev);
  					  
  					  if (chg.substatus === "OPPORTUNITY" && db.projectStore.oppStore){
  					    db.projectStore.oppStore.notify(chg, chg._id);
  					    db.projectStore.store.notify(chg, chg._id);
  					  } else {
  					    db.projectStore.store.notify(chg, chg._id);
  					  }
  					}
  					dojo.publish("coordel/projectNotify", [{project: chg}]);
  					break;
  				case "role":
  				  if (chg.isNew && chg.creator !== app.username && chg.updater !== app.username  && chg.status !== "TRASH" && chg.status !== "ARCHIVE" && !chg._deleted){
  				    //this is a new role that I didn't create
  				    //console.debug("Notify Role ADD", chg);
  				    db.roleStore.store.notify(chg);
  				  } else if (chg.status === "ARCHIVE" || chg.status === "TRASH" || chg._deleted) {
  				    //role was deleted
  				    //console.debug("Notify Role DELETE");
  				    db.roleStore.store.notify(null, chg._id);
  				  } else {
  				    //this was an update
  				    //console.debug("Notify Role UPDATE");
  					  db.roleStore.store.notify(chg, chg._id);
  				  }
  				  
  				  //if the role belongs to the current project, then need to update the project store;
  				  
  				  if (chg.project === db.projectStore.currentProject){
  				    //console.debug("Current Project Role", chg, app.username);
  				    if (chg.isNew && chg.creator !== app.username && chg.status !== "TRASH" && !chg._deleted){
  				      //console.debug("Notify Project Role ADD", chg);
  				      //this is a new task and I didn't create it so add 
  				      db.projectStore.roleStore.notify(chg);
  				      
  				    } else if (chg.status === "TRASH" || chg._deleted){
  				      //console.debug("Notify Project Role DELETE", chg);
  				      db.projectStore.roleStore.notify(null, chg._id);
  				      
  				    } else {
  				      //this is an update
  				      //console.debug("Notify Project Role UPDATE", chg);
  				      db.projectStore.roleStore.notify(chg, chg._id);
  				    }
  				  } else {
  				    //console.log("Role Project Not Current", chg);
  				  }
  				  
  				  
  				  
  				  dojo.publish("coordel/roleNotify", [{role: chg}]);
  				  break;
  				case "task":
  				  //taskStore - incoming change to one of my tasks
  				  //console.debug("STATUS: ", chg.status, db.focus);
  				  
  				  if (chg.username === app.username ||
  				        //if I'm the delegator then I need to know what happens to this task
  				        (chg.delegator && chg.delegator !== chg.responsible && chg.delegator === app.username) ||
  				        //if I'm the responsible then I need to know what happens to this task
  				        (chg.responsible === app.username)
  				        /*
  				        //if I'm responsible and this task is delegated, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "DELEGATED") ||
  				        //if I'm responsible and this task is accepted, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "ACCEPTED") ||
  				        //if I'm responsible and this task is submitted, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "DONE") ||
  				        //if I'm responsible and this task is cancelled, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "CANCELLED") ||
  				        //if I'm responsible and this task is declined, then i need to be notified
  				        (chg.responsible === app.username && chg.substatus === "DECLINED") ||
  				        //if I'm responsible and this task is an issue, then I need to be notified
  				        (chg.responsible === app.username && chg.substatus === "ISSUE") ||
  				        //a user has proposed a change to a task and i'm responsible
  				        (chg.responsible === app.username && chg.substatus === "PROPOSED")
  				        */
  				        
  				        ){
  				          
  				    
  				    if (chg.isNew && chg.creator !== app.username && chg.status !== "TRASH" && chg.status !== "ARCHIVE" && !chg._deleted){
  				      //this is a new task that I didn't create so add 
  				      db.taskStore.store.notify(chg);
  				      //console.log("Notify Task ADD", chg.name);
  				      
  				    } else if (chg.status === "TRASH" || chg.status === "ARCHIVE" || chg._deleted){
  				      //this task was deleted
  				      db.taskStore.store.notify(null, chg._id);
  				      //console.log("Notify Task DELETE", chg, db.taskStore.memory);
								
								
								//need to track deleted from session to session to make sure we don't try and load it again
								//this came up when demos required that docs get deleted en masse
							
								
							
  				      
  				    } else {
  				      //this is an update
  				      db.taskStore.store.notify(chg, chg._id);
  				  
  				      //console.log("Notify Task UPDATE", chg.name);
  				    }
  				    
  				  }
  				  
  	        //since the user could make any task in any project a blocker,
  	        //there's no way to tell if the store needs updated except to check the existing 
  	        //blockers. if it was chosen before, it will be in this store
  			    if (dojo.indexOf(db.getBlockerArray(), chg._id) > -1){
				      //console.debug("Notify Blockers UPDATE", chg.name);
				      db.taskStore.blockStore.notify(chg, chg._id);
				    }
  			
  				  
  				  //projectStore - if the currentProject is is the project of this task
  				  //update taskStore with the incoming task
  				  if (chg.project === db.projectStore.currentProject){
  				    //console.debug("Current Project Task", chg, app.username);
  				    if (chg.isNew && chg.creator !== app.username && chg.status !== "TRASH" && !chg._deleted){
  				      //console.debug("Notify Project Task ADD", chg);
  				      //this is a new task and I didn't create it so add 
  				      db.projectStore.taskStore.notify(chg);
  				      
  				    } else if (chg.status === "TRASH" || chg._deleted){
  				      //console.debug("Notify Project Task DELETE", chg);
  				      db.projectStore.taskStore.notify(null, chg._id);
  				      
  				    } else {
  				      //this is an update
  				      //console.debug("Notify Project Task UPDATE", chg);
  				      db.projectStore.taskStore.notify(chg, chg._id);
  				    }
  				  } else {
  				    //console.log("Task Project Not Current", chg);
  				  }
  				  //console.log("taskNotify", chg.name);
  				  dojo.publish("coordel/taskNotify", [{task: chg}]);
  					break;
  				case "message":
  				  //console.log("message", chg.updater ,app.username, db.focus, db.streamStore.currentContextId);
  			
  				  //a message notify the stream store
  				  //if i sent it, it's an update, if I didn't send it , it's an add
  				  if (chg.updater !== app.username){
  				    //I didn't send this message, it's an add
  				    if (db.streamStore.currentContext === "projectStream" && chg.project === db.streamStore.currentContextId){
  				      db.streamStore.projectStore.notify(chg);
  				    }
  				    if (db.streamStore.currentContext==="taskStream" && db.streamStore.currentContextId === chg.task){
  				      db.streamStore.taskStore.notify(chg);
  				    }
  				    db.streamStore.store.notify(chg);
  				    //console.log("Notify Message ADD", chg);
  				    dojo.publish("coordel/streamNotify", [{message: chg}]);
  				  } else {
  				    
  				    //console.log("Notify Message UPDATE", chg.project, db.streamStore.currentContextId, db.streamStore.currentContext);
  				    if (db.streamStore.currentContext === "projectStream" && chg.project === db.streamStore.currentContextId){
  				      //console.log("notifying streamStore");
  				      db.streamStore.projectStore.notify(chg, chg._id);
  				      
  				    }
  				    
  				    if (db.streamStore.currentContext==="taskStream" && db.streamStore.currentContextId === chg.task){
  				      //console.log("notifying streamStore");
  				      db.streamStore.taskStore.notify(chg, chg._id);
  				    
  				    }
  				    
  				    db.streamStore.store.notify(chg, chg._id);
  				    dojo.publish("coordel/streamNotify", [{message: chg}]);
  				    //I sent it, it's an update
  				    //db.streamStore.store.notify(chg, chg._id);
  				  }
  					break;
  				case "file":
  					break;
  			};
	      
	      //update the counts in case
	      dojo.publish("coordel/setPrimaryBoxCounts");

  	}
	  
	};
	
	return app;
});