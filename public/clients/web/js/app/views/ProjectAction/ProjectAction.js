define([
  "dojo",
  "i18n!app/nls/coordel",
  "text!app/views/ProjectAction/templates/ProjectAction.html",
  "text!app/views/ProjectAction/templates/Blueprint.html",
  "text!app/views/ProjectAction/templates/Feedback.html",
  "text!app/views/ProjectAction/templates/Opportunity.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/ConfirmDialog/ConfirmDialog",
  'app/widgets/ContainerPane',
  'app/models/CoordelStore',
  'app/views/ProjectForm/ProjectForm',
  "app/views/feedback/RatingForm/RatingForm"], function(dojo, coordel, template, blueprint, feedback, opportunity, w, t, Dialog, ContainerPane, db, Form, Rating) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.ProjectAction", [w,t], {
    
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
      var i = coordel.projectActions.instructions[this.action];
      if (i){
        this.instructions = i;
      }
      
      if (this.action === "ackDone"){
        this.templateString = feedback;
        //console.log("it's feedback");
      }
      
      if (this.action === "publish"){
        this.templateString = opportunity;
      }
      
    },
    
    postCreate: function(){
      this.inherited(arguments);
      
      //console.log("project action", this.action);
      
      if (this.project.status === "PROJECT"){
        this.project = db.projectStore.store.get(this.project.project);
      }
      
      if (this.action === "publish"){
        //make sure there is a message entered before enabling the save button
        dojo.connect(this.actionText, "onKeyUp", this, function(){ 
          this.validate();
        });
      } else {
        //make sure there is a message entered before enabling the save button
        dojo.connect(this.actionText, "onKeyUp", this, function(){ 
          this.validate();
        });
        
      }
      
      //the message, issue and proposed solution need to be entered before this can be saved
      this.onValidate(false);
      
      //if we're giving feedback, then we need to show a feedback form
      if (this.action === "ackDone"){
        
        this.rating = new Rating({
          project: this.project
        }).placeAt(this.containerNode);
        //console.log("it was ackDone", this.rating);
      }
      
    },
    
    save: function(){
    
      //console.debug("save called in ProjectAction", this.action, this.project);
      var p = db.getProjectModel(this.project, true),
          message = "",
          project = this.project,
          username = db.username();
      
      if (this.actionText){
         message = this.actionText.get("value");
      }
      
      switch(this.action){
        case "participate":
          //if we're participating the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.participate(username, project, message);
          break;
        case "delegate":
          p.delegate(project, message);
          break;
        case "leave": 
          p.leave(username, project, message);
          break;
        case "follow": 
          //console.log("before follow, db, username, project", db, username, project);
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            //console.log("before primaryNavSelect");
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.follow(username, project, message);
          //console.log("after follow");
          
          
          break;
        case "unfollow":
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.unfollow(username, project, message);
          break;
        case "send":
          p.send(project, message);
          //if we're activating the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          break;
        case "publish":
          
          //in order to publish an opportunity, the responsible had to give a budget and currency
          //NOTE: disabled until better payment integration
          /*
          var opp = {};
          opp.budget = this.budget.get("value");
          opp.currency = this.currency.get("value");
          project.opportunity = opp;
          */
          p.publish(project, message);
          //if we're activating the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          break;
        case "decline":
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.decline(username, project, message);
          break;
        case "pause":
          p.pause(project, message);
          break;
        case "resume":
          p.resume(project, message);
          break;
        case "cancel":
          p.cancel(project, message);
          break;
        case "ackCancel":
          //if we're deleting the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.ackCancel(username, project);
          break;
        case "deleteProject":
          //if we're deleting the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          p.remove(project);
         
          break;
        case "reuse":
          //p.reuse(project);
          break;
        case "markDone":
          p.markDone(project, message);
          break;
        case "ackDone":
          this.rating.save();
          p.feedback(username, project);
          break;
      }
    },
    
    onValidate: function(isValid){
      //console.debug("onValidate called in ProjectAction", isValid);
    },
    
    validate: function(){
      var isValid = false,
          v = this.actionText.get("value");
      
      //console.log("actionText", v);
      
      /*
      if (this.action === "publish"){
        v = this.budget.get("value");
        if (v){
          isValid = true;
          //turn the required dot gray
          dojo.addClass(this.isRequired, "ready");
        }
      }
      */
         
       
      //turn the required dot red
      dojo.removeClass(this.isRequired, "ready");  
      if (v.length > 0){
        isValid = true;
        //turn the required dot gray
        dojo.addClass(this.isRequired, "ready");
      }

      this.onValidate(isValid);
    }
  });
  return app.views.ProjectAction;    
});



