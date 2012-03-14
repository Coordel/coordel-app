define("app/widgets/PositionComboBox", ["dojo", "dijit", "dijit/form/ComboBox"], function(dojo, dijit) {

dojo.declare(
	"app.widgets.PositionComboBox",
	dijit.form.ComboBox,
	{
		// summary:
		//		A ComboBox specifically used in the TaskForm 
		
		
		positionRef: null,
		

	  openDropDown: function(){
	    this.inherited(arguments);
	    
	    var aroundNode = this._aroundNode || this.domNode;
	    
	    var parentPos = dojo.position(aroundNode.parentNode, true);
	    
	    var thisPos = dojo.position(aroundNode, true);
	  
	    //console.debug("position", parentPos, thisPos);
	    
	    var myStyle = {
	      position: "absolute",
	      left: (parentPos.x - thisPos.x + 8) + "px",
	      top: (thisPos.y - parentPos.y) + "px",
	      width: (parentPos.w - 16) + "px"
	    };
	    
	    dojo.style(this.dropDown.domNode, myStyle);
	  }
	}
);


return app.widgets.PositionComboBox;
});
