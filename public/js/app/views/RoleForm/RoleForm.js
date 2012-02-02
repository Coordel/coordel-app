define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/RoleForm.html",
    "dojo/data/ItemFileWriteStore",
    "app/models/CoordelStore"], 
  function(dojo,coordel, w, t, html, ws, db) {
  
  dojo.declare(
    "app.views.RoleForm", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      isNew: true,
      
      coordel: coordel,
      
      project: null,
      
      role: null,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        
        this._setPeople();
       
      },
      
      reset: function(){
        this.focusPoint.reset();
        this.people.reset();
      },
      
      _setPeople: function(){
        var store = new ws({data: {identifier: "id", items:[]}}),
            control = this.people;
  
        //add the unassigned option
        store.newItem({
          name: "Unassigned",
          id: "UNASSIGNED"
        });
        
        //add this project's current users as options
        var users = this.project.users;
        
        dojo.forEach(users, function(user){
          //already added the possible UNASSIGNED, don't add it again
          if (user !== "UNASSIGNED"){
            store.newItem({
              name: db.contactFullName(user),
              id: user
            });
          }
        });
         
        control.displayMessage = function(){
          return false;
        };
         
        control.set("store" , store);
      }

  });
  return app.views.RoleForm;     
});