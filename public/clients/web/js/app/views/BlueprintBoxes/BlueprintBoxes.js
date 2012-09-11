define(
  ["dojo","i18n!app/nls/coordel","text!app/views/BlueprintBoxes/templates/BlueprintBoxes.html","dijit/_Widget", "dijit/_Templated"], 
  function(dojo, coordel, html, w, t) {
  
  dojo.declare(
    "app.views.BlueprintBoxes", 
    [w, t], 
    {
      coordel: coordel,

      clearSelectionHandler: null,
      
      currentBox: null, 
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        //console.debug("in primary boxes postCreate", this.showCurrent);  
        
        dojo.connect(this.showTasks, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("task-blueprints");
  	    });
  	    dojo.connect(this.showProjects, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("project-blueprints");
  	    });
  	    
  	    dojo.connect(this.showDeliverables, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("deliverable-blueprints");
  	    });
  	    dojo.connect(this.showShared, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("shared-blueprints");
  	    });
      },
      
      setSelection: function(selection){
        //console.debug("in setSelection in PrimaryBoxes", selection);
     
        this.currentBox = selection;
        dojo.publish("coordel/primaryNavSelect", [{focus:selection, name: "", id:"", setSelection: true, searchBlueprint: false}]);
      
      },
      
      _clearSelection: function(selection, doSet){
        
        //console.debug("clearing selection", selection);
        //if (selection !== "search"){
          if (this.domNode){
            var boxes = dojo.query("ul.primary-boxes li", this.domNode);
            boxes.removeClass("selected active");
            //it might be that selection is cleared without a click of one of the primary boxes
            //this makes sure that selection is set to what was clicked if it doesn't match
            if (doSet && selection !=="search"){
              dojo.addClass(selection, "active selected");
            }
          }
        //}
        
    
      },
      
      clearSelection: function(args){
        //console.debug("clearSelection args", args);
        if (args.focus && args.focus !== ""){
          var selection = args.focus;
          this._clearSelection(selection, args.setSelection);
        }
      }
  });
  return app.views.BlueprintBoxes;     
});