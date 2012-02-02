define(["dojo"], function(dojo) {
  dojo.declare(
    "app.views.Deliverale._deliverable", 
    null, 
    {
      addField: function(field){
        console.debug("addField called in Deliverable", field);
        field.placeAt(this.fieldsContainer);
      }
  });
  return app.views.Deliverale._deliverable;    
});

