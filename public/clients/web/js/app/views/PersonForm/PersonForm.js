define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/PersonForm.html",
    "app/models/CoordelStore"], 
  function(dojo, coordel, w, t, html, db) {
  
  dojo.declare(
    "app.views.PersonForm", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
      },
      
      save: function(){
        
        var names = this.contactName.get("value").split(" "),
            email = this.contactEmail.get("value"),
            firstName = names,
            lastName = "",
            self = this;
            
        if (names.length > 1){
          firstName = names[0];
          lastName = names[1];
          if (names.length > 2){
            lastName = names[names.length -1];
          }
        }
        
        var query = db.getUser(email);
        
        dojo.when(query, function(user){
          //console.log("queried coordel user", user);
          if (user){
            //console.log("coordel member, add to this user's app", user);
            var add = db.contactStore.addContact(user.app);
          } else {
            
            var invite = db.inviteUser({
              email: email,
              firstName: firstName,
              lastName: lastName,
              subject: coordel.invitationSubject,
              data: {}});
              
            dojo.when(invite, function(user){
              //console.log("user added", user);
              db.contactStore.store.notify(user);
            });
          }
          
          self.onSave();
        });
      },
      
      onSave: function(){
        
      }

  });
  return app.views.PersonForm;     
});