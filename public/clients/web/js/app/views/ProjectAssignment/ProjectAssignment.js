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
        
        var self = this;
        
        if (self.isResponsible){
          var role = self.assignment.role;
          console.debug ("i'm responsible", role);
          self.setContact(self.assignment.username);
          self.header.innerHTML = coordel.projDetails.responsible;
          dojo.addClass(self.status, "hidden");
          //if role === "RESPONSIBLE" just add the contact and hide role
          if (role === "RESPONSIBLE"){
            dojo.addClass(self.roleContainer, "hidden");
            dojo.style(self.contactContainer, "border","0px solid transparent");
          } else {
            console.log("im responsible and im going to show the role", role);
            self.setRole(role, self.assignment.name);
          }
        } else if (self.isFollowers){
          console.debug ("it's the followers", this.followers);
          //if isFollowing add a contact for each follower and hide the role
          dojo.addClass(self.roleContainer, "hidden");
          dojo.addClass(self.contactContainer, "followers");
          self.setFollowers();
          self.header.innerHTML = coordel.projDetails.followers;
          dojo.style(self.contactContainer, "border","0px solid transparent");
          
        } else {
        
          console.debug("participant", this.assignment.username, this.assignment.role);
          //get the role from the assignment and add it to the container
          self.setContact(self.assignment.username);
          //get the username from the assignment and add the contact details to the container
          self.setRole(self.assignment.role, self.assignment.name);
        }
        
      },
      
      setRole: function(roleid, rolename){
        console.log("roleid", roleid);
        this._clear(this.roleContainer);
        var self = this;
        
      
        
        dojo.when(db.get(roleid), 
          //success case
          function(r){
          
            console.log("setRole", r, roleid);

            //if the role has responsibilities, show them
            if (r.responsibilities && r.responsibilities.length > 0){
              var view = new Role({
                role: r,
                onEmpty: function(){
                  dojo.addClass(self.roleContainer, "hidden");
                }
              }).placeAt(self.roleContainer);
            } else {
              dojo.addClass(self.roleContainer, "hidden");
              dojo.style(self.contactContainer, "border","0px solid transparent");
            }

            //set the assignment header
            var head = coordel.role,
                status = self.assignment.status,
                display = coordel.status[self.assignment.status];

            if (self.isResponsible) {
              head = coordel.responsible;
              if (rolename && rolename.length > 0){
                head += " - " + rolename;
              }
            } else {
              if (rolename && rolename.length > 0){
                head = rolename;
              }
            }  

            self.header.innerHTML = head;


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

            self.status.innerHTML = display;
          },
          //error case
          function(err){
            console.log("didn't find role in projectAssignment", err);
          });
      },
      
      setContact: function(username){
        this._clear(this.contactContainer);
        
        var self = this;
  
        dojo.when(db.contact(username), function(c){
          var ctl = new Contact({
            contact: c
          }).placeAt(self.contactContainer);
        });
      },
      
      setFollowers: function(){
        
        this._clear(this.contactContainer);
        
        var self = this;
      
        dojo.forEach(this.followers, function(assign){
          dojo.when(db.contact(assign.username), function(c){
            var ctl = new Contact({
              contact: c
            }).placeAt(self.contactContainer);
          });
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