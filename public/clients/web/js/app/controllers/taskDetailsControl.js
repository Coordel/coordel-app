define([
  "dojo", 
  "dijit",
  "dijit/Dialog",
  'i18n!app/nls/coordel',
  "app/models/DeliverableModel",
  "app/layouts/taskDetailsLayout",
  "app/views/TaskInfo/TaskInfo",
  "app/views/TaskWorkspace/TaskWorkspace",
  "app/views/EmptyDeliverable/EmptyDeliverable",
  "app/views/Deliverable/Deliverable",
  "app/widgets/ContainerPane",
  "app/views/ToDo/ToDo",
  "app/views/Note/Note",
  "app/views/Stream/Stream",
  "dijit/TitlePane",
  "dijit/form/TextBox",
  "dijit/form/Textarea",
  "app/views/QuickSearch/QuickSearch",
  "app/models/CoordelStore",
  "app/views/BlockerInfo/BlockerInfo",
  "app/views/QuickEntry/QuickEntry",
  "dojo/store/Memory",
  "app/views/TaskChecklist/TaskChecklist",
  "app/views/TaskChecklistSort/TaskChecklistSort",
  "app/views/TaskNotes/TaskNotes",
  "app/views/Turbo/Turbo",
  "app/views/TaskDetailsHeader/TaskDetailsHeader",
  "app/models/StreamModel"], function(dojo, dijit, dialog, coordel, dModel, layout, ti, tw, ed, del, cpane, todo, note, Stream, tp, textbox, textarea, search, db, BlockerInfo, QuickEntry, Memory, Checklist, Sort, Notes, Turbo, Header, sModel) {
	return {
		db: null,
		focus: null,
		task: null,
		infoDialog: new dialog({title: coordel.taskDetails.info, style: "width: 400px"}),
		controllerName: "taskDetailsControl",
		
		todoStore: null,
		
		noteStore: null,
		
		todoEntry: null,
		
		bnFilter: null,
		
		bnTurbo: null,
		
		bnSort: null,
		
		turboMap: {},
		
		isTurbo: false,
		
		rightFocus: "todo", //can be note or stream as well
		
		init: function(focus, task, isTurbo) {
		  //console.log("init isTurbo", isTurbo);
		  

		  
		  if (!task.todos){
		    task.todos = [];
		  }
		  
		  if (!task.notes){
		    task.notes = [];
		  }
		
		  //console.debug ("in taskDetailsController", task);
		  //this.task = task;
		  this.task = task;
		  this.focus = focus;
		  this.isTurbo = isTurbo;
		  var self = this;

		  document.title = document.title + " > " + task.name;
		  
		  layout.showLayout(focus, task, db.username(), task.responsible);
		  
		  this.showRightColumnHandler = dojo.subscribe("coordel/showRightColumn", this, "setRightColumn");
		  
		  this.streamNotifyHandler = dojo.subscribe("coordel/streamNotify", this, "handleStreamNotify");
		  
		  var cont = dijit.byId("workspaceMain"),
		      title = coordel.deliverables,
		      content = new ed({emptyTitle: coordel.deliverable.emptyTitle, emptyDescription: coordel.deliverable.emptyDescription});

	    if (cont.hasChildren()){
	      cont.destroyDescendants();
	    }
	    
      this.showHeader();
		  
		  //show the info about the task, if there are attachments show them as well
		  this.showInfo();
		  
		  //if there are blockers, show the blocker or results
		  this.showBlockers();
		  
		  //need to show the deliverables will show deliverables or empty
  		this.showDeliverables();
      
		  //if this task blocks, show the tasks it's blocking
		  this.showBlocking();
		  
		  //show the tab 
		  
		  //load the task stream
		  dojo.when(db.streamStore.loadTaskStream(this.task._id), function(res){
		    //console.log("got stream", res);
		    self.updateRight();
		  });
		  
		  dojo.removeClass(dijit.byId("taskListDetailsTurbo").domNode, "hidden");
      dojo.addClass(dijit.byId("taskListDetailsFilter").domNode, "hidden");
      
      //handle click of the tabs
      //checklist
      dojo.connect(dojo.byId("checklistTab"), "onclick", this, function(evt){
        //console.debug("clicked checklist", evt);
        if (dojo.hasClass(evt.target, "inactive")){
          this.showChecklist();
        }
      });
      
      //notes
      dojo.connect(dojo.byId("notesTab"), "onclick", this, function(evt){
        //console.debug("clicked notes", evt);
        if (dojo.hasClass(evt.target, "inactive")){
          this.showNotes();
        }
      });
      
      //stream
      dojo.connect(dojo.byId("streamTab"), "onclick", this, function(evt){
        //console.debug("clicked stream", evt);
        if (dojo.hasClass(evt.target, "inactive")){
          this.showStream();
        }
      });
      
      dojo.connect(dijit.byId("taskSendMessageButton"), "onClick", this, function(){
        //console.log("project send message button clicked");
        var self = this;

        var node = dijit.byId("taskMessageText");
        var message = node.get("value");
        
        node.reset();
        var stream = new sModel();

        stream.init(db);

        var send = stream.sendTaskMessage(message, self.task);
        
        /*
        dojo.when(send, function(res){
          console.log("sent message", res);
          node.reset();
          self.showStream();
        });
        */
      });
      
      //handle click of the header buttons
      dojo.connect(dijit.byId("taskListDetailsTurbo"), "onClick", this, function(){
        //console.debug("turbo clicked");
        var bn = dijit.byId("taskListDetailsTurbo");
        
        if (this.isTurbo){
          //we were in turbo mode, turn it off and reset the turbo map
          dojo.removeClass(bn.iconNode, "active");
          this.turboMap = {};
          bn.set("title", coordel.goTurbo);

        } else {
          //go into turbo mode
          dojo.addClass(bn.iconNode, "active");
          bn.set("title", coordel.cancelTurbo);
        }
        
        this.isTurbo = !this.isTurbo;
        this.showChecklist();
      });
      
      dijit.byId("rightDetailsLayout").resize();
      
      var bn = dijit.byId("showRightColumn");
	    this.setRightColumn(dojo.hasClass(bn.domNode, "hidden"));
      
		},
	
	  handleStreamNotify: function(args){
      //console.log("stream notify", args);
      if (args.message.task === this.task._id){
        this.showStream();
      }
    },
		
		updateRight: function(){
		  switch (this.rightFocus){
		    case "todo":
		      this.showChecklist();
		      break;
		    case "note":
		      this.showNotes();
		      break;
		    case "stream":
		      this.showStream();
		      break;
		  }
		},
		
		_showTab: function(tabId){
		  
		  switch (tabId){
		    case "checklistTab":
		      this.rightFocus = "todo";
          this._resetTabs();
          dojo.removeClass(tabId, "inactive");
          dojo.addClass(tabId, "active");
          dijit.byId("cnMain").selectChild("taskDetailsChecklist");
          dojo.removeClass(dijit.byId("taskListDetailsTurbo").domNode, "hidden");
          dojo.removeClass(dijit.byId("taskListDetailsSort").domNode, "hidden");
          dijit.byId("rightDetailsLayout").resize();
  		    break;
		    case "notesTab":
		      this.rightFocus = "note";
          this._resetTabs();
          dojo.removeClass(tabId, "inactive");
          dojo.addClass(tabId, "active");
          dijit.byId("cnMain").selectChild("taskDetailsNotes");
          dijit.byId("rightDetailsLayout").resize();
          dojo.style("taskListDetailsContainer", "background", "#e5e5e5");
          dojo.style("taskListDetailsContainer", "border-bottom", "1px solid transparent");
  		    break;
		    case "streamTab":
		      this.rightFocus = "stream";
          this._resetTabs();
          dojo.removeClass(tabId, "inactive");
          dojo.addClass(tabId, "active");
          dojo.removeClass("taskListDetailsInput", "hidden");
          dojo.addClass("taskListDetailsToolbar", "hidden");
          dojo.removeClass(dijit.byId("taskListDetailsFilter").domNode, "hidden");
          dijit.byId("cnMain").selectChild("taskDetailsStream");
          dijit.byId("rightDetailsLayout").resize();
  		    break;
		  }
		  
		},
		
		setRightColumn: function(showColumn){
		  
		  //console.debug("setRightColumn taskDetailsControl", showColumn);
      
      var col = dijit.byId("rightDetailsLayout");
      
      //console.debug("right column", col);
      
      if (col){
         if (showColumn){
          
            dojo.removeClass(col.domNode, "hidden");

        
          } else {
           
            dojo.addClass(col.domNode, "hidden");

            
          }
          dijit.byId("outerLayout").resize();
      }

    },
		
		showHeader: function(){
		  var task = this.task,
		      focus = this.focus;
		      
		  //show the taskDetails header
      var head = dijit.byId("mainLayoutHeaderCenter");

      //console.debug("header", head, head.hasChildren());

      //add the header control
      if (head.hasChildren()){
        head.destroyDescendants();
      }
      
      this.header = new Header({focus: focus, task: task});

      head.addChild(this.header);
	  
	
		  this.sortMenu = dijit.byId("taskListDetailsSortMenu");
      
      var sort = new Sort();
      
      this.sortMenu.set("content", sort);
      
      var bn = dijit.byId("showRightColumn");
      
      this.setRightColumn(dojo.hasClass(bn.domNode, "hidden"));
		},
	
		
		_resetTabs: function(){
		  dojo.addClass("checklistTab", "inactive");
		  dojo.removeClass("checklistTab", "active");
		  dojo.addClass("notesTab", "inactive");
		  dojo.removeClass("notesTab", "active");
		  dojo.addClass("streamTab", "inactive");
		  dojo.removeClass("streamTab", "active");
		  dojo.addClass("taskListDetailsInput", "hidden");
		  dojo.removeClass("taskListDetailsToolbar", "hidden");
		  dojo.style("taskListDetailsContainer", {background:"#e5e5e5", "border-bottom": "1px solid #a3aab1"});
		  dojo.addClass(dijit.byId("taskListDetailsTurbo").domNode, "hidden");
      dojo.addClass(dijit.byId("taskListDetailsFilter").domNode, "hidden");
      dojo.addClass(dijit.byId("taskListDetailsSort").domNode, "hidden");
		},

		showInfo: function(){
		  //adds the info title pane to the layout, always shows
		  var cont = dijit.byId("workspaceMain");
		    
		  if (cont.hasChildren()){
		    cont.destroyDescendants();
		  }
		  
		  this.taskInfo = new ti({task:this.task, showName: false, isTurbo: this.isTurbo});
		      
		  var pane = new tp({
		    title: this.task.name,
		    content: this.taskInfo,
		    "class": "taskDetailsInfo"
		  });
		    
		  cont.addChild(pane);
		},
		
	  showDeliverables: function(){
		  //adds the deliverables title pane to the layout, always shows even if empty
		  var task = this.task,
		      cont = dijit.byId("workspaceMain"),
		      title = coordel.deliverables,
		      content = new ed({emptyTitle: coordel.deliverable.emptyTitle, emptyDescription: coordel.deliverable.emptyDescription});
		  
		  //need to show the deliverables if there are any and they are ready
		  if (task.workspace && task.workspace.length > 0){
		    //show a task workspace control
		    var space = new tw({task: task});
		    
		    dojo.connect(space, "onSave", this, function(task){
		      //console.debug ("saving...should update buttons");
		      this.header.setButtons();
		    });
		    
		    content = space;
	    }
	    
	    var pane = new tp({
		    title: title,
		    content: content
		  }).placeAt(cont);
		  
		},
		
		showBlockers: function(){
		  //add blockers title pane with tasks that block this task to layout, 
		  //only shows when this task has blockers
		  var task = this.task;
		  
		  //console.debug("showing blockers", task.coordinates);
		  
		  if (task.coordinates && task.coordinates.length > 0){
		    
		    var b = new BlockerInfo({task: task}),
		        cont = dijit.byId("workspaceMain");
		    
		    /*
		    var res = new cpane({style: "padding: 0;"}),
		        tdc = this,
  		      title = coordel.blockers,
    		    content = "",
    		    cont = dijit.byId("workspaceMain"),
    		    self = this;
		    
		    dojo.forEach(task.coordinates, function(id){
		      var t = db.getBlockerModel(id);
		      
		      if (t.workspace && t.workspace.length > 0){
		        //if this has deliverables, then show it
		        res.addChild(new BlockerHeader({task: t}));
		        dojo.forEach(t.workspace, function(deliv){
		          res.addChild(new del({task: t, deliverable: deliv, isBlocker: true, username: db.contactFullName(t.username)}));
		        });
		      } else {
		        //just show the info about the blocker
		        var block = db.taskStore.blockStore.get(id);
		        console.debug("block", block);
		        res.addChild(new ti({task:block, db:db}));
		      }
		    });
		    */
		  
		    var bl = new tp({
		      title: coordel.blockers,
		      "class": "task-details",
		      content: b
		    });
		    
		    cont.addChild(bl);
		  }
		},
		
		showBlocking: function(){
		  //add blocking title pane with tasks this task is blocking
		  //only shows when this task blocks other tasks
		  
		},
		

		showChecklist: function(){
		  var cont = dijit.byId("taskDetailsChecklist"),
		      bnSort =  dijit.byId("taskListDetailsSort"),
		      bnTurbo =  dijit.byId("taskListDetailsTurbo");
		      
		  this._showTab("checklistTab");
		  
		  //NOTE: it might be that the buttons need to be controlled, but it seems a bit overkill at the moment
		  /*
		  //disable the buttons by default
		  bnSort.set("disabled", true);
		  bnTurbo.set("disabled", true);
		  
		  //if there are undone todos, then enable the buttons
		  if (this.checklist.todos.length > 0){
		    bnSort.set("disabled", false);
  		  bnTurbo.set("disabled", false);
		  }
		  */

		  if (cont.hasChildren()){
		    cont.destroyDescendants();
		  }
		  
		  this.checklist = new Checklist({
		    task: this.task
		  });
		  
		  //add a turbo control if this is turbo
		  if (this.isTurbo){
  
		    this.turboWizard = new Turbo({
		      focus: this.focus,
		      isChecklist: true
		    });
		    
		    //watch for removed todos
		    dojo.connect(this.turboWizard, "onTrash", this, function(todo){
		      //console.debug("onTrash taskListDetails", todo);
		      //remove the todo from the checklist and move to the next item
		      this.checklist.remove(todo);
		      this.turboWizard.next(this._getNext());
		    });
		    
		    //watch for delegated todos
		    dojo.connect(this.turboWizard, "onDelegate", this, function(todo){
		      //console.debug("onDelegate taskListDetails", task);
		      //mark the todo done and update the task that had the todo
		      todo.done = true;
		      this.checklist.update(todo);
		      //add the todo as a new task
		      this.addTask(todo);
		    });
		    
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
     	  
     	  //if the user adds another todo while the wizard is started, it needs
		    //to become part of the wizard
		    dojo.connect(this.checklist, "onShowChecklist", this, function(){
		      if (this.isTurbo){
		        //console.debug("got showChecklist in taskDetailsControl");
		        this.turboWizard.next(this._getNext());
		      }
		      
		    });
		    
		    //add a turbo control
     	  cont.addChild(this.turboWizard);

        this.turboWizard.next(this._getNext());
		  }
		  
		  //add the checklist control
		  cont.addChild(this.checklist);
 
		},
		
		_getNext: function(){
      //return false to show turbo done

      var count =0,
          found = false,
          done = false,
          empty = false,
          t;
      
      //if there aren't any tasks show done
      if (this.checklist.todos.length === 0){
        return({hasTask: false, isEmpty: true});
        //return false;
      }

      while (!found) {
        t = this.checklist.todos[count];
        if (!this.turboMap[t._id]){
          found = true;
          //if this is used by the turbo, it needs to be new
        } else if (count === this.checklist.todos.length -1){
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
    
    addTask: function(task){
      //console.debug("adding task", task);
      var t=db.getTaskModel(task, true);
      t.add(task);
    },
	
		save: function(){
		  var t = db.getTaskModel(this.task, true);
		  t.update(this.task);
		},
		
		showNotes: function(){
		  //console.debug("showNotes called");
		  
		  this._showTab("notesTab");
		  
		  var cont = dijit.byId("taskDetailsNotes");
		  
		  if (cont.hasChildren()){
		    cont.destroyDescendants();
		  }
		  
		  cont.addChild(new Notes({
		    task: this.task
		  }));

		},
		
		showStream: function(){
		  //console.debug("showStream called");
		  var node = dijit.byId("taskDetailsStream"),
		      self = this;
		      
		  this._showTab("streamTab");
		  
      if (node.hasChildren()){
        node.destroyDescendants();
        //console.log("destroyed descendants", node);
      }
      
      var stream = db.streamStore.taskMemory.query(null, {sort:[{attribute: "time", descending: true}]});
  
      //console.debug("stream in taskDetailsControl", stream);
      
      node.addChild(new Stream({
        stream: stream
      }));
      
		}
	};
});