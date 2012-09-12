
define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/PrimaryFooterViews.html",
    "dijit/form/DropDownButton",
    "dijit/TooltipDialog"

    ], 
  function(dojo, coordel, w, t, html, dd, tip) {
  
  dojo.declare(
    "app.views.PrimaryFooterViews", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      clearSelectionHandler: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        dojo.connect(this.addProject, "onclick", this, function(){
          //console.debug("add a project");
          dojo.publish("coordel/addObject", [{object: "project"}]);
          this.showObjectMenu.closeDropDown();
        });
        
        dojo.connect(this.addContact, "onclick", this, function(){
          //console.debug("add a contact");
          dojo.publish("coordel/addObject", [{object: "contact"}]);
          this.showObjectMenu.closeDropDown();
        });
        
        dojo.connect(this.hideViews, "onclick", this, function(){
         dojo.publish("coordel/showPrimaryFooterViews", [{showViews:false}]);
        });
      
        dojo.connect(this.showAll, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("all");
  	    });
  	    
  	    dojo.connect(this.showSomeday, "onclick", this, function(evt){
  	      //console.debug("current",evt);
  	      this.setSelection("someday");
  	    });
  	    
  	    dojo.connect(this.showArchive, "onclick", this, function(evt){
  	      //console.debug("upcoming",evt);
  	      this.setSelection("archive");
  	    });
  	    
  	    dojo.connect(this.showDone, "onclick", this, function(evt){
  	      //console.debug("upcoming",evt);
  	      this.setSelection("done");
  	    });
        
      },

      setSelection: function(selection){
        //console.debug("in setSelection in PrimaryFooterViews", selection);
     
        this.currentBox = selection;
        dojo.publish("coordel/primaryNavSelect", [{focus:"other", name: selection, id:"", setSelection: true}]);
      
      },
      
      _clearSelection: function(selection, doSet){
        
        if (this.domNode){
          var boxes = dojo.query("ul.primary-boxes li", this.domNode);
          boxes.removeClass("selected active");
          //it might be that selection is cleared without a click of one of the primary boxes
          //this makes sure that selection is set to what was clicked if it doesn't match
          //console.log("testing _clear/set in primaryfooter", dojo.indexOf(["someday","archive","done","all"], selection)>-1);
          if (doSet && dojo.indexOf(["someday","archive","done","all"], selection)>-1){
              dojo.addClass(selection, "active selected");
          }
        }
      },
      
      clearSelection: function(args){
        //console.debug("clearSelection primaryfooterviews args", args);
        if (args.focus && args.focus !== ""){
          var selection = args.name;
          this._clearSelection(selection, args.setSelection);
        }
      },
    
      
      baseClass: "primary-footer-views"
  });
  return app.views.PrimaryFooterViews;     
});