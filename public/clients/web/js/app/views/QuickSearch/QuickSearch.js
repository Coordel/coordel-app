define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/QuickSearch.html",
    "dijit/form/TextBox"
    ], 
  function(dojo, w, t, html) {
  
  dojo.declare(
    "app.views.QuickSearch", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        
        //handle quick enter 
        dojo.connect(this.search, "onKeyUp", this, function(evt){
          //console.debug("key pressed", evt.which);
          if (evt.which === 13){
            //so the search
            //console.debug("search for this", this.search.get("value"));
            
          }
        });
        
      },
      
      baseClass: "quick-search"
  });
  return app.views.QuickSearch;     
});