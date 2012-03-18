define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!./templates/turbo.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/TaskInfo/TaskInfo",
  "app/views/TurboWizard/TurboWizard",
  "dijit/TitlePane",
  "app/views/ConfirmDialog/ConfirmDialog",
  "app/models/CoordelStore",
  "app/views/TransferDialog/TransferDialog",
  "app/views/TaskForm/TaskForm",
  "app/widgets/ContainerPane"], function(dojo, dijit, bn, coordel, html, w, t, Info, Wizard, tp, Confirm, db, Transfer, TaskForm, cp) {
  dojo.declare(
    "app.views.Turbo", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      currentTask: {},
      
      model: null,
      
      wizard: null,
      
      listFocus: "current",
      
      taskForm: null,
      
      isChecklist: false, // if this is a wizard for a checklist, set it true
     
      postCreate: function(){
        this.inherited(arguments);
        
        if (this.isChecklist){
          //hide the task info titlepane
          dojo.addClass(this.taskInfoTp.domNode, "hidden");
          
          //hide the header of the wizard tp
          dojo.addClass(this.wizardTp.titleBarNode, "hidden");
        
        }
      },
      
      showDone: function(){
        //hide info
        dojo.addClass(this.taskInfoTp.domNode, "hidden");
        
        //hide wizard
        dojo.addClass(this.wizardTp.domNode, "hidden");
        
        //show done
        dojo.removeClass(this.turboDone, "hidden");
        
        //add a border to the bottom of the turbo control if this is a checklist
        if (this.isChecklist){
          dojo.addClass(this.domNode, "checklist-done");
        }
      },
      
      showEmpty: function(){
        //hide info
        dojo.addClass(this.taskInfoTp.domNode, "hidden");
        
        //hide wizard
        dojo.addClass(this.wizardTp.domNode, "hidden");
        
        //show done
        dojo.addClass(this.turboDone, "hidden");
      },
      
      setTask: function(task){
        //TODO: animate sliding the turbo in when a task is set
        console.debug("setTask in Turbo", task);
        
        //hide info if not checklist
        if (!this.isChecklist){
          dojo.removeClass(this.taskInfoTp.domNode, "hidden");
        }
        
        //hide wizard
        dojo.removeClass(this.wizardTp.domNode, "hidden");
        
        //hide done
        dojo.addClass(this.turboDone, "hidden");
        
        dojo.publish("coordel/glow", [{id: task._id, isGlowing: true}]);
        
        this.currentTask = task;
        this.model = db.getTaskModel(this.currentTask, true);
        this.taskInfoTp.set("content",  new Info({task: task, showName: false,  align: "vertical"}));
        var title = task.name;
        this.taskInfoTp.set("title", title);
        this.wizard = new Wizard({task: task, isChecklist: this.isChecklist});
        this.wizardTp.set("content", this.wizard);
        
        //if this task doesn't have attachments hide the attachments button
        /*
        if(!this.model.hasAttachments()){
          dojo.addClass(this.wizard.transferTaskNode, "hidden");
        }
        */
        
        //wire up the buttons
        //delete
        dojo.connect(this.wizard.deleteTask, "onClick", this, "trash");
        //archive
        dojo.connect(this.wizard.archiveTask, "onClick", this, "archive");
        //someday
        dojo.connect(this.wizard.somedayTask, "onClick", this, "someday");
        //transfer
        dojo.connect(this.wizard.transferTask, "onClick", this, "transferTask");
        //defer
        dojo.connect(this.wizard, "onDefer", this, "deferTask");
        //delegate
        dojo.connect(this.wizard.delegateTask, "onClick", this, "delegateTask");
        //do
        dojo.connect(this.wizard.doTask, "onClick", this, "doTask");
        //skip
        dojo.connect(this.wizard.skipTask, "onClick", this, "skipTask");
      },
      
      
      next: function(args){
        //args will be {hasTask: true/false, isEmpty: true/false, task: {}}
        //if the task is false, then the wizard ends otherwise set the task
        if (!args.hasTask){
          if (args.isEmpty){
            this.showEmpty();
          } else {
            this.showDone();
          }
          
        } else {
          this.setTask(args.task);
        }
      },
      
      onNext: function(){
        dojo.publish("coordel/glow", [{id: this.currentTask._id, isGlowing: false}]);
        dojo.publish("coordel/turboDone", [{id: this.currentTask._id, isDone: true}]);
      },
      
      trash: function(){
        var t = this.model,
            confirmText = coordel.turbo.deleteConfirmText,
            executeText = coordel.turbo.deleteExecuteText,
            title = coordel.turbo.deleteConfirmTitle ;
        if (this.isChecklist){
          confirmText = coordel.turbo.deleteTodoConfirmText;
          title = coordel.turbo.deleteTodoConfirmTitle; 
        } 
        var c = new Confirm({
          confirmText: confirmText,
          executeText: executeText,
          executeCss: "warning-button",
          title: title
        });

        dojo.connect(c, "onConfirm", this, function(){
          if (this.isChecklist){
            this.onTrash(this.currentTask);
          } else {
            t.remove(this.currentTask);
          }
        });
        
        c.show();
      }, 
      
      onTrash: function(task){
        //console.debug("onTrash in Turbo", task);
      },
      
      archive: function(){
        var t = this.model;
        var c = new Confirm({
          confirmText: coordel.turbo.archiveConfirmText,
          executeText: coordel.turbo.archiveExecuteText,
          title: coordel.turbo.archiveConfirmTitle
        });
        
        dojo.connect(c, "onConfirm", this, function(){
          t.archive(this.currentTask);
        });
        
        c.show();
      },
      
      someday: function(){
        var t = this.model;
        var c = new Confirm({
          confirmText: coordel.turbo.somedayConfirmText,
          executeText: coordel.turbo.somedayExecuteText,
          title: coordel.turbo.somedayConfirmTitle
        });
        
        dojo.connect(c, "onConfirm", this, function(){
          t.someday(this.currentTask);
        });
        
        c.show();
      },
      
      transferTask: function(){
        var c = new Transfer({
          destinationInstructions: coordel.turbo.transferConfirmInstruct1,
          fileInstructions: coordel.turbo.transferConfirmInstruct2,
          executeText: coordel.turbo.transferExecuteText,
          title: coordel.turbo.transferConfirmTitle,
          task: this.currentTask
        });
        
        c.show();
      },
      
      skipTask: function(){
        dojo.publish("coordel/glow", [{id: this.currentTask._id, isGlowing: false}]);
        this.onSkip(this.currentTask);
      },
      
      onSkip: function(task){
        dojo.publish("coordel/turboDone", [{id: task._id, isDone: true}]);
      },
      
      deferTask: function(args){
        console.debug("deferred args", args);
        var t = this.model,
            now = new Date(),
            date,
            def;
            
        switch (args){
          case "deferOneDay":
            def = dojo.date.add(now, "day", 1);
            t.defer(this.currentTask, dojo.date.stamp.toISOString(def));
            break;
          case "deferOneWeek":
            def = dojo.date.add(now, "week", 1);
            t.defer(this.currentTask, dojo.date.stamp.toISOString(def));
            break;
          case "deferTwoWeeks":
            def = dojo.date.add(now, "week", 2);
            t.defer(this.currentTask, dojo.date.stamp.toISOString(def));
            break;
          case "deferOther":
            var cont = this.wizard.deferTaskFormContainer;
            if (cont.hasChildren()){
              cont.destroyDescendants();
            }
            var form = new TaskForm({isNew: false, task: this.currentTask});
            cont.addChild(form);
            this.wizard.deferTaskDialog.show();
            dojo.connect(this.wizard.deferTaskDialog, "onConfirm", this, function(){
              form.save();   
            });
            break;
        }
      },
      
      onDelegate: function(task){
        //console.debug("onDelegate in Turbo", task);
      },
      
      delegateTask: function(){
        
        //create a clone in case the user cancels the form
        var newTask = dojo.clone(this.currentTask);
        
        newTask.username = "";
        
        if (this.model.p.isMyPrivate()){
          newTask.project = "";
        }
        
        var form = new TaskForm({isNew: false, task: newTask});
        this.wizard.delegateTaskFormContainer.addChild(form);
        this.wizard.delegateTaskDialog.show();
        dojo.connect(this.wizard.delegateTaskDialog, "onConfirm", this, function(){
          if (this.isChecklist){
            this.onDelegate(form.task);
            form.cancel();
          } else {
            form.save();
          }
        });
      },
      
      doTask: function(){
        dojo.publish("coordel/primaryNavSelect", [ {name: "task", isTurbo: true, focus: this.focus, id: this.currentTask._id, task: this.currentTask}]);
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.wizard){
          this.wizard.destroy();
        }
        
      },
      
      baseClass: "turbo"
  });
  return app.views.Turbo;    
}
);

