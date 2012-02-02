define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/QuickEntry.html",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore",
    "dojo/date/stamp",
    "dijit/form/TextBox",
    "dijit/form/Textarea"
    ], 
  function(dojo, w, t, html, coordel, db, stamp) {
  
  dojo.declare(
    "app.views.QuickEntry", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      project: null,
      
      isEdit: false,
      
      addTitle: "New",
      
      widgetsInTemplate: true,
      
      isEditing: false,
      
      entryType: "todo", //can be task or note as well

      postCreate: function(){
        this.inherited(arguments);
        
        //set the min date on the deadline control
        var min = stamp.toISOString(new Date(), {selector: "date"});
        this.taskFormDeadline.set("constraints",{min: min});
        
        dojo.connect(this.taskPurpose, "onFocus", this.taskPurpose, function(){
          //console.debug ("onFocus taskFormPurpose", this);
          if(this.value === coordel.taskForm.phPurpose){
            //console.debug("it was placeholder blank it");
            this.setValue("");
            dojo.removeClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.taskPurpose, "onBlur", this.taskPurpose, function() {
          //console.debug ("onblur taskFormPurpose", this);
        
          if(dojo.trim(this.value).length == 0){
            //console.debug("it was blank set it to the placeholder");
            this.setValue(coordel.taskForm.phPurpose);  
            dojo.addClass(this.domNode, "c-placeholder");
            
          }
        });
        
        dojo.connect(this.quickEntry, "onclick", this, function(){
          if (!this.isEditing){
            this.showEdit();
            switch (this.entryType){
              case "todo":
                this.taskName.focus();
                break;
              case "note":
                this.note.focus();
                break;
              case "task":
                break;
            }
          }
        });
        
        dojo.connect(this, "onBlur", this, function(evt){
          //console.debug("blur");
          this.hideEdit();
        });
        
        //handle quick enter 
        
        dojo.connect(this.taskName, "onKeyUp", this, "handleKeyUp");
        dojo.connect(this.taskFormDeadline, "onKeyPress", this, function(evt){
          //console.debug("key press event", evt.which, evt);
          
          if (evt.which === 9){
            evt.preventDefault();
            //console.debug ("handling tab");
            switch (this.entryType){
              case "todo":
                this.saveTodo();
                break;
              case "task":
                this.saveTask();
                break;
            }
          }
        });
        dojo.connect(this.note, "onKeyPress", this, function(evt){
          //console.debug("key press event", evt.which, evt);
          
          if (evt.which === 9){
            evt.preventDefault();
            this.saveNote();
          }
        });
      },
      
      handleKeyUp: function(evt){
        
        if (evt.which === 13){
          switch (this.entryType){
            case "todo":
              this.saveTodo();
              break;
            case "note":
              this.saveNote();
              break;
            case "task":
              this.saveTask();
              break;
          }
        }
      },
      
      saveTask: function(){
        //console.debug("save task");
      },
      
      saveNote: function(){
        //console.debug("save note");
        var self = this;
        var note = {
          _id: db.uuid(),
          entry: this.note.get("value").trim(),
          created: stamp.toISOString(new Date(),{milliseconds:true}),
          username: db.username()
        };
        //console.debug("note", note);
        this.onSave({
          entryType: "note",
          entry: note
        });
        this.note.reset();
        this.hideEdit();
        this.showEdit();
        setTimeout(function(){
          self.note.focus();
        }, 100);
      },
      
      saveTodo: function(){
        //add the task
        var todo = {
          _id: db.uuid(),
          name: this.taskName.get("value").trim(),
          purpose: this.taskPurpose.get("value").trim(),
          done: false,
          created: stamp.toISOString(new Date(),{milliseconds:true}),
          username: db.username()
        };
        
        var deadline = this.taskFormDeadline.get("value");
        //console.debug("deadline", deadline);
        
        if (deadline){
          todo.deadline = stamp.toISOString(new Date(deadline), {selector: "date"});
        }
        
        //to enable placeholder on purpose
        if (todo.purpose === coordel.taskForm.phPurpose){
          todo.purpose = "";
        }
        
        //console.debug("saved todo", todo);
        this.onSave({
          entryType: "todo",
          entry: todo
        });
        var self = this;
        
        dojo.addClass(this.taskPurpose.domNode, "c-placeholder");
        this.taskName.reset();
        this.taskPurpose.reset();
        this.taskFormDeadline.reset();
        this.hideEdit();
      
        this.showEdit();
        setTimeout(function(){
          self.taskName.focus();
        }, 100);
  
      },
      
      onSave: function(args){
        
      },
      
      showEdit: function(){
        if (!this.isEditing){
          var type = this.entryType;
          this.isEditing = true;
          dojo.toggleClass(this.quickEntry, "inactive");
          dojo.toggleClass(this.quickEntry, "active");
          dojo.toggleClass(this.entryEdit, "hidden");
          
          switch (type){
            case "todo":
              dojo.toggleClass(this.taskEnter, "hidden");
              break;
            case "note":
              dojo.toggleClass(this.noteEnter, "hidden");
              break;
            case "task":
              break;
          }
        }
      },
    
      
      hideEdit: function(){
        if (this.isEditing){
          var type = this.entryType;
          this.isEditing = false;
          dojo.toggleClass(this.quickEntry, "inactive");
          dojo.toggleClass(this.quickEntry, "active");
          dojo.toggleClass(this.entryEdit, "hidden");
          
          switch (type){
            case "todo":
              dojo.toggleClass(this.taskEnter, "hidden");
              break;
            case "note":
              dojo.toggleClass(this.noteEnter, "hidden");
              break;
            case "task":
              break;
          }
        }
      },
      
      baseClass: "quick-entry"
  });
  return app.views.QuickEntry;     
});