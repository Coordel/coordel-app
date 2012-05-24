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
      
      postMixInProperties: function(){
        this.inherited(arguments);
        //in case null values are passed in, make sure there is a string passed so the 
        //template doesn't bomb
        if (!this.emptyTitle){
          this.emptyTitle = "";
        }
        if (!this.emptyDescription){
          this.emptyDescription = "";
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        //console.debug("emptyTaskList", this);
       
      },
    
      baseClass: "tasklist"
  });
  return app.views.EmptyTaskList;     
});