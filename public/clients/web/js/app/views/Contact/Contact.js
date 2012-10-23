define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/Contact/templates/contact.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore",
  "app/views/PrimaryBoxes/PrimaryBoxes"], 
  function(dojo, coordel, html, w, t, db, pb) {
  
  dojo.declare(
    "app.widgets.Contact", 
    [w, t], 
    {
      
      name: null,
      
      id: null,

			isMember: true,
      
      templateString: html,
      
      url: "/images/default_contact.png",
      
      doNavigation: false, //this might be used to navigate and if so, it should publish a nav select
      
      clearSelectionHandler: null,
      
      setSelectionHandler: null,
      
      currentArgs: {},
      
      postCreate: function(){
        this.inherited(arguments);
   
       
        
        this.clearSelectionHandler = dojo.subscribe("coordel/primaryNavSelect", this, "clearSelection");

 				//console.debug("in Contact postCreate", this.contact, this.currentArgs);
        
        var email = dojo.trim(this.contact.email.toLowerCase()),
            self = this;
        
        if (this.contact.email && this.contact.email !== ""){
           dojo.xhrGet({
              url: '/gravatar?email='+ escape(email) + '&s=32',
              handleAs: "json",
              load: function(res){
                //console.log("url response", res);
                self.userImage.src = res.url;
              }
            });
        }
        
        self.email.innerHTML = email;
        self.firstName.innerHTML = self.contact.firstName;
        self.lastName.innerHTML = self.contact.lastName;
				
				//self.isMember = false;
				if (!self.isMember){
					dojo.addClass(self.userImage, "non-member");
					dojo.removeClass(self.nonMemberImg, "hidden");
				}
        
        dojo.connect(self.domNode, "onclick", this, function(evt){
          //console.debug("contact clicked", evt);
          if (this.doNavigation){
            //console.log("doNavigation contact primaryNavSelect");
            pb.currentBox = "contact";
            dojo.publish("coordel/primaryNavSelect", [ {name: "contact", focus: "contact", id: this.contact.id}]);
            
          }
  	      //dojo.addClass(con.contactContainer, "active selected");
  	      this.onClick();
  	    });
  	    
  	    self.setSelection();

      },
      
      baseClass: "contactlist-item",
      
      hiddenComments: [], // id of unseen comments, cleared when full stream or project viewed
      
      onClick: function(){
        //called when contact is clicked
        //console.log("clicked");
      },
      
      onChange: function(object){
        //subscribes to coordel/change
        
        //updates contact name if change is update this contact of this id
        
        //calls destroy if change is trash and this contact id
        
        //adds hidden comment if of type comment and stream hidden
        
      },
      
      clearSelection: function(args){
        var self = this;

          //console.debug("clearing contact selection", self.id);
          if (self.domNode){
            dojo.removeClass(self.domNode, "active selected");
          }
  
      },
      
      setSelection: function(){
        //console.log("current args", this.currentArgs);
        if (this.currentArgs.name === "contact" && this.currentArgs.id === this.contact.id){
          //console.log("setting contact selection", this.contact.id, this.currentArgs);
          dojo.addClass(this.domNode, "active selected");
        }
        
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.unsubscribe(this.clearSelectionHandler);
      }
  });
  return app.widgets.Contact;     
});