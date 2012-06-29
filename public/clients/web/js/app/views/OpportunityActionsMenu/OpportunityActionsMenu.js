define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/OpportunityActionsMenu/templates/OpportunityActionsMenu.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], function(dojo, coordel, menu, w, t, db) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.OpportunityActionsMenu", [w,t], {
    
    project: null,
    
    username: null,
    
    hasOptions: true,
    
    responsible: null,  
    
    coordel: coordel,
    
    templateString: menu,
    
    postCreate: function(){
      this.inherited(arguments);
  
      //wire up the follow menu option
      dojo.connect(this.follow, "onclick", this, function(){
        console.log("follow clicked");
        dojo.publish("coordel/opportunityAction", [{action: "follow", project: this.project, validate: true}]);
        this.onSelect();
      });
      
      //wire up the addTask menu option
      dojo.connect(this.proposeTask, "onclick", this, function(){
        console.log("proposeTask clicked");
        //dojo.publish("coordel/opportunityAction", [{action: "proposeTask", project: this.project, validate: true, cssClass: "warning-button"}]);
        dojo.publish("coordel/addObject", [{object: "task", project: this.project}]);
        this.onSelect();
      });
     
    },
    
    onSelect: function(){
      
    }
       
  });
  return app.views.OpportunityActionsMenu;    
});

