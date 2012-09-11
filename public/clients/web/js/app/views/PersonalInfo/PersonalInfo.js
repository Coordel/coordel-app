define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/PersonalInfo.html",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore",
    "dojo/cookie",
    "dijit/form/ValidationTextBox"
    ], 
  function(dojo, w, t, html, coordel, db, cookie) {
  
  dojo.declare(
    "app.views.PersonalInfo", 
    [w, t], 
    {
      coordel: coordel,
      
      //the only info kept in coordel is first last email phone skype and only names phone and skype can change
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        db.profileStore.get(db.username()).then(function(data){
          console.log("profile", data);
          self.profile = data.profile;
          
          self.firstName.set("value",  self.profile.first);
          self.lastName.set("value",  self.profile.last);
          self.skype.set("value", self.profile.skype);
          self.phone.set("value", self.profile.phone);
        });
        
      },
      
      save: function(){
        var self = this;
        
        self.profile.first = self.firstName.get("value");
        self.profile.last = self.lastName.get("value");
        self.profile.skype = self.skype.get("value");
        self.profile.phone = self.phone.get("value");
        
        console.log("profile to save", self.profile);
        
        db.profileStore.store.put(self.profile, {username:db.username()});
      },
      
      baseClass: "personal-info"
  });
  return app.views.PersonalInfo;     
});