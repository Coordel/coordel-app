define(
  ["dojo",
  "dijit",
  "i18n!app/nls/coordel",
  "text!app/views/ProjectFormPill/templates/ProjectFormPill.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], 
  function(dojo, dijit, coordel, html, w, t, db) {
  
  dojo.declare(
    "app.views.ProjectFormPill", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      source: null,
      
      imageClass: null, //set set this to have a decorator icon show up on the left of the pill
      
      value: "",
      
      //field on which the form is focused (project, blocker, contact, etc)
      formField: "",
      
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
        
        //console.debug("showing the pill", value);
        dojo.addClass(this.image, "hidden");
        if (this.imageClass){
          dojo.removeClass(this.image, "hidden");
          dojo.addClass(this.image, this.imageClass);
        }
        
        this.value = value;
        
        switch(this.formField){
          case "responsible":
          //console.debug("showing a project pill");
          this.source = db.contactFullName(value);
          this.displayValue.innerHTML = this.source;
          break;
          case "deadline":
          this.source = value;
          this.displayValue.innerHTML = this.source;
          break;
          case "defer":
          this.source = value;
          this.displayValue.innerHTML = this.source;
          break;
          case "people":
          //console.log("setting pill for people", value);
          if (value === "pending"){
            this.value = contact.email;
            this.source = contact.firstName + " " + contact.lastName;
            this.displayValue.innerHTML = this.source;
          } else {
            //console.log("db", db);
            this.source = db.contactFullName(value);
            //console.log("self source", this.source, this.displayValue.innerHTML);
            this.displayValue.innerHTML = this.source;
          }
          break;
          case "assignment":
          //the default value of name is Role if there isn't a name provide
          var n = coordel.role;
          if (value.name){
            n = value.name;
          }
          this.source = n + " : " + db.contactFullName(value.username);
          this.displayValue.innerHTML = this.source;
          break;
          case "attachments":
          //console.debug("in attachments in pill");
          this.source = this.value;
          this.displayValue.innerHTML = this.source;
          break;
        }
      }

      
  });
  return app.views.ProjectFormPill;     
});

