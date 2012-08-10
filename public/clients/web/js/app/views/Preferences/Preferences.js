define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Preferences.html",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore",
    "dijit/form/CheckBox"
    ], 
  function(dojo, w, t, html, coordel, db) {
  
  dojo.declare(
    "app.views.Preferences", 
    [w, t], 
    {
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        var app = db.appStore.app();
       
        //this is a bit strange because by default, there is no suppressEmail to default it on
        if (app.suppressEmail){
          self.emailUpdates.checked = false;
        } else {
          self.emailUpdates.checked = true;
        }
        
        dojo.connect(self.emailUpdates, "onChange", this, function(){
          console.log("in connect");
          var suppress = self.emailUpdates.get("checked");
          var a = db.appStore.app();
          console.log("app", a);
          if (suppress){
            console.log("send updates");
            delete a.suppressEmail;
            dojo.when(db.appStore.post(a), function(){
              db.appStore._app = a;
              console.log("updated", a);
            });
          } else {
            console.log("don't send updates");
            a.suppressEmail = true;
            dojo.when(db.appStore.post(a), function(){
              db.appStore._app = a;
              console.log("updated", a);
            });
          }
          
        });
      },
      
      _update: function(app){
        db.appStore.put(app);
      },
      
      baseClass: "preferences"
  });
  return app.views.Preferences;     
});