define([
  "dojo",
  "app/util/Sort"], function(dojo, sort) {
    //Do setup work here

    return {
      
      //this is the actual json field contained in the workspace
  	  field: null,

  	  //usually implemented at the base widget but if not, assume valid for deliverable
  	  isValid: function(){
  	    return this.validate();
  	  },

  	  //usually implemented at the base widget but if not, just an interface
  	  validate: function(){
  	    var isValid = true;
  	    if (!this.isReady()){
  	      isValid = false;
  	    }
  	    return isValid;
  	  },

  	  //returns whether the field requires that the workspace be disabled after a single save
  	  isSingleSave: function(){
  	    return this.field.singleSave;
  	  },

  	  //returns whether this field must be valide before any submission of the workspace
  	  isMustValidate: function(){
  	    return this.field.mustValidate;
  	  },

  	  //allows all parts of the field to be disabled (i.e. expecially for use in displaying the result)
  	  disable: function(){

  	  },

  	  //if any field is required and doesn't have a value, the deliverable isn't ready
      //if any field is invalid, it isn't ready
      isReady: function(){
        var isReady = true,
            f = this;

        if (f.isRequired() && !f.hasValue()){
          //console.debug("required and no value NOT READY", f.field.label);
          return false;
        };

        //when creating a control, the developer can create supporting name/value pairs about the control
        //to facilitate validation rules. if data is added, there must be an isReady property
        //included. on the save event of the workspace, the developers validation function will
        //be called, and will manage the value of the isReady property. that property will be checked
        //when determining if a field is ready.
     		if (f.hasData()){
          //console.debug("field had data, ready = ", f.field.label, f.field.data.ready);
    			//console.debug("deliverable field had data", this.field.data);
    			isReady = f.field.data.ready;

    		}
    		return isReady;
      },
      
      //does this field have a default value;
      showDefault: function(){
        var f = this.field;
        return (f["default"] && f["default"] !== "" && !this.hasValue());
      }, 

      //part of determining whether a field is ready means that we need to check if a value exists
      hasValue: function(){
        var f = this.field,
          has = true;

        
        
        if (this.hasChildren()){
          var childValue = false;
          dojo.forEach(f.children, function(child){
            if(child.value){
              childValue = true;
            }
          });
          
          if (!childValue){
            //console.debug("children didn't have a value",f);
            has = false;
          }
        } else {
          if (!f.value || f.value === ""){
            has = false;
          }
        }

        //console.debug("testing if field has value", f.label, f.value, has);

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
    	  
    	  //console.debug("isRequired ", this, this.field.label, this.field.required);
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

    	//get a particular version
    	getVersion: function(date){
    	  //console.debug("called getVersion", this.field.versions, date);
    	  var idx = dojo.indexOf(this.field.versions, {date: date});
    	  //console.debug("getting index", idx);
    	  return this.field.versions(idx);
    	},

    	//in some situations the user interface will want to show all versions of this field,
    	//this function enables that
    	allVersions: function(){
    		var toReturn = false,
    			f = this;

    		if (f.hasVersions()){
    			toReturn = [];
    			dojo.forEach(f.field.versions, function(ver) {
    				//$.log("setting the version");
    				//$.log(f);
    				//ver.fieldId = f.field.id;
    				toReturn.push(ver);
    			});
    			//sort the versions
    			toReturn = sort.sort(toReturn, {sort: [{attribute: "date", descending: true}]});
    		}

    		return toReturn;
    	},
    	
    	recentVersions: function(){
    	  var toReturn = false;

    		if (this.hasVersions()){
    			var all = this.allVersions();
    			toReturn = [];
    			if (all.length > 0){
    				toReturn.push(all[0]);
    			}
    			if (all.length > 1){
    				toReturn.push(all[1]);
    			}
    			if (all.length > 2){
    				toReturn.push(all[2]);	
    			}	
    		}
    		return toReturn;
    	}
  	};
});