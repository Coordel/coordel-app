define([
  "dojo", 
  "dijit",
  "dijit/_Widget",
  "dijit/_Templated",
  "dijit/form/CheckBox",
  "text!./templates/CheckboxList.html",
  "app/views/Deliverable/formFields/_field",
  "app/views/Deliverable/formFields/_child"], function(dojo, dijit, w, t, CheckBox, html, _field, _child) {
  dojo.declare(
    "app.views.Deliverable.formFields.CheckboxList", 
    [w, t, _field, _child], 
    {
      hasVersions: false,
      
      templateString: html,
      
      field: null,
      
      isMulti: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        console.debug("field in checkboxlist", self.field);
        dojo.forEach(this.field.children, function(child){
          
          var box = this._getChoice(child);
          
          dojo.place(box, this.choicesNode);
        
        }, this);
      },
      
      onChange: function(chg){
        console.debug("CheckboxList changed", chg);
      },
      
      _getChoice: function(child){
        var self = this;
        
        var node = dojo.create("div", {
          "class": "checkbox"
        });
        
        var box = new CheckBox({
          value: child.id,
          label: child.label,
          checked: child.value,
          onChange: function(chg){
            console.debug("checkbox changed", chg);
            self.onChange(child.id);
          }
        }).placeAt(node);
        
        var label = dojo.create("label", {
          innerHTML: child.label,
          "class": "choice"
        });
        
        dojo.place(label, node);
        
        return node;
        
        
      },
      
      setDisabled: function(){
        this.inherited(arguments);
        dojo.forEach(dijit.findWidgets(this.choicesNode), function(choice){
          choice.set("disabled", true);
        });
      },
      
      baseClass: "checkbox-list"
      
          
  });
  
  return app.views.Deliverable.formFields.CheckboxList; 
     
});