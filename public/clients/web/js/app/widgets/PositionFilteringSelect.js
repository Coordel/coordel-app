define("app/widgets/PositionFilteringSelect", 
["dojo", 
  "dijit", 
  "app/views/TaskFormSelect/TaskFormSelect",
  "app/views/TaskFormAdd/TaskFormAdd",
  "dojo/date/stamp",
  "dojo/date",
  "dijit/form/FilteringSelect"
  ], function(dojo, dijit, TaskFormSelect, TaskFormAdd, stamp, date) {

dojo.declare(
	"app.widgets.PositionFilteringSelect",
	dijit.form.FilteringSelect,
	{
		// summary:
		//		A ComboBox specifically used in the TaskForm 
		
		showAddButton: false,
		
		//status can be "select" (showing the list), "none" (nothing to show based on what was typed),
		//and "add" (in the add form for the field)
		_status: "select",
		
		addButtonText: "Add",
		
		isEditing: false,
		
		baseForm: "task",
		
		taskFormField: "",
		
		altDropDown: null,
		
		positionRef: null,   
		
		_getPositionStyle: function(parent){
		  
		 
		  
		  var query = "." + this.baseForm + "-"+this.taskFormField;
		  
		   
		   
		  var li = dojo.query(query);
		  
		  
		  //this seems to fail when not in the upper right corner, give a little time to make sure all is
		  
		  
		  
		  //get the position of the li containing this control
		  var nodePos = dojo.position(li[0], true);
		  
		  var aroundNode = parent.domNode;
		  
		  //console.debug("parent in _getPositionStyle", parent, li, li[0], parent._aroundNode, parent.domNode);
		  
	    //get this parent's position
	    var parentPos = dojo.position(aroundNode.parentNode);
	    
	    //get this position
	    var thisPos = dojo.position(aroundNode);
	  
		  var style = {
	      position: "absolute",
        left: (nodePos.x - parentPos.x + 3) + "px", // need to move left (negative number) and will result in getting 5, +3 gets it to 8px from the edge of the dropdown
        top: ((nodePos.y + nodePos.h) - (thisPos.y + thisPos.h)) + "px",
        width: (nodePos.w - 16) + "px" //leaves 8px on each side
	    };
	    
		  //console.debug("position style", style);
		  return style;
		},
		
	  openDropDown: function(){
	    this.inherited(arguments);
	    
	    var boxStyle = this._getPositionStyle(this);
	    
	    dojo.style(this.dropDown.domNode, boxStyle);
	    
	    //console.debug("node", this.dropDown);
	    
	    dojo.addClass(this.dropDown.domNode, "task-form-dropdown ui-corner-bottom dijitMenu");
	  
	  },
	  
    _addProject: function(){
      
      //this function gathers up the the values of the project into an object and then triggers the
      //onAddOption function
      
      var project = {};
      project.name = this.altDropDown.projectName.get("value");
      project.purpose = this.altDropDown.projectPurpose.get("value");
      
      //get deadline. if there isn't one, set to to three days from now. Most times,
      //there should be a dealine. this is a safety net
      var deadline = this.altDropDown.projectDeadline.get("displayedValue");
      if (!deadline || deadline === ""){
        project.deadline = stamp.toISOString(date.add(new Date(), "day", 3), {selector: "date"});
      } else {
        project.deadline = deadline;
      }
      
      
      this.onAddOption(project);
      
    },
    
    _addDeliverable: function(itemId){
      //the settings container's first child is the settings control and it has access to the deliverable
      var del = this.altDropDown.settingsContainer.getChildren()[0].getDeliverable();
      
      //need to set the date this deliverable was updated so we can track changes
      var t = stamp.toISOString(new Date(),{milliseconds:true});
      del.updated = t;
      
      if (this.isEditing){
        this.onEditOption(del);
      } else {
        //add the create date to the deliverable
        del.created = t;
        
        this.onAddOption(del);
      } 
    },
    
    _addBlocker: function(){
      var duration = {};
      
      duration.number = this.altDropDown.durNumber.get("value");
      duration.unit = this.altDropDown.durationChoices.get("value");
      
      //console.log("adding duration", duration);
      
      this.onAddOption(duration);
    },
    
    _addContact: function(){
      
      var contact = {},
          name = this.altDropDown.contactName.get("value").split(" ");
      
      contact.email = this.altDropDown.contactEmail.get("value");

      contact.firstName = name[0];
      contact.lastName = name[1];
      
      this.onAddOption(contact);
      
    },
    
    onAddOption: function(obj){
      //console.debug("onAddOption called in PFS", obj);
      this.onChange();
      //the taskForm can connect to this event to handle doing the work it needs to do
    },
    
    onAdd: function(){
      
    },
	  
	  openAltDropDown: function(alt, itemId){
	    //alt can be either "none" or "add"
	    if (alt === "none"){
	      //console.debug("alt === none");
	      //since it's none, then get a select and register the click event of the "Add" button
	      this.altDropDown = new TaskFormSelect({
	        fieldFocus: this.taskFormField,
	        showAddButton: this.showAddButton
	      });
	      
	      dojo.connect(this.altDropDown.addFieldValue, "onclick", this, function(){
	        //console.debug("add clicked in openAltDropDown");
	        this.onAdd(this.taskFormField);
	        this.closeAltDropDown();
	        this.openAltDropDown("add");
	      });
	      
	    } else if (alt === "add"){
	      this.altDropDown = new TaskFormAdd({
	        fieldFocus: this.taskFormField
	      });
	      
	      dojo.connect(this.altDropDown.saveFieldValue, "onclick", this, function(){
	        //console.debug("save clicked in openAltDropDown", this);
	        //save according to the taskFormField
	        this._status = "saved";
	        switch(this.taskFormField){
	          case "project":
	          this._addProject();
	          break;
	          case "blockers":
	          this._addBlocker();
	          break;
	          case "delegate":
	          this._addContact();
	          break;
	          case "responsible":
	          this._addContact();
	          break;
	          case "people":
	          this._addContact();
	          break;
	          case "deliverables":
	          this._addDeliverable();
	          break;
	        }
	        //since the pill is in focus on edit, we don't get the onchange event. it will get called
	        //twice when not in edit mode, but it doesn't hurt;
	        this.onChange();
	        this.forceClose(true);
	        this.focus();
	      });
	    }
	    
	    var dropDown = this.altDropDown,
				ddNode = dropDown.domNode,
				aroundNode = this._aroundNode || this.domNode,
				self = this;
				
				this._altOpened = true;
      
        // Prepare our popup's height and honor maxHeight if it exists.

  			// TODO: isn't maxHeight dependent on the return value from dijit.popup.open(),
  			// ie, dependent on how much space is available (BK)
  			
  			dijit.popup.moveOffScreen(dropDown);

  			
  		  var boxStyle = this._getPositionStyle(this);
  	    dojo.style(dropDown.domNode, boxStyle);
  	    

		
			var retVal = dijit.popup.open({
				parent: this,
				popup: dropDown,
				around: aroundNode,
				orient: dijit.getPopupAroundAlignment((this.dropDownPosition && this.dropDownPosition.length) ? this.dropDownPosition : ["below"],this.isLeftToRight())
			
			});
			this._altOpened=true;
			
			
	    //dojo.addClass(this.dropDown.domNode, "task-form-dropdown ui-corner-bottom");
			// TODO: set this.checked and call setStateClass(), to affect button look while drop down is shown
			return retVal;
	    
	  },
	  
	  closeAltDropDown: function(){
	    if(this._altOpened){
				dijit.popup.close(this.altDropDown);
				this._altOpened = false;
			}
	  },
	  
	  onChange: function(){
	    /*
	    console.debug("in onChange", this._status);
	    if (this._status === "select"){
	      console.log("should change value of the field");
	      this.inherited(arguments);
	    } else {
	      console.log("_status wasn't select, no change");
	    }
	    */
	    
	  },
	  
	  _openResultList: function(/*Object*/ results, /*Object*/ dataObject){
			// Callback when a data store query completes.
			// Overrides FilteringSelect._openResultList()
	
			
  		if(dataObject.query[this.searchAttr] != this._lastQuery){
  			return;
  		}
  		
  		dijit.form.ComboBoxMixin.prototype._openResultList.apply(this, arguments);
			
			if (this.item === undefined){
			  //console.debug("should have shown the nothing to show");
			  this._status = "none";
			  this.reset();
			  //dojo.publish("coordel/showNoneFound", [{field: this.taskFormField, showAddButton: this.showAddButton, parent: this}]);
			  this.openAltDropDown("none");
			
			  /*
			  var toShow = dojo.byId("projectNotFound");
			  console.debug("toShow", toShow, this._getPositionStyle(this));
			  dojo.style(toShow, this._getPositionStyle(this));
			  dojo.removeClass(toShow, "hidden");
			  */
			}
	
		},
		
	
		onFocus: function(){
		  //console.log("onFocus", this._status);
		  var incoming = this._status;
		  if (this._status === "closed" || this._status === "saved"){
		    this._status = "select";
		  } 
		  //console.debug("focused", this.taskFormField, this._status, incoming);
		  this.inherited(arguments);
		},
	
		/*
		onBlur: function(){
		  if (this.taskFormField === "deliverables"){
		    this._status = "closed";
		  } else if (this.taskFormField === "blockers"){
		    this._status = "closed";
		  }
		  this.inherited(arguments);
		},
		*/
		
		//this function is called when focusing on another field to make sure that
		//everthing clears that wasn't finished
		forceClose: function(keepStatus){
		  //console.debug("forceClose", this.taskFormField, this._status, keepStatus);
		  if (!keepStatus){
    		this._status = "closed";
		  }
		  if(this._opened){
				dijit.popup.close(this.dropDown);
				this._opened = false;
			}
			this.closeAltDropDown();
		}
	}
);


return app.widgets.PositionFilteringSelect;
});
