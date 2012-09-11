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
    "app/views/StreamFooter/StreamFooter",
    "app/views/StreamDetails/StreamDetails",
    "app/views/Label/Label"
    ], 
  function(dojo, coordel, w, t, html, Footer, Details, Label) {
  
  dojo.declare(
    "app.widgets.StreamActivity", 
    [w, t], 
    {
      
      coordel: coordel,
      
      templateString: html,
      
      prettyVerb: "",
      
      footer: null,
      
      prettyObjectName: "",//coordel.project,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        var verb = this.verb.toLowerCase();
        
        //need to get the translated verbs
        try {
          this.prettyVerb = coordel.stream.verbs[verb].verb;
        } catch (err) {
          console.debug("ERROR getting the verb, so used the raw value", verb, err);
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
        
        if (!this.body || this.body === ""){
          dojo.addClass(this.bodyContainer, "hidden");
          dojo.addClass(this.detailsContainer, "hidden");
        } else {
          //raise-issue and update will have json objects in them that need to be properly formatted
          if (this.verb === "UPDATE" || this.verb === "RAISE-ISSUE" || this.verb === "ADD-BLOCKING" || this.verb === "REMOVE-BLOCKING"){ 
            
            var newBody = "";
            if (this.body){
              //this is a fix from an old format for blocking
              if (this.body.indexOf("Task:")> -1){
                newBody = this.body;
              } else {
                newBody = dojo.fromJson(this.body);
              }
            }
            
            var d = new Details({
              body: newBody
            }).placeAt(this.detailsContainer);
            dojo.addClass(this.bodyContainer, "hidden");
            dojo.removeClass(this.detailsContainer, "hidden");
          } else {
            var l = new Label({
              value: this.body
            }).placeAt(this.bodyContainer);
            dojo.addClass(this.detailsContainer, "hidden");
            dojo.removeClass(this.bodyContainer, "hidden");
          }
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