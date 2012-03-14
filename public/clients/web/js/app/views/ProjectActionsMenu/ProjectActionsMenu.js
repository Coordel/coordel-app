define([
  "dojo", 
  "i18n!app/nls/coordel",
  "text!app/views/ProjectActionsMenu/templates/ProjectActionsMenu.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], function(dojo, coordel, menu, w, t, db) {
  //return an object to define the "./newmodule" module.
  dojo.declare("app.views.ProjectActionsMenu", [w,t], {
    
    project: null,
    
    username: null,
    
    hasOptions: true,
    
    responsible: null,  
    
    coordel: coordel,
    
    templateString: menu,
    
    postCreate: function(){
      this.inherited(arguments);
      
      this.setMenuItems();
      
      /*
      participate: "Participate",
		  leave: "Leave",
		  follow: "Follow",
		  unfollow: "Unfollow",
		  cancel: "Cancel",
		  pause: "Pause",
		  resume: "Resume",
		  "delete": "Delete",
		  send: "Send",
		  decline: "Decline",
		  reuse: "Reuse",
		  markDone: "Mark Done"
      */
      
      //wire up the particate menu option
      //when you participate, you agree to do tasks
      //otherwise, there is the option to follow
      dojo.connect(this.participate, "onclick", this, function(){
        //console.log("return clicked");
        dojo.publish("coordel/projectAction", [{action: "participate", project: this.project, validate: true}]);
      });
      
      //wire up the leave menu option
      //leave is what you do when you have active tasks in a project
      //if you don't have active tasks, then the option is to unfollow
      dojo.connect(this.leave, "onclick", this, function(){
        //console.log("leave clicked");
        dojo.publish("coordel/projectAction", [{action: "leave", project: this.project, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the mark done menu option
      dojo.connect(this.markDone, "onclick", this, function(){
        //console.log("mark done clicked");
        dojo.publish("coordel/projectAction", [{action: "markDone", project: this.project, validate: true}]);
      });
      
      //wire up the mark done menu option
      dojo.connect(this.ackDone, "onclick", this, function(){
        //console.log("ack done clicked");
        dojo.publish("coordel/projectAction", [{action: "ackDone", project: this.project}]);
      });
  
      //wire up the follow menu option
      dojo.connect(this.follow, "onclick", this, function(){
        //console.log("follow clicked");
        dojo.publish("coordel/projectAction", [{action: "follow", project: this.project, validate: false}]);
      });
      
      //wire up the unfollow menu option
      dojo.connect(this.unfollow, "onclick", this, function(){
        //console.log("unfollow clicked");
        dojo.publish("coordel/projectAction", [{action: "unfollow", project: this.project, validate: true, cssClass: "warning-button"}]);
      });
     
      //wire up the pause menu option
      dojo.connect(this.pause, "onclick", this, function(){
        //console.log("pause clicked");
        dojo.publish("coordel/projectAction", [{action: "pause", project: this.project, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the resume menu option
      dojo.connect(this.resume, "onclick", this, function(){
        //console.log("resume clicked");
        dojo.publish("coordel/projectAction", [{action: "resume", project: this.project, validate: true}]);
      });
      
      //wire up the cancel menu option
      dojo.connect(this.cancel, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "cancel", project: this.project, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the cancel menu option
      dojo.connect(this.ackCancel, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "ackCancel", project: this.project, validate: false}]);
      });
      
      //wire up the delete menu option
      dojo.connect(this.deleteProject, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "deleteProject", project: this.project, cssClass: "warning-button"}]);
      });
      
      //wire up the send menu option
      dojo.connect(this.send, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "send", project: this.project, validate: true}]);
      });
      
      //wire up the decline menu option
      dojo.connect(this.decline, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "decline", project: this.project, validate: true, cssClass: "warning-button"}]);
      });
      
      //wire up the proposeChange menu option
      dojo.connect(this.proposeChange, "onclick", this, function(){
        //console.log("cancel clicked");
        dojo.publish("coordel/projectAction", [{action: "proposeChange", project: this.project, validate: true}]);
      });
      
      //wire up the reuse menu option
      dojo.connect(this.reuse, "onclick", this, function(){
        console.log("reuse clicked", this);
        dojo.publish("coordel/projectAction", [{action: "reuse", project: dojo.clone(this.project), validate: false}]);
      }); 
      
    },
    
    setMenuItems: function(){
      var projStat = this.project.status,
          projSub = this.project.substatus,
          myAssign = false,
          own = false;
          
      if (this.project.responsible === this.username){
        own = true;
      }
      
      var dKey = -1;
      
      dojo.forEach(this.project.assignments, function(assign, key ){
        //console.debug("testing username", assign.username, this.username, (assign.username === this.username));
        if (assign.username === this.username){
          //console.debug("setting the key", key);
          dKey = key;
          
        }
      }, this);
      
      if (dKey > -1){
        myAssign = this.project.assignments[dKey];  
      }
      
      //console.debug("project actions menu assignment", this.project._id, this.project.name, this.username, myAssign, dKey);   
          
      //if I'm the owner, I see reuse and I can usually see cancel pause
      if (own) {
        dojo.removeClass(this.reuse, "hidden");
        dojo.removeClass(this.cancel, "hidden");
        dojo.removeClass(this.pause, "hidden");
      } else {
        //eliminated the edit option because using it made the project list go crazy when not
        //in the project controller
        
        //I can't see edit if I'm not the responsible
        //dojo.addClass(this.edit, "hidden");
      }
      
      //console.log("projStat", projStat);
             
      switch(projStat){	
  		  case "ACTIVE":
  			  //owner - pause cancel reuse (the owner can't leave)
  				if (own){
  				
  				  if (projSub && projSub === "PENDING"){
  				    dojo.removeClass(this.send, "hidden");
    				  dojo.removeClass(this.deleteProject, "hidden");
    					dojo.addClass(this.cancel, "hidden");
    					dojo.addClass(this.pause, "hidden");
  				  } else if (projSub && projSub === "PAUSED") {
  				    dojo.addClass(this.pause, "hidden");
              dojo.removeClass(this.resume, "hidden");
  				  } else if (projSub && projSub === "CANCELLED") {
    				  dojo.addClass(this.pause, "hidden");
              dojo.addClass(this.cancel, "hidden");
    					dojo.addClass(this.resume, "hidden");
    				} else {
    				  dojo.removeClass(this.markDone, "hidden");
    				}
  				  
  				} else {
  				  if (myAssign){
  				    //console.log("assignment", myAssign);
  				    if (myAssign.role === "FOLLOWER"){
    				    if (myAssign.status === "INVITE"){
    				      //not owner - follow decline
    				      dojo.removeClass(this.follow, "hidden");
    				      dojo.removeClass(this.decline, "hidden");

    				    } else if (myAssign.status === "FOLLOWING"){
    				      //not owner - unfollow
    				      dojo.removeClass(this.unfollow, "hidden");
    				    }
    				  } else {
    				    //console.debug("not owner");
    				    if (myAssign.status === "INVITE"){
    				      //not owner - participate follow decline
    				      dojo.removeClass(this.proposeChange, "hidden");
    				    } else if (myAssign.status === "ACCEPTED"){
    				      //not owner - leave
    				      dojo.removeClass(this.leave, "hidden");
    				    } 
    				    
    				    if (projSub && projSub === "CANCELLED"){
    				      dojo.addClass(this.leave, "hidden");
    				      dojo.removeClass(this.ackCancel, "hidden");
    				    }
    				    
    				  }
  				  } else {
  				    //console.debug("should show no options");
  				    this.hasOptions = false;
  				  }
  				  
  				  
  				}
  				break;
  			  case "ARCHIVE":
  			    if (own){
      				dojo.addClass(this.pause, "hidden");
              dojo.addClass(this.cancel, "hidden");
      				dojo.addClass(this.resume, "hidden");
            } 
          
				    dojo.removeClass(this.ackDone, "hidden");
	
  			  break;
  		}
    }
       
  });
  return app.views.ProjectActionsMenu;    
});

