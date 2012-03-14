define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!app/layouts/templates/taskDetailsRightHeader.html",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane",
  "dijit/layout/ContentPane",
  "dijit/layout/StackContainer"], function(dojo, dijit, bn, coordel, cnHtmlHead, bc, cpane, pane, stack) {
  //return an object to define the "./newmodule" module.
  return {
    showLayout: function(focus, task, username, responsible) {
		  //console.debug ("in taskDetailsLayout", this);
		  this.task = task;
		  this.focus = focus;
		  this.username = username;
		  this.responsible = responsible;
		  var tdc = this;
		  
		  //show the taskDetails header
      var cont = dijit.byId("mainCenterContainer");
      
      //console.debug("header", head, head.hasChildren());
      
      //add the task details components
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }
      
      //create a border control that will be divided into left and right columns
      //the right column will be the same width as the stream, by default, and will contain
      //the checklist and notes
      //the left column will be the remaining width, and will contain the workspace, resources, and attachments
      var details = new bc({
        design: 'sidebar',
        id: "taskDetailsLayout",
        style: "width:100%;height:100%;padding:0; background-transparent;"
       }).placeAt("mainCenterContainer");
      
      //left workspace and resources container
      var wkspcCont = new bc({
        region: "center",
        id: "workspaceContainer",
        style:"padding: 0; background: transparent; border:none;"
        
      }).placeAt(details);
      
      //main workspace
      var wkspcMain = new cpane({
        region: "center",
        id: "workspaceMain",
        "class": "tasklist-titlepane",
        style: "padding: 0 0 1.8em 0; background: transparent;"

      }).placeAt(wkspcCont);
      
     
      
      //right checklist notes container
      var cnContain = new bc({
        region: "right",
        design: "headline",
        style:"padding:0",
        id: "rightDetailsLayout"
      }).placeAt(details);
      
      //checklist notes stack 
      var cnMain = new stack({
        region: "center",
        style:"padding:0",
        id: "cnMain"
      }).placeAt(cnContain);
      var checklist = new cpane({id: "taskDetailsChecklist", baseClass: "", style:"overflow-y:auto; overflow-x:hidden;padding: 0 0 1.8em 0"});
      var notes = new cpane({id: "taskDetailsNotes", baseClass: "", style:"overflow-y:auto; overflow-x:hidden;padding: 0 0 1.8em 0"});
      var stream = new cpane({id: "taskDetailsStream", baseClass: "", style:"overflow-y:auto; overflow-x:hidden;padding: 0 0 1.8em 0"});
      cnMain.addChild(checklist);
      cnMain.addChild(notes);
      cnMain.addChild(stream);
       
      //checklist notes header 
      var cnHead = new pane({
        region: "top",
        style: "padding: 0",
        content: dojo.string.substitute(cnHtmlHead, coordel)
      }).placeAt(cnContain);
      
      var cnFoot = new pane({
        region: "bottom",
        style: "padding:0",
        id: "cnFooter",
        content: "<div>&nbsp;</div>"
      }).placeAt(cnContain);
      
      details.startup();
      
      cont.resize();
		}
  };
});

