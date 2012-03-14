define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/DeadlineDropDown.html",
    "dijit/_HasDropDown",
    "app/views/DeadlineForm/DeadlineForm"
    ], 
  function(dojo, coordel, w, t, html, h, DeadlineForm) {
  
  dojo.declare(
    "app.views.DeadlineDropDown", 
    [w, t, h], 
    {
      coordel: coordel,
      
      minMax: {},
      
      hasTime: false,
      
      placeHolder: "",
      
      value: null,
      
      templateString: html,
      
      focus: function(){
        //override the typical focus behavior
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.label.innerHTML = this.placeHolder;
        
        //close the dropdown when losing focus
        dojo.connect(this, "onBlur", this, function(){
          //console.debug("should close the roled dropdown");
          this.closeDropDown();
        });
        
        //console.log("constraints", this.constraints);

      },
      
      reset: function(){
        this.value = null;
        this.dropDown.date.reset();
        this.dropDown.time.reset();
      },
      
      onChange: function(){
        
      },
      
      setDropDown: function(obj){
        
        //console.log("setting dropdown", obj);
        
        this.object = obj;
  
        this.dropDown = new DeadlineForm({
  
        }).placeAt(this.dropDownContainer);
        
        //console.log("minMax", this.minMax);
        this.dropDown.date.set("constraints", this.minMax);
      
        
        dojo.connect(this.dropDown, "onSave", this, function(deadline){
          this.hasTime = this.dropDown.hasTime;
          this.set("value", deadline);
          this.onChange();
        });
        
        dojo.connect(this.dropDown.save, "onclick", this, function(){
          this.closeDropDown();
          this.dropDown.date.reset();
          this.dropDown.time.reset();
        });
        
        
        
      },
      
      setData: function(deadline){
        if (deadline){
          var vals = deadline.split("T");
          this.dropDown.date.set("value", vals[0]);
          this.dropDown.time.set("value", vals[1]);
        }
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
  		  
  		  this.dropDown.date.reset();
  		  this.dropDown.time.reset();
  		},

  	  openDropDown: function(){
  	    this.inherited(arguments);
  	    
  	    //console.debug("opening dropdown");

  	    var boxStyle = this._getPositionStyle(this);

  	    //console.debug("node", this.dropDown);
  	    
  	    dojo.style(this.dropDown.domNode, boxStyle);
  	    
  	    this.dropDown.date.focus();

  	  },
      
      baseClass: "project-form-roles"
  });
  return app.views.DeadlineDropDown;     
});