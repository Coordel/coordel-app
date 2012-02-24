define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/blockerInfo.html",
    "app/models/CoordelStore",
    "app/views/TaskInfoDialog/TaskInfoDialog",
    "app/views/Dialog/Dialog",
    "app/widgets/ContainerPane",
    "app/views/BlockerHeader/BlockerHeader",
    "app/views/Deliverable/Factory",
    "app/views/EmptyDeliverable/EmptyDeliverable",
    "i18n!app/nls/coordel"
    ], 
  function(dojo, w, t, html, db, TaskInfo, Dialog, cpane, BlockerHeader, Factory, Empty, coordel) {
  
  dojo.declare(
    "app.views.BlockerInfo", 
    [w, t], 
    {
      
      templateString: html,
      
      task: null,
      
      containerNode: null,
      
      notifyHandler: null,
      
      widgetsInTemplate: true,
    
      postCreate: function(){
        this.inherited(arguments);
        
        this.containerNode  = new cpane({style: "padding: 0;"}).placeAt(this.domNode);
        
        this.setTask(this.task);
        
        //handle task notifications
    		this.notifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
        
      },
      
      setTask: function(task){
        var cont = this.containerNode,
            self = this;
        
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
        
        if (task.coordinates && task.coordinates.length > 0){
          
          //console.debug("blockers", task.coordinates);

  		    dojo.forEach(task.coordinates, function(id){
  		      var def = db.getBlockerModel(id);
  		      
  		      dojo.when(def, function(t){
  		        //console.debug("blocker", t);
  		        self.containerNode.addChild(new BlockerHeader({task: t}));
  		        if (t.workspace && t.workspace.length > 0){
    		        //if this has deliverables, then show it
    		      
    		        
    		        dojo.forEach(t.workspace, function(del){
    		          
    		          //console.debug("adding deliverable", del);

    		          var f = new Factory();

                  self.containerNode.addChild(f.create({
                    deliverable: del,
                    view: "displayForm"
                  }));

    		        });
    		      } else {
    		        var nodeClass = "";
    		        
    		        var empty = new Empty({
    		          emptyTitle: coordel.empty.noDeliverables
    		        });
    		            
    		        if (t.isDone()){
    		          nodeClass = "done";
    		        } else if (t.isCancelled()){
    		          nodeClass = "cancelled";
    		        }
    		        
    		        dojo.addClass(empty.domNode, nodeClass);
  		          
  		          self.containerNode.addChild(empty);
  		          
    		      }
  		      });
  		    });
  		  }
      },
      
      handleTaskNotify: function(args){
  		  //console.debug("handlining task Notify in BlockerInfo", args.task, this.task);
  		  var task = args.task;
  		  
  		  if ( dojo.indexOf(this.task.coordinates, task._id) > -1){
  		    this.setTask(this.task);
  		  }
  		},
      
      baseClass: "blocker-info"
  });
  return app.views.BlockerInfo;     
});