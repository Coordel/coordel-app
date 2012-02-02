define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/labeledCheckbox.html"
    ], 
  function(dojo,coordel, w, t, html) {
  
  dojo.declare(
    "app.widgets.LabeledCheckbox", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      label: "",
      
      value: "",
      
      checked: function(){
        return false;
      },
      
      onChange: function(){
        
      },
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        
        //this.checkbox.set("value", this.value);
        
        this.checkbox.set("checked", this.checked());
        
        dojo.connect(this.checkbox, "onChange", this, "onChange");

      }
      
  });
  return app.widgets.LabeledCheckbox;     
});