define(["dojo",  
        "dijit",
        "dijit/Dialog",
        'app/views/Task/Task',
        'app/layouts/taskListLayout',
        'app/views/TaskList/TaskList',
        'app/views/Stream/Stream',
        'app/views/TaskListGroup/TaskListGroup',
        'app/views/EmptyTaskList/EmptyTaskList',
        'app/views/SortMenuButton/SortMenuButton',
        'app/views/TaskListHeader/TaskListHeader',
        'app/views/StreamMessage/StreamMessage',
        'i18n!app/nls/coordel',
        'app/util/group',
        'app/models/CoordelStore',
        'app/views/Turbo/Turbo',
        'app/views/Calendar/Calendar',
        'app/views/QuickEntry/QuickEntry',
        'app/views/OpportunityList/OpportunityList',
        'dojo/date/locale',
        'app/views/QuickSearch/QuickSearch'], function(dojo, dijit, dialog, t, layout, tl, Stream, tlg, etl, sort, tlh, message, txt, g, db, Turbo, Calendar, QuickEntry, OpportunityList) {
  return {
    controllerName: "taskListControl",
    showProjectLabel: false,
    isIntialized: false,
    focus: null,
    taskList: [], 
    emptyGroup: null,
    isEmpty: true, 
    observeHandlers: [],
    subscribeHandlers: [],
    stream: null,
    isTurbo: false,
    turboMap: {}, //this tracks any task that were left in the list 
    streamTarget: "deadlineCalendar", //by default, show the calendare. other values streamActivity
    sortOptions: {
      grpTimeline: false,
      grpProject: false,
      grpUsername: false,
      showChecklist: false,
      sortKeys:[{attribute: "contextDeadline", descending: false}]
    },  //sort order defaults to sorting by name, checklist off 
       //(options: by = name(s), project(g), priority(s), deadline(g), status(g), username(g))
    init: function(focus, isTurbo){
      //console.debug("init taskListControl focus", focus);
      var tlc = this;
      
      db.streamStore.currentContext = "userStream";
      
      this._clearSubscribeHandlers();
      
      this.isTurbo = isTurbo;
      
      layout.showLayout();
     
      //the init gets the db store that was initialized in appControl
      db.focus = "task";
      
      //init also gets the name of the focus
      tlc.focus = focus;
      
	    //console.debug("focus tasks", focus, tasks);
      tlc._showHeader(focus, isTurbo);
  
      //show the task list
	    tlc.showTaskList(focus);
	    
      //show the quick entry
      this._showQuickEntry();
      
	    //console.log("focus in tasklist control",  focus);
	    //set the title
      document.title = "Coordel > " + txt[focus];
	    
	    //either show the turbo if this is turbo and current or private, or show the stream
      if (isTurbo && (focus === "current" || focus === "private")){
        //show the turbo
        //console.debug("show the turbo, isTurbo true in taskListControl");
        this.showTurbo();
      } else {
        //show the stream
        //console.debug("show the stream, isTurbo false in taskListControl", this.streamTarget);
        
        if (this.streamTarget === "deadlineCalendar"){
          this.showCalendar();
        } else if (this.streamTarget === "streamActivity"){
          this.showStream();
        }

      }

      //handle click of the tabs
      //calendar
      dojo.connect(dojo.byId("calendarTab"), "onclick", this, function(evt){
        //console.debug("clicked calendar", evt.target);
        if (dojo.hasClass(evt.target, "inactive")){
          this.showCalendar();
        } 
      });

      //stream
      dojo.connect(dojo.byId("streamTab"), "onclick", this, function(evt){
        //console.debug("clicked stream", evt.target);
        if (dojo.hasClass(evt.target, "inactive")){
          this.showStream();
        }
      });
          
      //listen for sortChange
      this.subscribeHandlers.push(this.sortChangeHandler = dojo.subscribe("coordel/sortChange", this, "setSortOrder"));
      
      //listen for deleted Tasks private tasks will be deleted, others set to "TRASH" status
      this.subscribeHandlers.push(this.removeTaskHandler = dojo.subscribe("coordel/removeTask", this, "refreshList"));
      
      //listen for hide/show rightColumn 
      this.subscribeHandlers.push(this.showRightColumnHandler = dojo.subscribe("coordel/showRightColumn", this, "setRightColumn"));
      
      //listen for doNotDisturb
      this.subscribeHandlers.push(this.doNotDisturbHandler = dojo.subscribe("coordel/doNotDisturb", this, "setDoNotDisturb"));
      
      this.isInitialized = true;
    
    },
    
    _showTab: function(tabId){
      
      var node = dojo.byId(tabId);
      if (node){
        switch (tabId){
          case "streamTab":
          if (dojo.hasClass(node, "inactive")){
            dojo.removeClass(node, "inactive");
            dojo.addClass(node, "active");
            dojo.addClass("calendarTab", "inactive");
            dojo.removeClass("calendarTab", "active");
            this.streamTarget = "streamActivity";
            dijit.byId("streamContainer").selectChild("streamActivity");
            dojo.removeClass(dijit.byId("showFullStreamFilter").domNode, "hidden");
          }
          break;
          case "calendarTab":
          if (dojo.hasClass(node, "inactive")){
            dojo.removeClass(node, "inactive");
            dojo.addClass(node, "active");
            dojo.addClass("streamTab", "inactive");
            dojo.removeClass("streamTab", "active");
            this.streamTarget = "deadlineCalendar";
            dijit.byId("streamContainer").selectChild("deadlineCalendar");
            dojo.addClass(dijit.byId("showFullStreamFilter").domNode, "hidden");
          }
          break;
        }
      }
      
    },
      
    setDoNotDisturb: function(doNotDisturb){
      if (doNotDisturb){
        this.setRightColumn(false);
      } else {
        this.setRightColumn(true);
      }
    },
    
    setRightColumn: function(showColumn){
      
      //console.debug("showColumn in taskListControl", showColumn);
      
      var col = dijit.byId("rightListTabsLayout");
      
      if (col){
         if (showColumn){
           
            dojo.removeClass(col.domNode, "hidden");
    
      
          } else {
       
            dojo.addClass(col.domNode, "hidden");

     
          }
          dijit.byId("outerLayout").resize();
      }

    },
    
    setSortOrder: function(args){
      //console.debug("setSortOrder", args);
      var sortOptions = this.sortOptions;
      
      //sort might need to happen with the existing options
      if (args){
        //grouping are mutually exclusive, so if one is selected, the others are off
        //set if this is grouped or if options are ste
        if (args.type === "group" || args.type === "option"){
          switch (args.id){
            case "grpTimeline":
              sortOptions.grpProject = false;
              sortOptions.grpUsername = false;
              //console.debug("group by timeline");
              sortOptions.grpTimeline = args.value;
              break;
            case "grpProject":
              sortOptions.grpUsername = false;
              sortOptions.grpTimeline = false;
              //console.debug("group by project");
              sortOptions.grpProject = args.value;
              break;
            case "grpUsername":
              sortOptions.grpProject = false;
              sortOptions.grpTimeline = false;
              //console.debug("group by username");
              sortOptions.grpUsername = args.value;
              break;
            //it's an option, so toggle it on or off
            case "optDescending":
              sortOptions.sortKeys[0].descending = args.value;
              break;
            case "optShowChecklist":
              sortOptions.showChecklist = args.value;
              break;
          }
        }

        //if it's an attribute, then select it
        if (args.type === "attribute"){
          sortOptions.sortKeys[0].attribute = args.value;
        }
      }
      
      this.setSortOptions(sortOptions);
    },
    
    setSortOptions: function(args){
      //console.debug("setSortOptions: ", this.focus, this.sortOptions);
      this.sortOptions = args;
      this.showTaskList(this.focus);
    },
    
    refreshList: function(args){
      //console.debug("refreshList args:", args);
      //this.showList(this.focus);
    },
    
    _showHeader: function(focus, isTurbo){
      //console.debug("showHeader", focus);
      var head = dijit.byId("mainLayoutHeaderCenter");

  	  if (head.hasChildren()){
	      head.destroyDescendants();
	    }
	  
	    
	    this.header = new tlh({listFocus:focus});

	    
	    if (isTurbo){
	      //hide the goTurbo button and show the cancelTurbo button
	      dojo.addClass(this.header.goTurbo.domNode, "hidden");
	      dojo.removeClass(this.header.cancelTurbo.domNode, "hidden");
	      //hide the sort button
	    }
	    
	    var a = dojo.connect(this.header.goTurbo, "onClick", this, function(){
	      dojo.publish("coordel/setTurbo", [{isTurbo: true}]);
	      dojo.publish("coordel/showRightColumn", [true]);
	      //this.showTurbo();
	      dojo.disconnect(a);
	    });
	    
	    var b = dojo.connect(this.header.cancelTurbo, "onClick", this, function(){
	      dojo.publish("coordel/setTurbo", [{isTurbo: false}]);
	      this.turboMap = {};
	      //this.showTurbo();
	      dojo.disconnect(b);
	    });
	    
	    //turbo is only allowed on current and private tasks so disable it on the others
	    if (focus === "current" || focus === "private"){
	      this.header.goTurbo.set("disabled", false);
	      this.header.cancelTurbo.set("disabled", false);
	      //show the cancel label when turbo active
	      this.header.cancelTurbo.set("showLabel", true);
	    } else {
	      this.header.goTurbo.set("disabled", true);
	      this.header.cancelTurbo.set("disabled", true);
	      //hide the cancel label when turbo disabled
	      this.header.cancelTurbo.set("showLabel", false);
	    }
	  
	    head.addChild(this.header);
	    var bn = dijit.byId("showRightColumn");
	    this.setRightColumn(dojo.hasClass(bn.domNode, "hidden"));
    },
    
    _getNext: function(){
      //return false to show turbo done

      var count =0,
          found = false,
          done = false,
          empty = false,
          t;
      
      //if there aren't any tasks show done
      if (this.taskList.length === 0){
        return({hasTask: false, isEmpty: true});
        //return false;
      }

      while (!found) {
        t = this.taskList[count];
        if (!this.turboMap[t._id]){
          found = true;
        } else if (count === this.taskList.length -1){
          dojo.publish("coordel/turboDone", [{id: t._id, isDone: true}]);
          found = true;
          done = true;
        } else {
          dojo.publish("coordel/turboDone", [{id: t._id, isDone: true}]);
          count ++;
        }
      }
      
      if (done){
        //console.debug("no more items in this list, wizard should stop");
        return({hasTask: false, isEmpty: false});
      } else {
        //console.debug("in _getNext returning ", t);
        return({hasTask: true, task: t});
      }

    },
        
    showCalendar: function(){
      //console.debug("showing calendar");
      
      this._showTab("calendarTab");
      dijit.byId("streamContainer").selectChild("deadlineCalendar");
      var cont = dijit.byId("deadlineCalendar");
      
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      
      cont.addChild(new Calendar({listFocus: this.listFocus}));
    },
    
    showTurbo: function(){
      
      //console.debug("showing turbo", this.focus);
      
      //the right container needs to be updated; hide the stream header and resize
      dojo.addClass("streamHeader", "hidden");
      
      //set the correct stack pane
      dijit.byId("streamContainer").selectChild("taskListTurbo");
      dijit.byId("rightListTabsLayout").resize();
      
      
      //add the wizard to the pane
      var cont = dijit.byId("taskListTurbo");
      
      if (cont.domNode){
        dojo.addClass(cont.domNode, "tasklist-titlepane");
      }
      
      if (cont.hasChildren()){
   	    cont.destroyDescendants();
   	  }
   	  
   	  this.turboWizard = new Turbo({focus: this.focus, isChecklist: false});
   	  
   	  //watch for skipped tasks and add them to the map;
   	  dojo.connect(this.turboWizard, "onSkip", this, function(task){
   	    this.turboMap[task._id] = true;  
        this.turboWizard.next(this._getNext());
   	  });
   	  
   	  //watch for next event from turbo
   	  dojo.connect(this.turboWizard, "onNext", this, function(task){
   	    this.turboMap[this.turboWizard.currentTask._id] = true; 
        this.turboWizard.next(this._getNext());
   	  });

   	  //add the Turbo view
   	  cont.addChild(this.turboWizard);
      
      //set the first task
      this.turboWizard.next(this._getNext());
      
      //set the title
      document.title = "Coordel > " + txt.turbo.label + " > " + txt[this.focus];
     

    },
    
    showTaskList: function(focus){
      //console.debug("before add tasklist", focus);
      var cont = dijit.byId("taskListMain"),
          query,
          map,
          self = this;
      
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      
      this.header.sortButton.sortDropdown.set("disabled", false);
      
      //console.debug("focus in showTaskList", focus);
      
      if (focus === "project-invited"){
        this._cancelObserveHandlers();
        //query the project store for the PROJECT-INVITES
        //a list of projects passes to the TaskList control will convert projects into the appropriate tasks
        //to work with the Task widget
        
        //need to check for each of the types of possible project-invite and create groups for them
        //new
        var inv = db.projectStore.memory.query("invitedNew", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.projectInvited, inv, focus, "INVITE");
        //declined
        var dec = db.projectStore.memory.query("invitedDeclined", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.declinedProject, dec, focus, "DECLINED");
        //left
        var left = db.projectStore.memory.query("invitedLeft", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.leftProject, left, focus, "LEFT");
        //proposed-changes
        var prop = db.projectStore.memory.query("invitedProposed", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.proposedChange, prop, focus, "PROPOSED");
        //agreed-changes
        var ag = db.projectStore.memory.query("invitedAgreed", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.agreedChange, ag, focus, "AGREED");
        //ammend-proposed-changes
        var amm = db.projectStore.memory.query("invitedAmended", {sort:[{attribute: "created", descending: false}]});
        this._addGroup(txt.amendedChange, amm, focus, "AMENDED");
        
        //console.debug("invites taskListControl", inv.length , dec.length , left.length , prop.length , ag.length , amm.length);
        //show invited projects
        //this.taskList = db.projectStore.memory.query("invitedAgreed", {sort:this.sortOptions.sortKeys});

      } else if (focus === "deferred"){
        this.showProjectLabel = true;
        this._cancelObserveHandlers();
        this.header.sortButton.sortDropdown.set("disabled", true);
        //we'll hide the the groups (project and timeline) and show a timeline of defer date
        map = g.timelineMap("future");
        
        //NOTE: did this as a workaround..must be a better way that using the TQE to set these derived values
        //when you don't query, the first time it doesn't work, so do an extra query to get to work -- stupid me
        //db.taskStore.memory.query({db: db, focus: focus}, {sort:[{attribute: "contextStarts", descending: false}]});
        for (var k in map){
          query = {db: db, focus: focus};
          query.filters = {};
          query.filters["contextStarts"] = {};
          query.filters["contextStarts"].test  = map[k].test;
          var dtime = db.taskStore.memory.query(query, {sort:[{attribute: "contextStarts", descending: false}]});
          this._addGroup(map[k].header, dtime, focus);
        }
        
        this._checkEmpty();
        
      } else if (focus === "opportunities"){
        this._cancelObserveHandlers();
        //console.log("setting opportunities");
        var def = db.projectStore.loadOpportunities(db.username());
        def.then(function(opps){
          
          var latest = db.projectStore.oppMemory.query("latest");
          if (latest.length >0){
            var opp = new OpportunityList({projects:latest}).placeAt("taskListMain");
          } else {
            self.showEmptyTasks();
          }
          
          latest.observe(function(project, removedFrom, insertedInto){
            //console.debug("latest observed", project, removedFrom, insertedInto);

            //was this a delete
            if (removedFrom > -1){
              //console.log("remove opportunity", removedFrom, project, opp);
              opp.removeChild(removedFrom);
            }

            if (insertedInto > -1){
             //console.log("add opportunity", insertedInto, project);
             opp.addOpportunity(project);
            }

          });
          
        });
        
      } else {
        this._cancelObserveHandlers();
        //if this list should be grouped do it otherwise, just show a tasklist
        //timeline
        if (this.sortOptions.grpTimeline){
          this.showProjectLabel = true;
          //add the timeline map groups
          //the groups will depend on the sort field (created, updated are in the past; deadline, defer date are in the future)
          //if (this.sortOptions.attribute === "deadline"){
            var att = this.sortOptions.sortKeys[0].attribute;
            var when = "future";
            if (att === "created" || att === "updated"){
              when = "past";
            }
            //console.debug("attribute", att, when);
            map = g.timelineMap(when);
            for (var key in map){
              query = {db: db, focus: focus};
              query.filters = {};
              query.filters[att] = {};
              query.filters[att].test  = map[key].test;
              var gtime = db.taskStore.memory.query(query, {sort:this.sortOptions.sortKeys});
              this._addGroup(map[key].header, gtime, focus);
            }  
          
        } else if (this.sortOptions.grpProject){
          this.showProjectLabel = false;
          //console.debug("adding the project lists");
          //add groups for all projects (those with no tasks will be hidden)
          var projList = db.projects(true);
          
          dojo.forEach(projList, function(proj){
            //console.debug("adding project", proj.name, focus);
            var gproj = db.taskStore.memory.query({db: db, focus: focus, filters: {project:proj._id}}, {sort:this.sortOptions.sortKeys});
            //console.debug("list", list);
            this._addGroup(proj.name, gproj, focus);
          }, this);
          
          
        } else if (this.sortOptions.grpUsername){
          //add the contact map groups
          
        } else {
          this.showProjectLabel = true;
          
          //console.debug("focus", focus, this.showProjectLabel);
          
          //query for the tasks in focus
          this.taskList = db.taskStore.memory.query({db: db, focus: focus, filters: []}, {sort:this.sortOptions.sortKeys});
          
          //console.log("taskList", this.taskList);
          
          var list = new tl({
  	        listFocus: focus,
  	        taskList: this.taskList,
  	        showChecklist: this.sortOptions.showChecklist,
  	        showProjectLabel: this.showProjectLabel
  	      });
  	      
          cont.addChild(list);

  	      dojo.connect(list, "onInsert", this, function(task){
  	        //when a task is observed added to this tl need to call _getNext if we're in turbo
  	        //onNext is called when the action happens from the turbo control, but remove could
  	        //come from another part of the application
  	        //console.debug("in connect onInsert for tl");
  	        //console.debug("updater on insert", task.updater);
    	      if (this.isTurbo && this.turboWizard.currentTask._id === task._id && (focus === "current" || focus === "private") && task.updater === db.username()){
    	        //console.debug("got an insert here's the task list", this.taskList);
              this.turboWizard.next(this._getNext());
    	      } else {
    	        //some kind of task change happened, so we need to reset the glow
    	        if (this.turboWizard && this.turboWizard.currentTask){
    	          dojo.publish("coordel/glow", [{id: this.turboWizard.currentTask._id, isGlowing: true}]);
    	        }
    	      }
  	      });

  	      dojo.connect(list, "onRemove", this, function(task){
  	        //when a task is observed removed to this tl need to call _getNext if we're in turbo
  	        //onNext is called when the action happens from the turbo control, but remove could
  	        //come from another part of the application
  	        
  	        //console.debug("updater on remove", task.updater);
    	      if (this.isTurbo && this.turboWizard.currentTask._id === task._id && (focus === "current" || focus === "private") && task.updater === db.username()){
              this.turboWizard.onNext();
    	      }
  	      });
          
        }
      }
    
      dijit.byId("taskListLayout").resize();
    },
    
    _showQuickEntry: function(){
      //console.log("focus", this.focus);
      //if (this.focus === "private"){
        //console.debug("should show quickentry");
       
      var qe = new QuickEntry({
        entryType: "task",
        addTitle: txt.quickAddTask,
        onSave: function(args){
          var t = db.getTaskModel(args.entry, true);
          t.add(args.entry);
          qe.showEdit();
        },
        onShowEdit: function(){
          //console.log("resizing onShowEdit");
          dijit.byId("taskListContainer").resize();
           
        },
        onHideEdit: function(){
          //console.log("resizing onHideEdit");
          dijit.byId("taskListContainer").resize();
        }
      }).placeAt("taskListHeader");
      
    //}
    
      dijit.byId("mainCenterContainer").resize();
    },
        
    _createInviteTask: function(proj, status){
      //it's possible that more than one person role is creating an invite of this type
      //so need to create a holder for the usernames. If there's more than one, 
      //we'll append them as a supplemental field to the task. if there's one, that will be the 
      //username
      var users = [];
      
      var role = "project"; //when roleid is project, then this isn't responsible or follower
      
      //we know the type of invite this is based on the incoming status, so just need to 
      //inspect the project to find the assignment(s) with a matching status
      dojo.forEach(proj.assignments, function(assign){
        //if the status matches the incoming status, push the user and then need
        //to check if this is just a follower role so we know what buttons to show. if it's project,
        //it means that they need to participate. if it's follower, then they need to follow the project
        if (assign.status === status){
          if (proj.responsible === db.username()){
            //if i'm the project responsible, then i need to see everyone that might have generated
            //an invite with this status (PROPOSED, DECLINED, LEFT)
            
            //ignore responsible assignments when tracking users,responsibles know about themselves,
            //only care about declined participate. ignore declined follow here
            if (assign.role !== "RESPONSIBLE"){
              if (assign.role === "FOLLOWER"){
                role = "follower";
              } else {
                //track any users that meet all the criteria
                users.push(assign.username);
              }
            }
             
          } else if (assign.username == db.username()){
            //otherwise this is just for me (AGREED, INVITE)
            users.push(assign.username);
          }
        }
        
      });
      
      //create the task here. the project created is used as the id, name as name
      //inviteType is added with the value role became
      //the status is used as the substatus of the task
      var task = {
				_id: proj.created,
				name: proj.name,
				docType: "task",
				inviteType: role,
				created: proj.created,
				updated: proj.updated,
				isNew: proj.isNew,
				responsible: proj.responsible,
				project: proj._id,
				status: "PROJECT",
				substatus: status
		  };
		  
		  //finally deal with the users
		  if (users.length === 0){
		    //console.debug("there was an error coverting project to task, no username");
		  } else if (users.length === 1){
		    task.username = users[0];
		  } else if (users.length > 1){
		    task.username = "MULTIPLE";
		    task.userList = users;
		  }
		  
		  return task;

		},

    _addGroup: function(header, tasks, focus, status){
      var cont = dijit.byId("taskListMain"),
          self = this;

      //console.debug("_addGroup tasks", header, tasks, focus, status);
      //this function add
      var group = new tlg({
        header: header,
        tasks: tasks,
        focus: focus,
        projectStatus: status,
        db: db,
        showChecklist: self.sortOptions.showChecklist,
        showProjectLabel: this.showProjectLabel
      });

      cont.addChild(group);

      //need to watch and see if there is a change to this list
      var handler = group.tasks.observe(function(task, removedFrom, insertedInto){
        //console.debug("tasks observed in taskListControl", task, removedFrom, insertedInto, group.focus);

        //was this a delete
        if (removedFrom > -1){
          group.removeChild(removedFrom);
          //console.debug("NOT REMOVING FROM GROUP BUT SUPPOSED TO remov" + focus, removedFrom, task);
        }

        if (insertedInto > -1){
          //console.debug("inserted into group " + focus, insertedInto);
          //not empty now, hide it
          self.hideEmptyTasks();

          //if the group was hidden before, need to show it now
          if (group.isHidden){
            group.show();
          }

          //console.debug("adding to list", task, group.focus);

          group.addChild(new t({
            focus: group.focus,
            task: task
          }));
        }

        if (group.tasks.length === 0){
          group.hide();
          //if this groups tasks is zero, make sure all aren't
          self._checkEmpty();
        }
        
      });

      this.observeHandlers.push(handler);
    },
    
    _cancelObserveHandlers: function(){
      if (this.observeHandlers.length > 0){
        dojo.forEach(this.observeHandlers, function(h){
          h.cancel();
        });
        this.observeHandlers = [];
      }
    },
    
    _clearSubscribeHandlers: function(){
      if (this.subscribeHandlers.length > 0){
        dojo.forEach(this.subscribeHandlers, function(h){
          dojo.unsubscribe(h);
        });
        this.subscribeHandlers = [];
      }
    },
        
    showEmptyTasks: function(){
      var self = this;
      self.isEmpty = true;
      var cont = dijit.byId("taskListMain");
      //console.debug("showing empty", this.emptyGroup);
      //if (!this.emptyGroup){
      //  console.debug("empty group didin't exist yet", self);
      //console.log("focus in showEmptyTasks", self.focus);
      if (self.focus === "project-invited" || self.focus === "invite"){
        //we don't show empty because the option goes away
        dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
      } else {
        this.emptyGroup = new etl({
          emptyClass: self.focus, 
          emptyTitle: txt.empty[self.focus+"Title"], 
          emptyDescription: txt.empty[self.focus+"Text"]
        });
        cont.addChild(this.emptyGroup);
      }
        
      //} 
    },

    hideEmptyTasks: function(){
      this.isEmpty = false;
      //console.debug("in hideEmptyTasks, taskListControl");
      if (this.emptyGroup){
        this.emptyGroup.destroy();
        this.emptyGroup = null;
      }
    },

    _checkEmpty: function(){
      var cont = dijit.byId("taskListMain");

      //make sure at least one group has a task
      var groups = cont.getChildren(),
          isEmpty = true;
      
      //console.debug("testing empty", groups);
      dojo.forEach(groups, function(g){
        if (g.hasChildren()){
          //console.debug("group isn't empty", g);
          isEmpty = false;
        }
      });

      if (isEmpty){
        this.showEmptyTasks();
      }
    },
    
    showStream: function(){
      
      var self = this;
          
      this._showTab("streamTab");
      
      //console.debug("store data", db.streamStore.memory.data.length);
    
      var stream = db.streamStore.memory.query("all", {sort: [{attribute: "time", descending: true}]});
      //var stream = db.streamStore.loadUserStream();

      dojo.when(stream, function(resp){
        //console.debug("stream", resp.length);
        self._updateStream(resp);

        var handler = resp.observe(function(entry, removedFrom, insertedInto){
          //console.debug("stream observed, entry: ", entry, "removedFrom: ", removedFrom, "insertedInto: ", insertedInto);
          if (insertedInto > -1){
            handler.cancel();
            self.showStream();
          }
        });
      });
      
      
      
    },
    
    _updateStream: function(stream){
      //console.debug("streamTarget", this.streamTarget);
      //refresh the stream with what's loaded in the stream store
      var node = dijit.byId(this.streamTarget);
      try {
        if (node.hasChildren()){
          //console.debug("clearing children in ", this.streamTarget);
          node.destroyDescendants();
        }

        node.addChild(new Stream({stream: stream}));
        
      } catch (err){
        //console.debug("ERROR in _updateStream", err, stream, this.streamTarget);
      }
      
    }
  };
});