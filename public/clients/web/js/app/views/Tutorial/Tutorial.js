define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Tutorial.html",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/AccordionPane"
    ], 
  function(dojo, w, t, html) {
  
  dojo.declare(
    "app.views.Tutorial", 
    [w, t], 
    {
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
       
      },
      
      
      baseClass: "tutorial"
  });
  return app.views.Tutorial;     
});