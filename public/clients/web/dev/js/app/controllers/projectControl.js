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
  "app/views/ConfirmDialog/ConfirmDialog"], function(dojo, dl, dijit, layout, c, tlg, message, coordel, Stream, sModel, db, Info, Empty, Task, Assign, pStatus, ProjectForm, cDialog) {
  //return an object to define the "./newmodule" module.
  return {
      
      project: null,
      
      focus: "project",
      
      observeHandlers: [],
      
      showRightColumnHandler: null,
      
      emptyGroup: null,
      
      init: function(project){
        db.focus = this.focus;
        this.project = project;
        var self = this;
        //console.debug("projectControl init called", db);
        layout.showLayout(project);
       
        //load the project data
        if (db.projectStore.currentProject !== project._id){
          //this project isn't in the cache, so load it and then show it
          //console.debug("project not in cache, loading...");
          dojo.when(db.projectStore.loadProject(project._id), function(){
            self.showTasks();
            
            self.showStream();
            //self.showRoles();
          });
        } else {
          //console.debug("project in cache");
          //this project is currently in cache, so show it
          self.showTasks();

          self.showStream();
          //self.showRoles();
        }
        
        this.showRightColumnHandler = dojo.subscribe("coordel/showRightColumn", this, "setRightColumn");
        
        //handle click of sendProjMessageButton
        dojo.connect(dijit.byId("projSendMessageButton"), "onClick", this, function(){
          //console.log("project send message button clicked");
       
          var node = dijit.byId("projMessageText");
          var message = node.get("value");
      
          var stream = new sModel();
        
          stream.init(db);
          
          var def = stream.sendMessage(message, this.project._id);
        
          def.then(function(){
            message.set("value", "");
          });
        
        });
        
        //handle click of the people and roles tabs
        dojo.connect(dojo.byId("infoTab"), "onclick", this, function(evt){
          //console.debug("clicked people", evt);
          if (dojo.hasClass(evt.target, "inactive")){
            this.showInfo();
          }
        });

        dojo.connect(dojo.byId("rolesTab"), "onclick", this, function(evt){
          //console.debug("clicked roles", evt);
          if (dojo.hasClass(evt.target, "inactive")){
            this.showRoles();
          }
        });
        
        dojo.connect(dojo.byId("streamTab"), "onclick", this, function(evt){
         
          //console.debug("clicked roles", evt);
          if (dojo.hasClass(evt.target, "inactive")){
            this.showStream();
          }
        });
        
        var bn = dijit.byId("showRightColumn");
  	    this.setRightColumn(dojo.hasClass(bn.domNode, "hidden"));
        
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
      
      _openTab: function(id){
        this._closeTabs();
        dojo.addClass(id, "active");
        dojo.removeClass(id, "inactive");
        dijit.byId("rightDetailsLayout").resize();
      },
      
      _openStreamTab: function(){
        this._closeTabs();
        dojo.removeClass("projDetailsSendContainer", "hidden");
        dojo.removeClass(dijit.byId("projectDetailsFilter").domNode, "hidden");
        this._openTab("streamTab");
      },
      
      _closeTabs: function(){
        
        dojo.addClass("streamTab", "inactive");
        dojo.removeClass("streamTab", "active");
        dojo.addClass("infoTab", "inactive");
        dojo.removeClass("infoTab", "active");
        dojo.addClass("rolesTab", "inactive");
        dojo.removeClass("rolesTab", "active");
        dojo.addClass("projDetailsSendContainer", "hidden");
        dojo.addClass(dijit.byId("projectDetailsFilter").domNode, "hidden");
        
      },
      
      showTasks: function(){
        var store = db.projectStore;
        var self = this;
        var showEmpty = true;
        
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
        
        //here are the invitations
        //task invite
        self._addGroup("Task Invited", inv);
        
        //project invite
        self._addGroup("Project Invited", pNew);
        self._addGroup("Declined Role", pDec);
        self._addGroup("Proposed Role Changes", pProp);
        self._addGroup("Amended Proposed Role Changes", pAmend);
        self._addGroup("Agreed Role Changes", pAgree);
        self._addGroup("Left Project", pLeft);
        
        
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
  
        this._openTab("rolesTab");   
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
        
        this._openTab("infoTab");
        dijit.byId("prMain").selectChild("projDetailsInfo");
        
      },
      
      showStream: function(){

  		  var node = dijit.byId("projDetailsStream"),
  		      store = db.streamStore;
  		      
  		  dojo.removeClass("projDetailsToolbar", "hidden");
  		  this._openStreamTab();
        dijit.byId("prMain").selectChild("projDetailsStream");

  		  var stream = store.loadProjectStream(this.project._id);
  		  
  		  dojo.when(stream, function(resp){
  		    if (node.hasChildren()){
            node.destroyDescendants();
          }

          node.addChild(new Stream({
            stream: resp
          }));

          
  		  });

  		}
  };
});