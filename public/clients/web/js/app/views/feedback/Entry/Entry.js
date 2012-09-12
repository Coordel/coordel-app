define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Entry.html",
    "app/models/CoordelStore",
    "dijit/form/RadioButton"
    ], 
  function(dojo, w, t, html, db) {
  
  dojo.declare(
    "app.views.feedback.Entry", 
    [w, t], 
    {
      
      templateString: html,
      
      from: null,
      
      to: null,
      
      toFullName: "",
      
      widgetsInTemplate: true,
      
      postMixInProperties: function(){
        this.toFullName = db.contactFullName(this.to);
      },
      
      postCreate: function(){
        this.inherited(arguments);
        //console.log("creating entry", this.from, this.to);
        
        dojo.connect(this.low1, "onClick", this, function(){
          dojo.addClass(this.commentContainer, "hidden");
        });
        
        dojo.connect(this.low2, "onClick", this, function(){
          dojo.addClass(this.commentContainer, "hidden");
        });
        
        dojo.connect(this.medium3, "onClick", this, function(){
          dojo.addClass(this.commentContainer, "hidden");
        });
        
        dojo.connect(this.high4, "onClick", this, function(){
          dojo.addClass(this.commentContainer, "hidden");
        });
        
        dojo.connect(this.high5, "onClick", this, function(){
          dojo.removeClass(this.commentContainer, "hidden");
        });
      },
      
      getEntry: function(){
        
        var score = this._getScore();
        
        if (score){
          var entry = {};
          entry.from = this.from;
          entry.score =  score;
          entry.comment = this.comment.get("value");
          entry.created = (new Date()).toISOString();
          //console.log("getting entry", entry);
          return entry;
        } else {
          return false;
        }
        
      },
      
      _getScore: function(){
        var toReturn = false;
        dojo.forEach(dijit.findWidgets(this.score), function(item){
          //console.log("getting score", item.get("value"));
          if (item.get("checked")){
            toReturn = item.get("value");
          }
        });
        return toReturn;
      },
      
      baseClass: "feedback-entry"
  });
  return app.views.feedback.Entry;     
});