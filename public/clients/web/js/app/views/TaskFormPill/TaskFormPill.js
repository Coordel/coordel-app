define(
  ["dojo",
  "dijit",
  "i18n!app/nls/coordel",
  "text!app/views/TaskFormPill/templates/taskFormPill.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], 
  function(dojo, dijit, coordel, html, w, t, db) {
  
  dojo.declare(
    "app.views.TaskFormPill", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      source: null,
      
      imageClass: null, //set set this to have a decorator icon show up on the left of the pill
      
      value: "",
      
      //field on which the form is focused (project, blocker, contact, etc)
      taskFormField: "",
      
      postCreate: function(){
        this.inherited(arguments);

      },
      
      hideRemove: function(){
        dojo.addClass(this.removeValue, "hidden");
      },
      
      select: function(){
        dojo.addClass(this.mainNode, "selected");
      },
      
      reset: function(){
        dojo.removeClass(this.mainNode, "selected");
      },
      
      showPill: function(value, contact){
        //the value will be the id used to create the actual display value of the pill based on
        //the taskFormField this is for except for deliverable which will be the deliverable itself
        //when adding a contact, value will be pending, and a pending contact will be sent in as well
        
        //console.debug("showing the pill", value);
        
        var self = this;
        
        dojo.addClass(this.image, "hidden");
        if (this.imageClass){
          dojo.removeClass(this.image, "hidden");
          dojo.addClass(this.image, this.imageClass);
        }
        
        this.value = value;
        
        switch(this.taskFormField){
          case "project":
          //console.debug("showing a project pill");
          /*
          this.source = db.projectStore.store.get(value);
          this.source.then(function(){})
          this.displayValue.innerHTML = this.source.name;
          */
          dojo.when(db.projectStore.store.get(value), function(project){
            self.displayValue.innerHTML = project.name;
          });
          
          break;
          case "deadline":
          this.source = value;
          this.displayValue.innerHTML = this.source;
          break;
          case "defer":
          this.source = value;
          this.displayValue.innerHTML = this.source;
          break;
          case "delegate":
          //console.debug("showing a delegate pill", value, email);
          if (value === "pending"){
            this.source = contact.firstName + " " + contact.lastName;
            this.displayValue.innerHTML = this.source;
          } else {
            self.source = db.contactFullName(value);
            self.displayValue.innerHTML = self.source;
          }
          break;
          case "deliverables":
          //set the value (to be the id of the template)
          
          this.source = this.value.name;
          this.value = this.value.id;
          this.displayValue.innerHTML = this.source;
          
          break;
          case "blockers":
          //console.debug("showing a blocker pill");
          //get the task, then the project and create a hybrid string
          var task = db.taskStore.blockStore.get(value);
          
          
          
          dojo.when(task, function(task){
            var project = db.projectStore.store.get(task.project);
            
            dojo.when(project, function(project){
              self.source = '<div class="pill-project-label c-float-l">' + project.name + '</div><div class="c-float-l pill-divider"> : </div><div class="pill-task-label c-float-l">' + task.name + "</div>";
              self.displayValue.innerHTML = self.source;
            });
          });
          break;
          case "attachments":
          //console.debug("in attachments in pill");
          this.source = this.value;
          this.displayValue.innerHTML = this.source;
          break;
        }
      }
      
      
      
  });
  return app.views.TaskFormPill;     
});

