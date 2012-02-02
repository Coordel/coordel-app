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
    "text!./templates/primaryHeader.html",
    "dojo/date/stamp",
    "app/util/dateFormat",
    "app/views/AddTaskButton/AddTaskButton",
    "app/views/DNDDialog/DNDDialog",
    "app/views/Contact/Contact",
    "app/widgets/ContainerPane",
    "dijit/form/Button"
    ], 
  function(dojo, coordel, w, t, html, stamp, dt, add, dialog, c, cp, button) {
  
  dojo.declare(
    "app.widgets.PrimaryHeader", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      postCreate: function(){
        this.inherited(arguments);
        
      },
    
      
      baseClass: "primary-header"
  });
  return app.widgets.PrimaryHeader;     
});