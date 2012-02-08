define(
  ["dojo",
    "text!./templates/empty.html",
    "dijit/_Widget", 
    "dijit/_Templated"], 
  function(dojo, empty, w, t) {
  
  dojo.declare(
    "app.views.EmptyDeliverable", 
    [w, t], 
    {
      
      name: null,
      
      templateString : empty,
      
      emptyTitle: "",
      
      emptyDescription: "",
      
      postCreate: function(){
        this.inherited(arguments);
        
      },
      
      baseClass: "deliverable"
  });
  return app.views.EmptyDeliverable;     
});