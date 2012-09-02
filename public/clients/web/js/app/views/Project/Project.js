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
    "app.views.Project", 
    [w, t], 
    {
      
      name: null,
      
      menuOpen: false,
      
      id: null,
      
      widgetsInTemplate: true,
      
      connections: [],
      
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
          
          if (this.project.substatus === "OPPORTUNITY"){
            //console.debug("set to icon-owner-project-opportunity", this.project.substatus);
            this.icon = "icon-owner-project-opportunity";
          }
        } else {
          dojo.forEach(self.project.assignments, function(assign){
            if (assign.username === username && assign.role === "FOLLOWER"){
              //show the following icon
              self.icon = "icon-project-following";
              if (self.project.substatus === "OPPORTUNITY"){
                self.icon = "icon-project-opportunity-following";
              }
            } 
          });
        }
        
        if (this.project.substatus && this.project.substatus === "PENDING"){
          this.icon = "icon-owner-project-pending";
        }

        if (self.project.substatus && self.project.substatus === "DONE"){
          self.icon = "icon-project-done";
        }
        
        if (self.project.substatus && self.project.substatus === "CANCELLED"){
          self.icon = "icon-project-cancelled";
        }
 
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
        
        if (self.project.substatus !== "DONE" && self.project.substatus !== "CANCELLED"){
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
        }
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
 
        //show the project
        dojo.connect(self.domNode, "onclick", function(evt){
  	      //console.debug("project selected", proj._id);
  	      pb.currentBox = "project";
  	      dojo.publish("coordel/primaryNavSelect", [ {name: "project", focus: "project", id: proj._id}]);
  	    });
  	    
  	    dojo.connect(self.domNode, "ondblclick", function(evt){
  	      evt.stopPropagation();
  	      dojo.publish("coordel/editProject", [{project: proj}]);
  	    });
  	    
  	    //show the actions menu button when mousing over the project
  	    dojo.connect(self.domNode, "onmouseover", this, function(){
  	      dojo.removeClass(self.actionsMenu, "hidden");
  	    });
  	    
  	    //hide the actions menu button when mousing out of the project
  	    dojo.connect(self.domNode, "onmouseout", this, function(){
  	      if (self.actionsMenu && !self.menuOpen){
  	        dojo.addClass(self.actionsMenu, "hidden");
  	      }
  	    });
  	    
  	    dojo.connect(self.projActionDialog, "onOpen", this, function(){
  	      //console.log("onOpen");
  	      self.menuOpen = true;
  	      dojo.addClass(self.actionsMenu, "opaque");
  	    });
  	    
  	    dojo.connect(self.projActionDialog, "onClose", this, function(){
    	    //console.log("onClose");
    	    dojo.addClass(self.actionsMenu, "hidden");
    	    dojo.removeClass(self.actionsMenu, "opaque");
    	    self.menuOpen = false;
    	  });
  	    
  	    dojo.connect(self.actionsMenu, "onclick", this, function(evt){
  	      evt.stopPropagation();
  	    });
  	    
  	    dojo.connect(self.showProjectMenu, "onClick", this, function(evt){
  	      evt.stopPropagation();
  	    });
  	    
  	    self.watch("project", self.showInvited);
  	    
        self.showInvited();
        
        self.setSelection();
        
        self.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");

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
      
      /*
      _clearSelection: function(selection, doSet){
        
        //console.debug("clearing selection", selection);
        if (this.domNode){
          var boxes = dojo.query("ul.primary-boxes li", this.domNode);
          boxes.removeClass("selected active");
          //it might be that selection is cleared without a click of one of the primary boxes
          //this makes sure that selection is set to what was clicked if it doesn't match
          if (doSet){
            dojo.addClass(selection, "active selected");
          }
        }
    
      },
      */
      
      clearSelection: function(args){
        var self = this;

          //console.debug("in clear project selection", args, self.project._id, self.domNode);

          if (self.domNode){
            self.currentArgs = args;
            dojo.removeClass(self.domNode, "active selected");
          }
      
      },
 
      
      setSelection: function(){
        var self = this;
        if (self.domNode && self.currentArgs.focus === "project" && self.currentArgs.id === self.project._id){
          /*
          console.log("setting project selection", self.currentArgs, self.project._id);
          dojo.addClass(self.domNode, "active selected");
          console.log("project should be active", self.project._id, self.currentArgs);
          */
        }
        
        if (self.domNode && self.currentArgs.id == self.project._id){
          //console.log("setting project selection", self.currentArgs, self.project._id);
          dojo.addClass(self.domNode, "active selected");
          //console.log("project should be active", self.project._id, self.currentArgs);
        }
        
        //console.log("args", self.currentArgs, self.project.id);
      },
      
      destroy: function(args){
        this.inherited(arguments);
        
        var self = this;
        dojo.unsubscribe(this.clearSelectionHandler);
        if (self.connections.length > 0){
          dojo.forEach(self.connections, function(con){
            dojo.disconnect(con);
          });
        }
      }
  });
  return app.views.Project;     
});