define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/OpportunityAction/templates/OpportunityAction.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/ConfirmDialog/ConfirmDialog",
  'app/widgets/ContainerPane',
  'app/models/CoordelStore'], function(dojo, coordel, template, w, t, Dialog, ContainerPane, db) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.OpportunityAction", [w,t], {
    
    rating: null,
    
    project: null, 
    
    action: null, 
    
    coordel: coordel,
    
    instructions: "",
    
    mustValidate: false,
    
    widgetsInTemplate: true,
    
    templateString: template,
    
    postMixInProperties: function(){
      this.inherited(arguments);
      var i = coordel.opportunityActions.instructions[this.action];
      if (i){
        this.instructions = i;
      }
      
    },
    
    postCreate: function(){
      this.inherited(arguments);
      
      console.log("opportunity action", this.action);
      
      if (this.project.status === "PROJECT"){
        this.project = db.projectStore.store.get(this.project.project);
      }
      
      //make sure there is a message entered before enabling the save button
      dojo.connect(this.actionText, "onKeyUp", this, function(){
        this.validate();
      });
      
      //the message, issue and proposed solution need to be entered before this can be saved
      this.onValidate(false);
      
    },
    
    save: function(){
    
      console.debug("save called in OpportunityAction", this.action, this.project);
      var p = db.getProjectModel(this.project, true),
          message = "",
          project = this.project,
          username = db.username();
      
      if (this.actionText){
         message = this.actionText.get("value");
      }
      
      switch(this.action){
        case "follow": 
          p.follow(username, project, message);
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "opportunities", setSelection: true}]);
          }
          break;
      }
    },
    
    onValidate: function(isValid){
      //console.debug("onValidate called in ProjectAction", isValid);
    },
    
    validate: function(){
      var isValid = false,
          v = this.actionText.get("value");
          
      //turn the required dot red and show the footer instructions
      dojo.removeClass(this.isRequired, "ready");  
      if (v.length > 0){
        isValid = true;
        //turn the required dot gray and hide the footer instructions
        dojo.addClass(this.isRequired, "ready");
      }

      this.onValidate(isValid);
    }
       
  });
  return app.views.OpportunityAction;    
});



