/*
  use this control to add details provided in the body entry of a stream activity or entry
*/
define(
  ["dojo",
    "i18n!app/nls/coordel",
    "text!./templates/StreamDetails.html",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "app/models/CoordelStore",
    "app/views/Label/Label",
    "app/util/dateFormat"], 
  function(dojo, coordel, html, w, t, db, Label, format) {
  
  dojo.declare(
    "app.views.StreamDetails", 
    [w, t], 
    {
      
      widgetsInTemplate: true, 
      
      templateString : html,
      
      coordel: coordel,
      
      body: null,
    
      postCreate: function(){ 
        this.inherited(arguments);
        
        var self = this;
        
        
        
        function getChange(label, chg){
          
          var val = "<div class='c-padding-b'>";
          //removed
          if (chg.prev && !chg.value){
            val += "<div class='activity-details'>"+coordel.changes.removed + " "+label+"</div>";
            val += "<div>" + chg.prev +"</div>";
            if (label === "Deadline"){
              val += "<div class='c-padding-b'>" + coordel.changes.deadline.removedDeadline + "</div>";
            }
          }
          //changed 
          if (chg.prev && chg.value){
            val += "<div class='activity-details'>" + coordel.changes.changed +  " " + label +"</div>";
            val += "<div><em>" + coordel.changes.value + "</em></div><div class='c-padding-b'>" + chg.value +"</div>";
            val += "<div><em>" + coordel.changes.previous + "</em></div><div>" + chg.prev +"</div>";
          }
          //added
          if (!chg.prev && chg.value){
            val += "<div class='activity-details'>" + coordel.changes.added + " " + label +"</div>";
            val += "<div>" + chg.value +"</div>";
          }
          val += "</div>";

          var c = new Label({
            value: val
          }).placeAt(self.changesContainer);
          
        }
        
        if (this.body.raiseIssue){
          console.log("show the issue and solution");
          dojo.removeClass(this.raiseIssue, "hidden");
          var i = new Label({
            value: this.body.raiseIssue.issue
          }).placeAt(this.issue);
          var s = new Label({
            value: this.body.raiseIssue.solution
          }).placeAt(this.solution);
        } else if (this.body.changes){
          //console.log("show the changes");
          dojo.removeClass(this.changes, "hidden");
          dojo.forEach(this.body.changes, function(chg){
            var c, label, val;
            //console.log("field", chg.field);
            switch (chg.field){
              case "name":
                if (chg.prev !== chg.value){
                  val = "<div class='c-padding-b'>";
                  val += "<div class='activity-details'>" + coordel.changes.changed +  " " + coordel.taskDetails.name +"</div>";
                  val += "<div><em>" + coordel.changes.value + "</em></div><div class='c-padding-b'>" + chg.value +"</div>";
                  val += "<div><em>" + coordel.changes.previous + "</em></div><div>" + chg.prev +"</div>";
                  val += "</div>";

                  c = new Label({
                    value: val
                  }).placeAt(self.changesContainer);
                }
              break;
              case "purpose":
                getChange(coordel.taskDetails.purpose, chg);
              break;
              case "deadline":
                getChange(coordel.taskDetails.deadline, chg);
              break;
              case "deferred":
                getChange(coordel.taskDetails.deferDate, chg);
              break;
              case "deliverable":
                getChange(coordel.taskDetails.deliverable, chg);
              break;
              case "blocker":
                getChange(coordel.taskDetails.blocker, chg);
              break;
              case "attachment":
                getChange(coordel.taskDetails.attachment, chg);
              break;
            }
          }, this);
        }
        
      },
      
      baseClass: "stream-details"
  });
  return app.views.StreamDetails;     
});

