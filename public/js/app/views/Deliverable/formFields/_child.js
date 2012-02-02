define(["dojo",
        "i18n!app/nls/coordel"], function(dojo, coordel) {
  dojo.declare(
  "app.views.Deliverale.formFields._child", 
  null, 
  {
    
    postCreate: function(){
      this.inherited(arguments);

      var self = this;
      
      dojo.connect(this, "onChange", this, function(value){
        console.debug("onChange in _child", value, self.type);
        dojo.forEach(this.field.children, function(child){
          
          //need to set all children values to false if not multi
          if (!self.isMulti){
            child.value = false;
          }
          
          if (child.id === value){
            if (self.isMulti){
              //if it's multiple select, we need to toggle the existing value of the choice
              child.value = !child.value;
            } else {
              console.debug("settingi child to true", child.id, child.label);
              //need to set the selected one to true 
              child.value = true;
            }
          }
        
        });
      });
    }
  });
  return app.views.Deliverale.formFields._child;    
});