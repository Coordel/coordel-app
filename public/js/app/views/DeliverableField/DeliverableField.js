define(
  ["dojo",
    "dijit",
    "dijit/form/TextBox",
    "dijit/form/SimpleTextarea",
    "dijit/form/Select",
    "dijit/form/CheckBox",
    "dijit/form/RadioButton",
    "app/form/Uploader",
    "app/models/FieldModel",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
    "text!./templates/infoView.html",
    "text!./templates/editView.html",
    "text!./templates/gridView.html",
    "text!./templates/multipart/infoView.html",
    "text!./templates/multipart/editView.html",
    "text!./templates/multipart/gridView.html"
    ], 
  function(dojo,dijit,TextBox,Textarea,Select,CheckBox,RadioButton, Uploader,  fModel, coordel, w, t, c, info, edit, grid, mInfo, mEdit, mGrid) {
  
  dojo.declare(
    "app.views.DeliverableField", 
    [w, t, c], 
    {
      name: null,
      
      id: null,
      
      widgetsInTemplate: true,
      
      view: "info", //the three view types are info, edit, grid
      
      templateString: info,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        
        var multipart = this.multipart;
        
        switch(this.view){
          case "edit":
          this.templateString = edit;
          if (multipart){
            this.templateString = mEdit;
          }
          break;
          case "grid":
          this.templateString = grid;
          if (multipart){
            this.templateString = mGrid;
          }
          break;
          default:
          this.templateString = info;
          if (multipart){
            this.templateString = mInfo;
          }
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        var f = this.field,
            self = this,
            toAdd,
            size = "";
        
        if (f.size){
          size = f.size;
        }
        
        switch (f.fieldType){
          case "input":
          if (f.inputType === "file"){
            //console.debug("self", self);
            //toAdd = new File({name: f.id}).placeAt(self.fieldContainer, 0).startup();
            toAdd = new Uploader({
              label: coordel.deliverable.uploadLabel,
              multiple: false,
              uploadOnSelect: true
            }).placeAt(self.fieldContainer,0); 
          } else {
            toAdd = new TextBox({
              
              "class": "textbox " + size,
              value: f.value,
              name: f.id
            }).placeAt(self.fieldContainer, 0);
          }
          break;
          
          
          case "textarea":
          toAdd = new Textarea({
         
            "class": "textarea " + size,
            style: "width: 99%",
            value: f.value,
            name: f.id
          }).placeAt(self.fieldContainer,0);
          break;
        
          
          case "select":
          var options = [];
          dojo.forEach(f.children, function(child){
            options.push({
              selected: child.value,
              label: child.label,
              value: child.id
            });
          });
          toAdd = new Select({
           
            "class": "select " + size,
            options: options,
            value: f.value,
            name: f.id
          }).placeAt(self.fieldContainer,0);
          break;
          
          
          case "checkbox":
          dojo.forEach(f.children, function(child){
            //create the radio button
            var check = new CheckBox({
              checked: child.value,
              "class": "checkbox",
              value:child.id,
              label: child.label,
              name: f.id
            }).placeAt(self.fieldContainer);
            //create the label for the radio button
            var label = dojo.create("label", {"class": "choice", "for": check.id, innerHTML: child.label}, self.fieldContainer); 
          });
          break;
          
          case "radio":   
  
          dojo.forEach(f.children, function(child){
            //create the radio button
            var radio = new RadioButton({
              "class": "radio",
              checked: child.value,
              value:child.id,
              label: child.label,
              name: f.id
            }).placeAt(self.fieldContainer);
            //create the label for the radio button
            var label = dojo.create("label", {"class": "choice", "for": radio.id, innerHTML: child.label}, self.fieldContainer); 
          });
          break;

        }
        
        //required is hidden by default, remove it if this field is required
        if (this.multipart && f.required){
          dojo.removeClass(dojo.byId(this.isRequired), "hidden");
        }
      
        
        
      },
      
      /*
      destroy: function(){
        this.inherited(arguments);
        console.debug("DeliverableField destroy called on ", this.field.id);
      },
      
      destroyDescendants: function(){
        this.inherited(arguments);
        console.debug("DeliverableField destroyDescendants called on ", this.field.id);
      },
      */
      
      baseClass: "deliverable-field"
  });
  return app.views.DeliverableField;     
});