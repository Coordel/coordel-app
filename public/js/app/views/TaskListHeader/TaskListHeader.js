define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  'app/views/SortMenuButton/SortMenuButton',
  "i18n!app/nls/coordel",
  "text!./templates/taskListHeader.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dijit/_Container",
  "app/controllers/taskListControl",
  "app/models/TaskModel",
  "app/models/CoordelStore"], function(dojo, dijit, bn, sort, coordel, html, w, t, c, tControl, tm,db) {
  dojo.declare(
    "app.views.TaskListHeader", 
    [w, t, c], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      turboType: "taskList",
      
      listFocus: "current",
      
      coordel: coordel,
      
      sortButton: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var tlh = this;
        //publish the button events
        //there are three items, and want sort. buttons float right, so want to have this further
  	    //right than the rest of the buttons, so it needs to be first after the title span
        //var s = new sort({focus:focus}).placeAt(this.domNode, "last");
        
        this.sortButton = new sort({focus: focus}).placeAt(this.buttonContainer, "last");

      }
  });
  return app.views.TaskListHeader;    
}
);

