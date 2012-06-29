define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane",
  "dijit/layout/ContentPane"], function(dojo, dijit, coordel, bc, cpane, pane) {

  return {
    showLayout: function(){
      //get the containers
      var head = dijit.byId("mainLayoutHeaderCenter"),
          cont = dijit.byId("mainCenterContainer");

      //add the header control
      if (head.hasChildren()){
        head.destroyDescendants();
      }

     
      //clear the center
      if (cont.hasChildren()){
        cont.destroyDescendants();
      }

      //create a border control that will be divided into left and right columns
      //the right column will be the same width as the stream, by default
      //the left column will be the remaining width, and will contain the store
      var details = new bc({
        design: 'sidebar',
        id: "storeDetailsLayout",
        style: "width:100%;height:100%;padding:0;background:transparent"
       }).placeAt("mainCenterContainer");

      //left store
      var tasksCont = new bc({
        region: "center",
        id: "storeContainer",
        style:"padding: 0;background:transparent"

      }).placeAt(details);

      //main space for tasks grouped by current,blocked,deferred (private and delegated won't show)
      var tasksMain = new cpane({
        region: "center",
        id: "storeMain",
        style: "padding: 0;background:transparent"

      }).placeAt(tasksCont);
      
      details.startup();
      cont.resize();
    }
  };
});