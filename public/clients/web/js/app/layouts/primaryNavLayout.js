define(['dojo', 
  'dijit',
  "i18n!app/nls/coordel",
  'dijit/layout/ContentPane', 
  'dijit/layout/BorderContainer',
  'dijit/layout/StackContainer',
  'app/views/AddTaskButton/AddTaskButton',
  'app/widgets/ContainerPane',
  "text!app/layouts/templates/otherListHeader.html",
  "text!app/layouts/templates/leftNavFooter.html"], function(
    dojo, dijit, coordel, pane, bc, stack, add, cpane, headHtml, footHtml) {

  return {
    showLayout: function(){
      
      var left = dijit.byId("leftLayout");
      
      //header
      var leftHead = new cpane({
         region: "top",
         "class": "mainLayoutHeader coordel-header",
         style: "background-color: #000",
         id: "leftNavHeader",
         splitter: false

       }).placeAt(left);
       
       leftHead.startup();
       
      //main
      var leftNavContainer = new bc({
        region: "center",
        splitter: false,
        design: "headline",
        id:"leftNavContainer"

      }).placeAt(left);

      //projects and contacts container
      var otherListNav = new bc({
        region:"center",
        splitter: false,
        style: "padding: 0px"
      }).placeAt(leftNavContainer);


      var pcHead = new pane({
        region: "top",
        style: "height: 3.6em",
        splitter: false,
        id: "otherListHeader",
        //href: 'js/app/layouts/templates/otherListHeader.html'
        content: dojo.string.substitute(headHtml, coordel)
      }).placeAt(otherListNav);
      
      pcHead.startup();

      var pcMain = new stack({
        region: "center",
        style:"padding:0",
        id: "otherListMain"
      }).placeAt(otherListNav);
      var projects = new cpane({id: "otherListProjects", style:"padding:0"});
      var contacts = new cpane({id: "otherListContacts", style:"padding:0"});
      var store = new cpane({id: "otherListStore", style:"padding:0"});
      pcMain.addChild(projects);
      pcMain.addChild(contacts);
      pcMain.addChild(store);
      
      projects.startup();
      contacts.startup();
      store.startup();
      pcMain.startup();

      //footer
      var pcFoot = new cpane({
        region: "bottom",
        splitter: false,
        id: "otherListFooter"
      }).placeAt(otherListNav);
      
      pcFoot.startup();
      
      otherListNav.startup();
      leftNavContainer.startup();
    }
  };
});

