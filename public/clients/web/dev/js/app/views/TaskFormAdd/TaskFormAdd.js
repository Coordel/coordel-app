define(
  ["dojo",
  "dijit",
  "dijit/form/TextBox",
  "dijit/form/Textarea",
  "i18n!app/nls/coordel",
  "text!app/views/TaskFormAdd/templates/addProject.html",
  "text!app/views/TaskFormAdd/templates/addDeliverable.html",
  "text!app/views/TaskFormAdd/templates/addBlocker.html",
  "text!app/views/TaskFormAdd/templates/addContact.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dojo/date/stamp",
  "dojo/date"], 
  function(dojo, dijit, TextBox, Textarea, coordel, addProject, addDeliverable, addBlocker, addContact, w, t, stamp, date) {
  
  dojo.declare(
    "app.views.TaskFormAdd", 
    [w, t], 
    {
      
      id: "",
      
      templateString: "",
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      //field on which the form is focused (project, blocker, contact, etc)
      fieldFocus: "",
      
      postMixInProperties: function(){
        this.inherited(arguments);
        
        switch (this.fieldFocus){
          case "project":
          this.templateString = addProject;
          break;
          case "deliverables":
          this.templateString = addDeliverable;
          break;
          case "blockers":
          this.templateString = addBlocker;
          break;
          case "delegate":
          this.templateString = addContact;
          break;
          case "responsible":
          this.templateString = addContact;
          break;
          case "people":
          this.templateString = addContact;
          break;
        }
          
      }, 
      
      postCreate: function(){
        this.inherited(arguments);
        
        dojo.connect(this.domNode, "onkeypress", this, function(evt){
          //console.debug("key", evt.which);
          evt.stopPropagation();
          //the parent popup will close this if you press TAB stop it from propagating
        });
        
        //need to set the default project deadline to three days from today by default
        if (this.fieldFocus === "project"){
          var deadline = stamp.toISOString(date.add(new Date(), "day", 3), {selector: "date"});
          this.projectDeadline.set("value", deadline);
        }
        
      }
  });
  return app.views.TaskFormAdd;     
});

