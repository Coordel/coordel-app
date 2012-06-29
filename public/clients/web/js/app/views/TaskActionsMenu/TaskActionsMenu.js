define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/TaskActionsMenu/templates/taskActionsMenu.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], function(dojo, coordel, menu, w, t, db) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.TaskActionsMenu", [w,t], {
    
    task: null,
    
    username: null,
    
    responsible: null,  
    
    coordel: coordel,
    
    templateString: menu,
    
    postCreate: function(){
      this.inherited(arguments);
      
      this.setMenuItems();
      
      //wire up the proposeChange menu option
      dojo.connect(this.proposeChange, "onclick", this, function(){
        //console.log("proposeChange clicked");
        dojo.publish("coordel/taskAction", [{action: "proposeChange", validate: true, task: this.task}]);
      });

      //wire up the agreeChange menu option
      dojo.connect(this.agreeChange, "onclick", this, function(){
        //console.log("return clicked");
        dojo.publish("coordel/taskAction", [{action: "agreeChange", validate: true, task: this.task}]);
      });
      
      //wire up the submit menu option
      dojo.connect(this.submitTask, "onclick", this, function(){
        //console.log("return clicked");
        dojo.publish("coordel/taskAction", [{action: "submit", validate:true, task: this.task}]);
      });
      
      //wire up the return menu option
      dojo.connect(this.returnTask, "onclick", this, function(){
        //console.log("return clicked");
        dojo.publish("coordel/taskAction", [{action: "return", validate: true, task: this.task, cssClass: "warning-button"}]);
      });
      
      //wire up the approve menu option
      dojo.connect(this.approveTask, "onclick", this, function(){
        //console.log("return clicked");
        dojo.publish("coordel/taskAction", [{action: "approve", validate: true, task: this.task}]);
      });
      
      //wire up the raise issue menu option
      dojo.connect(this.raiseIssue, "onclick", this, function(){
        //console.log("raiseIssue clicked");
        dojo.publish("coordel/taskAction", [{action: "raiseIssue", task: this.task,  validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the clear issue menu option
      dojo.connect(this.clearIssue, "onclick", this, function(){
        //console.log("clearIssue clicked");
        dojo.publish("coordel/taskAction", [{action: "clearIssue", validate: true, task: this.task}]);
      });
      
      //wire up the pause menu option
      dojo.connect(this.pauseTask, "onclick", this, function(){
        //console.log("pause clicked");
        dojo.publish("coordel/taskAction", [{action: "pause", task: this.task, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the resume menu option
      dojo.connect(this.resumeTask, "onclick", this, function(){
        //console.log("resume clicked");
        dojo.publish("coordel/taskAction", [{action: "resume", validate: true,  task: this.task}]);
      });
      
      //wire up the cancel menu option
      dojo.connect(this.cancelTask, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/taskAction", [{action: "cancel", task: this.task, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the delete menu option
      dojo.connect(this.deleteTask, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/taskAction", [{action: "delete", task: this.task, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the reuse menu option
      dojo.connect(this.reuseTask, "onclick", this, function(){
        //console.log("reuse clicked");
        dojo.publish("coordel/taskAction", [{action: "reuse", task: dojo.clone(this.task)}]);
      });
      
      /*
      //wire up the reuse menu option
      dojo.connect(this.reuseDeliverables, "onclick", this, function(){
        //console.log("reuse clicked");
        dojo.publish("coordel/taskAction", [{action: "reuseDeliverables", task: this.task}]);
      });
      */
      //PROJECT 
      //wire up the proposeProjChange menu option
      dojo.connect(this.proposeProjChange, "onclick", this, function(){
        //console.log("proposeChange clicked");
        dojo.publish("coordel/projectAction", [{action: "proposeChange", validate: true, project: this.task}]);
      });
      
      
    },
    
    setMenuItems: function(){
      var stat = this.task.status + "-" + this.task.substatus,
          own = false,
          t = db.getTaskModel(this.task, true);
          
      if (this.responsible === this.username){
        own = true;
      }
              
      //reuse shows by default but hide it if this is a PROJECT invite
      if (this.task.status === "PROJECT"){
        dojo.addClass(this.reuseTask, "hidden");
        dojo.addClass(this.reuseDeliverables, "hidden");
      }
          
      //if I'm the owner, I can usually see cancel pause unless this
      //is my private project when I see delete or when it's a PROJECT invite
      if (own) {
        if (this.task.project === db.myPrivate()){
          dojo.removeClass(this.deleteTask, "hidden");
        } else {
          if (this.task.status !== "PROJECT"){
            dojo.removeClass(this.cancelTask, "hidden");
            dojo.removeClass(this.pauseTask, "hidden");
          }
        }
      }
             
      switch(stat){	
        case "CURRENT-PAUSED":
  			//owner - reuse cancel resume
  			//not owner - reuse
  				if (own){
  					dojo.addClass(this.pauseTask, "hidden");
  					dojo.removeClass(this.resumeTask, "hidden");
  				}
  				break;
  		  case "DONE-CANCELLED":
  			//owner - reuse
  			//not owner - reuse
  				if (own){
  				  dojo.addClass(this.cancelTask, "hidden");
            dojo.addClass(this.pauseTask, "hidden");
  				}
  				break;
  	    case "DONE-APPROVED":
  			//owner - reuse
  			//not owner - reuse
  				if (own){
            dojo.addClass(this.cancelTask, "hidden");
            dojo.addClass(this.pauseTask, "hidden");
  				}
  				break;
  	    case "CURRENT-RESUMED":
  			//owner - reuse cancel pause
  			//not owner - reuse issue submit
  			  if (!own){
  					dojo.removeClass(this.raiseIssue, "hidden");
  					dojo.removeClass(this.submitTask, "hidden");
  				}
  				break;
  			case "CURRENT-DELEGATED":
  			//owner - reuse cancel
  			//not owner - propose and accept/decline buttons will show
  				if (own){
            dojo.addClass(this.pauseTask, "hidden");
  				} else {
  				  dojo.removeClass(this.proposeChange, "hidden");
  				}
  				break;
  			case "DELEGATED-PROPOSED":
  			//this state means that the person assigned the task has proposed changes to the
  			//task (created deliverables, set a defer date, refined the purpose, etc)
  			//owner - reuse cancel agree
  			//not owner - only stream and info buttons will show
  			  if (own){
            dojo.addClass(this.pauseTask, "hidden");
            dojo.removeClass(this.agreeChange, "hidden");
				  }
  			  break;
  			case "DELEGATED-AGREED":
  			//this state means that the responsible/delegator has accepted the proposed changes
  			//to the task
  			//owner - reuse cancel
  			//not owner - propose and accept/decline buttons will show
  			  if (own){
            dojo.addClass(this.pauseTask, "hidden");
  				} else {
  				  dojo.removeClass(this.proposeChange, "hidden");
  				}
  			  break;
  			case "CURRENT-ACCEPTED":
  			//owner - reuse cancel pause
  			//not owner - reuse issue submit
  				if (!own){
  					dojo.removeClass(this.raiseIssue, "hidden");
  					if (t.isReady()){
  						dojo.removeClass(this.submitTask, "hidden");
  					}
  				
  				} 
  				break;
  			case "CURRENT-RETURNED":
  			//owner - cancel pause reuse
  			//not owner - reuse issue submit
  				if (!own){
  					dojo.removeClass(this.raiseIssue, "hidden");
  					if (t.isReady()){
  						dojo.removeClass(this.submitTask, "hidden");
  					}
  				}
  				break;
  			case "CURRENT-CLEARED":
  			//owner - cancel pause reuse
  			//not owner - reuse issue submit
  				if (!own){
  					dojo.removeClass(this.raiseIssue, "hidden");
  					if (t.isReady()){
  						dojo.removeClass(this.submitTask, "hidden");
  					}
  				}
  				break;
  			case "CURRENT-DECLINED":
  			//owner - cancel pause 
  			//not owner - reuse
  				if (own){
            dojo.addClass(this.pauseTask, "hidden");
  				}
  				break;
  			case "CURRENT-DONE":
  			//owner - reuse return approve
  			//not owner - reuse 
  				if (own){
  					dojo.removeClass(this.returnTask, "hidden");
  					dojo.removeClass(this.approveTask, "hidden");
  					dojo.addClass(this.pauseTask, "hidden");
  					dojo.addClass(this.cancelTask, "hidden");
  					
  				} 
  				break;
  			case "CURRENT-ISSUE":
  			//owner - cancel pause reuse clear
  			//not owner - reuse
  				if (own){
  					dojo.removeClass(this.clearIssue, "hidden");
  				}
  				break;
  		  case "PROJECT-INVITE":
  			//owner
  			//not owner - propose
  			  if (this.task.role !== "follower"){
  			    dojo.removeClass(this.proposeProjChange, "hidden");
  			  } 
  				
  				break;
  		  case "PROJECT-AMENDED":
  			//owner
  			//not owner - propose
  			  dojo.removeClass(this.proposeProjChange, "hidden");
  				break;
  	    case "PROJECT-DECLINED":
  			//owner
  			//not owner - propose
  			  dojo.removeClass(this.reassignProj, "hidden");
  				break;
        case "PROJECT-LEFT":
  			//owner
  			//not owner - propose
  			  dojo.removeClass(this.reassignProj, "hidden");
  				break;
  			case "PROJECT-PROPOSED": 
  			  dojo.removeClass(this.agreeProjChange, "hidden");
  			  dojo.removeClass(this.amendProjChange, "hidden");
  			  dojo.removeClass(this.reassignProj, "hidden");
  			  break;
  		  case "PROJECT-AGREED": 
  			  dojo.removeClass(this.proposeProjChange, "hidden");
  			  break;
		    }
    }
       
  });
  return app.views.TaskActionsMenu;    
});

