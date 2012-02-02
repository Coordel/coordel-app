define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/TaskAndChecklist.html",
    "app/views/Task/Task",
    "app/views/TaskChecklist/TaskChecklist"
    ], 
  function(dojo, w, t, html, Task, Checklist) {
  
  dojo.declare(
    "app.views.TaskAndChecklist", 
    [w, t], 
    {
      
      templateString: html,
      
      task: null,
      
      focus: "current",
      
      postCreate: function(){
        this.inherited(arguments);
        
        var t = new Task({
          task: this.task,
          focus: this.focus
        }).placeAt(this.taskContain);
        
        if (this.task.todos && this.task.todos.length > 0){
          //console.debug("adding todos", this.task.name);
          var c = new Checklist({
            task: this.task,
            isAddEnabled: false
          }).placeAt(this.checklistContain);
        }
      },
      
      baseClass: "task-and-checklist"
  });
  return app.views.TaskAndChecklist;     
});