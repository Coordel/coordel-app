define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/choiceGroupSettings.html",
    "app/views/ChoiceSettings/ChoiceSettings"
    ], 
  function(dojo,coordel, w, t, html, ChoiceSettings) {
  
  dojo.declare(
    "app.widgets.ChoiceGroupSettings", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      coordel: coordel,
      
      templateString: html,
      
      field: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        //console.debug("field in choicegroupsettings", this.field);
        dojo.forEach(this.field.children, function(c){
          //console.debug("adding a choice", c);
          self.addChoice(c);
        });
        
        dojo.connect(this.newChoice, "onKeyUp", this, function(evt){
          //wait for enter key and then add the choice
          if (evt.which === 13){
            this.createChoice(this.newChoice.get("value"));
            this.newChoice.reset();
          }
        });
        
      },
      
      getChildren: function(){
        //this gets all the children back and creates the correctly formatted array
        var choices = this.choicesContainer.getChildren(),
            children = [];
        
        dojo.forEach(choices, function(c){
          var child = {};
          
          child.id = c.choice.id;
          child.value = c.choice.value;
          child.label = c.choice.label;
          
          children.push(child);
          
        });
        
        return children;
      },
      
      setParentRequired: function(isRequired){
        //if the parent field is required, none of the choices are selected by default
        dojo.forEach(this.choicesContainer.getChildren(), function(c){
          if (isRequired){
            c.setDefault(false);
            dojo.addClass(c.defaultState, "hidden");
          } else {
            dojo.removeClass(c.defaultState, "hidden");
          }
        });
      },
      
      createChoice: function(label){
        var choiceId = this._getChoiceId(),
            self = this;
        choiceId.then(function(resp){
          var c = {
            id: resp.uuids[0],
            value: false,
            label: label
          };
          self.addChoice(c);
          self.field.children.push(c);
        });
      },
      
      addChoice: function(choice){
        //console.debug("added choice in choicegroupsetting", choice);
        var c = new ChoiceSettings({
          choice: choice,
          fieldIsRequired: this.field.required
        });
        this.choicesContainer.addChild(c);
        
        dojo.connect(c, "onRemoveChoice", this, "removeChoice");
        
        dojo.connect(c, "onToggleDefault", this, "toggleDefault");
      },
      
      removeChoice: function(childId){
        var children = this.field.children;
        //console.debug("got removeChoice in choicegroupsetting", childId);
        dojo.forEach(children, function(c, key){
          if (c.id === childId){
            children.splice(key, 1);
          }
        });
        //console.debug("removed choice, current children", this.field.children);
      },
      
      toggleDefault: function(args){
        var children = this.choicesContainer.getChildren(),
            fieldType = this.field.fieldType,
            field = this.field;
            
        //console.debug("got toggleChoice in choicegroupsetting", args, field, fieldType);
        
        //if this is a checkbox, can toggle individually. if it's a radio or select, need to 
        //toggle off the others
        dojo.forEach(children, function(c){
          switch(fieldType){
            case "checkbox":
            if (c.choice.id === args.id){
              c.choice.value = args.value;
            }
            break;
            case "radio":
            if (c.choice.id === args.id){
              c.choice.value = args.value;
            } else {
              c.choice.value = false;
              c.setDefault(false);
            }
            break;
            case "select":
            if (c.choice.id === args.id){
              c.choice.value = args.value;
            } else {
              c.choice.value = false;
              c.setDefault(false);
            }
            break;
          }
          
        });
      },
      
      _getChoiceId: function(){
       
        var def = dojo.xhrGet ({
          url: "/_uuids",
          content: {count: 1},
          handleAs: "json",
          sync: true,
          error: function(resp){
            console.log("Failed to retrieve UUID",resp);
          }
        });
        return def;
      }
      
  });
  return app.widgets.ChoiceGroupSettings;     
});