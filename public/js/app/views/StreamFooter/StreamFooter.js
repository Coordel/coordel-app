/*
NOTE: Activies may be very language specific depending on how verb/preposition combinations
are used or not used. If a translation is required. it's likely, that it will be necessary to 
create language specific activities in this component rather than using the nls as it is now
*/

define(
  ["dojo",
    "app/models/StreamModel",
    "app/views/StreamReply/StreamReply",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/form/Textarea",
    "text!./templates/StreamFooter.html",
    "dojo/date/stamp",
    "app/util/dateFormat"
    ], 
  function(dojo, sModel, reply, coordel, w, t, textarea, html, stamp, dt) {
  
  dojo.declare(
    "app.widgets.StreamFooter", 
    [w, t], 
    {
      
      id: null,
      
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      interval: null,
      
      created: "",
      
      replyObj: null,
      
      _isReplyState: false, 
      
      allowOptions: false, //set this to true if mouseover should show footer options (i.e. reply)
      
      postCreate: function(){
        this.inherited(arguments);
        var project = this.project,
            self = this;
        
        if (this.created !== ""){
          this._refresh();
          this.interval = setInterval(dojo.hitch(self, self._refresh), 60000);
        }  
        
        if (this.allowOptions){
          this.replyObj = new reply({
              project: project
          }).placeAt(this.replyTextContainer);
        } 
        
        
  	    //show the textarea and focus it
  	    dojo.connect(this.replyLink, "onclick", this, function(){
  	      this.showReplyText(true);
          //hide the reply link 
          this.showOptions(false);
          this.replyObj.replyText.focus();
  	    });
  	    
      },
      
      showReplyText: function(isShowing){
        dojo.addClass(this.replyTextContainer, "hidden");
        this._isReplyState = isShowing;
        if (isShowing){
          dojo.removeClass(this.replyTextContainer, "hidden");
        }
      },
      
      showOptions: function(isShowing){
        if (this.allowOptions){
          dojo.addClass(this.replyLink, "hidden");
          if (isShowing && !this._isReplyState){
            dojo.removeClass(this.replyLink, "hidden");
          }
        }
      },
      
      _refresh: function(){
        this.timeago.innerHTML = dt.ago(this.created);
      },
      
      baseClass: "stream-footer"
  });
  return app.widgets.StreamFooter;     
});