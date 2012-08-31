define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/QuickSearch.html",
    "i18n!app/nls/coordel",
    "dijit/form/TextBox"
 
    ], 
  function(dojo, w, t, html, coordel) {
  
  dojo.declare(
    "app.views.QuickSearch", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      widgetsInTemplate: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        //handle quick enter 
        dojo.connect(this.search, "onKeyUp", this, function(evt){
          //console.debug("key pressed", evt.which);
          if (evt.which === 13){
            //so the search
            var val = this.search.get("value").trim();
            console.debug("search for this", val);
            if (val.length){
               self.onSearch(val);
            }
           
          }
        });
        
      },
      
      onSearch: function(query){
        
      },
      
      baseClass: "quick-search"
  });
  return app.views.QuickSearch;     
});