define(
  ["dojo", 
  "i18n!app/nls/coordel",
  "text!./templates/Blueprint.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dojo/date/stamp",
  "app/views/TaskInfo/TaskInfo",
  "app/views/Dialog/Dialog",
  "dijit/TooltipDialog",
  "dijit/TitlePane",
  "app/widgets/ContainerPane",
  "app/models/CoordelStore",
  "app/views/TaskForm/TaskForm",
  "app/views/ConfirmDialog/ConfirmDialog",
  "app/views/TaskInfoDialog/TaskInfoDialog",
  "app/views/ProjectInfo/ProjectInfo",
  "app/views/Dialog/Dialog",
  "app/util/dateFormat",
  "app/views/Share/Share",
  "app/util/fade"], 
  function(dojo, coordel, html, w, t, stamp, ti, dialog, toolDialog, tp, cp, db, TaskForm, Confirm, TaskInfoDialog, ProjectInfo, cDialog, dt, Share, fade) {
  
  dojo.declare(
    "app.views.Blueprint", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      widgetsInTemplate: true,
      
      subHandlers: [],
      
      blueprint: {},
      
      postMixInProperties: function(){
        this.inherited(arguments);
				
				if (!this.template.name){
				  this.template.name = "";
				}
        
      },
      
     
      postCreate: function(){
        this.inherited(arguments);
        
        var username = db.username(),
            self = this,
            type = self.template.templateType;
            
        
        switch (type){
          case "task":
            dojo.removeClass(self.taskBlueprintIcon, "hidden");
            self.taskBlueprintIcon.title = coordel["task-blueprint"];
          break;
          case "project":
            dojo.removeClass(self.projectBlueprintIcon, "hidden");
            self.projectBlueprintIcon.title = coordel["project-blueprint"];
          break;
          case "deliverable":
            dojo.removeClass(self.deliverableBlueprintIcon, "hidden");
            //hide the add button because you can't start a deliverable
            dojo.addClass(self.addBlueprint, "hidden");
            dojo.addClass(self.shareBlueprint, "first");
          break;
        }
        
        self._setMetaInfo();
        
        self._setDate();
        
        //hide add and share buttons on shared templates
        if (self.template.isPublic){
          dojo.addClass(self.addBlueprint, "hidden");
          dojo.addClass(self.shareBlueprint, "hidden");
          //round the copy button since the others are hidden
          dojo.addClass(self.copyBlueprint, "first");
          //hide the delete button if this is a shared template but not mine
          if (self.template.username !== username){
            dojo.addClass(self.removeBlueprint, "hidden");
           
          }
        } 
        
        //if this is a user template, hide the copy button
        if (self.template.isUserTemplate){
          dojo.addClass(self.copyBlueprint, "hidden");
          //if I didn't create this template, then I can't share it
          if (self.template.username !== db.username()){
            dojo.addClass(self.shareTemplate, "hidden");
          }
        }

        //wire up the add button - sets the template on a task or project
        dojo.connect(self.addBlueprint, "onclick", self, function(){
          var form, cont;
          if (type === "task"){
            var bn = dijit.byId("addTaskDropdown");
            console.log("dropdown", bn.dropDown);
          
            bn.openDropDown();
          
            form = dijit.byId("addTaskForm");
            form._setTemplate(self.template._id);
          
          } else if (type === "project"){
            dojo.publish("coordel/addObject", [{object: "project", template: self.template._id}]);
          }
        });
        
        //wire up the copy button 
        dojo.connect(self.copyBlueprint, "onclick", this, function(){
          var t = dojo.clone(this.template);
        
          //get rid of _id, _rev, default and public
          delete t._id;
          delete t._rev;
          delete t.isPublic;
          delete t.isDefault;
          //add the username and flag as user template
          t._id = db.uuid();
          t.username = db.username();
          t.isUserTemplate = true;
          t.isActive = true;
          //console.log("username", db.username(), "template", t);
          db.appStore.templateStore.add(t, {username:db.username()});
          
          var node = self.feedbackContainer;
          dojo.removeClass(node, "hidden");
          node.innerHTML = coordel.blueprintDetails.copied;
          fade.init(node, 0); // fade out the "fade" element
        });
        
        //wire up the share button
        dojo.connect(self.shareBlueprint, "onclick", this, function(){
          var share = new Share();
          var c = new Confirm({
            title: coordel.blueprintDetails.share,
    	      executeText: coordel.ok,
    	      content: share
          });
          
          c.show();
          
          var save = dojo.connect(c, "onConfirm", share, function(){
            var t = dojo.clone(self.template);
            
            delete t._id;
            delete t._rev;
            t._id = db.uuid();
            t.isActive = true;
            var isEveryone = share.withEveryone.get("checked");
            if (isEveryone){
              delete t.isUserTemplate;
              t.isPublic = true;
              console.log("isEveryone", t);
            } else {
              var contact = share.contact.get("value");
              delete t.isPublic;
              t.isUserTemplate = true;
              t.username= contact;
              console.log("isContact", contact, t);
            }
            db.appStore.sharedStore.add(t, {username: db.username()});
            var node = self.feedbackContainer;
            node.innerHTML = coordel.blueprintDetails.shared;
            fade.init(node, 0); // fade out the "fade" element
    	      dojo.disconnect(save);
    	      c.destroy();
    	    });
          /*
          var t = dojo.clone(this.template);
          
          
          
          
          t._id = db.uuid();
          db.appStore.sharedStore.add(t, {username: db.username()});
          */
          
          
        });
        
        //wire up the delete button
        dojo.connect(self.removeBlueprint, "onclick", this, function(){
          console.log("deactivating template", this.template);
          var template = this.template;
          template.isActive = false;
          if (this.template.isPublic){
            db.appStore.sharedStore.put(template, {username: db.username()});
          } else {
            db.appStore.templateStore.put(template, {username: db.username()});
          }
        });
        
        
        //wire up the info button
        dojo.connect(this.showInfo, "onclick", self, function(){
          console.debug("task in showInfo", self.template);
          //console.debug("dialog", i);
          var cont = self.infoContainer;
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
   
          if (type==="project"){
        
            cont.addChild(new ProjectInfo({project:self.template.project}));
   
          } else {
            cont.addChild(new TaskInfoDialog({task: self.template.task}));
          }

          self.infoDialog.show();
        });
        
        self.subHandlers.push(dojo.subscribe("coordel/timeUpdate", this, "_setDate"));
      
      },
      
      _setDate: function(){
        this.created.innerHTML = dt.ago(this.template.created, true);
      },
      
      _setMetaInfo: function(){
        //NOTE set any decoration required here
        
      },
      
      
      destroy: function(){
        this.inherited(arguments);
        if (this.subHandlers.length > 0){
          dojo.forEach(this.subHandlers, function(h){
            dojo.unsubscribe(h);
          });
          this.subHandlers = [];
        }
      },
      
      baseClass: "tasklist-item"
  });
  return app.views.Blueprint;     
});