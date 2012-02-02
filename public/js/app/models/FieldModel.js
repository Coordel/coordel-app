define("app/models/FieldModel", ["dojo", "app/models/CoordelBase"], function(dojo, base) {
  dojo.declare(
    "app.models.FieldModel", 
    [base], 
    {
      //if any field is required and doesn't have a value, the deliverable isn't ready
      //a field isn't ready if it's required and it doesn't have a value
      isReady: function(){
        var isReady = true,
            f = this;
            
        if (f.isRequired() && !f.hasValue()){
          //console.debug("field wasn't ready", f.field.label);
          isReady = false;
        };
        
        //when creating a control, the developer can create supporting name/value pairs about the control
        //to facilitate validation rules. if data is added, there must be an isReady property
        //included. on the save event of the workspace, the developers validation function will
        //be called, and will manage the value of the isReady property. that property will be checked
        //when determining if a field is ready.
     		if (f.hasData()){
     		  
    			//console.debug("deliverable field had data", this.field, this.field.data);
    			isReady = this.field.data.ready;
    			
    		}
    		
    		return isReady;
      },
      
      //part of determining whether a field is ready means that we need to check if a value exists
      hasValue: function(){
        var f = this.field,
          has = true;
          
        
        
        if (f.value === "" || f.value === undefined){
          has = false;
        }
        
        //console.debug("testing if field has value", f, f.value, has);
        
        return has;
      },
      
      //if a field needs additional variables for validation purposes, they can be stored in data
      //this function checks if there is a data member in the field object
      hasData: function(){
        var hasData = false,
            field = this.field;
        
        if (field.data){
          hasData = true;
        }
        
        return hasData;
      },
      
      //controls with children have info required to make it make sense like a radio button choices
      //or a checkbox value. developers can also add children to their control that can provide
      //custom functionality they need
      hasChildren: function(){
    		var hasChildren = false,
    			f = this.field;
        
        //first check if this is one of the main html-type controls
    		if (f.fieldType === "radio" || f.fieldType === "checkbox" || f.fieldType === "select"){
    			return true;
    		}
    		
    		//then check for children in general
    		if (f.children && f.children.length > 0){
    		  hasChildren = true;
    		}

    		return hasChildren;
    	},
    	
    	//required is just a boolean that the user indicates when they add a field to a workspace
    	isRequired: function(){
    	  return this.field.required;
    	},
    	
    	//fields can be designed to track versions. this detects whether or not this field has versions
    	hasVersions: function(){
    	  var hasVersions = false,
    	      f = this.field;

    		if (f.versions && f.versions.length > 0){
    			hasVersions = true;
    		}

    		return hasVersions;
    	},
    	
    	//in some situations the user interface will want to show all versions of this field,
    	//this function enables that
    	allVersions: function(){
    		var toReturn = false,
    			f = this;

    		if (f.hasVersions()){
    			toReturn = [];
    			dojo.forEach(f.versions, function(ver) {
    				//$.log("setting the version");
    				//$.log(f);
    				ver.fieldId = f.id;
    				toReturn.push(ver);
    			});
    			//sort the versions
    			
    			toReturn = f.sort(toReturn, [{attribute: "version", descending: true}]);
    		}

    		return toReturn;
    	},
    	
    	sort: function(results, options){
    	  results.sort(function(a, b){
  				for(var sort, i=0; sort = options.sort[i]; i++){
  					var aValue = a[sort.attribute];
  					var bValue = b[sort.attribute];
  					if (aValue != bValue) {
  						return !!sort.descending == aValue > bValue ? -1 : 1;
  					}
  				}
  				return 0;
  			});
  			return results;
    	},
    	
    	setType: function(){
    		var fld = this.field;
    		fld.hasDefault = true;
    		fld.hasSize = false;
    		//determine the type of the field
    		//$.log("fieldType: " + fld.fieldType);
    		switch (fld.fieldType){
    			case "input":
    				fld.isInput = true;
    				if (fld.inputType === "file"){
    				  fld.hasDefault = false;
    					fld.isInput = false;
    					fld.isFile = true;
    					//need to rev so can submit files
    					fld.rev = this.taskRev;
    				} else if (fld.inputType === "text"){
    				  fld.hasSize = true;
      				fld.sizes = [
      					{id: "x-small",value: "x-small"},
      					{id: "small",value: "small"},
      					{id: "medium",value: "medium"},
      					{id: "large",value: "large"},
      					{id: "x-large",value: "x-large"}

      				];
    				}
    				break;
    			case "textarea":
    			  //console.debug("textarea");
    				fld.isTextarea = true;
    				fld.hasSize = true;
    				fld.sizes = [
    					{id: "x-small",value: "x-small"},
    					{id: "small",value: "small"},
    					{id: "medium",value: "medium"},
    					{id: "large",value: "large"},
    					{id: "x-large",value: "x-large"}

    				];
    				break;
    			case "iframe":
    				fld.isIframe = true;
    				break;
    			case "select":
    				fld.isSelect = true;
    				fld.hasDefault = false;
    				fld.hasSize = true;
    				fld.sizes = [
    					{id: "x-small",value: "x-small"},
    					{id: "small",value: "small"},
    					{id: "medium",value: "medium"},
    					{id: "large",value: "large"},
    					{id: "x-large",value: "x-large"}

    				];
    				//deal with the children of the select here
    				dojo.forEach(fld.children, function(child, key){
    					//$.log("key " + key);
    					//$.log("child " +  child.label);
    					//$.log("child value ", child.value);
    					fld.children[key].parentType = fld.fieldType;
    					if (child.value == true){
    						fld.children[key].selected = true;
    						fld.children[key].isDefault = true;
    					}
    					//$.log(fld);
    				});
    				break;
    			case "checkbox":
    				fld.isCheckbox = true;
    				fld.hasDefault = false;
    				dojo.forEach(fld.children, function(child, key){
    					//$.log("key " + key);
    					//$.log("child ", child);
    					fld.children[key].parentType = fld.fieldType;
    					if (child.value == true){
    						//$.log("checkbox " + child.label + " was checked");
    						fld.children[key].checked = true;
    						fld.children[key].isDefault = true;	
    					}
    				});
    				break;
    			case "radio":
    				fld.isRadio = true;
    				fld.hasDefault = false;
    				dojo.forEach(fld.children, function(child, key){
    					//$.log("key " + key);
    					//$.log("child ", child);
    					//set the name of the radio control to radio group + control index in the workspace
    					//NOTE: took off the index when moved to object since will only edit a control at a time
    					fld.children[key].name = "radioGroup";
    					fld.children[key].parentType = fld.fieldType;
    					if (child.value == true){
    						//$.log("radio " + child.label + " was checked");
    						fld.children[key].checked = true;
    						fld.children[key].isDefault = true;
    					}
    				});
    				break;
    		}
    		
    	},
    	
    	//need to make sure we know what task we are dealing with so need id and rev values
      taskId: null,
      
      taskRev: null,
      
      //need to know what deliverable we're referring
      deliverableId: null,
      
      //the raw data of the field
      field: null
      
      
  });

  return app.models.FieldModel;
      
});

