define(["dojo",
        "app/models/FieldModel2", 
        "dojo/date/stamp", 
        "i18n!app/nls/coordel"], function(dojo, fModel, stamp, coordel) {
  dojo.declare(
  "app.views.Deliverale.formFields._field", 
  null, 
  {
    postCreate: function(){
      this.inherited(arguments);

      var self = this;
      
      fModel.field = self.field;
      
      //console.debug("postCreate in _field", fModel, fModel.hasValue());
      
      //if this has a default value, set it
      if (fModel.showDefault()){
        self.set("value", self.field["default"]);
      }
      
      if (fModel.hasValue()){
        //console.debug("setting field value", self.field.value);
        self.set("value", self.field.value);
      }
      
      //watch for changes to the value and update the field
      self.watch("value", function(prop, oldVal, newVal){
        //console.debug("Field value changed", prop, oldVal, newVal);
        //self.set("deadline", newVal);
        self.field.value = newVal;
        
        if (this.hasVersions){
          self.field.versions.push({
            value: oldVal,
            date: stamp.toISOString(new Date())
          });
        }
      });
    },
    
    setDisabled: function(){
      this.inherited(arguments);
      //use this function for dispay type views. It will disable the field if there is a value
      //or is will add a not started node
      fModel.field = this.field;
      if (!fModel.hasValue()){
        this.domNode.innerHTML = '<div class="not-started">' + coordel.notStarted + '</div>';
      }
      
    }
      
  });
  return app.views.Deliverale.formFields._field;    
});


