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
  "app/models/CoordelStore",
  "app/views/QuickSearch/QuickSearch"], function(dojo, dijit, bn, sort, coordel, html, w, t, c, tControl, tm,db) {
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
        
        dojo.connect(this.search, "onSearch", function(query){
           dojo.publish("coordel/primaryNavSelect", [{focus: "search", setSelection: false, search: query}]);
        });
        
       //views
        dojo.connect(this.showTasks, "onclick", this, function(){
          //dojo.publish("coordel/taskViewChange", [{view: "private"}]);
          //dojo.publish("coordel/primaryNavSelect", [{focus:"private", name: "", id:"", setSelection: true}]);
          this.setView("private");
        });

        dojo.connect(this.showSomeday, "onclick", this, function(){
          //dojo.publish("coordel/taskViewChange", [{view: "someday"}]);
          //dojo.publish("coordel/primaryNavSelect", [{focus:"private", name: "", id:"", setSelection: true}]);
          this.setView("someday");
        });
        
        dojo.connect(this.showArchive, "onclick", this, function(){
          //dojo.publish("coordel/taskViewChange", [{view: "archive"}]);
          //dojo.publish("coordel/primaryNavSelect", [{focus:"private", name: "", id:"", setSelection: true}]);
          this.setView("archive");
        });
        

      },
      
      setView: function(view){
        //console.log("view", view);
        switch (view) {
          case "private":
          dojo.addClass(this.showTasks, "selected");
          dojo.removeClass(this.showSomeday, "selected");
          dojo.removeClass(this.showArchive, "selected");
          break;
          case "someday":
          dojo.removeClass(this.showTasks, "selected");
          dojo.addClass(this.showSomeday, "selected");
          dojo.removeClass(this.showArchive, "selected");
          break;
          case "archive":
          dojo.removeClass(this.showTasks, "selected");
          dojo.removeClass(this.showSomeday, "selected");
          dojo.addClass(this.showArchive, "selected");
          break;
        }
      }
  });
  return app.views.TaskListHeader;    
}
);

