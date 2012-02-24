define(
  ["dojo",
  "dijit",
  "dijit/form/TextBox",
  "dijit/form/Textarea",
  "i18n!app/nls/coordel",
  "text!app/views/TaskFormSelect/templates/taskFormSelect.html",
  "dijit/_Widget", 
  "dijit/_Templated"], 
  function(dojo, dijit, TextBox, Textarea, coordel, html, w, t) {
  
  dojo.declare(
    "app.views.TaskFormSelect", 
    [w, t], 
    {
      
      id: "",
      
      noneFoundText: "",
      
      addText: "",
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      //if we don't want to show an add button, then set this value to false. an example of this
      //is when you add deliverables. The user can't create a deliverable type, so no add button should show
      showAddButton: true,
      
      //field on which the form is focused (project, blocker, contact, etc)
      fieldFocus: "",
      
      //text to show when user types but nothing is found (i.e. "No Project Found");
      noneFoundText: "",
      
      //text to show when the user types, nothing found, and add button shown (i.e. "Add Project")
      addText: "",
      
      postMixInProperties: function(){
        this.inherited(arguments);
        
        //based on focus, set the not found text and the add text
        this.noneFoundText = coordel.taskFormSelect[this.fieldFocus+"NoneFound"];
        this.addText = coordel.taskFormSelect[this.fieldFocus+"Add"];
      }, 
      
      postCreate: function(){
        this.inherited(arguments);
        
        //console.debug("showAddButton", this.showAddButton);
        
        //if showAddButton is false, then hide the button
        if (this.showAddButton === false){
          dojo.addClass(this.addFieldValue, "hidden");
        }
        
        
        /*
        //show the correct form when addObject is clicked
        dojo.connect(this.addTaskFieldValue, "onclick", this, function(){
          
          //dojo.publish("coordel/showAddForm", [{field: this.fieldFocus}]);
          
          //hide the noneFound form
          //dojo.addClass(this.noneFoundForm, "hidden");
          
          //show the instructions for this as a tooltip that matches the tooltip for the field
          
          //show the form for the field (i.e. new project form, invite contact form, etc)
          
        
        });
        */
      }
      
      
      
  });
  return app.views.TaskFormSelect;     
});

