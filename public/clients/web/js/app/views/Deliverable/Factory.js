define([
  "dojo", 
  "dijit",
  "app/views/Deliverable/Deliverable",
  "app/views/Deliverable/formFields/TextBox",
  "app/views/Deliverable/formFields/ValidationTextBox",
  "app/views/Deliverable/formFields/File",
  "app/views/Deliverable/formFields/Textarea",
  "app/views/Deliverable/formFields/Select",
  "app/views/Deliverable/formFields/CheckboxList",
  "app/views/Deliverable/formFields/RadioList"], 
  function(dojo, dijit, Del, TextBox, ValidationTextBox, File, Textarea, Select, CheckboxList, RadioList) {
  dojo.declare(
    "app.views.Deliverable.Factory",
    [],
    {
      //deliverables must all have an org and id properties to be stored
  		//there will be docTypes of org that will have details about the org (name, contact, etc)
  		//as well as all of their deliverable templates. The id they provide allows for use of the 
  		//template to be tracked both for users as well as deliverable makers


  		//we'll need the id of the deliverable and the view
  		//identifier associated to the template when it's created
  		//there are three types of views: 
  		  //1. config - this is the view used when adding a deliverable
  		  //2.a. displayGrid - this view will show the value of the deliverable in a grid
  		  //2.b. displayForm - this view will show the value of the deliverable in form layout
  		  //if the deliverable is done, it will be the value, otherwise it will be the
  		  //instructions for the deliverable
  	    //3. form - this is the default view and is what is shown in the workspace
  	    
  	  //some deliverables will have versioning enabled. However, if the deliverable is shown as blocker info
  	  //or as a result in a project, then versions shouldn't be shown. By default, versions are displayed
  	  //the app can set when they shouldn't show. the value is set in the _get[control] if versions are
  	  //enabled by the [control]
  	  displayVersions: false,

  	  //the deliverable is the json representation of the deliverable from the workspace
  		create: function(args) {
  		  var defaults = {
  		    deliverable: {},
  		    view: "form"
  		  };
  		  
  		  if (args.displayVersions){
  		    this.displayVersions = true;
  		  }
  		
  		  //this is the parameter to hold whatever deliverable is created
  		  //and the object that will be passed into it
  		  var del,
  		      d = {};   
  		
  		  //this function is designed to compose the correct deliverable object based on
  		  //the data of it's template
  		  var obj = dojo.mixin(defaults, args);
  		  
  		  //get the deliverable
  		  d.deliverable = obj.deliverable;

  		  //get the widget based on the deliverable  and the view and passed in the args
  		  switch (obj.view){
  		    case "form":
  		      del = new Del(d);
  		      break;
  		    case "config":
  		      if (obj.deliverable.multipart) {
  		        del = new Multipart(d);
  		      } else {
  		        del = new Single(d);
  		      }
  		      break;
  		    case "displayGrid":
  		      del = new Grid(d);
  		      break;
  		    case "displayForm": 
  		      del = new Del(d);
  		      del.set("baseClass", "blocker-info");
  		      break;
  		  }
  		  //sort, iterate and create all the fields: the data object contains all of the parameters to set on the field
  		  //add the fiels using the Deliverable's addField method
        
        //get the fields for this deliverable
  		  dojo.forEach(obj.deliverable.fields, function(field){
  		    
  		    //addField knows how to handle the control it's going to receive 
  		    var f = this._createField(field);
  		    
  		    console.debug("field in deliverble", f);
  		    
  		    //if this is a display view, then disable the field
  		    if (obj.view === "displayGrid" || obj.view === "displayForm"){
  		      f.setDisabled();
  		    }
  		    
  		    del.addField(f);
  		  }, this);

  		  //return an instantiated version of the requested deliverable
        return del;          
  		},

  		_createField: function(field){
  		  //this function creates the correct field based on the json data of the field
  		  //if the field has choices, need to compose the choices
  		  var fld;
  		  switch (field.fieldType){
  		    case "input":
  		      fld = this._getInput(field);
  		      break;
  		    case "textarea":
  		      fld = this._getTextarea(field);
  		      break;
  		    case "select":
  		      fld = this._getSelect(field);
  		      break;
  		    case "checkbox":
  		      fld = this._getCheckbox(field);
  		      break;
  		    case "radio":
  		      fld = this._getRadio(field);
  		      break;
  		  }

  		  //deal with field parameters
  		  //size
  		  //data
  		  //choices

  		  return fld;
  		},

  		_getInput: function(field){
  		  //this returns one of three types of inputs
  		    //1. non-validating text box
  		    //2. validating text box if required
  		    //3. file
  		  var input;

  		  switch(field.inputType){
  		    case "file":
  		      input = new File({field: field, displayVersions: this.displayVersions});
  		      break;
  		    default:
  		      if (field.required){
  		        //return a validating text box
  		        //console.debug("returning validation text box");
  		        input = new ValidationTextBox({required: true, field: field});
  		      } else {
  		        input = new TextBox({field: field});
  		      }
  		  }

  		  return input;
  		},

  		_getTextarea: function(field){
        //console.debug("_getTextarea", this.displayVersions);
  		  var text;

  		  switch(field.textareaType){
  		    case "fixed-length":
  		      break;
  		    default:
  		      text = new Textarea({required: field.required, field: field, displayVersions: this.displayVersions});
  		  }

  		  return text;
  		},
  		
  		_getSelect: function(field){
  		  
  		  var select;
  		  //this type of control is the dropdown type. will be a simple dropdown to start but will
  		  //need to be extended to allow filtering select, etc.
  		  switch(field.selectType){
  		    case "autocomplete":
  		      break;
  		    default:
  		      select = new Select({required: field.required, field:field, displayVersions: this.displayVersions});
  		  }
  		  
  		  return select;
  		},
  		
  		_getCheckbox: function(field){
  
  		  var ctl = new CheckboxList({field:field, displayVersions: this.displayVersions});
  
  		  return ctl;
  		},
  		
  		_getRadio: function(field){
  
  		  var ctl = new RadioList({field:field, displayVersions: this.displayVersions});
  	
        console.debug("radio control", ctl);
  		  return ctl;
  		}
    });
     
	return app.views.Deliverable.Factory;
});