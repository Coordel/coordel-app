define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/toDo.html",
    "app/models/CoordelStore",
    "dojo/date/stamp",
    "app/util/dateFormat"
    ], 
  function(dojo,coordel, w, t, html, db, stamp, dt) {
  
  dojo.declare(
    "app.widgets.ToDo", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      isEnabled: true,
      
      isShowDetails: true,
      
      templateString: html,
      
      glowHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.todoCheckBox.checked = this.todo.done;
        
        if (!this.isEnabled){
          this.todoCheckBox.set("disabled", true);
        }
        
        if (this.isShowDetails){
          this._setPurpose();
          this._setDeadline();
        }
        
        //on click of the todo, go into edit mode
        dojo.connect(this, "onClick", this, function(){
          this.onEdit(this.todo);
        });
        
        //need to stop propagation of the click of the checkbox so we don't go into edit mode
        dojo.connect(this.todoCheckBox, "onClick", this, function(evt){
          evt.stopPropagation();
        });
        
        //when the checkbox value is change signal onChange
        dojo.connect(this.todoCheckBox, "onChange", this, function(){
          this.todo.done = this.todoCheckBox.get("checked");
          this.todo.updated = stamp.toISOString(new Date(),{milliseconds:true});
          this.todo.updater = db.username();
          this.onChange(this.todo);
        });
        
        //handle making this todo glow
        this.glowHandler = dojo.subscribe("coordel/glow", this, "handleGlow"); 
        
        //handle turboDone
        this.turboDoneHandler = dojo.subscribe("coordel/turboDone", this, "handleTurboDone");
      },
      
      onChange: function(todo){
        
      },
      
      onRemove: function(todo){
        
      },
      
      onEdit: function(todo){
        
      },
      
      _setPurpose: function(){
        var purpose = this.todo.purpose.replace(/\n/g, "<br>");
        
        if (purpose && purpose.length > 0){
          dojo.removeClass(this.purposeContainer, "hidden");
          this.purpose.innerHTML = purpose;
        }
      },
      
     _setDeadline: function(){

        //console.debug("in _setDeadline", this);
        var t = db.getTaskModel(this.todo, true);

        var has = t.hasDeadline(),
            deadline = "",
            past = false, //if it does have a deadline and past we'll color it red
            now = new Date();


        //has deadline
        //console.debug("_setDeadline", has, pdead, this);

        //check if this has a deadline
        if (has){
          //check if this deadline has passed?
          var c = dojo.date.compare(stamp.fromISOString(t.deadline), now, "date");
          if ( c < 0){
            past = true;
          }

          deadline = dt.deadline(t.deadline);
          dojo.removeClass(this.deadline, "hidden");
          this.deadline.innerHTML = deadline;
          //has deadline
          if (past) {
            // deadline past so show it and add error color
            dojo.addClass(this.deadline, "c-color-error");
          } 
        } 
             
        return;
      },
      
      handleGlow: function(args){
        if (this.todo._id === args.id){
          if (args.isGlowing){
            //console.debug("show glow: ", this.task.name);
            if (this.domNode){
               dojo.addClass(this.domNode, "glow");
               dojo.window.scrollIntoView(this.domNode);
            }
           
          } else {
            //console.debug("hide glow: ", this.task.name);
            if (this.domNode){
              dojo.removeClass(this.domNode, "glow");
            }
            
          }
           
        }
      },
      
      handleTurboDone: function(args){
        if (this.todo._id === args.id){
          if (args.isDone){
            if (this.domNode){
              dojo.removeClass(this.turboIcon, "hidden");
            }
            
          } else {
            if (this.domNode){
              dojo.addClass(this.turboIcon, "hidden");
            }
            
          }
        }
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.glowHandler){
          dojo.unsubscribe(this.glowHandler);
          this.glowHandler = null;
        }
      },
      
      baseClass: "todo-item"
  });
  return app.widgets.ToDo;     
});