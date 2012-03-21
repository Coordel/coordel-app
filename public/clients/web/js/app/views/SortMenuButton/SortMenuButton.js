define(
  ["dojo",
    "dijit",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/SortMenuButton.html",
    "dijit/TooltipDialog",
    "dijit/form/DropDownButton"
    ], 
  function(dojo,dijit,coordel, w, t, html, tip, drop) {
  
  dojo.declare(
    "app.views.SortMenuButton", 
    [w, t], 
    {
      
      id: null,
      sort: coordel.sort,
      //navSelectHandler: null,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      sortOptions: {
        attribute: "byCreated",
        grpTimeline: false,
        grpProject: false,
        grpUsername: false,
        optDescending: false,
        optShowChecklist: false
      },
      
      connections: [],
      
      postCreate: function(){
        this.inherited(arguments);
        var smb = this;
        //console.debug("in the SortMenuButton", this);
        
        //set the initial sort order
        //this._setSortOptions();
        
        //hide any sort attributes not relevant to current focus
        //this._setFocusAttributes();
        
        //disable non-relevant sort menu items
        
        //set connections
       
        var connections = this.connections;
        
        /*
        //all connections publish coordel/sortOptionChange with the options
        connections.push(dojo.connect(this.byTaskName, "onclick", function(evt){
  	      smb.setSortOptions({id: "byTaskName", value: "name", type: "attribute"});
  	    }));
  	    */
  	    
  	    connections.push(dojo.connect(this.byCreated, "onclick", function(evt){
  	      smb.setSortOptions({id: "byCreated", value: "created", type: "attribute"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.byUpdated, "onclick", function(evt){
  	      smb.setSortOptions({id: "byUpdated", value: "updated", type: "attribute"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.byDeadline, "onclick", function(evt){
  	      smb.setSortOptions({id: "byDeadline", value: "contextDeadline", type: "attribute"});
  	    }));
  	    
  	    /*
  	    connections.push(dojo.connect(this.byPriority, "onclick", function(evt){
  	      smb.setSortOptions({id: "byPriority", value: "priority", type: "attribute"});
  	    }));
  	    */
  	    
  	    connections.push(dojo.connect(this.grpTimeline, "onclick", function(evt){
  	      //if we're sorting by timeline, then only date attributes are allowed
  	      //if it's a non date attribute, default back to created
  	      if (smb.sortOptions.attribute === "byTaskName" || smb.sortOptions.attribute === "byPriority"){
  	        smb.setSortOptions({id: "byCreated", value: "created", type: "attribute"});
  	      }
  	      smb.setSortOptions({id: "grpTimeline", value: !smb.sortOptions.grpTimeline, type: "group"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.grpProject, "onclick", function(evt){
  	      smb._showAllAttributes();
  	      smb.setSortOptions({id: "grpProject", value: !smb.sortOptions.grpProject, type: "group"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.grpUsername, "onclick", function(evt){
  	      this._showAllAttributes();
  	      smb.setSortOptions({id: "grpUsername", value: !smb.sortOptions.grpUsername, type: "group"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.optDescending, "onclick", function(evt){
  	      smb.setSortOptions({id: "optDescending", value: !smb.sortOptions.optDescending , type: "option"});
  	    }));
  	    
  	    connections.push(dojo.connect(this.optShowChecklist, "onclick", function(evt){
  	      smb.setSortOptions({id: "optShowChecklist", value: !smb.sortOptions.optShowChecklist, type: "option"});
  	    }));
        
      },
      
      _showAllAttributes:function(){
        dojo.query(".sort-attribute").removeClass("hidden");
      },
      
      setSortOptions: function(options){
        //console.debug("in setSortOptions in SortMenuButtons", options);
        dojo.publish("coordel/sortChange", [options]);
        if (options.type === "option"){
          //handle an option
          this._updateSortOption(options.id, options.value);
        } else if (options.type === "attribute"){
          //otherwise, handle an attribute
          this._updateSortAttribute(options.id);
        } else if (options.type === "group"){
          this._updateSortGroup(options.id, options.value);
        }
      },
  
      _updateSortAttribute: function(id){
        //console.debug("setting attribute", id);
        this.sortOptions.attribute = id;
        dojo.query(".sort-attribute").removeClass("selected");
        dojo.addClass(this[id], "selected");
      },
      
      _updateSortOption: function(id, value){
        
        //console.debug("setting sort option, value: ", id, value);
        this.sortOptions[id] = value;
        
        dojo.removeClass(this[id],"selected");
        if (value){
          dojo.addClass(this[id],"selected");
        }
      
      },
      
      _updateSortGroup: function(id, value){
        //console.debug("updating group", id, value);
        //grouping is like attributes in that there can only be one selected
        //and like options in that each option can toggle on and off
        //reset the projects values and remove the selected class
        this.sortOptions.grpTimeline = false;
        this.sortOptions.grpProject = false;
        this.sortOptions.grpUsername = false;
        dojo.query(".group").removeClass("selected");
        
        //set the new value
        this.sortOptions[id] = value;
        //and set the selected class if it's on
        if (value){
          dojo.addClass(this[id], "selected");
        } 
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.connections.length > 0){
          dojo.forEach(this.connections, function(c){
            dojo.disconnect(c);
          }, this);
          this.connections = [];
        }
        
        //console.debug("connections disconnected");
      },
   
      baseClass: "header"
  });
  return app.views.SortMenuButton;     
});