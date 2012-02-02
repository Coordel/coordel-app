define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/Project/templates/project.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore",
  "app/views/PrimaryBoxes/PrimaryBoxes",
  "app/views/ProjectActionsMenu/ProjectActionsMenu",
  "dijit/TooltipDialog"], 
  function(dojo, coordel, html, w, t, db, pb, ActionsMenu) {
  
  dojo.declare(
    "app.widgets.Project", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      widgetsInTemplate: true,
      
      templateString: html,
      
      clearSelectionHandler: null,
      
      setSelectionHandler: null,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        var username = db.username(),
            self = this;
        //console.debug("project test", this.project.responsible);
        if (this.project.responsible === username){
          this.icon = "icon-owner-project";
        }
        
        if (this.project.substatus && this.project.substatus === "PENDING"){
          this.icon = "icon-owner-project-pending";
        }
        
        dojo.forEach(self.project.assignments, function(assign){
          if (assign.username === username && assign.role === "FOLLOWER"){
            //show the following icon
            self.icon = "icon-project-following";
          }
        });
        
        
      },
      
      showInvited: function(){
        //this function updates the icon to indicate that the project has unresolved invitations or invitations
        //that are declined or where users have left
        var self = this,
            username = db.username();
            
        //remove invite by default
        if (dojo.hasClass(self.projectIcon, "invite")){
          dojo.removeClass(self.projectIcon, "invite");
        }
        if (dojo.hasClass(self.projectIcon, "invite-error")){
          dojo.removeClass(self.projectIcon, "invite-error");
        }
           
        dojo.forEach(self.project.assignments, function(assign){

          
          if (self.project.responsible === username && 
              assign.status === "PROPOSED" || 
              assign.status === "INVITE" && assign.role !== "FOLLOWER" ||
              assign.status === "AMENDED"){
            //the project shows the invite icon while the project has roles that aren't accepted or in error
            //this helps the responsible keep track of what invitations they have sent in which projects
            //show the invite icon
            //console.debug("show invite", self.project.name);
            dojo.addClass(self.projectIcon, "invite");
          }
          
          if (self.project.responsible === username && assign.role !== "FOLLOWER" && assign.status === "DECLINED" || assign.status === "LEFT"){
            //the project shows a warning if the invited user declines or leaves the project
            //show the invite error icon
            //console.debug("show invite-error", self.project.name);
            dojo.addClass(self.projectIcon, "invite-error");
          }
        });
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var proj = this.project,
            self = this;
            
            
        //set the menu
        
        var menu = new ActionsMenu({
          project: self.project,
          username: db.username()
        }).placeAt(self.menuHolder);
        
           
        //console.debug("in Project postCreate", proj);
        
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        //this.setSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "setSelection");
        
        this.showInvited();
        
        //show the project
        dojo.connect(this.domNode, "onclick", function(evt){
  	      //console.debug("current",evt);
  	      pb.currentBox = "project";
  	      dojo.publish("coordel/primaryNavSelect", [ {name: "project", focus: "project", id: proj._id}]);
  	      dojo.addClass(self.domNode, "active selected");
  	    });
  	    
  	    //show the actions menu button when mousing over the project
  	    dojo.connect(this.domNode, "onmouseover", this, function(){
  	      dojo.removeClass(this.actionsMenu, "hidden");
  	    });
  	    
  	    //hide the actions menu button when mousing out of the project
  	    dojo.connect(this.domNode, "onmouseout", this, function(){
  	      dojo.addClass(this.actionsMenu, "hidden");
  	    });
  	    
  	    dojo.connect(this.actionsMenu, "onclick", this, function(evt){
  	      evt.stopPropagation();
  	    });
  	    
  	    dojo.connect(this.showProjectMenu, "onClick", this, function(evt){
  	      evt.stopPropagation();
  	    });
  	    
  	    self.watch("project", self.showInvited);

      },
      
      baseClass: "projectlist-item",
      
      icon: "icon-project",
      
      hiddenComments: [], // id of unseen comments, cleared when full stream or project viewed
      
      onStreamViewChange: function(){
        //subscribes to coordel/streamViewChange
        //highlights project affected if comment not viewable in stream (stream hidden, etc)
      },
      
      onChange: function(object){
        //subscribes to coordel/change
        
        //updates project name if change is update this project of this id
        
        //calls destroy if change is trash and this project id
        
        //adds hidden comment if of type comment and stream hidden
        
      },
      
      clearSelection: function(args){
        //console.debug("in clear selection", this.domNode);
        if (this.domNode){
          dojo.removeClass(this.domNode, "active selected");
          this.setSelection(args);
        }
        
      },
      
      setSelection: function(args){
        if (args.id === this.project._id){
          if (this.domNode){
            dojo.addClass(this.domNode, "active selected");
          }
        }
      }
  });
  return app.widgets.Project;     
});