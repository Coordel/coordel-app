define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/Contact/templates/contact.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], 
  function(dojo, coordel, html, w, t, db) {
  
  dojo.declare(
    "app.widgets.Contact", 
    [w, t], 
    {
      
      name: null,
      
      id: null,
      
      templateString: html,
      
      url: "/images/default_contact.png",
      
      doNavigation: false, //this might be used to navigate and if so, it should publish a nav select
      
      clearSelectionHandler: null,
      
      setSelectionHandler: null,
      
      postMixInProperties : function() {
        this.inherited(arguments);
        //console.log("Contact",this.contact);
        
      },
      
      postCreate: function(){
        this.inherited(arguments);
   
        //console.debug("in Contact postCreate");
        
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");
        
        this.setSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "setSelection");
        
        var email = dojo.trim(this.contact.email.toLowerCase()),
            self = this;
        
        if (this.contact.email !== ""){
           dojo.xhrGet({
              url: '/gravatar?email='+ escape(email) + '&s=32',
              handleAs: "json",
              load: function(res){
                //console.log("url response", res);
                self.userImage.src = res.url;
              }
            });
        }
        
       
        
        dojo.connect(self.contactContainer, "onclick", this, function(evt){
          //console.debug("contact clicked", evt);
          if (this.doNavigation){
             dojo.publish("coordel/primaryNavSelect", [ {name: "contact", id: this.contact.id}]);
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
        if (args.id === this.contact.id){
          if (this.domNode){
            dojo.addClass(this.domNode, "active selected");
          }
        }
      }
  });
  return app.widgets.Contact;     
});