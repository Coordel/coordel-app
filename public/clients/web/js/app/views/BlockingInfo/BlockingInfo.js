define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/blockingInfo.html",
    "app/models/CoordelStore",
    "i18n!app/nls/coordel",
    "app/views/TaskInfo/TaskInfo",
		"app/views/BlockerHeader/BlockerHeader"
    ], 
  function(dojo, w, t, html, db, coordel,ti, BlockerHeader) {
  
  dojo.declare(
    "app.views.BlockingInfo", 
    [w, t], 
    {
      
      templateString: html,
      
     	task: {},
      
      containerNode: null,
      
      notifyHandler: null,
      
      widgetsInTemplate: true,
    
      postCreate: function(){
        this.inherited(arguments);

				if (this.task.blocking && this.task.blocking.length){
					this.setBlocking();
				} else {
					dojo.addClass(this.domNode, "hidden");
				}
				
        //handle task notifications
    		this.notifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
        
      },
      
      setBlocking: function(){
        var cont = this.containerNode,
            self = this;
        
       	dojo.forEach(dijit.findWidgets(cont), function(item){
					item.destroy();
				});
				
				//console.log("show blocking", self.task.blocking);
				dojo.forEach(self.task.blocking, function(id){
					db.get(id).then(function(task){
						var t = db.getTaskModel(task, true);
						var bh = (new BlockerHeader({task: task, showInfoButton: false, focus: self.focus})).placeAt(self.containerNode);
						var info = new ti({task:task, showName: false, isTurbo: false}).placeAt(self.containerNode);
						if (t.isDone()){
		          nodeClass = "done";
		        } else if (t.isCancelled()){
		          nodeClass = "cancelled";
		        }
		        dojo.addClass(info.domNode, "c-padding-large");
					});
				});
      },
      
      handleTaskNotify: function(args){
  		  //console.debug("handlining task Notify in BlockerInfo", args.task, this.task);
  		  var task = args.task;
  		  
  		  if ( this.task._id === task._id){
					this.task = task;
  		    this.setBlocking();
  		  }
  		},
      
      baseClass: "blocking-info"
  });
  return app.views.BlockingInfo;     
});