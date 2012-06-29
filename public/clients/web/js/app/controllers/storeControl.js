define([
  "dojo", 
  "dijit", 
  "app/layouts/storeLayout",
  "i18n!app/nls/coordel",
  "app/models/CoordelStore",
  "app/views/EmptyProject/EmptyProject"], function(dojo, dijit, layout,  coordel, db, Empty) {
  //return an object to define the "./newmodule" module.
  return {
      focus: "store",
      observeHandlers: [],
      init: function(){
    
        var self = this;
        console.debug("storeControl init called", db);
        
        //the contact layout will show any tasks this person has in any of the current user's
        //projects
        layout.showLayout();
        
        //add profile to container
        document.title = "Coordel > " + coordel.store;
      }
  };
});