define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/RoleDeliverable.html",
    "i18n!app/nls/coordel"
    ], 
  function(dojo, w, t, html, coordel) {
  
  dojo.declare(
    "app.views.RoleDeliverable", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      deliverable: null,
      
      postCreate: function(){
        this.inherited(arguments);
        //console.debug("created the deliverable");
        
        if (this.deliverable.name){
          this.name.innerHTML = this.deliverable.name;
        }
        
        if (this.deliverable.instructions){
          this.instructions.innerHTML = this.deliverable.instructions;
        }
      
        
      },
      
      baseClass: "role-deliverable"
  });
  return app.views.RoleDeliverable;     
});