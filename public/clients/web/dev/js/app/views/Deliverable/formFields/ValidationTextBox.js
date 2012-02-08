define([
  "dojo", 
  "dijit",
  "dijit/form/ValidationTextBox",
  "app/views/Deliverable/formFields/_field"], function(dojo, dijit, TextBox, _field) {
  dojo.declare(
    "app.views.Deliverable.formFields.ValidationTextBox", 
    [TextBox, _field], 
    {
      
      hasVersions: false,
      
      postCreate: function(){
        this.inherited(arguments);
        
        //add the size class to the domNode
        dojo.addClass(this.domNode, this.field.size);
      }
      
    });
  return app.views.Deliverable.formFields.ValidationTextBox;    
});

