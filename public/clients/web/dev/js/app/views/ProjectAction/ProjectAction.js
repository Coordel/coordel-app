define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/ProjectAction/templates/ProjectAction.html",
  "text!app/views/ProjectAction/templates/Blueprint.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/ConfirmDialog/ConfirmDialog",
  'app/widgets/ContainerPane',
  'app/models/CoordelStore',
  'app/views/ProjectForm/ProjectForm'], function(dojo, coordel, template, blueprint, w, t, Dialog, ContainerPane, db, Form) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.ProjectAction", [w,t], {
    
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
      
      if (this.action === "reuse"){
        this.templateString = blueprint;
      }
      
    },
    
    postCreate: function(){
      this.inherited(arguments);
      
      if (this.project.status === "PROJECT"){
        this.project = db.projectStore.store.get(this.project.project);
      }
      
      //make sure there is a message entered before enabling the save button
      dojo.connect(this.actionText, "onKeyUp", this, function(){
        this.validate();
      });
      
      //the message, issue and proposed solution need to be entered before this can be saved
      this.onValidate(false);
      
      //if we're reusing, then we need to show a project form
      if (this.action === "reuse"){
        var f = new Form({
          project: this.project,
          isNew: false
        }).placeAt(this.containerNode);
      }
      
    },
    
    save: function(){
      console.debug("save called in ProjectAction", this.action, this.project, this.actionText.get("value"));
      var p = db.getProjectModel(this.project, true),
          message =  this.actionText.get("value"),
          project = this.project,
          username = db.username();
      
      switch(this.action){
        case "participate":
          p.participate(username, project, message);
          //if we're participating the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          break;
        case "delegate":
          p.delegate(project, message);
          break;
        case "leave": 
          p.leave(username, project, message);
          break;
        case "follow": 
          p.follow(project, message);
          break;
        case "unfollow":
          p.unfollow(project, message);
          break;
        case "send":
          p.send(project, message);
          //if we're activating the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          break;
        case "decline":
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
        case "deleteProject":
          p.remove(project);
          //if we're deleting the currently focused project, default back to current
          if (db.focus === "project" && db.projectStore.currentProject === project._id){
            dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
          }
          break;
        case "reuse":
          p.reuse(project);
          break;
        case "markDone":
          p.markDone(project, message);
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
  return app.views.ProjectAction;    
});



