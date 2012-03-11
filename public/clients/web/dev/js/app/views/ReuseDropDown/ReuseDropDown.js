define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ReuseDropDown.html",
    "dijit/_HasDropDown",
    "app/views/ReuseForm/ReuseForm"
    ], 
  function(dojo, coordel, w, t, html, h, ReuseForm) {
  
  dojo.declare(
    "app.views.ReuseDropDown", 
    [w, t, h], 
    {
      coordel: coordel,
      
      value: null,
      
      templateString: html,
      
      focus: function(){
        //override the typical focus behavior
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        //close the dropdown when losing focus
        dojo.connect(this, "onBlur", this, function(){
          //console.debug("should close the roled dropdown");
          this.closeDropDown();
        });

      },
      
      reset: function(){
        this.value = null;
        this.dropDown.blueprint.reset();
      },
      
      onChange: function(){
        
      },
      
      setDropDown: function(obj){
        
        
        //console.log("setting dropdown", obj);
        
        this.object = obj;
        var templateFilter = "tasks";
        if (obj.docType === "project"){
          templateFilter = "projects";
        }
  
        this.dropDown = new ReuseForm({
          templateFilter: templateFilter
  
        }).placeAt(this.dropDownContainer);
        
        dojo.connect(this.dropDown.save, "onclick", this, function(){
          //console.log("onclick", this.dropDown.blueprint.get("value"));
          this.onChange(this.dropDown.blueprint.get("value"));
          this.closeDropDown();
          this.dropDown.blueprint.reset();
        });
      },
      
      setData: function(template){
        //console.log("set DATA", template);
      },
      
      _getPositionStyle: function(parent){
    
  		  //get the position of the li containing this control
  		  //var nodePos = dojo.position(dojo.query(query)[0]);
  		  var nodePos = dojo.position(this._aroundNode);
  		  
  		  var aroundNode = this._aroundNode;

  	    //get this parent's position
  	    var parentPos = dojo.position(aroundNode.parentNode);
  	    
  	    //console.debug("parent", parentPos);

  	    //get this position
  	    var thisPos = dojo.position(aroundNode);
  	    
  	    //console.debug("this", thisPos);

  		  var style = {
  	      position: "absolute",
          left: (nodePos.x - parentPos.x + 7) + "px", // need to move left (negative number) and will result in getting 5, +3 gets it to 8px from the edge of the dropdown
          top: ((nodePos.y + nodePos.h) - (thisPos.y + thisPos.h)) + "px",
          width: (nodePos.w - 16) + "px" //leaves 8px on each side
  	    };

  		  //console.debug("attachments position style", style);
  		  return style;
  		},
  		
  		closeDropDown: function(){
  		  this.inherited(arguments);
  		  
  		  this.dropDown.blueprint.reset();
  		},

  	  openDropDown: function(){
  	    this.inherited(arguments);
  	    
  	    //console.debug("opening dropdown");

  	    var boxStyle = this._getPositionStyle(this);

  	    //console.debug("node", this.dropDown);
  	    
  	    dojo.style(this.dropDown.domNode, boxStyle);
  	    
  	    this.dropDown.blueprint.focus();

  	  },
      
      baseClass: "project-form-roles"
  });
  return app.views.ReuseDropDown;     
});