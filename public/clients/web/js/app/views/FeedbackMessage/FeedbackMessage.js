define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/FeedbackMessage.html",
    "app/views/Label/Label",
    "app/util/dateFormat",
    "app/models/CoordelStore"
    ], 
  function(dojo, w, t, html, Label, dt, db) {
  
  dojo.declare(
    "app.views.FeedbackMessage", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      message: "",
      
      created: "",
      
      from: null,
      
      interval: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        if (this.created !== ""){
          this._refresh();
        }
        
        if (this.from){
          this.setFrom();
        }
        
        this.interval = dojo.subscribe("coordel/timeUpdate", this, "_refresh");
        
        var lab = new Label({value: this.message}).placeAt(this.messageBody);
      },
      
      _refresh: function(){
        this.timeago.innerHTML = dt.ago(this.created);
      },
      
      setFrom: function(){
        var from = db.contactFullName(this.from);
        this.fromContact.innerHTML = from;
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.unsubscribe(this.interval);
      },
      
      baseClass: "stream-message"
  });
  return app.views.FeedbackMessage;     
});