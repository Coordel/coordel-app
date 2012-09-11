define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Share.html",
    "dojo/data/ItemFileWriteStore",
    "app/models/CoordelStore",
     "i18n!app/nls/coordel",
     "dijit/form/FilteringSelect"
    ], 
  function(dojo, w, t, html, ws, db, coordel) {
  
  dojo.declare(
    "app.views.Share", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
       
       
        self._setFilteringSelect();
         
        dojo.connect(self.withEveryone, "onClick", this, function(){
          dojo.addClass(self.contactContainer, "hidden");
        });
        
        dojo.connect(self.withContact, "onClick", this, function(){
          dojo.removeClass(self.contactContainer, "hidden");
          
        });
      },
      
      _setFilteringSelect: function(){
        
        var self = this;
        var list = db.contacts();
    
        //console.log("templates", list);
        var store = new ws({data: {identifier: "id", items:[]}});

        dojo.forEach(list, function(obj, key){
          store.newItem({
            id: obj.id,
            name: obj.firstName + " " + obj.lastName
          });
        });

        self.contact.displayMessage = function(){
          return false;
        };

        self.contact.set("store" , store);
      },
    
      baseClass: "share"
  });
  return app.views.Share;     
});