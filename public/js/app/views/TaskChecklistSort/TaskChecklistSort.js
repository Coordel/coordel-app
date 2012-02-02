define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/TaskChecklistSort.html",
    'i18n!app/nls/coordel'
    ], 
  function(dojo, w, t, html, coordel) {
  
  dojo.declare(
    "app.views.TaskChecklistSort", 
    [w, t], 
    {
      coordel: coordel,
      
      templateString: html,
      
      sortOptions: {
        attribute: "byCreated",
        optDescending: false,
        optShowDone: false
      },
      
      postCreate: function(){
        this.inherited(arguments);

       
        //all sort connections publish coordel/sortOptionChange with the options
        dojo.connect(this.byName, "onclick", this, function(evt){
  	      this.setSortOptions({id: "byName", value: "name", type: "attribute"});
  	    });
	      
  	    dojo.connect(this.byCreated, "onclick", this, function(evt){
  	      this.setSortOptions({id: "byCreated", value: "created", type: "attribute", grouped: false});
  	    });
	  
  	    dojo.connect(this.byDeadline, "onclick", this, function(evt){
  	      this.setSortOptions({id: "byDeadline", value: "deadline", type: "attribute", grouped: false});
  	    });
	    
  	    dojo.connect(this.optDescending, "onclick", this, function(evt){
  	      this.setSortOptions({id: "optDescending", value: !this.sortOptions.optDescending , type: "option"});
  	    });
	    
  	    dojo.connect(this.optShowDone, "onclick", this, function(evt){
  	      this.setSortOptions({id: "optShowDone", value: !this.sortOptions.optShowDone, type: "option"});
  	    });
      
      },
      
      setSortOptions: function(options){
        //console.debug("in setSortOptions", this.sortOptions, options);
        //dojo.publish("coordel/sortChange", [options]);
      
        if (options.type === "option"){
          //handle an option
          this._updateSortOption(options.id, options.value);
        } else if (options.type === "attribute"){
          //otherwise, handle an attribute
          this._updateSortAttribute(options.id);
        }
        dojo.publish("coordel/checklistSortChange", [options]);
      },
    
      _setSortOptions: function(){
        this._updateSortAttribute(this.sortOptions.attribute);
        this._updateSortOption("optDescending", this.sortOptions.optDescending);
        this._updateSortOption("optShowDone", this.sortOptions.optShowDone);
      },
    
      _updateSortAttribute: function(id){
        this.sortOptions.attribute = id;
        dojo.query(".sort-attribute", this.sortMenu).removeClass("selected");
        dojo.addClass(this[id], "selected");
      
        //console.debug("the attachpoint ", id, this[id]);
      
      },
    
      _updateSortOption: function(id, value){
      
        //console.debug("setting sort option, value: ", value);
        this.sortOptions[id] = value;
      
        dojo.removeClass(this[id],"selected", this.sortMenu);
        if (value){
          dojo.addClass(this[id],"selected", this.sortMenu);
        }
    
      }
      
   
      
      
  
  });
  return app.views.TaskChecklistSort;     
});