define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/StreamEntry.html",
    "app/models/CoordelStore",
    "app/widgets/ContainerPane"
    ], 
  function(dojo, w, t, html, db) {
  
  dojo.declare(
    "app.views.StreamEntry", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      showProject: false,
      
      username: null, //this is the username all the activities and messages contained in this entry
      
      project: null, //this is the projectid of all the activities and messages contained in this entry
      
      projectName: null, //project name of all acts and msgs in the entry
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        if (!self.projectName){
          self.projectName = "";
          //console.log("project not found in StreamEntry", self);
        }
        
        if (!self.contact){
          console.log("contact not found in StreamEntry", self);
        }
        
        self.projectLink.innerHTML = self.projectName;
        self.contactLink.innerHTML = self.contact;
        
        self._showProject(self.showProject);
        
        //if the user clicks the project link, show the project 
        var pLink = dojo.connect(this.projectLink, "onclick", this, function(){
  	      //console.debug("showProject", this.project);
  	      
  	    });
  	    
  	    //if the user clicks the user link, show the contact
        dojo.connect(this.contactLink, "onclick", this, function(evt){
          //console.debug("contact clicked", evt);
  	      dojo.publish("coordel/primaryNavSelect", [ {name: "contact", id: this.username}]);
  	    });
  	    
  	    
  	    //don't allow navigation if this is a delgated project
  	    var p = db.projectStore.store.get(this.project);
  	    dojo.when(p, function(){
  	      if (p.isMyDelegated){
  	        dojo.disconnect(pLink);
  	        dojo.removeClass(self.projectLink, "entry-project");
  	        dojo.style(self.projectLink, "cursor", "default");
  	      }
  	    });
        
      },
      
      addChild: function(child){
        //add this function to add activities and messages to the stream entry
        child.placeAt(this.children);
        //this.children.addChild(child);
      },
      
      _showProject: function(isShowing){
        
        dojo.addClass(this.projectLink, "hidden");
        if (isShowing){
          dojo.removeClass(this.projectLink, "hidden");
        }
      },
      
      baseClass: "stream-entry"
  });
  return app.views.StreamEntry;     
});