define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/label.html",
    "app/util/format"
    ],
  function(dojo, w, t, html, format) {

  dojo.declare(
    "app.views.Label",
    [w, t],
    {

      templateString: html,

      value: "",

      original: "",

      postMixInProperties: function(){
        this.inherited(arguments);
        this.original = this.value;
        this.value = this._setValue(this.original);
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
          string = value;
          if (!this.hasHTML){
            string = format.smartText(value);
          }
        }
        return string;
      },

      baseClass: "label"
  });
  return app.views.Label;
});