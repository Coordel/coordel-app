define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!app/layouts/templates/projDetailsRightHeader.html",
  "app/views/ProjDetailsHeader/ProjDetailsHeader",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane",
  "dijit/layout/ContentPane",
  "dijit/layout/StackContainer"], function(dojo, dijit, bn, coordel, prHtmlHead, pdh, bc, cpane, pane, stack) {
  //return an object to define the "./newmodule" module.
  return {
    showLayout: function(project){
      //show the taskDetails header
      var head = dijit.byId("mainLayoutHeaderCenter"),
          cont = dijit.byId("mainCenterContainer");

      //add the header control
      if (head.hasChildren()){
        head.destroyDescendants();
      }

      head.addChild(new pdh({project: project}));

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
        id: "projDetailsLayout",
        style: "width:100%;height:100%;padding:0",
        gutters: false
       }).placeAt("mainCenterContainer");
       
      var listBc = new bc({
         region: "center",
         id: "projTasksBorderContainer",
         style: "padding: 0; background: transparent; border:none;"
       }).placeAt(details);

      //left taskList and results
      var projTasksCont = new bc({
        region: "center",
        id: "projTasksContainer",
        style:"padding: 0"

      }).placeAt(listBc);
      
      var listHead = new pane({
        region: "top",
        id: "projTasksListHeader",
        style: "padding: 0;background: #eaeaea;"
      }).placeAt(listBc);

      //main space for tasks and task results
      //at the top, this will hold undone tasks, below, it will show the results of done tasks
      var projTasksMain = new cpane({
        region: "center",
        id: "projTasksMain",
        style: "padding: 0 0 1.8em 0; background: transparent;"

      }).placeAt(projTasksCont);

      //right stream and roles container
      var prContain = new bc({
        region: "right",
        design: "headline",
        style:"padding:0",
        id: "rightDetailsLayout"
      }).placeAt(details);
      
      //right column header
      var prHead = new pane({
        region: "top",
        style: "padding: 0",
        id: "prHead",
        content: dojo.string.substitute(prHtmlHead, coordel)
      }).placeAt(prContain);

      //right column stack 
      var prMain = new stack({
        region: "center",
        style:"padding:0",
        id: "prMain"
      }).placeAt(prContain);
      var info = new cpane({id: "projDetailsInfo", style: "padding: 0"});
      var roles = new cpane({id: "projDetailsRoles", style: "padding: 0"});
      var stream = new cpane({id: "projDetailsStream", style: "padding:0"});
      prMain.addChild(stream);
      prMain.addChild(info);
      prMain.addChild(roles);
      
      //right column footer
      var prFoot = new pane({
        region: "bottom",
        style: "padding:0",
        id: "prFooter",
        "class": "rightFooter",
        content: "<div>&nbsp;</div>"
      }).placeAt(prContain);

      details.startup();
      cont.resize();
    }
  };
});