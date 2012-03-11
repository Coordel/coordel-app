define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ReuseForm.html",
    "dijit/form/FilteringSelect",
    "app/models/CoordelStore",
    "dojo/data/ItemFileWriteStore"], 
  function(dojo, coordel, w, t, html, Select, db, ws) {
  
  dojo.declare(
    "app.views.ReuseForm", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      submitLabel: coordel.applyBlueprint,
      
      templateFilter: null,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        this.blueprint.reset();
        
        //console.log("templateFilter", this.templateFilter);
        
        this._setFilteringSelect(db.templates(this.templateFilter));
        
        /*
        this.blueprint.watch("value", function(prop, oldVal, newVal){
          //console.debug("task deadline changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          if (newVal){
            console.log("new blueprint value", newVal);
            //self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "datetime"});
          } else {
           
          }
        });
        */
        
      },
      
      _setFilteringSelect: function(list){
        
        
        //console.log("templates", list);
        var store = new ws({data: {identifier: "_id", items:[]}});
       
       
       
        dojo.forEach(list, function(obj, key){
          store.newItem(obj);
        });
       
        this.blueprint.displayMessage = function(){
          return false;
        };
       
        this.blueprint.set("store" , store);
      },
      
      onSave: function(){
        
      }

  });
  return app.views.ReuseForm;     
});