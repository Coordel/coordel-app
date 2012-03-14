define("app/widgets/PositionDateTextBox", ["dojo", "dijit", "dijit/form/DateTextBox"], function(dojo, dijit) {

dojo.declare(
	"app.widgets.PositionDateTextBox",
	dijit.form.DateTextBox,
	{
		// summary:
		//		A DateTextBox specifically used in the TaskForm
		//
		//		Example:
		// |	new dijit.form.DateTextBox({value: new Date(2009, 0, 20)})
		//
		//		Example:
		// |	<input dojotype='dijit.form.DateTextBox' value='2009-01-20'>
		
		positionRef: null,
		
		taskFormField: "",
		
		baseForm: "task",
		
	  openDropDown: function(){
	    this.inherited(arguments);
	    
	    var aroundNode = this._aroundNode || this.domNode;
	    
	    var parentPos = dojo.position(aroundNode.parentNode);
	    
	    var thisPos = dojo.position(aroundNode, true);
	    
	    var query = "." + this.baseForm + "-" + this.taskFormField;
		  
		  var nodePos = dojo.position(dojo.query(query)[0]);
	  
	    //console.debug("position", parentPos, thisPos, query);
	    
	    //NOTE: this positioning works fine on safari and chrome, but is 
	    //off in firefox by 2px and opera by 1px
	    
	    //console.debug("date positions this, parent: " ,thisPos, parentPos);
	    
	    var myStyle = {
	      position: "absolute",
        left: (nodePos.x - parentPos.x + 3) + "px", // need to move left (negative number) and will result in getting 5, +3 gets it to 8px from the edge of the dropdown
        top: ((nodePos.y + nodePos.h) - (thisPos.y + thisPos.h) - 1) + "px",
        width: (nodePos.w - 16) + "px"
	    };
	    
	    dojo.style(this.dropDown.domNode, myStyle);
	    
	    dojo.addClass(this.dropDown.domNode, "ui-corner-bottom");
	  }
	}
);


return app.widgets.PositionDateTextBox;
});
