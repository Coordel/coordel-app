define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/ContactDetails/templates/contactDetails.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], 
  function(dojo, coordel, html, w, t, db) {
  
  dojo.declare(
    "app.views.ContactDetails", 
    [w, t], 
    {
      
      name: null,
      
      coordel: coordel,
      
      fullName: "",
      
      templateString: html,
      
      url: "/images/default_contact.png",
      
      postMixInProperties : function() {
        
        //try and set the url to the gravatar of this user
        //var defaultUrl = escape("http://" + location.host + db.db + "_design/coordel/images/default_contact.png");
        
       
        var c = this.contact;
        
        console.debug("contact", this.contact);
        
        //now set default to "" where the user hasn't provided the details value
        
        if (!c.fullName){
          c.fullName = db.contactFullName(c.id);
        }
  
        if (!c.email){
          c.email = "";
        }
        
        if (!c.phone){
          c.phone = "";
        }
        
        if (!c.skype){
          c.skype = "";
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var c = this.contact;
        
        //console.log("contact details contact", c);
        this.fullNameValue.innerHTML = db.contactFullName(c.id);
        
        if (c.email === ""){
          dojo.addClass(this.email, "hidden");
        } else {
          this.emailValue.innerHTML = c.email;
        }
        
        if (c.phone === ""){
          dojo.addClass(this.phone,"hidden");
        } else {
          this.phoneValue.innerHTML = c.phone;
        }
        
        if (c.skype === ""){
          dojo.addClass(this.skype, "hidden");
        } else {
          this.skypeValue.innerHTMLinnerHTML = c.skype;
        }
        
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
        
      
      },
      
      baseClass: "contactlist-details",
      
      hiddenComments: [], // id of unseen comments, cleared when full stream or project viewed
      
      onChange: function(object){
        //subscribes to coordel/change
        
        //updates contact name if change is update this contact of this id
        
        //calls destroy if change is trash and this contact id
        
        //adds hidden comment if of type comment and stream hidden
        
      }
      
  });
  return app.views.ContactDetails;     
});