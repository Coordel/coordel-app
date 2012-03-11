define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ProjectFormRoles.html",
    "dijit/_HasDropDown",
    "app/views/RoleForm/RoleForm",
    "app/models/ProjectModel",
    "app/models/CoordelStore",
    "app/views/ProjectFormPill/ProjectFormPill"
    ], 
  function(dojo,coordel, w, t, html, h, RoleForm, pModel, db, Pill) {
  
  dojo.declare(
    "app.views.ProjectFormRoles", 
    [w, t, h], 
    {
      coordel: coordel,
      
      project: null,
      
      isNew: true, 
      
      placeHolder: "",
      
      templateString: html,
      
      focus: function(){
        //override the typical focus behavior
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.roleLabel.innerHTML = this.placeHolder;
        
        //close the dropdown when losing focus
        dojo.connect(this, "onBlur", this, function(){
          //console.debug("should close the roled dropdown");
          this.closeDropDown();
        });

      },
      
      onChange: function(){
        
      },
      
      setDropDown: function(project){
        this.project = project;
        this.dropDown = new RoleForm({
          project: project
        }).placeAt(this.roleDropDown);
        
        dojo.connect(this.dropDown.save, "onclick", this, function(){
         var role = this.dropDown.role;
         console.debug("save clicked in role form", project, role);
          
          var roleName = this.dropDown.focusPoint.get("value"),
              username = this.dropDown.people.get("value"),
              p = new pModel({project: project, db:db});
          
          if (this.isNew){
            project = p.addAssignment(roleName, username, project);
            console.log("added assignment", roleName, username, project);
            this.onChange();
          } else {
            dojo.forEach(project.assignments, function(assign){
              if (assign.role === role.role){
                assign.username = username;
                assign.name = roleName;
                //console.debug("should update this role", assign);
                this.onChange();
              }
            }, this);
          }   
          
          //console.debug("project after addAssignment", project);
          this.closeDropDown();
          this.dropDown.reset();
          //this.showPills();
        });
        
        /*
        dojo.connect(this.dropDown, "onBlur", this, function(){
          console.debug("blur happened on dropdown");
          this.closeDropDown();
          this.dropDown.reset();
        });
        */
      },
      
      setData: function(){
        var self = this;
        //console.debug("setting role Data", self.project.assignments);
        if (self.project.assignments && self.project.assignments.length > 0){
          //console.debug("there are assignments");
          //self.showPills();
        } else {
          self.showNone();
        }
      },
      
      _getPositionStyle: function(parent){

  		  var query = ".project-roles";

  		  //get the position of the li containing this control
  		  var nodePos = dojo.position(dojo.query(query)[0]);

  		  var aroundNode = parent._aroundNode || parent.domNode;

  	    //get this parent's position
  	    var parentPos = dojo.position(aroundNode.parentNode);
  	    
  	    //console.debug("parent", parentPos);

  	    //get this position
  	    var thisPos = dojo.position(aroundNode);
  	    
  	    //console.debug("this", thisPos);

  		  var style = {
  	      position: "absolute",
          left: (nodePos.x - parentPos.x + 2) + "px", // need to move left (negative number) and will result in getting 5, +3 gets it to 8px from the edge of the dropdown
          top: ((nodePos.y + nodePos.h) - (thisPos.y + thisPos.h)) + "px",
          width: (nodePos.w - 16) + "px" //leaves 8px on each side
  	    };

  		  //console.debug("attachments position style", style);
  		  return style;
  		},
  		
  		closeDropDown: function(){
  		  this.inherited(arguments);
  		  this.dropDown.reset();
  		},

  	  openDropDown: function(){
  	    this.inherited(arguments);
  	    
  	    //console.debug("opening dropdown");

  	    var boxStyle = this._getPositionStyle(this);

  	    //console.debug("node", this.dropDown);

  	    dojo.addClass(this.dropDown.domNode, "task-form-dropdown ui-corner-bottom dijitMenu");
  	    
  	    dojo.style(this.dropDown.domNode, boxStyle);
  	    
  	    this.dropDown.focusPoint.focus();

  	  },
      
      baseClass: "project-form-roles"
  });
  return app.views.ProjectFormRoles;     
});