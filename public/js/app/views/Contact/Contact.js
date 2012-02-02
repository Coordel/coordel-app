define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/Contact/templates/contact.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dojox/encoding/digests/MD5",
  "dojox/encoding/digests/_base"], 
  function(dojo, coordel, html, w, t, md5, dxd) {
  
  dojo.declare(
    "app.widgets.Contact", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      templateString: html,
      
      url: "images/default_contact.png",
      
      doNavigation: false, //this might be used to navigate and if so, it should publish a nav select
      
      clearSelectionHandler: null,
      
      setSelectionHandler: null,
      
      postMixInProperties : function() {
        this.inherited(arguments);
        var email = dojo.trim(this.contact.email.toLowerCase());
  
        //try and set the url to the gravatar of this user
        var defaultUrl = "http%3A%2F%2Fapp.coordel.com%2Fcoordel%2F_design%2Fcoordel%2Fimages%2Fdefault_contact.png";
        
        if (this.contact.email !== ""){
          this.url = 'http://www.gravatar.com/avatar/'+md5(this.contact.email, dxd.outputTypes.Hex)+'.jpg?s=32&d=' + defaultUrl;
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var con = this;
        //console.debug("in Contact postCreate");
        
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        this.setSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "setSelection");
        
        dojo.connect(con.contactContainer, "onclick", this, function(evt){
          //console.debug("contact clicked", evt);
          if (this.doNavigation){
             dojo.publish("coordel/primaryNavSelect", [ {name: "contact", id: this.contact._id}]);
          }
  	      //dojo.addClass(con.contactContainer, "active selected");
  	      this.onClick();
  	    });

      },
      
      baseClass: "contactlist-item",
      
      hiddenComments: [], // id of unseen comments, cleared when full stream or project viewed
      
      onClick: function(){
        //called when contact is clicked
      },
      
      onChange: function(object){
        //subscribes to coordel/change
        
        //updates contact name if change is update this contact of this id
        
        //calls destroy if change is trash and this contact id
        
        //adds hidden comment if of type comment and stream hidden
        
      },
      
      clearSelection: function(){
        //console.debug("in clear selection", this.domNode);
        if (this.domNode){
          dojo.removeClass(this.domNode, "active selected");
        }
      },
      
      setSelection: function(args){
        if (args.id === this.contact._id){
          if (this.domNode){
            dojo.addClass(this.domNode, "active selected");
          }
        }
      }
  });
  return app.widgets.Contact;     
});