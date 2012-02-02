define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
    "text!./templates/single.html",
    "text!./templates/multipart.html",
    "app/widgets/ContainerPane",
    "app/views/Deliverable/_deliverable",
    "app/models/DeliverableModel2"
    ], 
  function(dojo, coordel, w, t, c, single, multipart, cpane, _deliverable, dModel) {
  
  dojo.declare(
    "app.views.Deliverable", 
    [w, t, c, _deliverable], 
    {

      id: null,
      
      widgetsInTemplate: true,
      
      templateString: single, 
      
      postMixInProperties: function(){
        this.inherited(arguments);
        //if this is multipart, switch to the multipart template
        if (this.deliverable.multipart){
          this.templateString = multipart;
        }
        
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        dModel.deliverable = this.deliverable;
 
        if (dModel.isRequired()){
          dojo.removeClass(this.isRequired, "hidden");
          if (dModel.isReady()){
            dojo.addClass(this.isRequired, "ready");
          }
        }
        
        if (!dModel.hasInstructions()){
          dojo.addClass(this.hasInstructions, "hidden");
        }

      },
    
      baseClass: "deliverable"
  });
  return app.views.Deliverable;     
});