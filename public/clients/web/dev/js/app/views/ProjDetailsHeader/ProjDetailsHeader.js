define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!./templates/projDetailsHeader.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore",
  "app/models/ProjectStatus",
  "app/views/ProjectActionsMenu/ProjectActionsMenu"], function(dojo, dijit, bn, coordel, html, w, t, db, pStatus, ActionsMenu) {
  dojo.declare(
    "app.views.ProjDetailsHeader", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      postCreate: function(){
        this.inherited(arguments);
        var pdh = this,
            username = db.username();
        //console.debug("project", this.project);
        //publish the button events
        //dojo.addClass(dijit.byId("showRightProjectDetails").domNode, "hidden");
        
        //set the chooseActions menu
        var menu = new ActionsMenu({
          project: pdh.project,
          username: username
        });
        
        //removed because the edit button on the project list caused trouble
        //hide the edit option because there is an edit button
        //dojo.addClass(menu.edit, "hidden");
        
        this.actionsMenu.set("content", menu);
        
        //if I'm project responsible, show the edit button
        if (username === this.project.responsible){
          dojo.removeClass(this.editProject.domNode, "hidden");
          
          //TODO: it would be good if the done button was disabled unless all tasks are done or cancelled
        }
        
        //if this project is pending, hide the done button and show the send button
        if (pStatus.isPending(this.project, username)){
          //console.debug("project substatus", this.project.substatus);
          dojo.addClass(this.markDone.domNode, "hidden");
          dojo.removeClass(this.send.domNode, "hidden");
        }
        
        if (pStatus.isDone(this.project)){
          this.markDone.set("disabled", true);
        }
        
        //if i'm not the project responsible, hide both send and done buttons 
        if (username !== this.project.responsible){
          dojo.addClass(this.markDone.domNode, "hidden");
          dojo.addClass(this.send.domNode, "hidden");
        }
        
        //handle buttons when this is a follow or participate invitation
        if (pStatus.isInvitedFollow(this.project, username)){
          //if project is isFollow show follow and decline and hide the actions button
          dojo.removeClass(this.decline.domNode, "hidden");
          dojo.removeClass(this.follow.domNode, "hidden");
          dojo.addClass(this.chooseAction.domNode, "hidden");
          
          dojo.style(this.decline.domNode, {"margin-right": "0"});
          
        } else if (pStatus.isInvitedNew(this.project, username) || 
            pStatus.isInvitedAgreed(this.project, username) || 
            pStatus.isInvitedAmended(this.project, username) ){
          //if project is newInvite, agreeInvite, or amendedInvite then show accept/decline
          dojo.removeClass(this.decline.domNode, "hidden");
          dojo.removeClass(this.participate.domNode, "hidden");
          
          dojo.style(this.decline.domNode, {"margin-right": "0"});
              
        } else {
          //need to get rid of the margin on the action button it none of the other buttons are showing
          //and this user isn't responsible (send and done are hidden)
          if (username !== this.project.responsible){
            dojo.style(this.chooseAction.domNode, {"margin-right": "0"});
          }
        }
        
        
        //handle button clicks
        //edit the project
        dojo.connect(this.editProject, "onClick", this, function(){
          //console.debug("publishing coordel/editProject");
          dojo.publish("coordel/editProject", [{project: this.project}]);
        });
        
        //send pending project
        dojo.connect(this.send, "onClick", this, function(){
          //console.log("cancel clicked");
          dojo.publish("coordel/projectAction", [{action: "send", project: this.project}]);
        });
        
        //decline
        dojo.connect(this.decline, "onClick", this, function(){
          //console.log("cancel clicked");
          dojo.publish("coordel/projectAction", [{action: "decline", project: this.project, validate: true,  cssClass: "warning-button"}]);
        });
        
        //participate
        dojo.connect(this.participate, "onClick", this, function(){
          //console.log("cancel clicked");
          dojo.publish("coordel/projectAction", [{action: "participate", project: this.project}]);
        });
        
        //follow
        dojo.connect(this.follow, "onClick", this, function(){
          //console.log("cancel clicked");
          dojo.publish("coordel/projectAction", [{action: "follow", project: this.project}]);
        });
        
        //handle button clicks
        dojo.connect(this.markDone, "onClick", this, function(){
          //console.log("cancel clicked");
          dojo.publish("coordel/projectAction", [{action: "markDone", project: this.project}]);
        });

      }
  });
  return app.views.ProjDetailsHeader;    
}
);

