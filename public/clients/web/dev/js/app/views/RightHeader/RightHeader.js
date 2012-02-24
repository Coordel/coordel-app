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
    "text!./templates/rightHeader.html",
    "dojo/date/stamp",
    "app/util/dateFormat",
    'app/views/AddTaskButton/AddTaskButton',
    "app/views/DNDDialog/DNDDialog"
    ], 
  function(dojo, coordel, w, t, html, stamp, dt, add, dialog) {
  
  dojo.declare(
    "app.widgets.RightHeader", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      coordel: coordel,
      
      userFullName: null,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      updateNotificationCountHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        dojo.connect(this.showRight, "onClick", this, function(){
          //console.debug("showRight clicked");
          dojo.publish("coordel/showRightColumn", [true]);
          dojo.removeClass(dijit.byId("hideRightColumn").domNode, "hidden");
          dojo.addClass(dijit.byId("showRightColumn").domNode, "hidden");
        });
        
        dojo.connect(this.hideRight, "onClick", this, function(){
          //console.debug("hideRight clicked");
          dojo.publish("coordel/showRightColumn", [false]);
          dojo.addClass(dijit.byId("hideRightColumn").domNode, "hidden");
          dojo.removeClass(dijit.byId("showRightColumn").domNode, "hidden");
        });
        
        dojo.connect(this.optLogout, "onclick", this, function(){
          dijit.byId(this.coordelUserPreferences).closeDropDown();
          dojo.publish("coordel/logout");
        });
        
        //hide the do not disturb button 
        dojo.addClass(this.doNotDisturb, "hidden");
        
        dojo.connect(this.doNotDisturb, "onclick", this, function(){
          //do not disturb is on, click this to turn it off
          console.debug("onExecute fired in primary header");
          //clicking do not disturb off shows the stream and restarts alerts
          dojo.addClass(this.doNotDisturb, "hidden");
          dojo.removeClass(this.doNotDisturbOff, "hidden");
          dojo.removeClass(this.showNotifications, "hidden");
          dojo.publish("coordel/doNotDisturb", [false]);
        });
        
        dojo.connect(this.doNotDisturbOff, "onclick", this, function(){
          //do not disturb is off, click this to activate
          console.debug("onClick fired in primary header. showing dialog");
          var d = new dialog();
          dojo.connect(d, "onConfirm", this, "confirm");
          d.show();
        });
        
        //subscribe to notifications updates
        this.updateNotificationCountHandler = dojo.subscribe("coordel/updateNotificationCount", this, "updateNotificationCount");
      },
      
      updateNotificationCount: function(args){
        console.debug("updateNotificationCount called");
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
      },
      
      confirm: function(){
        //clicking do not disturb hides the stream and stops alerts
        dojo.removeClass(this.doNotDisturb, "hidden");
        dojo.addClass(this.doNotDisturbOff, "hidden");
        dojo.addClass(this.showNotifications, "hidden");
        dojo.publish("coordel/doNotDisturb", [true]);
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.unsubscribe(this.updateNotificationsHandler);
      },
      
      baseClass: "primary-header"
  });
  return app.widgets.RightHeader;     
});