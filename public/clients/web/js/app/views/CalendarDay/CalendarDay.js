define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "i18n!app/nls/coordel",
    "text!./templates/CalendarDay.html",
    "app/views/CalendarEntry/CalendarEntry"
    ], 
  function(dojo, w, t, coordel, html, Entry) {
  
  dojo.declare(
    "app.views.CalendarDay", 
    [w, t], 
    {
      
      templateString: html,
      
      header: "",
      
      listFocus: "current",
      
      entries: [],
      
      postCreate: function(){
        this.inherited(arguments);
      
        if (this.header === coordel.timeline.overdue){
          //hide the header
          dojo.addClass(this.dayHeader, "hidden");
        }
        
        dojo.forEach(this.entries, function(e){
          var entry = new Entry({
            name: e.name,
            project: e.project,
            entryId: e.id,
            type: e.type,
            isBlocked: e.isBlocked,
            isTaskInvite: e.isTaskInvite,
            isProjectInvite: e.isProjectInvite,
            listFocus: this.listFocus
          }).placeAt(this.dayEntries);
        }, this);
        
      },
    
      baseClass: "calendar-day"
  });
  return app.views.CalendarDay;     
});