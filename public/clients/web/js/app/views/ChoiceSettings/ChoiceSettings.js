define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/choiceSettings.html"
    ], 
  function(dojo,coordel, w, t, html) {
  
  dojo.declare(
    "app.widgets.ChoiceSettings", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      templateString: html,
      
      choice: null,
      
      isDefaultOn: false,
      
      fieldIsRequired: false,
      
      coordel: coordel,
      
      postCreate: function(){
        var self = this;
        
        this.inherited(arguments);
        this.choiceName.set("value", this.choice.label);
        
        //if fieldIsRequired, then the user can't set default on or off for this choice
        if (this.fieldIsRequired){
          dojo.addClass(this.defaultState, "hidden");
        }
      
        //default is turned off by default
        if (this.choice.isDefault){
          //show default on
          dojo.removeClass(this.defaultState, "ui-state-diabled");
        }
        
        //wire up the buttons
        dojo.connect(this.removeChoice, "onclick", this, function(){
          this.onRemoveChoice(this.choice.id);
        });
        
        dojo.connect(this.defaultState, "onclick", this, "toggleDefault");
        
        //watch the name for changes
        this.choiceName.watch("value", function(prop, oldVal, newVal){
          //console.debug("choice name changed", prop, oldVal, newVal);
          self.choice.label = newVal;
        });
        
      },
      
      onRemoveChoice: function(){
        this.destroy();
      },
      
      setDefault: function(isChecked){
        this.isDefaultOn = isChecked;
        if (isChecked){
          this.defaultState.title = coordel.choiceSettings.defaultOn;
          dojo.removeClass(this.defaultState, "ui-state-disabled");
        } else {
          this.defaultState.title = coordel.choiceSettings.defaultOff;
          dojo.addClass(this.defaultState, "ui-state-disabled");
        }
      },
      
      toggleDefault: function(){
        var toggle = !this.isDefaultOn;
        //console.debug("toggleDefault called toggle is ", toggle, this.isDefaultOn);
        this.setDefault(toggle);
        this.onToggleDefault({
          id: this.choice.id,
          value:toggle
        });
      },
      
      onToggleDefault: function(args){
        
      }
      
      
  });
  return app.widgets.ChoiceSettings;     
});