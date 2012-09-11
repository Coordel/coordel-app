define(
  ["dojo",
    "dijit",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/AddTaskButton.html",
    "dijit/form/DropDownButton",
    "dijit/TooltipDialog",
    "app/views/TaskForm/TaskForm",
    "app/widgets/ContainerPane"
    ], 
  function(dojo,dijit,coordel, w, t, html, drop, tip, tf, cp) {
  
  dojo.declare(
    "app.views.AddTaskButton", 
    [w, t], 
    {
      
      id: null,
      
      coordel: coordel,
      
      taskFormTitle: coordel.taskForm.titleNew,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      postCreate: function(){
        this.inherited(arguments);
        

        
        dojo.connect(this.addTaskDialog, "onOpen", this, function(){
            //console.debug("onOpen fired");
            var form = new tf({id: "addTaskForm", task: {}, isNew: true});
            var connections = [];
            
            connections.push(dojo.connect(this.taskFormCancel, "onClick", form, "cancel"));
            connections.push(dojo.connect(this.taskFormSave, "onClick", form, "save"));
            connections.push(dojo.connect(this.addTaskDialog, "onClose", form, function(){
              dojo.forEach(connections, function(c){
                dojo.disconnect(c);
              });
              //console.debug("disconnected addTaskDialog");
              form.destroy();
            }));
            this.taskFormContainer.addChild(form);
            //console.debug("added form", form.task);
        });
        
      },
      
      baseClass: "header"
  });
  return app.views.AddTaskButton;     
});