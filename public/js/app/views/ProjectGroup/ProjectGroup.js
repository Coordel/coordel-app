define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
    "i18n!app/nls/coordel",
    "text!./templates/ProjectGroup.html",
    "app/views/Project/Project"
    ], 
  function(dojo, w, t,c, coordel, html, Project) {
  
  dojo.declare(
    "app.views.ProjectGroup", 
    [w, t, c], 
    {
      
      templateString: html,
      
      projects: [],
      
      isHidden: false, 
      
      header: "",
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.groupHeader.innerHTML = this.header;
        var self = this;
        
        //console.debug("db in TaskListGroup", db);
        //is this grouped
        if (self.projects.length > 0){
          //add the tasks
          self.projects.forEach(function(proj){
          
    	      self.addChild(new Project({
              project: proj
            }));
    	    });
        } else {
          //hide this group
          this.hide();
        }
        
      },
      
      //if the groups projects go to zero, then we need to hide this group until it gets another project
      hide: function(){
        dojo.addClass(this.domNode, "hidden");
        this.isHidden = true;
      },

      //show the group because another project was added to it
      show: function(){
        dojo.removeClass(this.domNode, "hidden");
        this.isHidden = false;
      },
      
      baseClass: "ProjectGroup"
  });
  return app.views.ProjectGroup;     
});