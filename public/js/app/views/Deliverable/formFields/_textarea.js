/**********************
This let's us change the style of the textarea to it can be composed into different controls
that allow versioning, sizing, etc. All it really does is change the templateString
*/

define([
  "dojo", 
  "dijit",
  "dijit/form/Textarea",
  "text!./templates/_textarea.html",
   "dojo/date/stamp",
   "app/models/FieldModel2"], function(dojo, dijit, Textarea, html, stamp, fModel) {
  dojo.declare(
    "app.views.Deliverable.formFields._textarea", 
    [Textarea], 
    {
      size: "medium",
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        fModel.field = self.field;
        
        //console.debug("postCreate in _textarea", fModel, fModel.hasValue());
        
        //if this has a default value, set it
        if (fModel.showDefault() && !fModel.hasValue()){
          //self.textarea.set("value", self.field["default"]);
          self.set("value", self.field["default"]);
        }
        
        if (fModel.hasValue()){
          //console.debug("setting value in textarea", self.field["value"]);
          self.set("value", self.field.value);
          //self.containerNode.innerHTML = self.field["value"];
        }
        
        //watch for changes to the value and update the field
        self.watch("value", function(prop, oldVal, newVal){
          //console.debug("_textarea value changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          self.field.value = newVal;
          
          if (oldVal !== newVal && newVal !== "" && oldVal !== ""){
            //console.debug("adding a version");
            self.field.versions.push({
              value: oldVal,
              date: stamp.toISOString(new Date())
            });
          }
        });
      },
      
      templateString: html
      
    });
  return app.views.Deliverable.formFields._textarea;    
});

