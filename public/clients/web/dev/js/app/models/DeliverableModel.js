define(
  "app/models/DeliverableModel",["dojo", "app/models/FieldModel", "app/models/CoordelBase"],
   function(dojo, fModel, base) {
  dojo.declare(
    "app.models.DeliverableModel", 
    [base], 
    {
      //any workspace can control deliverables. they can be like legos, which are made up of a single
      //control (text field, radio button, dropdown, etc), or they can be like duplos, which are made up
      //of multiple controls creating a form (textarea, two choices, and a checkbox).
      isMultipart: function(){
        return this.deliverable.multipart;
      },
      
      //if any of deliverable's fields aren't ready (required has a value), or when it has not required field
      //and at least one of them doesn't have a value, the deliverable isn't ready
      //if the deliverable has an in-task blocker (deliverable in this task that blocks it), it isn't ready
      
      isReady: function(){
        
        var isReady = true,
            hasMinOneNotRequired = false,
            notRequiredCount = 0,
            fields = this.deliverable.fields,
            self = this;
        
        //console.debug("testing this deliverable is ready", this.deliverable);
        //check each field: does each required field have a value and
        //does at lease one not-required field have a value
        dojo.forEach(fields, function(field){
          
          //console.debug("testing deliverable field isReady", field);
          var f = new fModel({
            taskId: self.task._id,
            taskRev: self.task._rev,
            field: field
          });
          
          //first check that required fields have a value 
          if (!f.isReady()){
            isReady = false;
          }
          
          //now track that at least one not required field has a value
          if (!f.isRequired()){
            notRequiredCount += 1;
            if (f.hasValue()){
              hasMinOneNotRequired = true;
            }
          }
        });
        
        //test the tracked not required fields
        if (notRequiredCount > 0 && !hasMinOneNotRequired){
          isReady = false;
        }
        
        return isReady;
      },
      
      //a deliverable can be blocked by another deliverable in this task
    	//this allows for tasks to show as they are done in the workspace
      hasBlockers: function(){
        var d = this;
        //console.debug("checking hasBlockers", d);
        return (d.deliverable.blockers && d.deliverable.blockers.length > 0);   
      },
      
      hasInstructions: function(){
    		var d = this.deliverable;
    		return (d.instructions && d.instructions !== "");
    	},
    	
    	isRequired: function(){
    		var isRequired = false,
    		    d = this.deliverable,
    		    self = this;

    		dojo.forEach(d.fields, function(fld) {
    		  var f = new fModel({
            //taskId: self.task._id,
            //taskRev: self.task._rev,
            field: fld
          });
    			if (f.isRequired()){
    				isRequired = true;
    			}
    		});	
    		return isRequired;
    	},
      
      task: null,
      
      taskRev: null,
      
      deliverable: null
      
      
  });
  
  return app.models.DeliverableModel;
      
});