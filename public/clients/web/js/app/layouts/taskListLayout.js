define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "text!app/layouts/templates/streamHeader.html",
  "text!app/layouts/templates/taskListContainer.html",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane",
  "dijit/layout/ContentPane",
  "dijit/layout/StackContainer"], function(dojo, dijit, coordel, streamHtmlHead, listHtml, bc, cpane, pane, stack) {
  //return an object to define the "./newmodule" module.
  return {
    showLayout: function(focus, task) {
		  //console.debug ("in taskDetailsLayout", this);
		  this.task = task;
		  this.focus = focus;
		  var tdc = this;
		  
		  //show the taskDetails header
      var head = dijit.byId("mainLayoutHeaderCenter"),
          cont = dijit.byId("mainCenterContainer");
      
      //console.debug("header", head, head.hasChildren());
      
      //add the header control
      if (head.hasChildren()){
        head.destroyDescendants();
      }
      
      //add the task details components
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      
      //create a border control that will be divided into left and right columns
      //the right column will contain the full stream messages and activity
      //the left column will be the remaining width, and will contain the task list
      var list = new bc({
        design: 'sidebar',
        id: "taskListLayout",
        style: "width:100%;height:100%;padding:0; background-transparent;"
       }).placeAt("mainCenterContainer");
      
      //main layout container
      var listCont = new bc({
        region: "center",
        id: "taskListContainer",
        style:"padding: 0; background: transparent; border:none;"
        
      }).placeAt(list);
      
      var listHead = new pane({
        region: "top",
        id: "taskListHeader",
        style: "padding: 0;background: #eaeaea;"
      }).placeAt(listCont);
      
      //main workspace
      var listMain = new pane({
        region: "center",
        content: listHtml,
        style: "padding: 0 0 1.8em 0; background: transparent;" 
      }).placeAt(listCont);
      
     
      //right messages and all activity container
      var tabsContain = new bc({
        region: "right",
        design: "headline",
        id: "rightListTabsLayout"
      }).placeAt(listCont);
    
      //stream stack and turbo
      var streamMain = new stack({
        region: "center",
        style:"padding:0",
        id: "streamContainer"
      }).placeAt(tabsContain);
      //stack pane for messages
      var cal = new cpane({id: "deadlineCalendar", style:"padding:0"});
      //stack pane for messages
      var messages = new cpane({id: "streamMessages"});
      //stack pane for activity
      var allActivity = new cpane({id: "streamActivity"});
      //stack pane for turbo
      var turbo = new cpane({id: "taskListTurbo", style:"padding:0"});
      streamMain.addChild(messages);
      streamMain.addChild(allActivity);
      streamMain.addChild(cal);
      streamMain.addChild(turbo);
      
      //stream header 
      var streamHead = new pane({
        region: "top",
        style: "padding: 0",
        id: "streamHeader",
        content: dojo.string.substitute(streamHtmlHead, coordel)
      }).placeAt(tabsContain);
      
      //stream footer
      var streamFoot = new pane({
        region: "bottom",
        style: "padding:0",
        id: "streamFooter",
        content: "<div>&nbsp;</div>"
      }).placeAt(tabsContain);
      
      list.startup();
      
      cont.resize();
		}
  };
});