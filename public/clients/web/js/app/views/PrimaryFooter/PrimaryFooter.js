/*
NOTE: Activies may be very language specific depending on how verb/preposition combinations
are used or not used. If a translation is required. it's likely, that it will be necessary to 
create language specific activities in this component rather than using the nls as it is now
*/

define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/primaryFooter.html",
    "dijit/form/DropDownButton",
    "dijit/TooltipDialog"
    ], 
  function(dojo, coordel, w, t, html, dd, tip) {
  
  dojo.declare(
    "app.views.PrimaryFooter", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      postCreate: function(){
        this.inherited(arguments);
        
        dojo.connect(this.addProject, "onclick", this, function(){
          //console.debug("add a project");
          dojo.publish("coordel/addObject", [{object: "project"}]);
          this.showObjectMenu.closeDropDown();
        });
        
        dojo.connect(this.addContact, "onclick", this, function(){
          //console.debug("add a contact");
          dojo.publish("coordel/addObject", [{object: "contact"}]);
          this.showObjectMenu.closeDropDown();
        });
        
        
        dojo.connect(this.showViews, "onclick", this, function(){
          dojo.publish("coordel/showPrimaryFooterViews", [{showViews:true}]);
        });
        
      },
    
      
      baseClass: "primary-footer"
  });
  return app.views.PrimaryFooter;     
});