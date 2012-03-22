define(
  ["dojo",
    "i18n!app/nls/coordel",
    "app/views/Task/Task",
    "app/views/TaskAndChecklist/TaskAndChecklist",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container",
    "app/models/CoordelStore",
    "app/views/EmptyTaskList/EmptyTaskList",
    "dojo/dnd/Source"], 
  function(dojo, coordel, Task, TaskCheck, w, t, c, db, Empty, Source) {
  
  dojo.declare(
    "app.views.TaskList", 
    [w, t, c], 
    {
      
      name: null,
      
      templateString : '<div></div>',
      
      showChecklist: false,
      
      id: null,
      
      listFocus: null,
      
      showingEmpty: false,
      
      showProjectLabel: false, 
      
      taskList: [],
      
      observeHandler: null, 
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        //console.debug("in postCreate in TaskList ", self.listFocus);
        //console.log("showProjectLabel in TaskList", self.showProjectLabel);
        self.showList();

        /*
        if (self.sortOptions.grouped){
          //deal with the groups
          
          //get the map {groupTitle: "My Project", filter: "project", filterValue: "xxkdkdficikjek"}
          
          
        } else {
          console.debug("in postCreate in TaskList ", self.listFocus);
          self.showList();
        }
        */
      },
      
      //stubs to call when insert or remove happens in the observed list
      onInsert: function(task){
        //console.debug("got an insert");
         dojo.publish("coordel/sortChange");
      },
      
      onRemove: function(task){
        //console.debug("got a remove");
      },
      
      showList: function(){
        
        var self = this,
            s;
            
        
        if (self.hasChildren()){
          self.removeDescendants();
        }
          
        if (self.taskList.length > 0){
          //console.debug("list has tasks");
          self.taskList.forEach(function(task){
            var item;
            
            //show either a task or taskandchecklist
            if (self.showChecklist){
              item = new TaskCheck({
                focus: self.listFocus,
                task: task,
                showProjectLabel: self.showProjectLabel
              });
            } else {
              item = new Task({
                focus: self.listFocus,
                task: task,
                showProjectLabel: self.showProjectLabel
              });
            }
          
            self.addChild(item);
          
    	    });
        } else {
          //if there are no invites, then the user shouldn't have been able to make the selection
          if (self.listFocus !== "task-invited" && self.listFocus !== "project-invited"){
            self.showingEmpty = true;
            self.addChild(new Empty({emptyClass: self.listFocus, emptyTitle: coordel.empty[self.listFocus+"Title"], emptyDescription: coordel.empty[self.listFocus+"Text"]}));
          } else {
            console.debug("ERROR the user was shown the option to see a/an" + self.listFocus + " and there aren't any");
          }
        }
         
        //need to watch and see if there is a change to this list
        self.observeHandler = self.taskList.observe(function(task, removedFrom, insertedInto){
          //console.debug("TaskList observed", task, removedFrom, insertedInto, self.listFocus);
          
          //was this a delete
          if (removedFrom > -1){
            //console.debug("deleted from list", removedFrom, insertedInto);
            self.removeChild(removedFrom);
            
            self.onRemove(task);
          }

          if (insertedInto > -1){
            //if we showed empty, we need to get rid of it before showing an add
            //console.debug ("adding item and showingEmpty was ", self.showingEmpty);
            if (self.showingEmpty){
              self.destroyDescendants();
              self.showingEmpty = false;
            }
            //console.debug("adding to list", task, self.listFocus, removedFrom, insertedInto);
            self.addChild(new Task({
              focus: self.listFocus,
              task: task,
              showProjectLabel: self.showProjectLabel
            }));
            
            self.onInsert(task);
          }
          
          //only show empty for tasks. the invite nav boxes show and hide based on count so tell
          //the system to show current
          if (self.taskList.length === 0){
            if (self.listFocus === "project-invited" || self.listFocus === "task-invited"){
              dojo.publish("coordel/primaryNavSelect", [{focus: "current", setSelection: true}]);
            } else {
              self.showingEmpty = true;
              //console.debug("self.listFocus in TaskList", self.listFocus);
              self.addChild(new Empty({emptyClass: self.listFocus, emptyTitle: coordel.empty[self.listFocus+"Title"], emptyDescription: coordel.empty[self.listFocus+"Text"]}));
            } 
          }
        
        });
      },
      
      destroy: function(){
        this.inherited(arguments);
        
        this.observeHandler.cancel();
        //console.debug("observe handler cancelled");
      },
      
      baseClass: "tasklist"
  });
  return app.views.TaskList;     
});