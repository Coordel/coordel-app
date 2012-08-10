define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/CalendarEntry.html",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore"
    ], 
  function(dojo, w, t, html, coordel, db) {
  
  dojo.declare(
    "app.views.CalendarEntry", 
    [w, t], 
    {
      
      templateString: html,
      
      entryId: null,
      
      name: "",
      
      project: "",
      
      type: "task",
      
      listFocus: "current",
      
      isProjectInvite: false,
      
      isFollowInvite: false,
      
      isTaskInvite: false, 
      
      connection: null,
      
      taskNotifyHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        if (this.type === "project"){
          if (this.isProjectInvite && this.isFollowInvite){
            dojo.addClass(this.entry, "follow");
            dojo.addClass(this.entry, "follow-invite");
          } else if (this.isProjectInvite && !this.isFollowInvite) {
           
            dojo.addClass(this.entry, "project");
            dojo.addClass(this.entry, "project-invite");
          
          } else if (this.isFollowInvite && !this.isProjectInvite){
            
            dojo.addClass(this.entry, "follow");
            
          } else if (!this.isProjectInvite && !this.isFollowInvite){
             dojo.addClass(this.entry, "project");
          }
          
        } else if (this.type === "task"){
          dojo.addClass(this.entry, "task");
          if (this.isBlocked){
            dojo.addClass(this.entry, "blocked");
            this.entry.title = coordel.blocked;
          }
          
          if (this.isIssue){
            dojo.addClass(this.entry, "issue");
            this.entry.title = coordel.issue;
          }
        }
        
        if (this.project && this.project !== ""){
          dojo.removeClass(this.projectName, "hidden");
          this.projectName.innerHTML = this.project + " : ";
        }
        
        //console.log("isTaskInvite", this.isTaskInvite);
        if (this.isTaskInvite) {
           dojo.addClass(this.entry, "task-invite");
        }
        
        this.connection = dojo.connect(this.entry, "onclick", this , function(){
          dojo.publish("coordel/primaryNavSelect", [ {name: this.type, focus: this.listFocus, id: this.entryId}]);
        });
        
        this.taskNotifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
        
      },
      
      handleTaskNotify: function(args){
        
        var task = args.task;
        var block = false;
        var issue = false;
        var self = this;
        if (task.blocking && task.blocking.length > 0){
          block = dojo.some(task.blocking, function(id){
            return (id === self.entryId);
          });
          if (block){
            var t = db.getTaskModel(self.entryId, false);
            dojo.when(t, function(){
              if (t.isBlocked()){
                dojo.addClass(self.entry, "blocked");
                //console.log("calendar entry is blocked", args.task);
              } else {
                dojo.removeClass(self.entry, "blocked");
                self.entry.title = "";
                //console.log("calendar entry not blocked", args.task);
              }
            });
          }
        }
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.disconnect(this.connection);
        dojo.unsubscribe(this.taskNotifyHandler);
      },
    
      
      baseClass: "calendar-entry"
  });
  return app.views.CalendarEntry;     
});