define(
  ["dojo","i18n!app/nls/coordel","text!app/views/PrimaryBoxes/templates/primary-boxes.html","dijit/_Widget", "dijit/_Templated"], 
  function(dojo, coordel, html, w, t) {
  
  dojo.declare(
    "app.views.PrimaryBoxes", 
    [w, t], 
    {
      coordel: coordel,
      tasks: coordel.tasks,
      clearSelectionHandler: null,
      
      currentBox: null, 
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        //console.debug("in primary boxes postCreate", this.showCurrent);  
        
        dojo.connect(this.showCurrent, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("current");
  	    });
  	    dojo.connect(this.showInvited, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("invited");
  	    });
  	    dojo.connect(this.showBlocked, "onclick", this, function(evt){
  	      //console.debug("upcoming",evt);
  	      this.setSelection("blocked");
  	    });
  	    dojo.connect(this.showDeferred, "onclick", this, function(evt){
  	      //console.debug("upcoming",evt);
  	      this.setSelection("deferred");
  	    });
  	    dojo.connect(this.showDelegated, "onclick", this, function(evt){
  	      //console.debug("delegated",evt);
  	      this.setSelection("delegated");
  	    });
  	    
  	    dojo.connect(this.showPrivate, "onclick", this, function(evt){
  	      //console.debug("private",evt);
  	      this.setSelection("private");
  	    });
  	    
  	    dojo.connect(this.showOpportunities, "onclick", this, function(evt){
  	      //console.debug("private",evt);
  	      this.setSelection("opportunities");
  	    });
  	    
  	    dojo.connect(this.showTaskInvited, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("task-invited");
  	    });
  	    
  	    dojo.connect(this.showProjectInvited, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("project-invited");
  	    });
      },
      
      setSelection: function(selection){
        //console.debug("in setSelection in PrimaryBoxes", selection);
     
        this.currentBox = selection;
        dojo.publish("coordel/primaryNavSelect", [{focus:selection, name: "", id:"", setSelection: true}]);
      
      },
      
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
      
      clearSelection: function(args){
        //console.debug("clearSelection args", args);
        if (args.focus && args.focus !== ""){
          var selection = args.focus;
          this._clearSelection(selection, args.setSelection);
        }
      },
      
      hideInvitations: function(){
        dojo.addClass(this.invitations, "hidden");
        dojo.addClass(this.showTaskInvited, "hidden");
        dojo.addClass(this.showProjectInvited, "hidden");
      },
      
      
      showInvitations: function(options){
        dojo.removeClass(this.invitations, "hidden");
        dojo.removeClass(this.showTaskInvited, "hidden");
        dojo.removeClass(this.showProjectInvited, "hidden");
        if (options){
          if (!options.tasks){
            dojo.addClass(this.showTaskInvited, "hidden");
          }

          if (!options.projects){
            dojo.addClass(this.showProjectInvited, "hidden");
          } 
        }
      }
  });
  return app.views.PrimaryBoxes;     
});