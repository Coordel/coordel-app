define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ProjectAssignment.html",
    "i18n!app/nls/coordel",
    "app/views/ContactDetails/ContactDetails",
    "app/views/Role/Role",
    "app/models/CoordelStore"
    ], 
  function(dojo, w, t, html, coordel, Contact, Role, db) {
  
  dojo.declare(
    "app.views.ProjectAssignment", 
    [w, t], 
    {
      
      templateString: html,
      
      assignment: null,
      
      isResponsible: false,
      
      isFollowers: false,
      
      header: "",
      
      coordel: coordel,
      
      status: "",
      
      //an array of contacts sorted alphabetically
      followers: [],
      
      value: "",
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.watch("assignment", function(prop, oldVal, newVal){
          //most likely this would be when the contact changes
          //console.debug("assignment changed", prop, oldVal, newVal);
          
        });
        
        this.watch("followers", function(prop, oldVal, newVal){
          //most likely this would be when the contact changes
          //console.debug("followers changed", prop, oldVal, newVal);
          
        });
        
        if (this.isResponsible){
          //console.debug ("i'm responsible", this.assignment);
          this.setContact(this.assignment.username);
          this.header.innerHTML = coordel.projDetails.responsible;
          dojo.addClass(this.status, "hidden");
          //if role === "RESPONSIBLE" just add the contact and hide role
          if (this.assignment.role === "RESPONSIBLE"){
            dojo.addClass(this.roleContainer, "hidden");
            dojo.style(this.contactContainer, "border","0px solid transparent");
          } else {
            this.setRole(this.assignment.role);
          }
        } else if (this.isFollowers){
          //console.debug ("it's the followers", this.followers);
          //if isFollowing add a contact for each follower and hide the role
          dojo.addClass(this.roleContainer, "hidden");
          dojo.addClass(this.contactContainer, "followers");
          this.setFollowers();
          this.header.innerHTML = coordel.projDetails.followers;
          dojo.style(this.contactContainer, "border","0px solid transparent");
          
        } else {
        
          //console.debug("participant", this.assignment.username, this.assignment.role);
          //get the role from the assignment and add it to the container
          this.setContact(this.assignment.username);
          //get the username from the assignment and add the contact details to the container
          this.setRole(this.assignment.role);
        }
        
      },
      
      setRole: function(roleid){
        this._clear(this.roleContainer);
        
        var r = db.projectStore.roleStore.get(roleid);
        
      
        //if the role has responsibilities, show them
        if (r.responsibilities && r.responsibilities.length > 0){
          var view = new Role({
            role: r
          }).placeAt(this.roleContainer);
        } else {
          dojo.addClass(this.roleContainer, "hidden");
          dojo.style(this.contactContainer, "border","0px solid transparent");
        }

        //set the assignment header
        var head = coordel.role,
            status = this.assignment.status,
            display = coordel.status[this.assignment.status];
         
        if (this.isResponsible) {
          head = coordel.responsible;
        } else {
          if (r.name && r.name.length > 0){
            head = r.name;
          }
        }  
        
        this.header.innerHTML = head;
        
        
        //set the status
        if (status === "ACCEPTED"){
          //no need to show accepted only show new or change cases
          display = "&nbsp;";
        }

        if (status === "DECLINED" || status === "LEFT"){
          //add red to status
          dojo.addClass(this.status, "c-color-error");
        } else if (status === "INVITE" || status === "PROPOSED" || status === "AGREED" || status === "AMENDED"){
          //add purple to status
          dojo.addClass(this.status, "c-color-purple");
        }
  
        this.status.innerHTML = display;
      },
      
      setContact: function(username){
        this._clear(this.contactContainer);
        var c = db.contact(username);
        
        //console.debug("contact", c);
        var ctl = new Contact({
          contact: c
        }).placeAt(this.contactContainer);
      },
      
      setFollowers: function(){
        
        this._clear(this.contactContainer);
        dojo.forEach(this.followers, function(contact){
          var c = new Contact({
            contact: contact
          }).placeAt(this.contactContainer);
        },this);
      },
      
      _clear: function(nodeid){
        dojo.forEach(dijit.findWidgets(nodeid), function(child){
          child.destroyRecursive();
        });
      },
      
      baseClass: "project-assignment"
  });
  return app.views.ProjectAssignment;     
});