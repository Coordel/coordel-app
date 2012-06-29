define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container",
    "app/views/Opportunity/Opportunity"], 
  function(dojo, coordel, w, t, c, Opportunity) {
  
  dojo.declare(
    "app.views.OpportunityList", 
    [w, t, c], 
    {
      
      name: null,
      
      templateString : '<div></div>',
      
      projects: [],
      
      widgetsInTemplate: true, 
      
      header: "",
      
      projectStatus: null,
 
      postCreate: function(){
        this.inherited(arguments);
   
        var self = this;
        //console.debug("db in TaskListGroup", db);
        //is this grouped
        self._showOpportunities();
      },
      
      _showOpportunities: function(){
        var self = this;
        
        if (self.projects.length > 0){
          //add the tasks
          self.projects.forEach(function(project){
            
            var item = new Opportunity({project:project});
          
        
    	      self.addChild(item);
    	    });
        } else {
          //hide this group
          self.hide();
        }
      },
      
      addOpportunity: function(project){
        var self = this, 
            item = new Opportunity({project:project});
            
        self.addChild(item);
      },
      
      //if the groups tasks go to zero, then we need to hide this group until it gets another task
      hide: function(){
        dojo.addClass(this.domNode, "hidden");
        this.isHidden = true;
      },
      
      //show the group because another task was added to it
      show: function(){
        dojo.removeClass(this.domNode, "hidden");
        this.isHidden = false;
      }
  });
  return app.views.OpportunityList;     
});