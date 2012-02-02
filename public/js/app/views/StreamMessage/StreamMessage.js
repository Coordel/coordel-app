/*
NOTE: Activies may be very language specific depending on how verb/preposition combinations
are used or not used. If a translation is required. it's likely, that it will be necessary to 
create language specific activities in this component rather than using the nls as it is now
*/

define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/streamMessage.html",
    "app/views/StreamFooter/StreamFooter",
    "app/views/Label/Label"
    ], 
  function(dojo, w, t, html, Footer, Label) {
  
  dojo.declare(
    "app.widgets.StreamMessage", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      message: "",
      
      created: "",
      
      allowOptions: false,
      
      interval: null,
      
      footer: null,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        this.footer = new Footer({
          created: this.created,
          allowOptions: this.allowOptions,
          project: this.project.id
        }).placeAt(this.footContainer);
        
        var lab = new Label({value: this.message}).placeAt(this.messageBody);
        
        //if the user hovers over this, show the footer options
  	    dojo.connect(this.domNode, "onmouseover", this, function(evt){
  	      this.footer.showOptions(true);
  	    });
  	    
  	    //if the user hovers over this, show the footer options
  	    dojo.connect(this.domNode, "onmouseout", this, function(evt){
  	      this.footer.showOptions(false);
  	    });
  	    
  	    dojo.connect(this, "onBlur", this, function(){
  	      this.footer.showReplyText(false);
  	    });
        
      },
      
      baseClass: "stream-message"
  });
  return app.widgets.StreamMessage;     
});