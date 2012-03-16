define(
  ["dojo",
    "text!./templates/EmptyProject.html",
    "dijit/_Widget", 
    "dijit/_Templated"], 
  function(dojo, empty, w, t) {
  
  dojo.declare(
    "app.views.EmptyProject", 
    [w, t], 
    {
      
      name: null,
      
      templateString : empty,
      
      id: null,
      
      imageCss: "project-tasks",
      
      observeHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        //console.debug("emptyProjectList", this);
       
      },
    
      baseClass: "tasklist"
  });
  return app.views.EmptyProject;     
});