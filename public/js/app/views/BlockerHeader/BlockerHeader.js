define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/blockerHeader.html",
    "app/models/CoordelStore",
    "app/views/TaskInfoDialog/TaskInfoDialog",
    "app/views/Dialog/Dialog",
    "app/widgets/ContainerPane"
    ], 
  function(dojo, w, t, html, db, TaskInfo, Dialog) {
  
  dojo.declare(
    "app.views.BlockerHeader", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
    
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        self.showHeader(self.task);
        
        dojo.connect(this.showInfo, "onclick", this, function(){
          var i = new TaskInfo({task: this.task});
          //console.debug("dialog", i);
          var cont = this.infoContainer;
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
          cont.addChild(i);
          
          //NOTE: not sure why there is a boostrap error on the first try of the click so 
          //this is a terrible work around to handle it for now
          try{
            this.infoDialog.show();
          } catch (err){
            console.debug("ERROR showing dialog in blocker header");
            this.infoDialog.show();
          }
          
        });
    
      },
      
      showHeader: function(task){
        
        //console.debug ("showing header", task);
        this.userName.innerHTML = db.contactFullName(task.username);
        this.taskName.innerHTML = task.name;
        var t = db.getTaskModel(task, true);
        this.projectName.innerHTML = t.projName();
        
      },
      
      baseClass: "blocker-header"
  });
  return app.views.BlockerHeader;     
});