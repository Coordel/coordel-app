define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane",
  "dijit/layout/ContentPane"], function(dojo, dijit, bn, coordel, bc, cpane, pane) {

  return {
    showLayout: function(contact){
      //get the containers
      var head = dijit.byId("mainLayoutHeaderCenter"),
          cont = dijit.byId("mainCenterContainer");

      //add the header control
      if (head.hasChildren()){
        head.destroyDescendants();
      }

     
      //add the tasks
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }

      //create a border control that will be divided into left and right columns
      //the right column will be the same width as the stream, by default, and will contain
      //the contact's profile
      //the left column will be the remaining width, and will contain tasks users have in this user's projects
      var details = new bc({
        design: 'sidebar',
        id: "contactDetailsLayout",
        style: "width:100%;height:100%;padding:0;background:transparent"
       }).placeAt("mainCenterContainer");

      //left taskList by project
      var tasksCont = new bc({
        region: "center",
        id: "contactTasksContainer",
        style:"padding: 0;background:transparent"

      }).placeAt(details);

      //main space for tasks grouped by current,blocked,deferred (private and delegated won't show)
      var tasksMain = new cpane({
        region: "center",
        id: "contactTasksMain",
        style: "padding: 0;background:transparent"

      }).placeAt(tasksCont);
      
      //NOTE disabling profile for now. Need to enable it to show feedback, etc
      
      /*
      
      //right profile container
      var prContain = new bc({
        region: "right",
        design: "headline",
        style:"padding:0;background:transparent",
        id: "rightDetailsLayout"
      }).placeAt(details);

      //profile header 
      var prHead = new pane({
        region: "top",
        style: "padding: 0",
        content: "<div class='listHeader'>" + coordel.profile + "</div>"
      }).placeAt(prContain);
      
      //profile main
      var prMain = new cpane({
        region: "center",
        style: "padding: 0"
        
      }).placeAt(prContain);
      
      //profile footer
      var prFoot = new pane({
        region: "bottom",
        style: "padding:0",
        id: "prFooter",
        "class": "rightFooter",
        content: "<div>&nbsp;</div>"
      }).placeAt(prContain);
      */
      details.startup();
      cont.resize();
    }
  };
});