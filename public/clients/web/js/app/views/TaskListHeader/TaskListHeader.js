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

        dojo.connect(this.search.search, "onFocus", this, function(e){
          console.log("focus", this.search);
          dojo.removeClass(this.domNode, "inverse");
        });

        dojo.connect(this.search.search, "onBlur", this, function(e){
          console.log('blur', this.search);
          dojo.addClass(this.domNode, "inverse");
        });


        
        dojo.connect(this.search, "onSearch", function(query){
           dojo.publish("coordel/primaryNavSelect", [{focus: "search", setSelection: false, search: query}]);
        });
        
      },
      
      setView: function(view){
        //console.log("view", view);
        
      }
      
  });
  return app.views.TaskListHeader;    
}
);

