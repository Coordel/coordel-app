define(
  ["dojo",
    "i18n!app/nls/coordel",
    "app/models/TaskModel",
    "text!./templates/taskWorkspace.html",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container",
    "app/models/DeliverableModel2",
    "app/views/Deliverable/Deliverable",
    "app/widgets/ContainerPane",
    "dijit/form/Form",
    "app/views/Deliverable/Factory",
    "app/models/CoordelStore"], 
  function(dojo, coordel, tm, html, w, t, c, dModel, Deliverable, ContainerPane, Form, Factory, db) {
  
  dojo.declare(
    "app.views.TaskWorkspace", 
    [w, t, c], 
    {
      
      name: null,
      
      task: {},
      
      delivList: null,
      
      editHandler: null,
      
      coordel: coordel,
      
      //we don't want to stop people from doing partial work so they don't usually have to have all 
      //deliverables in the workspace completed correctly to save. However, if there is a deliverable
      //that needs to interface with a third party system, the deliverable can require itself
      //to be valid before submitting. if one of those types of deliverables is found, this flag
      //will be set to true
      _mustValidate: false, 
      
      //most of the time, users will save multiple times before getting done with work. However,
      //there are cases when a single save is all that is allowed (i.e. Tweet an announcement).
      //when multisave = false, once the user clicks save, the workspace will be disabled.
      //if one deliverable can be saved multiple times and one can't, they shouldn't be in the same
      //task unless the intention is that the combined save can only happen once.
      _multiSave: true,
      
      //this can be set to false if the deliverable has a keystroke or other means
      //of calling save.
      showSaveButton: true, 
      
      //this is the keystroke the user should use to save
      saveKeystroke: null,
      
      //if this workspace has deliverables with blockers, then rather than showing
      //save when this is true, a next button will be shown instead. This is disabled
      //if showSaveButton is false                     
      showNextButton: false, 
      
      //if there is a next button to show, what is the label
      nextButtonText: coordel.taskWorkspace.nextButtonText, 
      
      widgetsInTemplate: true,
      
      templateString : html,
      
      id: null,
      
      postCreate: function(){
        this.inherited(arguments);
        /**************
        The task workspace is where the user interacts with their deliverables. it allows them to 
        set the deliverable values and save those values
        
        it also watches for changes that might have been made to the task and lets the user know 
        a change happened to what they are working on
        
        the workspace save calls the deliverable validation functions that can be specific to
        each deliverable.
        
        if the workspace has deliverable blockers, the workspace header needs to show progress
        on those steps. So, if there are three steps, then the UI needs to indicate that there are
        x steps and y steps blocked. the user should be able to see the blocked step if they want
        but can't interact with it until it's not blocked

        ****/
        var self = this;
      
        self.showDeliverables();
        
        //wire up the form submit and save the values
        dojo.connect(this.saveButton, "onClick", this, "save");
        
        //handle task notifications
    		this.editHandler = dojo.subscribe("coordel/taskEdit", this, "handleTaskEdit");
        
      },
      
      handleTaskEdit: function(args){
        
  		  //console.debug("handling taskEdit in TaskWorkspace", args.task, this.task);
  		  var task = args.task;
  		  
  		  //so, when a task gets updated, if I didn't do it then redraw the deliverables
  		  //otherwise, need to handle a change done by someone else
  		  if (this.task._id === task._id && task.username === db.username()){
  		    this.showDeliverables();
  		  } else {
  		    //change done by someone else, handle it
  		  }
  		},
      
      showDeliverables: function(){
        //console.debug("showing deliverables", this.task.workspace);
        //this gets all the deliverables that aren't blocked and shows them
        var task = this.task,
            //dels = new ContainerPane().placeAt(this.deliverables),
            total = this.task.workspace.length,
            blocked = 0,
            t = db.getTaskModel(this.task, true),
            showBlockMsg = false;
        
        var ready = t.readyDeliverables();
        
        console.debug("ready deliverables", ready);
        
        blocked = total - ready.length;
        
        dojo.forEach(dijit.findWidgets(dojo.byId(this.workspaceForm)), function(w) {
          w.destroyRecursive();
        });
        
        dojo.forEach(ready, function(del){
          
          dModel.deliverable = del;
          
          if (dModel.isRequired() && !dModel.isReady()){
            //console.debug("show blocking message");
            showBlockMsg = true;
          }
          
          var f = new Factory();
          
          f.create({
            deliverable: del,
            view: "form",
            displayVersions: true
          }).placeAt(this.workspaceForm);
          
        }, this);
		    
		    //set the total and blocked counts if there are blocked deliverables
		    if (blocked > 0){
		      this.totalCount.innerHTML = total;
		      this.blockedCount.innerHTML = blocked;
		    } else {
		      dojo.addClass(this.workspaceHeader, "hidden");
		    }
		    
		    //if a deliverable isRequired and not ready, then 
		    //show the message that the task will be blocked until that field complete.
		    dojo.addClass(this.blockMessage, "hidden");
		    if (showBlockMsg){
		      dojo.removeClass(this.blockMessage, "hidden");
		    }
		    
      },
      
      showUpdateMessage: function(){
        
      },
      
      save: function(values){
        
        //console.debug("save called", this.task, this.task.workspace);
        
        //until the user has at least saved workspace once, the task isn't ready
        //marking hasSaveDone true indicates that save is complete
        this.task.hasSaveDone = true;
        
        var t = db.getTaskModel(this.task, true);
        
        t.update(this.task);
        
        this.onSave(this.task);

      },
      
      onSave: function(task){
        this.showDeliverables();
      },

      baseClass: "task-workspace"
  });
  return app.views.TaskWorkspace;     
});

