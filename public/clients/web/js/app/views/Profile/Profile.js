define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/Profile/templates/Profile.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore",
  "app/views/FeedbackMessage/FeedbackMessage"], 
  function(dojo, coordel, html, w, t, db, FeedbackMessage) {
  
  dojo.declare(
    "app.views.Profile", 
    [w, t], 
    {
      
      name: null,
      
      coordel: coordel,
      
      fullName: coordel.noName,
      
      templateString: html,
      
      url: "/images/default_contact.png",
      
      postMixInProperties : function() {
        
        //try and set the url to the gravatar of this user
        //var defaultUrl = escape("http://" + location.host + db.db + "_design/coordel/images/default_contact.png");
  
        var p = this.profile.profile;
        
        //console.debug("profile", this.profile);
        
        //now set default to "" where the user hasn't provided the details value
        
        if (p.first && p.last){
           this.fullName = p.first + " " + p.last;
        }
  
        if (!p.email){
          p.email = "";
        }
        
        if (!p.phone){
          p.phone = "";
        }
        
        if (!p.skype){
          p.skype = "";
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var p = this.profile.profile;
        var stats = this.profile.feedbackStats;
        var messages = this.profile.feedback;
        
        //console.log("contact details contact", c);
        this.fullNameValue.innerHTML = this.fullName;
        
        if (p.email === ""){
          dojo.addClass(this.email, "hidden");
        } else {
          this.emailValue.innerHTML = p.email;
          this.emailValue.href = "mailto:"+ p.email;
        }
        
        if (p.phone === ""){
          dojo.addClass(this.phone,"hidden");
        } else {
          this.phoneValue.innerHTML = p.phone;
        }
        
        if (p.skype === ""){
          dojo.addClass(this.skype, "hidden");
        } else {
          this.skypeValue.innerHTML = p.skype;
          this.skypeValue.href = "skype:" + p.skype;
        }
        
        var email = dojo.trim(p.email.toLowerCase()),
            self = this;
        
        if (p.email !== ""){
           dojo.xhrGet({
              url: '/gravatar?email='+ escape(email) + '&s=32',
              handleAs: "json",
              load: function(res){
                //console.log("url response", res);
                self.userImage.src = res.url;
              }
            });
        }
        
        //if there are is no feedback for this person, hide the badge
        if (!stats || stats.count === 0){
          dojo.addClass(this.feedbackRating, "hidden");
        } else {
          this.feedbackRating.innerHTML = parseInt(stats.avg, 10);
        }
        
        //if there were messages, show the feedback messages
        if (!messages || !messages.length){
          dojo.addClass(this.messagesContainer, "hidden");
        } else {
          
          dojo.forEach(dijit.findWidgets(this.feedbackMessages, function(w){
            w.destroy();
          }));
          
          dojo.forEach(messages, function(msg){
            var data = {
              created: msg.created,
              from: msg.from,
              message: msg.comment
            };
            
            var f = new FeedbackMessage(data).placeAt(self.feedbackMessages);
            
            //console.log("comment", data);
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
  return app.views.Profile;     
});