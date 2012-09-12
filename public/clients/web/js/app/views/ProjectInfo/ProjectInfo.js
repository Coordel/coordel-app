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
      		  href: db.db + "files/" + project._id + "/" + key,
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