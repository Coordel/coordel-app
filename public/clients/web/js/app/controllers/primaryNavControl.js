define(['dojo',
  'dojo/DeferredList', 
  'dijit',
  'app/layouts/primaryNavLayout',
  'app/views/PrimaryHeader/PrimaryHeader',
  'app/views/RightHeader/RightHeader',
  'app/views/AddTaskButton/AddTaskButton',
  'app/views/PrimaryBoxes/PrimaryBoxes',
  'app/views/BlueprintBoxes/BlueprintBoxes',
  'app/views/Project/Project',
  'app/views/Contact/Contact',
  'app/views/TaskForm/TaskForm',
  'app/controllers/taskListControl',
  'app/controllers/taskDetailsControl',
  'app/controllers/projectControl',
  'app/controllers/contactControl',
  'app/controllers/storeControl',
  'dojo/date/stamp',
  'app/models/CoordelStore',
  'dijit/TooltipDialog',
  'app/views/PrimaryFooter/PrimaryFooter',
  'app/views/PrimaryFooterViews/PrimaryFooterViews',
  'app/views/ProjectGroup/ProjectGroup',
  'i18n!app/nls/coordel',
  'app/views/EmptyTaskList/EmptyTaskList',
  'app/views/QuickSearch/QuickSearch',
  'app/util/Sort'
  ], function(dojo, dl, dijit, layout, ph, rh, add, pb,bpb, p, c, tf, tControl,tdControl, pControl, cControl, sControl, stamp, db, Tooltip, Footer,FooterViews, ProjectGroup, coordel, etl, search, util) {
    
  return {
    activeTab: "projects",
    
    currentFocus: "",
  
    navFocus: "",
  
    username: null,
  
    currentArgs: {},
  
    primaryController: null, //taskList, taskDetails, project, contact
  
    navSelectHandler: null,
  
    projObserveHandlers: [],
  
    setPrimaryBoxCountHandler: null,
  
    setTurboHandler: null,
  
    //taskListControl: tControl,
  
    //taskDetailsControl: tdControl,
    
    //storeControl: sControl,
  
    primaryBoxes: null,
  
    isTurbo: false, //set this to true to make private and current tasks show in turbo mode

    init: function(username) {
      //console.debug("initializing primaryNav", username);
      var pnc = this;
      //this controller holds the db loaded in appControl 
      this.username = username;
    
      //show primary boxes
      //show list (projects and contacts)
      layout.showLayout();
  
      var head = dijit.byId("leftNavHeader");
    
      var foot = dijit.byId("otherListFooter");
    
      head.addChild(new ph());
    
      /*
      var rightHead = dijit.byId("mainLayoutHeaderRight");
    
      rightHead.addChild(new rh());
      */
    
      //show the addTask button in the header
      head.addChild(new add());
    
      //add the footer
      foot.addChild(new Footer());
    
      pnc.showPrimaryBoxes();
    
      pnc.showProjectList();
      
      pnc.showSearch();
    
      //pnc.showContactList();
    
      pnc.setPrimaryController();
    
      pnc.setCounts();
      
      pnc.showQuickStart();
    
      //handle click of the projects and contacts tabs
      /*
      dojo.connect(dojo.byId("rightOtherListTab"), "onclick",null, function(evt){
        pnc.activateContacts();
      });
    
      dojo.connect(dojo.byId("leftOtherListTab"), "onclick",null, function(evt){
        pnc.activateProjects();
      });
      */
      
      dojo.connect(dojo.byId("projectsTab"), "onclick",null, function(evt){
        pnc.activateProjects();
      });
      
      dojo.connect(dojo.byId("contactsTab"), "onclick",null, function(evt){
        pnc.activateContacts();
      });
      
      dojo.connect(dojo.byId("storeTab"), "onclick",null, function(evt){
        pnc.activateBlueprints();
      });
    
      //listen for navSelection
      if (!this.navSelectHandler){
        this.navSelectHandler = dojo.subscribe("coordel/primaryNavSelect", this, "setPrimaryController");
      }
      
      if(!this.projectNotifyHandler){
        this.projectNotifyHandler = dojo.subscribe("coordel/projectNotify", this, "handleProjectNotify");
      }
    
      //listen for added Tasks and update the count
      if (!this.setPrimaryBoxCountHandler){
        this.setPrimaryBoxCountHandler = dojo.subscribe("coordel/setPrimaryBoxCounts", this, "setCounts");
      }
      
      //listen for turbo activation and deactivation
      if (!this.setTurboHandler){
        this.setTurboHandler = dojo.subscribe("coordel/setTurbo", this, "handleSetTurbo");
      }
      
      //listen for show footer views on/off
      if (!this.showFooterViewsHandler){
        this.showFooterViewsHandler = dojo.subscribe("coordel/showPrimaryFooterViews", this, "handleShowPrimaryFooterViews");
      }
      
      //publish a refresh signal every 60 seconds for objects that need to update like
	    //tasks that might be deferred when loaded, but aren't more, or if time is showing
	    //alter the time remaining or ago
	
    },
    
    handleProjectNotify: function(args){
      
      if (this.activeTab === "projects"){
        //console.log("handleProjectNotify primaryNavControl", args);
        this.activateProjects();
      }
    },
    
    handleShowPrimaryFooterViews: function(args){
      //console.debug("should popup the show other lists menu", args.showViews);
      var foot = dijit.byId("otherListFooter");
      foot.destroyDescendants();
      
      if (args.showViews){
        foot.addChild(new FooterViews());
      } else {
        foot.addChild(new Footer());
      }
    
      dijit.byId("leftNavContainer").resize();
      
    },
    
    handleSetTurbo: function(args){
      //console.debug ("in handleSetTurbo", this.currentArgs, args);
      this.isTurbo = args.isTurbo;
      this.setPrimaryController(this.currentArgs);
    },
    
    showQuickStart: function(){
      var a = db.appStore.app();
      //console.log("app", a);
      if (!a.showQuickStart){
        a.showQuickStart = true;
        dojo.publish("coordel/support", ["showQuickStart"]);
        
        dojo.when(db.appStore.post(a), function(){
          db.appStore._app = a;
          //console.log("updated", a);
        });
      
      } 
    },
    
  
    setPrimaryController: function(args){
  
      //detect what was sent and then create a new controller and init() it.
      var focus = "current",
          name = "",
          task,
          id,
          search,
          searchBlueprint,
          tab = this.activeTab,
          c;
    
      if (args){
        focus = args.focus;
        name = args.name;
        task = args.task;
        id = args.id;
        search = args.search;
        searchBlueprint = args.searchBlueprint;
      } 
    
      this.currentArgs.focus  = focus;
      this.currentArgs.name = name;
      this.currentArgs.task = task;
      this.currentArgs.id = id;
      if (search){
        this.currentArgs.search = search;
      }

      this.currentArgs.searchBlueprint = searchBlueprint;

      
      this.navFocus = focus;
      
      
      db.isOpportunities = (focus === "opportunities");
      
    
      //console.debug("setting primary controller", focus, name, task, id);
    
      if (name === "project"){
        
        
        //create a projectControl
        //console.debug("setting projectControl with project id", id);
        this.primaryController = null;
        if (pControl.editProjectHandler){
          dojo.unsubscribe(pControl.editProjectHandler);
        }
        if (pControl.showRightColumnHandler){
          dojo.unsubscribe(pControl.showRightColumnHandler);
        }
        if (pControl.projViewChangeHandler){
          dojo.unsubscribe(pControl.projViewChangeHandler);
        }
        
        dojo.when(db.projectStore.store.get(id), function(proj){
          pControl.init(proj);
        });
        
        
      
        this.primaryController = pControl;
        
        if (!this.isSearch){
          this.activateProjects();
        }

        //console.debug("created projectControl", this.primaryController);
      } else if (name === "contact"){
        
        if (cControl.showRightColumnHandler){
          dojo.unsubscribe(cControl.showRightColumnHandler);
        }
        
        //reset the current project so in case there are changes while gone, we get updated
        db.projectStore.currentProject = "";
        
        if (!this.isSearch){
          this.activateContacts();
        }

        //create a contactControl
        this.primaryController = null;
        cControl.init(id);
        this.primaryController = cControl;

      } else if (name === "task"){
        //reset the current project so in case there are changes while gone, we get updated
        db.projectStore.currentProject = "";
        
        //c = this.taskDetailsControl;
				c = tdControl;
				
				tControl.isActive = false;
      
        if (c.showRightColumnHandler){
          dojo.unsubscribe(c.showRightColumnHandler);
        }
        //console.debug("init taskDetails control:  focus ", focus, args, this.isTurbo);
  
        var t,
						isTurbo = this.isTurbo;
        if (focus === "contact"){
          t = db.contactStore.taskStore.get(id);
        } else{
          t = db.taskStore.store.get(id);
        }
        //this.primaryController = null;
        dojo.when(t, function(resp){
          c.init(focus, resp, isTurbo);
        });
        //this.primaryController = tdControl;
        /*
      } else if (focus === "opportunities"){
        
        console.log("show opportunities");
        */
      } else if (name === "store"){
        db.projectStore.currentProject = "";
        //c = this.storeControl;
				c = sControl;
        c.init(focus);
        //console.debug("after storeControl init");
        
      } else {
				
				tControl.isActive = true;
        
        //shim in the search capability of the blueprints search should probably be elsewhere
        if (this.currentArgs.focus === "task-blueprints"){
          //console.log("success it's tasks");
          this.search.search.reset();
          this.search.search.set("placeHolder", coordel.searchTaskBlueprints);
          dojo.removeClass(this.search.domNode, "hidden");
        } else if (this.currentArgs.focus === "project-blueprints"){
          //console.log("success it's projects");
          this.search.search.reset();
          this.search.search.set("placeHolder", coordel.searchProjectBlueprints);
          dojo.removeClass(this.search.domNode, "hidden");
        } else if (this.currentArgs.focus === "shared-blueprints"){
          //console.log("success it's shared");
          this.search.search.reset();
          this.search.search.set("placeHolder", coordel.searchSharedBlueprints);
          dojo.removeClass(this.search.domNode, "hidden");
        }
        
        
        //reset the current project so in case there are changes while gone, we get updated
        db.projectStore.currentProject = "";
      
        //c = this.taskListControl;
        c = tControl;
        c.search = this.currentArgs.search;
        c.searchBlueprint = this.currentArgs.searchBlueprint;
        c.primaryNavName = name;
				c.isTurbo = this.isTurbo;
        //console.debug("task list controller is", focus, this.isTurbo);
        //console.debug("initializing taskListController, streamTarget = ", c.streamTarget);
        c.init(focus, this.isTurbo);
        //console.debug("after taskListControl init");
      }
      
      dojo.publish("coordel/setPrimaryBoxCounts");
  
    },
  
    _openTab: function(id){
      this._closeTabs();
      this.tabFocus = id;
      dojo.addClass(id, "active");
      dojo.removeClass(id, "inactive");
      //console.log("open tab", id);
      switch (id){
        case "projectsTab":
        document.title = "Coordel > " + coordel.projects;
        break;
        case "contactsTab":
        document.title = "Coordel > " + coordel.contacts;
        break;
        case "storeTab":
        document.title = "Coordel > " + coordel.blueprints;
        break; 
      }
      
    },
    
    _closeTabs: function(){
      //console.log("in _closeTabs");
      dojo.addClass("projectsTab", "inactive");
      dojo.removeClass("projectsTab", "active");
      dojo.addClass("contactsTab", "inactive");
      dojo.removeClass("contactsTab", "active");
      dojo.addClass("storeTab", "inactive");
      dojo.removeClass("storeTab", "active");
      
      this.search.search.reset();
      
      this.isSearch = false;
      
    },
  
    activateProjects: function(){ 
      //console.log("activate Projects");
      this._closeTabs();
      this._openTab("projectsTab");
      this.showProjectList();
      //dojo.removeClass("leftOtherListTab", "inactive");
      //dojo.addClass("rightOtherListTab", "inactive");
      //dijit.byId("otherListMain").back();
      dijit.byId("otherListMain").selectChild("otherListProjects");
      this.activeTab = "projects";
      
      this.search.search.set("placeHolder", coordel.searchProjects);
      dojo.removeClass(this.search.domNode, "hidden");
    },
    
    
    activateContacts: function(){
      this._closeTabs();
      this._openTab("contactsTab");
      this.showContactList();
      //dojo.removeClass("rightOtherListTab", "inactive");
      //dojo.addClass("leftOtherListTab", "inactive");
      //dijit.byId("otherListMain").forward();
      dijit.byId("otherListMain").selectChild("otherListContacts");
      this.activeTab = "contacts";
      this.search.search.set("placeHolder", coordel.searchPeople);
      dojo.removeClass(this.search.domNode, "hidden");
    },

    
    activateStore: function(){
      this._closeTabs();
      this._openTab("storeTab");
      this.showStore();
      dijit.byId("otherListMain").selectChild("otherListStore");
      dojo.addClass(this.search.domNode, "hidden");
    },
    
    activateBlueprints: function(){
      
      this._closeTabs();
      this._openTab("storeTab");
      this.showBlueprints();
      dijit.byId("otherListMain").selectChild("otherListBlueprints");
      this.search.search.set("placeHolder", coordel.searchBlueprints);
      dojo.addClass(this.search.domNode, "hidden");
      var cont = dijit.byId("otherListBlueprints");
      this.activeTab = "blueprints";
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      var boxes = new bpb().placeAt("otherListBlueprints");
    },
    
    
  
    setCounts: function(){
      
      var goToCurrent = false;
      
      var curFocus = db.focus;
      
      db.focus = "task";
  
      var cur = db.taskStore.memory.query({db: db, focus: "current"}),
          inv = db.taskStore.memory.query({db: db, focus: "task-invited"}),
          bl = db.taskStore.memory.query({db: db, focus: "blocked"}),
          def = db.taskStore.memory.query({db: db, focus: "deferred"}),
          priv = db.taskStore.memory.query({db: db, focus: "private"}),
          del = db.taskStore.memory.query({db: db, focus: "delegated"}),
        
          //project invites
          invNew = db.projectStore.memory.query("invitedNew"),
          dec = db.projectStore.memory.query("invitedDeclined"),
          left = db.projectStore.memory.query("invitedLeft"),
          prop = db.projectStore.memory.query("invitedProposed"),
          ag = db.projectStore.memory.query("invitedAgreed"),
          amm = db.projectStore.memory.query("invitedAmended");
        
          var projInv = invNew.length + dec.length + left.length + prop.length + ag.length + amm.length;
          //console.debug("invites", projInv, invNew.length , dec.length , left.length , prop.length , ag.length , amm.length);

      setCount("currentCount", cur.length);
      setCount("taskInvitedCount", inv.length);
      setCount("blockedCount", bl.length);
      setCount("deferredCount", def.length);
      setCount("privateCount", priv.length);
      setCount("delegatedCount", del.length);
      setCount("projectInvitedCount", projInv);
      
      db.focus = curFocus;
    
      if (this.primaryBoxes){
        var options = {};
        if (inv.length === 0 && projInv === 0){
          if (this.currentArgs.focus === "project-invited"){
            goToCurrent = true;
          }
          this.primaryBoxes.hideInvitations();
          dijit.byId("leftNavContainer").resize();
        } else {
          if (inv.length > 0) {
            options.tasks = true;
          }
        
          if (projInv > 0){
            options.projects = true;
          }
        
          this.primaryBoxes.showInvitations(options);
          dijit.byId("leftNavContainer").resize();
        }
      
      }
    
      function setCount(id, count){
        //console.debug("setCount", "id: ", id, "count: ",  count);
        var node = dojo.byId(id);
        //console.debug("node", node);
        dojo.addClass(node, "hidden");
        if (count > 0){
          dojo.removeClass(node, "hidden");
          node.innerHTML = count;
        }
      }
      
      //console.debug("current arguments", this.currentArgs);
      //if there weren't any more invites, invites will hide and need to go to current
      if (goToCurrent){
        dojo.publish("coordel/primaryNavSelect", [{focus:"current", name: "", id:"", setSelection: true}]);
      }
    },
  
    showPrimaryBoxes: function(){
      var cont = dijit.byId("leftNavContainer");
      this.primaryBoxes = new pb({
        region: "top",
        id: "leftnavPrimaryBoxes"
      }).placeAt(cont);
    },
    
    
  
    showProjectList: function(){
      //console.debug("primaryNavControl.showProjectList called");

      var self = this;

      dijit.byId("otherListProjects").destroyDescendants();
    
      //get all the potential possible project groups
      //responsible
      var res = db.projectStore.memory.query("responsible",{sort:[{attribute: "name", descending: false}]}),
          //partipating
          part = db.projectStore.memory.query("participating",{sort:[{attribute: "name", descending: false}]}),
          //following
          fol = db.projectStore.memory.query("following",{sort:[{attribute: "name", descending: false}]}),
          //deferred
          defer = db.projectStore.memory.query("deferred", {sort:[{attribute: "name", descending: false}]}),
          //pending
          pend = db.projectStore.memory.query("pending",{sort:[{attribute: "name", descending: false}]}),
          //paused
          pause = db.projectStore.memory.query("paused",{sort:[{attribute: "name", descending: false}]}),
          //done
          done = db.projectStore.memory.query("done",{sort:[{attribute: "name", descending: false}]}),
          //cancelled
          can = db.projectStore.memory.query("cancelled",{sort:[{attribute: "name", descending: false}]});

     self._addProjectGroup(coordel.pending, pend);
     self._addProjectGroup(coordel.responsible, res);
     self._addProjectGroup(coordel.participating, part);
     self._addProjectGroup(coordel.following, fol);
     self._addProjectGroup(coordel.deferred, defer);
     self._addProjectGroup(coordel.metainfo.paused, pause);
     self._addProjectGroup(coordel.done, done);
     self._addProjectGroup(coordel.cancelled, can);
     
     //console.log("through setPrimaryController");
   
    },
  
    _addProjectGroup: function(header, projects){
      var cont = dijit.byId("otherListProjects"),
          self = this;
    
      //console.debug("_addGroup tasks", header, tasks);
      //this function add
      var group = new ProjectGroup({
        header: header,
        projects: projects,
        currentArgs: self.currentArgs
      });
    
      cont.addChild(group);
      
      /*
      //need to watch and see if there is a change to this list
      var handler = projects.observe(function(proj, removedFrom, insertedInto){
        
        
        
        
        if (removedFrom > -1){
          //console.debug("deleted from list", removedFrom);
          var toRemove = -1;
          //for some reason, after one change, the removeFrom changes to the end
          //of the results list, insertedInto knows where to add. so for each
          //subsequent change, the old doesn't get deleted from the list
          //this is probably a programmer error, but I could't figure out why??? JG
          //console.debug("indexOf", idx);
        
          dojo.forEach(group.getChildren(), function(child, key){
            if (child.project._id === proj._id){
              toRemove = key;
               //console.debug("child", child.project._id, "key", key, "removedFrom", removedFrom);
               
            }
           
          });
          
          
          
          if (toRemove !== -1){
            var child = group.getChildren()[toRemove];
            //console.debug("child", child, toRemove);
            child.destroyRecursive();
          }
          
          //console.log("GROUP PROJECTS LENGTH", group.projects.length);

        }

        if (insertedInto > -1){
        
          //if the group was hidden before, need to show it now
          
          if (group.isHidden){
            group.show();
          }
          
          
          if (insertedInto === 0){
            insertedInto = 1;
            
          }
          //console.debug("adding to list", insertedInto);
          
          group.addChild(new p({
            project: proj
          }), insertedInto);
        }
        
      
        if (group.projects.length === 0){
          group.hide();
          //dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
        }
        
      
      }, true);
      
      self.projObserveHandlers.push(handler);
      */
    },


    showContactList: function(){
      //console.debug("primayNav.showContactList");
    
      
      var cont = dijit.byId("otherListContacts"),
          self = this;
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
    
      var cons = db.contacts();
      //console.log("showContactList", cons);

      dojo.forEach(cons, function(con){
        //console.log("creating contact", con);
        if (!con.error && con.id !== db.username()){
          cont.addChild(new c({
            contact: con, 
            doNavigation: true,
            currentArgs: self.currentArgs}));
        }
        
      });
      
    },
    
    showStore: function(){
      var self = this;
      //console.log("show empty", self.navFocus);
      
      var empty = new etl({
        emptyClass: self.navFocus, 
        emptyTitle: coordel.empty[self.navFocus+"Title"], 
        emptyDescription: coordel.empty[self.navFocus+"Text"]
      }).placeAt("storeMain");
    },
    
    showBlueprints: function(){
      var cont = dijit.byId("otherListBlueprints");
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      var boxes = new bpb().placeAt("otherListBlueprints");
    },
    
    showSearch: function(){
      
      var self = this;
      
      dojo.forEach(dijit.findWidgets("otherListMenuBar"), function(item){
        item.destroy();
      });
      
      this.search = new search({
     
      }).placeAt("otherListMenuBar");
      
      this.search.search.set("placeHolder", coordel.searchProjects);
      
      dojo.connect(this.search, "onSearch", function(query){
        
        //console.log("searching", query, self.activeTab, self.currentArgs);
        
        //this was initially designed to handle searching in the column under tabs, but for 
        //blueprints it turns out that it makes more sense to show the results in the task list
        var focus = self.currentArgs.focus;
        if (focus === "task-blueprints"){
          //console.log("show found task blueprints");
          dojo.publish("coordel/primaryNavSelect", [{focus: "task-blueprints", setSelection: false, searchBlueprint: query}]);
          
        } else if (focus === "project-blueprints"){
          //console.log("show found project blueprints");
          dojo.publish("coordel/primaryNavSelect", [{focus: "project-blueprints", setSelection: false, searchBlueprint: query}]);
        } else if (focus === "shared-blueprints"){
          //console.log("show found shared blueprints");
          dojo.publish("coordel/primaryNavSelect", [{focus: "shared-blueprints", setSelection: false, searchBlueprint: query}]);
        } else {
          self.showSearchResults(self.activeTab, query);
        }

      });
    },
    
    showSearchResults: function(focus, query){
      var self = this;
      dijit.byId("otherListMain").selectChild("otherListSearch");
      
      //console.log("dijits", dijit.byId("otherListSearch"));
      
      dijit.byId("otherListSearch").destroyDescendants();
      
      //console.log("show search results", focus, query);
      
      this.isSearch = true;

      switch (focus){
        case "projects":
        db.projectStore.search(query).then(function(results){
          //console.log("search results", results);
          results = util.sort(results, {sort: [{attribute: "name"}]});
          dojo.forEach(results, function(proj){
            var obj =  new p({
              project: proj,
              currentArgs: self.currentArgs
            }).placeAt("otherListSearch");
            dojo.connect(obj.domNode, "onclick", function(){
              //console.log("set selection");
              obj.setSelection();
            });
          });
          
          
        });
        break;
        case "contacts":
        db.contactStore.search(query).then(function(results){
          //console.log("search results", results);
          dojo.forEach(results, function(con){
            var cObj = new c({
              contact: con,
              doNavigation: true,
              currentArgs: self.currentArgs
            }).placeAt("otherListSearch");
            dojo.connect(cObj.domNode, "onclick", function(){
              //console.log("set selection");
              cObj.setSelection();
            });
          });
          
        });
        break;
      }
    }
  };
});

