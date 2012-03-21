define(
  ["dojo",
    "i18n!app/nls/coordel",
    "app/views/Task/Task",
    "app/views/TaskAndChecklist/TaskAndChecklist",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container"], 
  function(dojo, coordel, Task, TaskCheck, w, t, c) {
  
  dojo.declare(
    "app.views.TaskListGroup", 
    [w, t, c], 
    {
      
      name: null,
      
      templateString : '<div><h3 class="listHeader" dojoAttachPoint="groupHeader"></h3></div>',
      
      tasks: [],
      
      isHidden: false,
      
      widgetsInTemplate: true, 
      
      header: "",
      
      projectStatus: null,
      
      showChecklist: false,
 
      postCreate: function(){
        this.inherited(arguments);
        this.groupHeader.innerHTML = this.header;
        var list = this,
            focus = this.focus,
            self = this;
        //console.debug("db in TaskListGroup", db);
        //is this grouped
        self._showTasks();
      },
      
      _showTasks: function(){
        var self = this;
        
        if (self.tasks.length > 0){
          //add the tasks
          self.tasks.forEach(function(task){
            
            var item;
            
            if (self.showChecklist){
              item = new TaskCheck({
                focus: focus,
                task: task,
                projectStatus: self.projectStatus
              });
            } else {
              item = new Task({
                focus: focus,
                task: task,
                projectStatus: self.projectStatus
              });
            }
        
    	      self.addChild(item);
    	    });
        } else {
          //hide this group
          self.hide();
        }
      },
      
      //if the groups tasks go to zero, then we need to hide this group until it gets another task
      hide: function(){
        dojo.addClass(this.domNode, "hidden");
        this.isHidden = true;
      },
      
      //show the group because another task was added to it
      show: function(){
        dojo.removeClass(this.domNode, "hidden");
        this.isHidden = false;
      },
      
      baseClass: "tasklist-group"
  });
  return app.views.TaskListGroup;     
});