define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/TaskActionDialog/templates/taskActionDialog.html",
  "text!app/views/TaskActionDialog/templates/raiseIssueDialog.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  'dijit/Dialog',
  'app/widgets/ContainerPane',
  'app/models/CoordelStore'], function(dojo, coordel, template, issueTemplate, w, t, Dialog, ContainerPane, db) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.TaskActionDialog", [w,t], {
    
    task: null, 
    
    action: null, 
    
    coordel: coordel,
    
    widgetsInTemplate: true,
    
    instructions: "",
    
    issueIntructions: "",
    
    solutionInstructions: "",
    
    templateString: template,
    
    postMixInProperties: function(){
      this.instructions = coordel.taskActions.instructions[this.action];
      
      //if this issue, then use the issue template
      if (this.action === "raiseIssue"){
        this.templateString = issueTemplate;
        this.issueInstructions = coordel.taskActions.instructions.raiseIssue;
        this.solutionInstructions = coordel.taskActions.instructions.proposedSolution;
      }
    },
    
    postCreate: function(){
      this.inherited(arguments);
      
      //the message, issue and proposed solution need to be entered before this can be saved
      //dijit.byId(this.saveButton).set("disabled", true);
      
      if (this.action === "raiseIssue"){
        //make sure that that both the issue and proposed solution are entered before 
        //enabling the save button
        dojo.connect(this.issueText, "onKeyUp", this, function(){
          this.validate();
        });
        
        dojo.connect(this.solutionText, "onKeyUp", this, function(){
          this.validate();
        });
        
      } else {
        //make sure there is a message entered before enabling the save button
        dojo.connect(this.actionText, "onKeyUp", this, function(){
          this.validate();
        });
      }
      
    },
    
    save: function(){
      //console.debug("save called in TaskActionDialog", this.action, this.task);
      var t = db.getTaskModel(this.task, true),
          task = this.task,
          message = "";
      
      if (this.action !== "raiseIssue"){
        message = dijit.byId(this.actionText).get("value");
      }
      
      switch(this.action){
        case "proposeChange":
          t.proposeChange(task, message);
          break;
        case "agreeChange": 
          t.agreeChange(task, message);
          break;
        case "submit": 
          t.submitToApprove(task, message);
          break;
        case "return":
          t.returnNotDone(task, message);
          break;
        case "approve":
          t.approve(task, message);
          break;
        case "raiseIssue":
          var i = dijit.byId(this.issueText).get("value"),
              s = dijit.byId(this.solutionText).get("value");
          t.raiseIssue(task, i, s);
          break;
        case "clearIssue":
          t.clearIssue(task, message);
          break;
        case "pause":
          t.pause(task, message);
          break;
        case "resume":
          t.resume(task, message);
          break;
        case "cancel":
          t.cancel(task, message);
          break;
        case "delete":
          t.remove(task);
      }
    },
    
    onValidate: function(isValid){
      
    },
    
    validate: function(){
      var isValid = false;
      
      if (this.action === "raiseIssue"){
        var i = dijit.byId(this.issueText).get("value"),
            s = dijit.byId(this.solutionText).get("value");
            
        if (i.length > 0 && s.length > 0){
          isValid = true;
        }
      } else {
        var m = dijit.byId(this.actionText).get("value");
        if (m.length > 0){
          isValid = true;
        }
      }
      
      this.onValidate(isValid);
    }
       
  });
  return app.views.TaskActionDialog;    
});



