define([
  "dojo",
  "dojo/DeferredList",
  "dijit", 
  "app/layouts/projectLayout",
  "app/views/ContactDetails/ContactDetails",
  "app/views/TaskListGroup/TaskListGroup",
  "app/views/StreamMessage/StreamMessage",
  "i18n!app/nls/coordel",
  "app/views/Stream/Stream",
  "app/models/StreamModel",
  "app/models/CoordelStore",
  "app/views/ProjectInfo/ProjectInfo",
  "app/views/EmptyProject/EmptyProject",
  "app/views/Task/Task",
  "app/views/ProjectAssignment/ProjectAssignment",
  "app/models/ProjectStatus",
  "app/views/ProjectForm/ProjectForm",
  "app/views/ConfirmDialog/ConfirmDialog",
  "app/views/ProjectDeliverable/ProjectDeliverable"], function(dojo, dl, dijit, layout, c, tlg, message, coordel, Stream, sModel, db, Info, Empty, Task, Assign, pStatus, ProjectForm, cDialog,ProjectDeliverable) {
  //return an object to define the "./newmodule" module.
  return {
      
      project: null,
      
      focus: "project",
      
      tabFocus: "streamTab",
      
      observeHandlers: [],
      
      connections: [],
      
      showRightColumnHandler: null,
      
      projViewChangeHandler: null,
      
      emptyGroup: null,
      
      init: function(project){
        db.focus = this.focus;
        this.project = project;
        var self = this;
        
        if (this.showRightColumnHandler){
          dojo.unsubscribe(this.showRightColumnHandler);
          this.showRightColumnHandler = null;
        }
        
        if (this.projViewChangeHandler){
          dojo.unsubscribe(this.projViewChangeHandler);
          this.projViewChangeHandler = null;
        }
        
        if (this.streamNotifyHandler){
          dojo.unsubscribe(this.streamNotifyHandler);
          this.streamNotifyHandler = null;
        }
        
        if (this.connections.length > 0){
          dojo.forEach(this.connections, function(c){
            dojo.disconnect(c);
          });
          this.connections = [];
        }
        
        dojo.when(db.projectStore.loadProject(self.project._id), function(){
          layout.showLayout(project);
    	    var showColumn = dojo.hasClass(dijit.byId("showRightColumn").domNode, "hidden");
          //check if we should show the right column
    	    self.setRightColumn(showColumn);
          self.showTasks();
        
          //handle click of the people and roles tabs
          self.connections.push(dojo.connect(dojo.byId("projInfoTab"), "onclick", this, function(evt){
            console.debug("clicked info", evt);
            if (dojo.hasClass(evt.target, "inactive")){
              self.showInfo();
            }
          }));

          self.connections.push(dojo.connect(dojo.byId("projRolesTab"), "onclick", this, function(evt){
            console.debug("clicked roles", evt);
            if (dojo.hasClass(evt.target, "inactive")){
              self.showRoles();
            }
          }));

          self.connections.push(dojo.connect(dojo.byId("projStreamTab"), "onclick", this, function(evt){

            console.debug("clicked stream", evt);
            if (dojo.hasClass(evt.target, "inactive")){
              self.showStream();
            }
          }));
          
          //handle click of sendProjMessageButton
          self.connections.push(dojo.connect(dijit.byId("projSendMessageButton"), "onClick", this, function(){
            //console.log("project send message button clicked");

            var node = dijit.byId("projMessageText");
            var message = node.get("value");

            var stream = new sModel();

            stream.init(db);

            var send = stream.sendMessage(message, self.project._id);

            dojo.when(send, function(){
              node.reset();
              self.showStream();
            });

          }));
        });
      
        
        this.showRightColumnHandler = dojo.subscribe("coordel/showRightColumn", this, "setRightColumn");
        
        this.projViewChangeHandler = dojo.subscribe("coordel/projViewChange", this, "handleViewChange");
        
        this.streamNotifyHandler = dojo.subscribe("coordel/streamNotify", this, "handleStreamNotify");
        
      },
      
      _loadProject: function(){
        var self = this;
        var def = new dojo.Deferred();
        var defList = new dojo.DeferredList([
           db.projectStore.loadProject(self.project._id),
           db.streamStore.loadProjectStream(self.project._id)
        ]);
        
        defList.then(def.callback());
       
        return def;
      },
      
      setRightColumn: function(showColumn){
      
  		  console.debug("setRightColumn projectControl", showColumn, this.tabFocus);

        var col = dijit.byId("rightDetailsLayout");

        console.debug("right column", col);

        if (col){
         if (showColumn){
            switch (this.tabFocus){
              case "streamTab":
              this.showStream();
              break;
              case "infoTab":
              this.showInfo();
              break;
              case "rolesTab":
              this.showRoles();
              break;
            }
            
            dojo.removeClass(col.domNode, "hidden");
          
          } else {
     
            dojo.addClass(col.domNode, "hidden");
          
          }
          dijit.byId("outerLayout").resize();
        }

      },
      
      _openTab: function(id){
        this._closeTabs();
        this.tabFocus = id;
        dojo.addClass(id, "active");
        dojo.removeClass(id, "inactive");
        dijit.byId("rightDetailsLayout").resize();
      },
      
      _openStreamTab: function(){
        console.log("in _openStreamTab");
        this._closeTabs();
        this.tabFocus = "streamTab";
        dojo.addClass("projStreamTab", "active");
        dojo.removeClass("projStreamTab", "inactive");
        console.log("showinng projDetailsStream");
        dijit.byId("prMain").selectChild("projDetailsStream");
        console.log("removing hidden class from the send container");
        dojo.removeClass("projDetailsSendContainer", "hidden");
        dijit.byId("rightDetailsLayout").resize();
        //dojo.removeClass(dijit.byId("projectDetailsFilter").domNode, "hidden");
       
      },
      
      _closeTabs: function(){
        console.log("in _closeTabs");
        dojo.addClass("projStreamTab", "inactive");
        dojo.removeClass("projStreamTab", "active");
        dojo.addClass("projInfoTab", "inactive");
        dojo.removeClass("projInfoTab", "active");
        dojo.addClass("projRolesTab", "inactive");
        dojo.removeClass("projRolesTab", "active");
        dojo.addClass("projDetailsSendContainer", "hidden");
        dojo.addClass(dijit.byId("projectDetailsFilter").domNode, "hidden");
        
      },
      
      handleStreamNotify: function(args){
        console.log("stream notify", args);
        if (args.message.project === this.project._id){
          this.showStream();
        }
      },
      
      handleViewChange: function(args){
        switch (args.view){
          case "tasks":
            this.showTasks();
            break;
          case "deliverables":
            this.showDeliverables();
            break;
        }
      },
      
      showDeliverables: function(){
        console.log("showing Deliverables");
        var store = db.projectStore;
        var cont = dijit.byId("projTasksMain");
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
        
        var sort = [{attribute: "contextDeadline", descending: false},{attribute: "created", descending: false}];

        //get the tasks with usual status
        var tasks = store.taskMemory.query({db: db, focus: "hasDeliverables"}, {sort: sort});
        
        if (tasks.length === 0){
          this.emptyGroup = new Empty({
            emptyTitle: coordel.empty.projectDeliverablesTitle,
            emptyDescription: coordel.empty.projectDeliverablesText,
            imageCss: "project-deliverables"
          });
          cont.addChild(this.emptyGroup);
        } else {
          console.log(" tasks with deliverables", tasks);
          
          dojo.forEach(tasks, function(task){
            var d = new ProjectDeliverable({
              task: task
            });
            cont.addChild(d);
          });
          
        }
      
      },
      
      showTasks: function(){
        var store = db.projectStore;
        var self = this;
        var showEmpty = true;
        
        console.log("showing tasks in project control");
        
        //make sure to delete any groups that are there and clear the empty group
        var cont = dijit.byId("projTasksMain");
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
        this.emptyGroup = null;
        
        //need to cancel any previously existing connections and reset the connections handler
        if (this.observeHandlers.length > 0){
          dojo.forEach(this.observeHandlers, function(handle){
            handle.cancel();
          });
          this.observeHandlers = [];
        }
        
        //If this is a pending project, all tasks are in an invite status
        
       var sort = [{attribute: "contextDeadline", descending: false},{attribute: "created", descending: false}];
        
        //get the tasks with usual status
        var cur = store.taskMemory.query({db: db, focus: "projectCurrent"}, {sort: sort});
        var def = store.taskMemory.query({db: db, focus: "deferred"}, {sort: sort});
        var bl = store.taskMemory.query({db: db, focus: "blocked"}, {sort: sort});
        var un = store.taskMemory.query({db:db, focus: "unassigned"}, {sort: sort});
        
        console.log("current tasks", cur);
        
        //get the invited tasks
        //TASK invited (for users who have accepted the project)
        var inv = store.taskMemory.query({db: db, focus: "projectTaskInvited"}, {sort:sort});
        
        //PROJECT invited tasks (for users who haven't joined yet)
        //tasks that correspond to a new invite - projectNew
        var pNew = store.taskMemory.query({db: db, focus: "projectNew"});
        //tasks that correspond to a declined invite projectDeclined
        var pDec = store.taskMemory.query({db: db, focus: "projectDeclined"});
        //tasks that correspond to a proposed invite projectProposed
        var pProp = store.taskMemory.query({db: db, focus: "projectProposed"});
        //tasks that correspond to an amended invite projectAmended
        var pAmend = store.taskMemory.query({db: db, focus: "projectAmended"});
        //tasks that correspond to an agreed invite projectAgreed
        var pAgree = store.taskMemory.query({db: db, focus: "projectAgreed"});
        //tasks that correspond to a left invite projectLeft
        var pLeft = store.taskMemory.query({db: db, focus: "projectLeft"});
        //tasks that 
        
        //finally, show the paused, done, and cancelled tasks
        var done = store.taskMemory.query({db: db, focus: "done"});
        var can = store.taskMemory.query({db: db, focus: "cancelled"});
    
        //here are all the corresponding task boxes. we don't track delegated as they aren't in projects
        //current
        self._addGroup(coordel.current, cur);
        //deferred
        self._addGroup(coordel.deferred, def);
        //blocked
        self._addGroup(coordel.blocked, bl);
        //unassigned
        self._addGroup(coordel.unassigned, un);
        
        
        //here are the invitations
        //task invite
        self._addGroup(coordel.taskInvited, inv);
        
        //project invite
        self._addGroup(coordel.projectInvited, pNew);
        self._addGroup(coordel.declinedProject, pDec);
        self._addGroup(coordel.proposedChange, pProp);
        self._addGroup(coordel.amendedChange, pAmend);
        self._addGroup(coordel.agreedChange, pAgree);
        //self._addGroup(coordel.leftProject, pLeft);
        
        
        //done, paused, and cancelled
        self._addGroup(coordel.done, done);
        self._addGroup(coordel.cancelled, can);
        
        self._checkEmpty();
        
        document.title = "Coordel > " + this.project.name;
        
      },
      
      showEmptyTasks: function(){
        var cont = dijit.byId("projTasksMain");
        //console.debug("showing empty tasks", this.emptyGroup);
        if (!this.emptyGroup){
          //console.debug("empty group didin't exist yet");
          this.emptyGroup = new Empty({
            emptyTitle: coordel.empty.projectTasksTitle,
            emptyDescription: coordel.empty.projectTasksText
          });
          cont.addChild(this.emptyGroup);
        } 
      },
      
      hideEmptyTasks: function(){
        if (this.emptyGroup){
          this.emptyGroup.destroy();
          this.emptyGroup = null;
        }
      },
      
      _checkEmpty: function(){
        var cont = dijit.byId("projTasksMain");
        
        //make sure at least one group has a task
        var groups = cont.getChildren(),
            isEmpty = true;
            
        dojo.forEach(groups, function(g){
          if (g.tasks && g.tasks.length > 0){
            //console.debug("tasks found", g.tasks);
            isEmpty = false;
          }
        });
        
        if (isEmpty){
          this.showEmptyTasks();
        }
      },
      
      _addGroup: function(header, tasks){
        var cont = dijit.byId("projTasksMain"),
            self = this;
        
        //console.debug("_addGroup tasks", header, tasks);
        //this function add
        var group = new tlg({
          header: header,
          tasks: tasks,
          focus: this.focus,
          db: db
        });
        
        cont.addChild(group);
        
        //need to watch and see if there is a change to this list
        var handler = group.tasks.observe(function(task, removedFrom, insertedInto){
          //console.debug("tasks observed", task, removedFrom, insertedInto, group.focus);
          
          //was this a delete
          if (removedFrom > -1){
            group.removeChild(removedFrom);
            
          }

          if (insertedInto > -1){
            //not empty now, hide it
            self.hideEmptyTasks();
            
            //if the group was hidden before, need to show it now
            if (group.isHidden){
              group.show();
            }
            
            //console.debug("adding to list", task, group.focus);
            
            group.addChild(new Task({
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
      
      showRoles: function(){
        
        console.log("showRoles");
  
        //first get the container
        var cont = dijit.byId("projDetailsRoles"),
            contacts = db.contactStore,
            resp = this.project.responsible;
            
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
        
        //the roles are shown in the following order: responsible first, participating sorted by
        //role name (or username if no role name), following, then invites order by severity (declined, left
        //proposed, amended, agreed, new participate, new follow);
        var own, 
            part = [], 
            follow = [];
        
        dojo.addClass("projDetailsToolbar", "hidden");
        
        //divide the assignments
        dojo.forEach(this.project.assignments, function(assign){
          if (assign.username === this.project.responsible){
            own = assign;
          } else if (assign.role === "FOLLOWER"){
            if (assign.status !== "DECLINED"){
              follow.push(db.contactStore.store.get(assign.username));
            }
          } else {
            part.push(assign);
          }
        }, this);
        
        //console.debug("responsible", own);
        //console.debug("participants", part);
        
        //add the responsible
        cont.addChild(new Assign({
          assignment: own,
          isResponsible: true,
          isFollowers: false
        }));
       
        //add the participants
        
        dojo.forEach(part, function(assign){
          cont.addChild(new Assign({
            assignment: assign,
            isResponsible: false,
            isFollowers: false
          }));
        });
        
        
        //add the followers if there are any
        if (follow.length > 0){
          cont.addChild(new Assign({
            isResponsible: false,
            isFollowers: true,
            followers: follow
          })); 
        }
  
        this._openTab("projRolesTab");   
        dijit.byId("prMain").selectChild("projDetailsRoles");
      },
      
      showInfo: function(){
        //show the project info
        //console.debug("showing info");
    
        var cont = dijit.byId("projDetailsInfo"),
            contacts = db.contactStore,
            resp = this.project.responsible;
            
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
        
        dojo.addClass("projDetailsToolbar", "hidden");
        
        cont.addChild(new Info({project: this.project}));
        
        this._openTab("projInfoTab");
        dijit.byId("prMain").selectChild("projDetailsInfo");
        
      },
      
      showStream: function(){
  		  var node = dijit.byId("projDetailsStream"),
  		      store = db.projectStore;
  		  
  		  if (node){
  		    if (node.hasChildren()){
    		    node.destroyDescendants();
    		  }

          var messages= store.streamMemory.query(null, {sort:[{attribute: "time", descending: true}]});

          node.addChild(new Stream({
            stream: messages
          }));

    		  dojo.removeClass("projDetailsToolbar", "hidden");
          this._openStreamTab();
  		  }
  		}
  };
});