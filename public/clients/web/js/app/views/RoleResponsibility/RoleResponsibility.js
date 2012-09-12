define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/RoleResponsibility.html",
    "i18n!app/nls/coordel",
    "app/views/RoleDeliverable/RoleDeliverable"
    ], 
  function(dojo, w, t, html, coordel, Deliverable) {
  
  dojo.declare(
    "app.views.RoleResponsibility", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      task: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        /*
        this.watch("task", function(prop, oldVal, newVal){
          //console.debug("task changed", prop, oldVal, newVal);
          self.task = newVal;
          self.setResponsibility();
        });
        */
        
        if (!this.task){
          //console.debug("ERROR: no task was provided to RoleResponsiblility view");
        }
        
        self.setResponsibility();
        
        //when the users hovers over the responsibility, highlight the task in the list
        dojo.connect(this.domNode, "onmouseenter", this, function(){
          //console.debug("highlight ", this.task.name);
          dojo.publish("coordel/glow", [{id: this.task._id, isGlowing: true}]);
        });
        
        dojo.connect(this.domNode, "onmouseleave", this, function(){
          //console.debug("remove highlight ", this.task.name);
          dojo.publish("coordel/glow", [{id: this.task._id, isGlowing: false}]);
        });
        
        //this.taskNotifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
        
        
      },
      
      setResponsibility: function(){
        dojo.removeClass(this.purpose, "hidden");
        if (this.task.name === undefined){
          console.debug("ERROR: undefined name", this.task);
        }
        this.name.innerHTML = this.task.name;
        
        if (!this.task.purpose || this.task.purpose.length === 0){
          dojo.addClass(this.purpose, "hidden");
        } else if (this.task.purpose){
          this.purpose.innerHTML = this.task.purpose;
        }
        
        //if this task has deliverables defined, list them here;
        
        if (this.task.workspace && this.task.workspace.length > 0){
          this._clear(this.deliverables);
          dojo.removeClass(this.deliverables, "hidden");
          
          dojo.forEach(this.task.workspace, function(del){
            var d = new Deliverable({deliverable: del}).placeAt(this.deliverables);
          }, this);
          
        }
      
      },
      
      _clear: function(id){
        dojo.forEach(dijit.findWidgets(id), function(item){
          item.destroy();
        });
      },
      
      baseClass: "role-responsibility"
  });
  return app.views.RoleResponsibility;     
});