define(['dojo',
  'dojo/DeferredList', 
  'dijit',
  'app/layouts/primaryNavLayout',
  'app/views/PrimaryHeader/PrimaryHeader',
  'app/views/RightHeader/RightHeader',
  'app/views/AddTaskButton/AddTaskButton',
  'app/views/PrimaryBoxes/PrimaryBoxes',
  'app/views/Project/Project',
  'app/views/Contact/Contact',
  'app/views/TaskForm/TaskForm',
  'app/controllers/taskListControl',
  'app/controllers/taskDetailsControl',
  'app/controllers/projectControl',
  'app/controllers/contactControl',
  'dojo/date/stamp',
  'app/models/CoordelStore',
  'dijit/TooltipDialog',
  'app/views/PrimaryFooter/PrimaryFooter',
  'app/views/ProjectGroup/ProjectGroup',
  "i18n!app/nls/coordel"], function(dojo, dl, dijit, layout, ph, rh, add, pb, p, c, tf, tControl,tdControl, pControl, cControl, stamp, db, Tooltip, Footer, ProjectGroup, coordel) {
    
  return {
    activeTab: "projects",
  
    navFocus: "",
  
    username: null,
  
    currentArgs: {},
  
    primaryController: null, //taskList, taskDetails, project, contact
  
    navSelectHandler: null,
  
    projObserveHandlers: [],
  
    setPrimaryBoxCountHandler: null,
  
    setTurboHandler: null,
  
    taskListControl: tControl,
  
    taskDetailsControl: tdControl,
  
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
    
      pnc.showContactList();
    
      pnc.setPrimaryController();
    
      pnc.setCounts();
    
      //handle click of the projects and contacts tabs
      dojo.connect(dojo.byId("rightOtherListTab"), "onclick",null, function(evt){
        pnc.activateContacts();
      });
    
      dojo.connect(dojo.byId("leftOtherListTab"), "onclick",null, function(evt){
        pnc.activateProjects();
      });
    
      //listen for navSelection
      if (!this.navSelectHandler){
        this.navSelectHandler = dojo.subscribe("coordel/primaryNavSelect", this, "setPrimaryController");
      }
      
      //listen for added Tasks and update the count
      if (!this.setPrimaryBoxCountHandler){
        this.setPrimaryBoxCountHandler = dojo.subscribe("coordel/setPrimaryBoxCounts", this, "setCounts");
        
      }
      
      //listen for turbo activation and deactivation
      if (!this.setTurboHandler){
        this.setTurboHandler = dojo.subscribe("coordel/setTurbo", this, "handleSetTurbo");
      }
    },
  
    handleSetTurbo: function(args){
      //console.debug ("in handleSetTurbo", this.currentArgs, args);
      this.isTurbo = args.isTurbo;
      this.setPrimaryController(this.currentArgs);
    },
  
    setPrimaryController: function(args){
    
      //console.debug("in primaryNavControl.setPrimaryView", this.currentArgs, args);
    
    
      //detect what was sent and then create a new controller and init() it.
      var focus = "current",
          name = "",
          task,
          id,
          tab = this.activeTab,
          c;
    
      if (args){
        focus = args.focus;
        name = args.name;
        task = args.task;
        id = args.id;
      } 
    
      this.currentArgs.focus  = focus;
      this.currentArgs.name = name;
      this.currentArgs.task = task;
      this.currentArgs.id = id;
    
      this.navFocus = focus;
    
      //console.debug("setting primary controller", focus, name, task, id);
    
      if (name === "project"){
      
        this.activateProjects();
        //create a projectControl
        //console.debug("setting projectControl with project id", id);
        this.primaryController = null;
        if (pControl.editProjectHandler){
          dojo.unsubscribe(pControl.editProjectHandler);
        }
        if (pControl.showRightColumnHandler){
          dojo.unsubscribe(pControl.showRightColumnHandler);
        }
        pControl.init(db.projectStore.store.get(id));
        this.primaryController = pControl;

        //console.debug("created projectControl", this.primaryController);
      } else if (name === "contact"){
        this.activateContacts();
        //create a contactControl
        this.primaryController = null;
        cControl.init(id);
        this.primaryController = cControl;

      } else if (name === "task"){
        c = this.taskDetailsControl;
      
        if (c.showRightColumnHandler){
          dojo.unsubscribe(c.showRightColumnHandler);
        }
        //console.debug("init taskDetails control:  focus ", focus);
      
        //if this is a contact request, we need to use the contact store so the task doesn't 
        //pollute the userTask store
        var t;
        if (focus === "contact"){
          t = db.contactStore.taskStore.get(id);
        } else{
          t = db.taskStore.store.get(id);
        }
        //this.primaryController = null;
        dojo.when(t, function(resp){
          c.init(focus, resp);
        });
        //this.primaryController = tdControl;
      }  else {
      
        c = this.taskListControl;
        //console.debug("task list controller is", c, focus );
        //console.debug("initializing taskListController, streamTarget = ", c.streamTarget);
        c.init(focus, this.isTurbo);
     
      }
  
    },
  
    activateContacts: function(){
      this.showContactList();
      if (dojo.hasClass("rightOtherListTab", "inactive")){
        dojo.removeClass("rightOtherListTab", "inactive");
        dojo.addClass("leftOtherListTab", "inactive");
        dijit.byId("otherListMain").forward();
        this.activeTab = "contacts";
      }
    
    },
  
    activateProjects: function(){
      if (dojo.hasClass("leftOtherListTab", "inactive")){
        dojo.removeClass("leftOtherListTab", "inactive");
        dojo.addClass("rightOtherListTab", "inactive");
        dijit.byId("otherListMain").back();
        this.activeTab = "projects";
      }
    
    },
  
    setCounts: function(){
      
      var goToCurrent = false;
    
      //console.debug("updating primary box counts");
  
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
      //console.debug("showProjectList called");
    
      var self = this;
    
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
   
    },
  
    _addProjectGroup: function(header, projects){
      var cont = dijit.byId("otherListProjects"),
          self = this;
    
      //console.debug("_addGroup tasks", header, tasks);
      //this function add
      var group = new ProjectGroup({
        header: header,
        projects: projects
      });
    
      cont.addChild(group);
    
      //need to watch and see if there is a change to this list
      var handler = projects.observe(function(proj, removedFrom, insertedInto){
        //console.debug("projects observed", proj, removedFrom, insertedInto);
        //was this a delete
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

        }

        if (insertedInto > -1){
        
          //if the group was hidden before, need to show it now
          
          if (group.isHidden){
            group.show();
          }
          
          
          if (insertedInto === 0){
            insertedInto = 1;
            
          }
          console.debug("adding to list", insertedInto);
          
          group.addChild(new p({
            project: proj
          }), insertedInto);
      
        }
        
      
        if (group.projects.length === 0){
          group.hide();
        }
      
      }, true);
    
      self.projObserveHandlers.push(handler);
    },


    showContactList: function(){
      //console.debug("primayNav.showContactList");
      
      var cont = dijit.byId("otherListContacts");
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
    
      var cons = db.contacts();
      console.log("showContactList", cons);
      
      dojo.forEach(cons, function(con){
        console.log("creating contact", con);
        cont.addChild(new c({contact: con, doNavigation: true}));
      });
      
    }
  };
});

