define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ProjectDeliverable.html",
    "app/util/dateFormat",
    "app/models/CoordelStore",
    "app/views/TaskInfo/TaskInfo",
    "app/views/Deliverable/Factory",
    "app/views/Label/Label"
    ], 
  function(dojo, coordel, w, t, html, dt, db, TaskInfo, Factory) {
  
  dojo.declare(
    "app.views.ProjectDeliverable", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      task: null,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        self.showHeader(self.task);
        
        self.setTask(self.task);
        
        dojo.connect(this.showInfo, "onclick", this, function(){
          
          //console.debug("dialog", i);
          dojo.forEach(dijit.findWidgets(this.infoContainer), function(w){
            w.destroy();
          });
          
          var i = new TaskInfo({task: this.task}).placeAt(this.infoContainer);
          
          //NOTE: not sure why there is a boostrap error on the first try of the click so 
          //this is a terrible work around to handle it for now
          try{
            this.infoDialog.show();
          } catch (err){
            console.debug("ERROR showing dialog in blocker header");
            this.infoDialog.show();
          }
        });
        
        //handle task notifications
    		this.notifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
       
      },
      
      setTask: function(task){
        var self = this;
        
        dojo.forEach(dijit.findWidgets(self.containerNode, function(w){
          w.destroy();
        }));
        
        var t = db.getTaskModel(self.task, true);

        dojo.forEach(t.workspace, function(del){
    
          var f = new Factory();

          var widget = f.create({
            deliverable: del,
            view: "displayForm"
          }).placeAt(self.containerNode);

        });
        
      },
      
      handleTaskNotify: function(args){
  		  //console.debug("handlining task Notify in BlockerInfo", args.task, this.task);
  		  var task = args.task;
  		  
  		  if (args.task._id === this.task._id){
  		    this.task = task;
  		    this.setTask(this.task);
  		  }
  		},
      
      showHeader: function(task){
        //console.debug ("showing header", task);
        this.userName.innerHTML = db.contactFullName(task.username);
        this.taskName.innerHTML = task.name;
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.notifyHandler){
          dojo.unsubscribe(this.notifyHandler);
        }
      },
      
      baseClass: "project-deliverable"
  });
  return app.views.ProjectDeliverable;     
});