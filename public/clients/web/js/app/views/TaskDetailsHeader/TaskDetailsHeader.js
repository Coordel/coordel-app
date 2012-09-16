define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "app/views/TaskActionsMenu/TaskActionsMenu",
  "app/views/TaskForm/TaskForm",
  "i18n!app/nls/coordel",
  "text!./templates/taskDetailsHeader.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dijit/Dialog",
  "app/models/CoordelStore"], function(dojo, dijit, bn, ActionsMenu, TaskForm, coordel, html, w, t, Dialog, db) {
  dojo.declare(
    "app.views.TaskDetailsHeader", 
    [w, t], 
    {
      username: null, //the name of the current user
      
      responsible: null,
  
      templateString: html,
      
      taskForm: null, 
      
      coordel: coordel,
      
      taskFormTitle: coordel.taskForm.titleEdit, 
      
      db: null,
      
      backLabel: "",
      
      widgetsInTemplate: true,
      
      taskActionHandler: null,
      
      connections: [],
      
      postMixInProperties : function() {
        //set values for button labels and titles
        //console.log("this.focus", this.focus);
        this.backLabel = this.focus;
        if (this.focus === "project"){
          this.backLabel = coordel.project;
        }
      },
      
      showRightColumnHandler: false,
      
      postCreate: function(){
        this.inherited(arguments);
        var tdh = this;
        //publish the button events
        
        
        this.connections.push(dojo.connect(this.editTask, "onClick", this, function(){
            if (this.taskFormContainer.hasChildren()){
              this.taskFormContainer.destroyDescendants();
            }
            
            this.taskForm = new TaskForm({task: tdh.task, isNew: false});
            this.taskFormContainer.addChild(this.taskForm);
        }));
        
        this.connections.push(dojo.connect(this.taskFormCancel, "onClick", this, function(){
          this.taskForm._resetDropDowns();
          this.editTask.closeDropDown();
        }));
        
        this.connections.push(dojo.connect(this.taskFormSave, "onClick", this, function(){
          this.taskForm.save();
          this.editTask.closeDropDown();
          dojo.publish("coordel/taskEdit", [{task: this.taskForm.task}]);
        }));
        
        this.connections.push(dojo.connect(this.editTaskDialog, "onClose", this, function(){
          //when the dialog closes, need to clean up the task form
          //console.debug ("got onClose in addTaskButton");
          var cont = this.taskFormContainer;
          
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
        }));
      
        
        //add the actions menu to the dropdown dialog
        var menu = new ActionsMenu({
          task: tdh.task,
          username: db.username(),
          responsible: tdh.task.responsible
        });
        this.actionsMenu.set("content", menu);
        
        //wire up the menu options
        dojo.connect(menu.agreeChange, "onclick", this, function(){
          //console.log("return clicked");
          dojo.publish("coordel/taskAction", [{action: "agreeChange", task: this.task}]);
        });
        
        
        this.setButtons();
        
        //wire up the acceptTask button
        dojo.connect(this.acceptTask, "onClick", this, function(){
          //console.log("acceptTask clicked");
          this.goBackToFocus();
          dojo.publish("coordel/taskAction", [{action: "accept", task: this.task}]);
        });
        
        //wire up the declineTask button
        dojo.connect(this.declineTask, "onClick", this, function(){
          //console.log("declineTask clicked");
          this.goBackToFocus();
          dojo.publish("coordel/taskAction", [{action: "decline", task: this.task, validate: true, cssClass: "warning-button"}]);
        });
        
        //wire up the edit button
        dojo.connect(this.editTask, "onClick", this, function(){
          //show the task form in a dialog
        });
        
        
        //wire up the done button so clicking it submits to approve if not project responsible
        //or approves if project responsible. There won't be a message when checking the box
        //the user can give a message by choosing submit or approve from actions menu
        dojo.connect(this.markDone, "onClick", this, function(){
          this.goBackToFocus();
          
					var t = db.getTaskModel(this.task, true);
          
          t.markDone(this.task);
          
          
        });
    
        dojo.connect(this.showChecklistNotes, "onClick", this, function(){
          dojo.removeClass(dojo.byId("rightDetailsLayout"), "hidden");
          dojo.removeClass(dijit.byId("hideRightTaskDetails").domNode, "hidden");
          dojo.addClass(dijit.byId("showRightTaskDetails").domNode, "hidden");
          dijit.byId("taskDetailsLayout").resize();
        });
        
        dojo.connect(this.hideChecklistNotes, "onClick", this, function(){
          dojo.addClass(dojo.byId("rightDetailsLayout"), "hidden");
          dojo.addClass(dijit.byId("hideRightTaskDetails").domNode, "hidden");
          dojo.removeClass(dijit.byId("showRightTaskDetails").domNode, "hidden");
          dijit.byId("taskDetailsLayout").resize();
        });
        
        dojo.connect(this.backToFocus, "onClick", this, function(){
          //console.debug("back to focus clicked", this.task);
          
          tdh.goBackToFocus();
          
        });
        
        //handle when the actionsMenu is clicked
        this.taskActionHandler = dojo.subscribe("coordel/taskAction", this, "doTaskAction");
        
        
      },
      
      setButtons: function(){
        //if this is an invite, then hide the done button and show accept/decline
        var task = this.task,
            t = db.getTaskModel(this.task, true);
            
        //if the task isn't ready, disable the done button
        if (!t.isReady()){
          //console.debug("done button should be disabled");
          this.markDone.set("disabled", true);
        } else {
          this.markDone.set("disabled", false);
        }
        
        if (task.substatus === "DELEGATED" || task.substatus === "PROPOSED" || task.substatus === "AGREED"){
          //there is no done button if this is an invite
          dojo.addClass(dijit.byId(this.markDone).domNode, "hidden");
          if (this.username === task.responsible || (task.delegator && task.delegator === this.username)){
            //hide the accept/decline buttons from the responsible and delegator (if there is one)
            //otherwise leave them showing
            dojo.addClass(dijit.byId(this.declineTask).domNode, "hidden");
            dojo.addClass(dijit.byId(this.acceptTask).domNode, "hidden");
          }
        } else {
            dojo.addClass(dijit.byId(this.declineTask).domNode, "hidden");
            dojo.addClass(dijit.byId(this.acceptTask).domNode, "hidden");
        }
        
        //hide the edit and done buttons if this task is done or cancelled
        if (t.isDone() || t.isCancelled()){
          dojo.addClass(dijit.byId(this.markDone).domNode, "hidden");
          dojo.addClass(dijit.byId(this.editTask).domNode, "hidden");
        }
      },
      
      
      doTaskAction: function(args){
        //just close the task action dropdown
        if (dijit.byId(this.chooseAction)){
          dijit.byId(this.chooseAction).closeDropDown();
        }
      },
      
      
      goBackToFocus: function(){
        var id,
            name,
            focus;
            
        //console.log("backToFocus", this.focus, this.task.project);
            
        if (this.focus === "project"){
        
          id = this.task.project;
          name = "project";
          focus = "";
          
        } else if (this.focus === "contact"){

            id = this.task.username;
            name = "contact";
            focus = "";
        } else if (this.focus === "turbo"){

          id = "";
          name = "turbo";
          focus = "";
        } else if (this.focus === "search"){
          
          id = "";
          name = "";
          focus = "search";
          
        } else {
     
          id = this.task._id;
          name = "";
          focus = this.focus;
        }

        //console.debug("back publish parameters", "id: "+id, "name: "+name, "focus: "+focus);
        
        dojo.publish("coordel/primaryNavSelect", [{focus:focus, name: name, id:id, setSelection: true}]);
        
        //console.debug("published");
      },
      
      destroy: function(){
     
        this.inherited(arguments);
        var h = this.taskActionHandler;
        if (h){
          dojo.unsubscribe(h);
        }
        
        
        if(this.connections.length > 0){
          dojo.forEach(this.connections, function(c){
            dojo.disconnect(c);
          });
          this.connections = [];
        }
      
      }
  });
  return app.views.TaskDetailsHeader;    
}
);

