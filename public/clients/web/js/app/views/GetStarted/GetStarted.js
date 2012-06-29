define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/GetStarted.html",
    "app/views/Dialog"
    ], 
  function(dojo, w, t, html, Dialog) {
  
  dojo.declare(
    "app.views.GetStarted", 
    [w, t], 
    {
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this,
            d = new Dialog();
            
            d.set("content", html);
    
            d.show();
        
      },
      
      baseClass: "get-started"
  });
  return app.views.GetStarted;     
});