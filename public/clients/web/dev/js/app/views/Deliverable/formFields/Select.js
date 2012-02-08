define([
  "dojo", 
  "dijit",
  "dijit/form/Select",
  "app/views/Deliverable/formFields/_field",
  "app/views/Deliverable/formFields/_child"], function(dojo, dijit, Select, _field, _child) {
  dojo.declare(
    "app.views.Deliverable.formFields.Select", 
    [Select, _field, _child], 
    {
      hasVersions: false,
      
      postCreate: function(){
        
        
        //add the size class to the domNode
        dojo.addClass(this.domNode, this.field.size);
        
        //console.debug("SELECT children", this.field.children, this.field.required);
        
        var hasValue = false;
        
        dojo.forEach(this.field.children, function(child){
          this.options.push({
            value: child.id,
            label: child.label,
            selected: child.value
          });
          
          if (child.value){
            hasValue = true;
          }
        }, this);
        
        if(!hasValue && this.field.required){
          this.options.unshift({
            value: "",
            label: "Select One",
            selected: true
          });
        }
        
        this.inherited(arguments);
  
      },
      
      setDisabled: function(){
        this.inherited(arguments);
        this.set("disabled", true);
      }
      
      
      
    });
  return app.views.Deliverable.formFields.Select;    
});