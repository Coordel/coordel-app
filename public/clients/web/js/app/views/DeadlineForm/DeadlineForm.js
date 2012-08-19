define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/DeadlineForm.html",
    "dijit/form/DateTextBox",
    "dijit/form/TimeTextBox",
    "dojo/date/stamp"], 
  function(dojo, coordel, w, t, html, DateText, TimeText, stamp) {
  
  dojo.declare(
    "app.views.DeadlineForm", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      hasTime: false,
      
      submitLabel: coordel.done,
      
      templateString: html,
      
      _getDeadline: function(){
        var toReturn = "";

        var date = stamp.toISOString(new Date(this.date.get("value")),{selector: "date"});
        if (this.hasTime){
          var time = stamp.toISOString(new Date(this.time.get("value")),{selector: "time"});
          return stamp.fromISOString(date + time);
        } else {
          return stamp.fromISOString(date);
        }
      },
      
      onChange: function(deadline){
        
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        dojo.connect(this.save, "onclick", this, function(){
          this.onSave(this._getDeadline());
        });
        
        this.date.watch("value", function(prop, oldVal, newVal){
          //console.debug("task deadline date changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          if (newVal){
            self.onChange(self._getDeadline());
            //console.log("new deadline value", newVal);
            self.time.set("disabled", false);
            //self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "datetime"});
          } else {
            self.time.set("disabled", true);
          }
        });
        
        this.time.watch("value", function(prop, oldVal, newVal){
          //console.debug("task deadline time changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          if (newVal){
            
            //console.log("new time value", newVal);
            self.hasTime = true;
            self.onChange(self._getDeadline());
            //self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "datetime"});
          } else {
            self.hasTime = false;
          }
          
        });

        //console.log("date constraints", this.date.get("constraints"));
      },
      
      onSave: function(deadline){
        
      }

  });
  return app.views.DeadlineForm;     
});