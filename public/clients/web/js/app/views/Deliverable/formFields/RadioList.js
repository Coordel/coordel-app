define([
  "dojo", 
  "dijit",
  "dijit/_Widget",
  "dijit/_Templated",
  "dijit/form/RadioButton",
  "text!./templates/RadioList.html",
  "app/views/Deliverable/formFields/_field",
  "app/views/Deliverable/formFields/_child"], function(dojo, dijit, w, t, RadioButton, html, _field, _child) {
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
        
        //console.debug("field in radiolist", self.field);
        dojo.forEach(this.field.children, function(child){
          
          var box = this._getChoice(child);
          
          dojo.place(box, this.choicesNode);
        
        }, this);
      },
      
      onChange: function(chg){
        //console.debug("RadioList changed", chg);
      },
      
      _getChoice: function(child){
        var self = this;
        
        var node = dojo.create("div", {
          "class": "radio"
        });
        
        var box = new RadioButton({
          value: child.id,
          name: this.field.id,
          label: child.label,
          checked: child.value,
          onChange: function(chg){
            //console.debug("radio changed", child.id);
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
      
      baseClass: "radio-list"
      
          
  });
  
  return app.views.Deliverable.formFields.CheckboxList; 
     
});