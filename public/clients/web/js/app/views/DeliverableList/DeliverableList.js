define(
  ["dojo",
    "i18n!app/nls/coordel",
    "app/views/ProjectDeliverable/ProjectDeliverable",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container"], 
  function(dojo, coordel, ProjectDeliverable, w, t, c) {
  
  dojo.declare(
    "app.views.DeliverableList", 
    [w, t, c], 
    {
      
      name: null,
      
      templateString : '<div><h3 class="listHeader" dojoAttachPoint="groupHeader"></h3></div>',
      
      tasks: [],
      
      isHidden: false,
      
      viewFocus: null,
      
      showProjectLabel: false,
      
      widgetsInTemplate: true, 
      
      header: "",
      
      projectStatus: null,
      
      showChecklist: false,
 
      postCreate: function(){
        this.inherited(arguments);
        this.groupHeader.innerHTML = this.header;
        var list = this,
            focus = this.focus,
            self = this;
        //is this grouped
        self._showList();
      },
      
      _showList: function(){
        var self = this,
            focus = this.focus;
            
        dojo.forEach(self.tasks, function(task){
          var d = new ProjectDeliverable({
            task: task
          });
          self.addChild(d);
        });
        
      }
  });
  return app.views.DeliverableList;     
});