/*
NOTE: Activies may be very language specific depending on how verb/preposition combinations
are used or not used. If a translation is required. it's likely, that it will be necessary to 
create language specific activities in this component rather than using the nls as it is now
*/

define(
  ["dojo",
    "app/models/StreamModel",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/form/Textarea",
    "text!./templates/streamReply.html",
    "dojo/date/stamp",
    "app/util/dateFormat",
    "app/models/CoordelStore"
    ], 
  function(dojo, sModel, coordel, w, t, textarea, reply, stamp, dt, db) {
  
  dojo.declare(
    "app.widgets.StreamReply", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      project: null,
      
      coordel: coordel,
      
      templateString: reply,
      
      widgetsInTemplate: true,
      
      postCreate: function(){
        this.inherited(arguments);
        
        dojo.connect(this.domNode, "onclick", this, function(evt){
          evt.stopPropagation();
        });
  
  	    //send the reply
  	    var replyHandle = dojo.connect(this.sendButton, "onClick", this, function(evt){
  	   
  	      
  	      try{
              //console.log("StreamReply sendButton handler called");

      	      var node = dijit.byId(this.replyText);
      	      var message = node.get("value");
      	     

      	      var stream = new sModel();
              stream.init(db);
            
              stream.sendMessage(message, this.project);
              dojo.disconnect(replyHandle);
              this.destroy();
          } catch(err) {
              console.debug("ERROR sending a message", err);
          }
  	    
  	    });
        
      },
      
      baseClass: "stream-reply"
  });
  return app.widgets.StreamReply;     
});