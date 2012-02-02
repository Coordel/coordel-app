define(
  ["dojo",
    "text!./templates/empty.html",
    "dijit/_Widget", 
    "dijit/_Templated"], 
  function(dojo, empty, w, t) {
  
  dojo.declare(
    "app.views.EmptyTaskList", 
    [w, t], 
    {
      
      name: null,
      
      templateString : empty,
      
      id: null,
      
      emptyTitle: "",
      
      emptyDescription: "",
      
      observeHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        //console.debug("emptyTaskList", this);
       
      },
    
      baseClass: "tasklist"
  });
  return app.views.EmptyTaskList;     
});