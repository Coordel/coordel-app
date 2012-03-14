define(['dojo',
  'dijit/layout/ContentPane', 
  'dijit/layout/BorderContainer',
  'dijit/layout/StackContainer',
  'app/widgets/ContainerPane'], function(dojo, pane, bc, stack, cpane) {
  //return an object to define the "./newmodule" module.
  return {
    showLayout: function(){
      //console.debug("showing main layout");
       var outer = new bc({
         design: 'sidebar', 
         id: "outerLayout"
       }).placeAt(dojo.body());
       
       //there are three main columns that will be divided into header and content
       var left = new bc({region:"left", design: "headline", splitter: false, id: "leftLayout"}).placeAt(outer);
       //var right = new bc({region:"right", design: "headine", splitter: true, id: "rightLayout"}).placeAt(outer);
       var center = new bc({region:"center", design: "headline", splitter: false, id: "centerLayout"}).placeAt(outer);
       
       //here is the container for the the main header.
       //the right will be the width of what right sides of controllers widths will be
       //the center will contain the main buttons of any controller
       //the right will contain the always available notifications button and user button
       var headCont = new bc({
         region: "top",
         design: "sidebar",
         style: "height: 3.6em;padding: 0",
         id: "mainLayoutHeaderContainer",
         splitter:false
       }).placeAt(center);
       
       //create the containers for the main header 
       //controllers will fill them with the proper buttons for the controller
       var centerHead = new cpane({
          region: "center",
          "class": "mainLayoutHeader coordel-header c-text-center",
          id: "mainLayoutHeaderCenter",
          style: "background-color: #000;overflow: hidden",
          splitter: false
        }).placeAt(headCont);
      
      var rightHead = new cpane({
        region: "right",
        style: "background-color: #000",
        "class": "mainLayoutHeader coordel-header c-text-center",
        id: "mainLayoutHeaderRight",
        splitter: false
      }).placeAt(headCont);
        
      //set up the container for the main center column
      //controllers will fill them with the proper headers and content
       var centerMain = new cpane({
         region: "center",
         style: "background-color: transparent",
         id: "mainCenterContainer",
         style: "padding: 0"
       }).placeAt(center);
  
      outer.startup();
       
      //console.debug("buildMainUI completed");
      return outer;
    }
 };
});

//Do setup work here

  //main layout - layout to which all other layouts get added left center right
  
  //main nav - layout of main four and lists nav (projects and contacts) (left main)
  
  //taskList - layout for main four (current, delegated, upcoming, private) (center of main)
  
  //projectList - layout for when a project is selected on the left (center of main)
  
  //turbo - layout to let a user gtd through a list (center of main)
  
  //stream - layout for messages and activities (right of main)
  
    //user = all stream entries for this user for this data
    
    //project = all entries for a project (selected task, selected project in list)
    
    //task = all entries for a task   
