define([
  "dojo", 
  "dijit",
  "dijit/form/TextBox",
  "app/views/Deliverable/formFields/_field"], function(dojo, dijit, TextBox, _field) {
  dojo.declare(
    "app.views.Deliverable.formFields.TextBox", 
    [TextBox, _field], 
    {
      hasVersions: false,
      
      postCreate: function(){
        this.inherited(arguments);
        
        //add the size class to the domNode
        dojo.addClass(this.domNode, this.field.size);
      },

			setDisabled: function(){
				this.inherited(arguments);
				console.log("disabling textbox", this.field);
				this.set("disabled", true);
			}
      
    });
  return app.views.Deliverable.formFields.TextBox;    
});

