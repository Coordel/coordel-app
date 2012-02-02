define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!./templates/streamHeader.html",
  "dijit/_Widget", 
  "dijit/_Templated"], function(dojo, dijit, bn, coordel, html, w, t) {
  dojo.declare(
    "app.views.StreamHeader", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      userFullName: null,
      
      updateNotificationCountHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        //publish the button events
        this.updateNotificationsHandler = dojo.subscribe("coordel/updateNotificationCount", this, "updateNotificationCount");
        
        //hide the back button by default
        dojo.addClass(dijit.byId("backToStreamButton").domNode, "hidden");
        
        //wire up the delete button
        dojo.connect(this.backToStream, "onClick", this, function(){
          //console.debug("removing task", this.task);
          dojo.publish("coordel/updateStream", [{id:"", name:""}]);
          //make sure that if user had used the stream button in a task list that
    		  //the stream header goes back to normal when navigated
    		  dojo.addClass(dijit.byId("backToStreamButton").domNode, "hidden");
          dojo.removeClass(dijit.byId("filterStreamButton").domNode, "hidden");
        });
        
        this.updateNotificationCount();
        
      },
      
      updateNotificationCount: function(args){
        //console.debug("updateNotificationCount called");
        var count = args.count;
        var node = dijit.byId(this.showNotifications);
        if (count !== 0){
          node.set("iconClass", "coordelHeaderIcon coordelHeaderIconNotifyActive");
          node.set("label", count);
          node.set("showLabel", true);
        } else {
          node.set("iconClass", "coordelHeaderIcon coordelHeaderIconNotify");
          node.set("showLabel", false);
        } 
      }
  });
  return app.views.StreamHeader;    
}
);

