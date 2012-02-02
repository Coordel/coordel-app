/*
NOTE: Activies may be very language specific depending on how verb/preposition combinations
are used or not used. If a translation is required. it's likely, that it will be necessary to 
create language specific activities in this component rather than using the nls as it is now
*/

define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/streamActivity.html",
    "app/views/StreamFooter/StreamFooter"
    ], 
  function(dojo, coordel, w, t, html, Footer) {
  
  dojo.declare(
    "app.widgets.StreamActivity", 
    [w, t], 
    {
      
      coordel: coordel,
      
      templateString: html,
      
      prettyVerb: "",
      
      footer: null,
      
      prettyObjectName: coordel.project,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        var verb = this.verb.toLowerCase();
        
        //need to get the translated verbs
        try {
          this.prettyVerb = coordel.stream.verbs[verb].verb;
        } catch (err) {
          console.debug("ERROR getting the verb, so used the raw value", verb);
          this.prettyVerb = verb;
        }
        
        if (!this.body){
          this.body = "";
        }
        
        if (this.object.type !== "PROJECT"){
          //if the object is a project, just leave "Project" as the object name
          this.prettyObjectName = this.object.name;
        }
        
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        //console.debug("activity", this);
        
        if (!this.body || this.body === ""){
          dojo.addClass(this.bodyContainer, "hidden");
        }
        
        if (this.project.id){
        
          this.footer = new Footer({
            created: this.time,
            allowOptions: this.allowOptions,
            project: this.project.id
          }).placeAt(this.footContainer);
          
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
    	    
    	  }
    	
      },
      
      baseClass: "stream-activity"
  });
  return app.widgets.StreamActivity;     
});