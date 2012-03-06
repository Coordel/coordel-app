define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/RatingForm.html",
    "app/views/feedback/Entry/Entry",
    "app/models/CoordelStore",
    "dijit/form/Button"
    ], 
  function(dojo, w, t, html, Entry, db) {
  
  dojo.declare(
    "app.views.feedback.RatingForm", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      project: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var from = db.username();
        
        console.log("in Rating form", this.project, from);
        
        dojo.forEach(this.project.assignments, function(assign){
          //only give feedback to people who accepted a role in the project and who
          //weren't only followers
          if (assign.status === "ACCEPTED" && assign.role !== "FOLLOWER" && assign.username !== from){
            var e = new Entry({
              from: from,
              to: assign.username
            }).placeAt(this.entries);
          }
        }, this);
        
      },
      
      _getFeedback: function(username){
        console.log("getting feedback for", username);
        var toReturn = false;
        dojo.forEach(dijit.findWidgets(this.entries), function(e){
          console.log("testing entries", e, e.get("to"));
          if (e.get("to") === username){
            toReturn = e.getEntry();
          }
        });
        return toReturn;
      },
      
      save: function(){
        console.log("save called", this);
        dojo.forEach(this.project.assignments, function(assign){
          var e = this._getFeedback(assign.username);
          console.log("testing for feedback", e);
          if (e){
            if (!assign.feedback){
              assign.feedback = [];
            }
            assign.feedback.push(e);
          }
        }, this);
      },
      
      baseClass: "feedback-rating-form"
  });
  return app.views.feedback.RatingForm;     
});