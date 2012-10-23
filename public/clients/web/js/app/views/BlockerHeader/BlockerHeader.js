define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/blockerHeader.html",
    "app/models/CoordelStore",
    "app/views/TaskInfo/TaskInfo",
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

			showInfoButton: true,
			
			isMyTask: false,
    
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;

				if (db.username() === self.task.username){
					this.isMyTask = true;
				}
        
        self.showHeader(self.task);

				if (!self.showInfoButton){
					dojo.addClass(self.showInfo, "hidden");
				}
        
        dojo.connect(this.showInfo, "onclick", this, function(){
					console.log("this.task", this.task, TaskInfo);
          var i = new TaskInfo({task: this.task});
          console.debug("dialog", i);
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
				var self = this;
        
        //console.debug ("showing header", task);
        this.userName.innerHTML = db.contactFullName(task.username);
        this.taskName.innerHTML = task.name;
        var t = db.getTaskModel(task, true);
        this.projectName.innerHTML = t.projName();

				if (this.isMyTask){
					
					dojo.addClass(this.taskName, "do-navigation");
					var c = dojo.connect(this.taskName, "onclick", this,function(){
						console.log("clicked", self.focus, self.task._id, self.task );
						dojo.publish("coordel/primaryNavSelect", [ {name: "task", focus: self.focus, id: self.task._id, task: self.task}]);
						dojo.disconnect(c);
					});
				}
        
      },
      
      baseClass: "blocker-header"
  });
  return app.views.BlockerHeader;     
});