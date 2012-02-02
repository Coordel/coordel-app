define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Login.html",
    "i18n!app/nls/coordel"
    ], 
  function(dojo, w, t, html, coordel) {
  
  dojo.declare(
    "app.views.Login", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      username: null,
      
      password: null,
      
      coordel: coordel,
      
      postCreate: function(){
        this.inherited(arguments);
        var username = dojo.cookie("username");
        var password = dojo.cookie("password");
        
        if (username){
          dijit.byId("username").set("value", username);
          dijit.byId("password").set("value", password);
          dijit.byId("rememberMe").set("checked", true);
        }
        
        dojo.connect(dijit.byId("password"), "onKeyUp", this, function(evt){
          if (evt.which === 13){
            this.onSubmit(evt);
          }
          
        });
        
      },
      
      onSubmit: function(evt){
        
      },
      
      baseClass: "signin"
  });
  return app.views.Login;     
});