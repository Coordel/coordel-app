define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "text!./templates/taskInfoDialog.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/TaskInfo/TaskInfo",
  "dijit/TitlePane",
  "app/views/Dialog/Dialog",
  "app/models/CoordelStore",
  "app/widgets/ContainerPane"], function(dojo, dijit, coordel, html, w, t, Info, tp, Dialog, db, cp) {
  dojo.declare(
    "app.views.TaskInfoDialog", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      task: null,
      
      model: null,
      
      postCreate: function(){
        this.inherited(arguments);
        console.log("in post create taskInfoDialog");
        this._setTask();
      },
        
      _setTask: function(){
        this._setInfo();
        this._setBlockers();
        this._setBlocking();
      },
      
      _setInfo: function(){
        //console.debug("setting info ", this.task, this.taskInfo.get("content"));
        this.taskInfo.set("content", new Info({task: this.task, showName: false}));
        this.taskInfo.set("title", this.task.name);
        
        dojo.addClass(this.taskInfo.titleNode, "c-color-active");
      },
      
      _setBlockers: function(){
        var t = db.getTaskModel(this.task, true);
        
        console.l
        
        if (t.hasBlockers()){
          var blockers = this.task.coordinates;
          console.debug("task has Blockers in TaskInfoDialog", this.task, this.task.coordinates);
          
          var aPane = new cp({
            style: "padding:0"
          });
          
        
          blockers.forEach(function(id){
            console.debug("blocker id", id);
            var blocker = db.getBlockerModel(id);
            
            var b = new Info({task:blocker.task});
            //if the blocker isn't cancelled, done, 
            aPane.addChild(b);
          });
          
          this.taskBlockers.set("content", aPane);
        } else {
          //hide the title pane
          console.debug("task had no blockers, hid the title pane TaskInfoDialog");
          dojo.addClass(this.taskBlockers.domNode, "hidden");
        }
        
      },
      
      _setBlocking: function(){
        console.log("setting blocking");
        var query = db.taskStore.getBlocking(this.task._id),
            self = this;
        dojo.when(query, function(blocking){
          console.log("blocking", blocking);
          if (blocking.length > 0){
            console.debug("this task was blocking", blocking);

            //add the blockers to a container
            var bPane = new cp({
              style: "padding:0"
            });

            blocking.forEach(function(t){
              //create the info for each blocking task
              var b = new Info({task:t});
              bPane.addChild(b);
            });

            self.taskBlocking.set("content", bPane);
          } else {
            console.debug("task wasn't blocking, hid the title pane TaskInfoDialog");
            dojo.addClass(self.taskBlocking.domNode, "hidden");
          }
        });
      },
      
      baseClass: "task-info-dialog"
      
  });
  return app.views.TaskInfoDialog;    
}
);



