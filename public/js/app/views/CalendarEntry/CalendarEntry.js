define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/CalendarEntry.html"
    ], 
  function(dojo, w, t, html) {
  
  dojo.declare(
    "app.views.CalendarEntry", 
    [w, t], 
    {
      
      templateString: html,
      
      entryId: null,
      
      name: "",
      
      type: "task",
      
      listFocus: "current",
      
      isProjectInvite: false,
      
      isTaskInvite: false, 
      
      connection: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        if (this.type === "project"){
          dojo.addClass(this.entry, "project");
        } else if (this.type === "task"){
          dojo.addClass(this.entry, "task");
        }
        
        if (this.isProjectInvite){
          dojo.addClass(this.entry, "project-invite");
        }
        
        if (this.isTaskInvite) {
           dojo.addClass(this.entry, "task-invite");
        }
        
        this.connection = dojo.connect(this.entry, "onclick", this , function(){
          dojo.publish("coordel/primaryNavSelect", [ {name: this.type, focus: this.listFocus, id: this.entryId}]);
        });
        
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.disconnect(this.connection);
        console.debug("entry disconnected and destroyed");
      },
    
      
      baseClass: "calendar-entry"
  });
  return app.views.CalendarEntry;     
});