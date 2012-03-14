define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/deliverableFieldSettings.html",
    "app/models/FieldModel",
    "app/views/ChoiceGroupSettings/ChoiceGroupSettings",
    "dojo/data/ItemFileWriteStore"
    ], 
  function(dojo,coordel, w, t, html, FieldModel, ChoiceGroupSettings, WriteStore) {
  
  dojo.declare(
    "app.views.DeliverableFieldSettings", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      showName: true,
      
      id: null,
      
      field: null,
      
      choiceSettings: null,
      
      model: null,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        this.model = new FieldModel({field: this.field});
        var f = this.model;
        f.setType();
        
        //hide the name if we don't need it. (usually because this isn't a multipart deliverable)
        if (!this.showName){
          dojo.addClass(this.nameField, "hidden");
        }
        
        //some fields will have sizes the user can select, hide the field if not
        if (!f.field.hasSize){
          dojo.addClass(this.sizeField, "hidden");
        } else {
          //fill up the sizes list
          var store = new WriteStore({data: {identifier: "id", items:[]}});
          var isSelected = false,
              selectedId = "";
              
          dojo.forEach(f.field.sizes, function(s){
            store.newItem({name:s.value, id:s.id});
            if (s.selected){
              isSelected = true;
              selectedId = s.id;
            }
          });
          
          self.sizeSetting.store = store;
      
          self.sizeSetting.setDisplayedValue(self.field.size);
        }
        
        //hide choices if no children
        if (!f.hasChildren()){
          dojo.addClass(this.choicesField, "hidden");
        } else {
          //add a choices group
          this.choiceSettings = new ChoiceGroupSettings({
            field: this.field
          });
          this.choicesContainer.addChild(this.choiceSettings);
        }
        
        if (!f.field.hasDefault){
          dojo.addClass(this.defaultField, "hidden");
        } else {
          this.defaultValueSetting.set("value", f.field["default"]);
        }
        
        //set the required value;
        this.requiredSetting.set("checked", f.isRequired());
        this.nameSetting.set("value", f.field.label);
        
        
        //watch for changes to the controls
        this.nameSetting.watch("value", function(prop, oldVal, newVal){
          //console.debug("deliverable field name changed", prop, oldVal, newVal);
          self.field.name = newVal;
        });
        
        this.defaultValueSetting.watch("value", function(prop, oldVal, newVal){
          //console.debug("deliverable field defaultValue changed", prop, oldVal, newVal);
          self.field["default"] = newVal;
        });
        
        this.sizeSetting.watch("value", function(prop, oldVal, newVal){
          //console.debug("deliverable field size changed", prop, oldVal, newVal);
          self.field.size = newVal;
        });
        
        this.requiredSetting.watch("checked", function(prop, oldVal, newVal){
          //console.debug("required changed", prop, oldVal, newVal);
          
          //need to update the choices (if this field has choices) to reflect required status
          //if it's required, the user can set default selected on any of the choices
          if (self.choiceSettings){
            self.choiceSettings.setParentRequired(newVal);
          }
          
          self.field.required = newVal;
        });
      },
      
      getField: function(){
        //this gets the current state of the field and children
        var field = this.field;
        if (this.choiceSettings){
          field.children = this.choiceSettings.getChildren();
        }
        return field;
      },
      
      baseClass: "deliverable-field-settings"
  });
  return app.views.DeliverableFieldSettings;     
});