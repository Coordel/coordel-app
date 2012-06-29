define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ProjectInfo.html",
    "app/models/ProjectModel",
    "app/util/dateFormat",
    "dijit/TitlePane",
    "app/models/CoordelStore",
    "app/views/Label/Label"
    ], 
  function(dojo, coordel, w, t, html, pModel, dt, tp, db) {
  
  dojo.declare(
    "app.views.ProjectInfo", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      project: null,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
            
        this.setProject(this.project);
        /* 
        //watch the task for changes
        self.watch("task", function(prop, oldVal, newVal){
          console.debug("task changed", prop, oldVal, newVal);
          self.setTask(newVal);
        });
        
        //watch the task properties for changes
        self.name.watch("value", function(prop, oldVal, newVal){
          console.debug("task name changed", prop, oldVal, newVal);
          self.name.innerHTML = newVal;
        });
        
        self.username.watch("value", function(prop, oldVal, newVal){
          console.debug("task username changed", prop, oldVal, newVal);
          self.username.innerHTML = db.contactFullName(newVal);
        });
        
        self.deadline.watch("value", function(prop, oldVal, newVal){
          console.debug("task deadline changed", prop, oldVal, newVal);
          if (t.hasDeadline()){
            self.deadline.innerHTML = dt.deadline(newVal);
            dojo.removeClass(self.infoDeadline, "hidden");
          } else {
            dojo.addClass(self.infoDeadline, "hidden");
          }
        });
        
        self.calendar.watch("value", function(prop, oldVal, newVal){
          console.debug("task deferred changed", prop, oldVal, newVal);
          if (t.isDeferred()){
            self.deferred.innerHTML = dt.deferred(newVal.start);
            dojo.removeClass(self.infoDeferDate, "hidden");
          } else {
            dojo.addClass(self.infoDeferDate, "hidden");
          }
        });
      
        self.delegator.watch("value", function(prop, oldVal, newVal){
          console.debug("task delegator changed", prop, oldVal, newVal);
          
          
        });
        
        self.purpose.watch("value", function(prop, oldVal, newVal){
          console.debug("task purpose changed", prop, oldVal, newVal);
          if (newVal && newVal !== ""){
            self.purpose.innerHTML = newVal;
            dojo.removeClass(self.infoPurpose, "hidden");
          } else {
            dojo.addClass(self.infoPurpose, "hidden");
          }
        });
        
        self.project.watch("value", function(prop, oldVal, newVal){
          console.debug("task project changed", prop, oldVal, newVal, t);
          var hide = false;
          
          self.projectName.innerHTML = t.projName();
          
          
        });
        */
      },
      
      setProject: function(project){
        //console.debug("in setTask", task);
        
        this.project = project;
        
        var p = new pModel({db: db, project: project});
            self = this;
            
        ///project name
        self.name.set("value", project.name);
        
        //purpose
        if (project.purpose && project.purpose !== ""){
          self.purpose.set("value", project.purpose);
          dojo.removeClass(self.infoPurpose, "hidden");
        } else {
          dojo.addClass(self.infoPurpose, "hidden");
        }
        
        //responsible
        self.responsible.set("value", db.contactFullName(project.responsible));
      
        //deadline
        self.deadline.set("value" , dt.prettyISODate(project.deadline));
        
        //deferred
        if (p.isDeferred()){
          self.deferred.set("value", dt.deferred(project.calendar.start));
          dojo.removeClass(self.infoDeferDate, "hidden");
        } else {
          dojo.addClass(self.infoDeferDate, "hidden");
        }
        
        //attachments
        if (p.hasAttachments()){
          self.showAttachments(project);
          dojo.removeClass(self.infoAttachments, "hidden");
        } else {
          dojo.addClass(self.infoAttachments, "hidden");
        }
        
        //opportunity: if this is an opportunity, then show it
        if (!p.isOpportunity()){
          dojo.addClass(self.infoOpportunity, "hidden");
        }
        
        //console.debug("finished setting the task");
      },
      
      showAttachments: function(project){
        var files = project._attachments;
        dojo.empty(this.attachments);
        //console.debug("showing attachments", files);
    		for (var key in files){
    		  var file = dojo.create("a", {
      		  title: key,
      		  href: db.db + project._id + "/" + key,
      		  style: "font-size: 10px;display:block",
      		  "class": "attachment c-ellipsis",
      		  target: "_blank",
      		  innerHTML: key
      		}, this.attachments);
      		
      		//console.debug("file in showAttachments", file);
    		}
    		
      },
      
      baseClass: "project-info"
  });
  return app.views.ProjectInfo;     
});