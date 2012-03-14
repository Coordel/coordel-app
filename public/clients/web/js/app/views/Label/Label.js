define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/label.html"
    ], 
  function(dojo, w, t, html) {
  
  dojo.declare(
    "app.views.Label", 
    [w, t], 
    {
      
      templateString: html,
      
      value: "",
      
      postMixInProperties: function(){
        this.inherited(arguments);
        this.value = this._setValue(this.value);
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
       
        
        this.watch("value", function(prop, oldVal, newVal){
          //console.debug("label value changed", prop, oldVal, newVal);
          this.domNode.innerHTML = self._setValue(newVal);
        });
        
      },
      
      _setValue: function(value){
        var string = "";
        if (value){
           string = value.replace(/\n/g, "<br>");
        }
        return string;
      },
      
      baseClass: "label"
  });
  return app.views.Label;     
});