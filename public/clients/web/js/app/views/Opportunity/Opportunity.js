define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Opportunity.html",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore",
    "app/util/dateFormat",
    "app/views/OpportunityActionsMenu/OpportunityActionsMenu",
    "dijit/TooltipDialog",
    "dijit/form/DropDownButton",
  
    "app/views/Label/Label"
    
    ], 
  function(dojo, w, t, html, coordel, db, dt, ActionsMenu, Tooltip) {
  
  dojo.declare(
    "app.views.Opportunity", 
    [w, t], 
    {
      
      templateString: html,
      
      menuOpen: false,
      
      isClosed: true,
      
      project: {},
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        self.setProject();
        
        //set the menu
        var menu = new ActionsMenu({
          project: self.project,
          username: db.username(),
          onSelect: function(){
            self.showProjectMenu.closeDropDown();
          }
        });
        
        this.showProjectMenu.dropDown = new Tooltip({
          content: menu
        });
        
        //console.log("menu", menu);
        //self.projActionDialog.set("content", menu);
        
        //show the actions menu button when mousing over the project
  	    dojo.connect(this.name, "onmouseover", this, function(){
  	      dojo.removeClass(this.actionsMenu, "hidden");
  	    });
  	    
  	    //hide the actions menu button when mousing out of the project
  	    dojo.connect(this.name, "onmouseout", this, function(){
  	      if (!this.menuOpen){
  	        dojo.addClass(this.actionsMenu, "hidden");
  	      }
  	    });
  	  
  	    dojo.connect(this.showProjectMenu.dropDown, "onOpen", this, function(){
  	      //console.log("onOpen");
  	      this.menuOpen = true;
  	      dojo.addClass(this.actionsMenu, "opaque");
  	    });
  	    
  	    dojo.connect(this.showProjectMenu.dropDown, "onClose", this, function(){
    	    //console.log("onClose");
    	    dojo.addClass(this.actionsMenu, "hidden");
    	    dojo.removeClass(this.actionsMenu, "opaque");
    	    this.menuOpen = false;
    	  });
  	    
  	    
      },
      
      setProject: function(){
 
        var project = this.project,
            p = db.getProjectModel(project, true),
            self = this;
            
        
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
        
        //opportunity: if this is an opportunity, then show it
        if (!p.isOpportunity()){
          dojo.addClass(self.infoOpportunity, "hidden");
        }
        
        //console.debug("finished setting the task");
      },
      
      baseClass: "tasklist-group"
  });
  return app.views.Opportunity;     
});