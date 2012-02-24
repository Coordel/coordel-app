define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/ContactDetails/templates/contactDetails.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore"], 
  function(dojo, coordel, html, w, t, db) {
  
  dojo.declare(
    "app.widgets.ContactDetails", 
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
        
        if (this.contact.email && this.contact.email !== ""){
          this.url = '/gravatar?email='+ escape(this.contact.email) + '&s=32';
        }
        
        var c = this.contact;
        
        //console.debug("contact", this.contact);
        
        //now set default to "" where the user hasn't provided the details value
        
        if (!c.fullName){
          c.fullName = db.contactFullName(c._id);
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
        
        if (c.email === ""){
          dojo.addClass(this.email, "hidden");
        }
        
        if (c.phone === ""){
          dojo.addClass(this.phone,"hidden");
        }
        
        if (c.skype === ""){
          dojo.addClass(this.skype, "hidden");
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
  return app.widgets.ContactDetails;     
});