define(["dojo/_base/declare",
        "dijit/_WidgetBase", 
        "dijit/_TemplatedMixin", 
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/Opportunity.html",
        "dojo/text!./templates/Profile.html",
 				"dojo/text!./templates/CoordelOpportunity.html",
        "dojo/dom-style", 
        "dojo/_base/fx",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom-class",
        "dojo/mouse",
        "dojo/keys",
        "dijit/Tooltip",
        "dijit/TooltipDialog",
        "dijit/form/DropDownButton",
        "dijit/form/TextBox",
        "dijit/form/Button",
        "dijit/form/ValidationTextBox",
        "dojox/validate/web",
        "dojo/date/locale",
        "dojo/json",
        "dojo/request/xhr",
        "dojo/cookie",
        "dojo/dom-construct",
        "dojo/_base/array"
        ],
  function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template, profileTemplate, oppTemplate, domStyle, baseFx, lang, on, dc, mouse,keys,Tooltip, TooltipDialog, DropDownButton, TextBox, Button, ValidationTextBox, validate, locale, JSON, xhr, cookie, build, array){
    return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
      
      // Our template - important!
      templateString: template,

      // A class to be applied to the root node in our template
      baseClass: "opp",
      
      isActive: false,

			isCoordel: false,
      
      project: {},
      
      postCreate: function(){
        // Run any parent postCreate processes - can be done at any point
        this.inherited(arguments);
        
        var self = this;
        
        //get a reference to the follow button
        var follow = this.follow;
        var dialog = this.oppDialog;
        var bnFollow = this.bnFollow;
        var name = this.name;
        var email = this.email;
        var avatar = this.avatar;
        
        var project = self.project;

				//test is this is a coordel opportunity
				//console.log("opp", self.project);
				if (project.opportunity && project.opportunity.isCoordel){
					this.isCoordel = true;
				}
			

        this.oppPurpose.innerHTML = getPurpose(project.purpose);
        this.oppName.innerHTML = project.name;
        this.oppDeadline.innerHTML = getPrettyDate(project.deadline);
        this.oppUsers.innerHTML = project.users.length;
        if (project._attachments){
          this.setAttachments();
        } else {
          dc.add(this.oppAttachments, "hidden");
        }

				if (this.isCoordel){
					//show coordel avatar
					this.setOpportunity(project.opportunity);
					
				} else {
					//set the user avatar for the responsible
					this.setAvatar(project.responsible);
				}
        
        
        function getPurpose(purpose){
          if (purpose){
            purpose = purpose.replace(/[\r\n]/g, "<br/>");
          } else {
            purpose = "Woops, purposeless!";
          }
          return purpose;
        }
        
        function getPrettyDate(date){
          return locale.format(new Date(date),{
            selector: "date",
            formatLength: "medium"
          });
        }
        
  
        on(this.domNode, mouse.enter, function(){
          if (!self.isActive){
            dc.remove(follow.domNode, "hidden");
          }
        });
        
        on(this.domNode, mouse.leave, function(){
          if (!self.isActive){
            dc.add(follow.domNode, "hidden");
          }
        });
        
        dialog.on("close", function(){
          self.isActive = false;
          
          dc.add(follow.domNode, "hidden");
        });
        
        
        follow.on("click", function(){
          self.isActive = true;
          //check if there is a cookie for this user so they only have to do it once
          var name = JSON.parse(cookie("oppNames"));
          var email = cookie("oppEmail");
          
          if (name){
            //console.log("name", name);
            self.name.set("value", name.firstName + " " + name.lastName);
            self.validate();
          }
          if (email){
            self.email.set("value", email);
            self.validate();
          }
        });
        
        bnFollow.on("click", function(){
          var email = self.email.get("value"),
              allNames = self._getNames();
   
          self.followOpp(email, allNames);
          
          //set the cookie of the person who did the click
          cookie("oppNames", JSON.stringify(allNames));
          cookie("oppEmail", email);
          self.isActive = false;
          follow.closeDropDown();
          dc.add(follow.domNode, "hidden");
        });
        
        email.on("keyup", function(){
          self.validate();
        });
        
        name.on("keyup", function(){
          self.validate();
        });
        
      },
      
      setResponse: function(message, color){
        var cont = this.oppResponse;
        dc.remove(cont, "hidden");
        dc.add(cont,color);
        cont.innerHTML = message;
      },
      
      setAttachments: function(){
        
        var self = this;
        var files = self.project._attachments;
        //console.log("setting attachments", files);
        build.empty(self.attachments);
        //console.debug("showing attachments", files);
    		for (var key in files){
    		  var file = build.create("a", {
      		  title: key,
      		  href: "/coordel/files/"+ self.project._id + "/" + key,
      		  style: "font-size: 10px;display:block",
      		  "class": "attachment c-ellipsis",
      		  target: "_blank",
      		  innerHTML: key
      		}, self.attachments);
 
    		}
    		
      },

			setOpportunity: function(opp){
				dc.remove(this.coordelAvatar, "hidden");
				dc.remove(this.oppCoordel, "hidden");
				this.oppDetails.innerHTML = opp.budget.toString() + " " + "Licenses";
				
				var monthly = opp.budget * 0.5 * 10;
				var annual = monthly * 12;
				
				//console.log("profile", profile);
  	    var tip = new Tooltip({
          label: lang.replace(oppTemplate, {licenseCount: opp.budget, monthly: monthly, annual: annual}),
          showDelay: 250,
          connectId: [this.oppDetails]
        });
			},
      
      setAvatar: function(id){
        var profile = {
          fullName: "",
          rating: "",
          count: "Not yet rated"
        };
        var avatar = this.avatar;
				
				dc.remove(avatar, "hidden");
        
        var query = {
          startkey: JSON.stringify([id]),
          endkey: JSON.stringify([id, {}])
        };
        
        

        xhr("/coordel/view/userProfiles", { query: query,
            handleAs: "json"
          }).then(function(data){
            //console.log("profile", data.rows, data.rows.length);
            if (data.rows && data.rows.length){
              var email = escape(data.rows[0].email) + "&s=32";
              var contact = data.rows[0].app;
              profile.fullName = data.rows[0].first + " " + data.rows[0].last;
              xhr('/gravatar?email='+ email,
                {handleAs: "json"}).then(function(obj){
                //console.log("string", obj.url);
                avatar.src = obj.url;
                
                var qAvg = {
              		key: JSON.stringify(contact),
              		group:true,
              		group_level: "1",
              		reduce: true
              	};
              	
              	xhr("coordel/view/userFeedbackAvg", {query: qAvg,
              	  handleAs: "json"
            	  }).then(function(avgRes){
            	  
            	    
            	    if (avgRes.rows && avgRes.rows.length){
            	      var avgObj = avgRes.rows[0];
            	      //console.log("object", avgObj);
            	      profile.rating = avgObj.avg;
            	      profile.count = "Times Rated " + avgObj.count;
            	    }
            	    //console.log("profile", profile);
            	    var tip = new Tooltip({
                    label: lang.replace(profileTemplate, {name: profile.fullName, rating: profile.rating, count: profile.count}),
                    showDelay: 250,
                    connectId: [avatar]
                  });
            	  });
              });
            } 
          });
      },
      
      _getNames: function(){
        var name = this.name;
        var reName = /(\w+(?:-\w+)?),\s*(\w+)(?:\s+(\w(?=\.)|\w+(?:-\w+)?))?|(\w+)\s+(?:(\w(?=\.)|\w+(?:-\w+)?)\s+)?(\w+(?:-\w+)?)/;
        
        var firstName = false,
            middleName = false,
            lastName = false;
        
        var fullName = name.get("value").trim();
        
        if (!fullName.length){
          return false;
        }

        var matches = fullName.match(reName);
        
        if (matches){
          firstName = matches[2] || matches[4];  // "David"
          middleName = matches[3] || matches[5];  // "Richard"
          lastName = matches[1] || matches[6]; // "Wade"
        } else {
          firstName = fullName;
        }
        
        return {
          firstName: firstName,
          middelName: middleName,
          lastName: lastName
        };
      },
      
      validate: function(){
        if (this.email.isValid() && this.name.isValid()){
          this.bnFollow.set("disabled", false);
        } else {
          this.bnFollow.set("disabled", true);
        }
      },
      
      followOpp: function(email, names){
        //var query = db.getUser(email);
        var self = this;
        
        var userArgs = {
      		startkey: JSON.stringify([email]),
      		endkey: JSON.stringify([email,{}])
      	};
      	
      	xhr("/coordel/view/users", { query: userArgs,
            handleAs: "json"
          }).then(function(userRows){
            //console.log("users", userRows);
            
            if (userRows && userRows.rows.length){
              var user = userRows.rows[0];
              //console.log("existing user", user);
              self._followProject(user);
              
            } else {
              
              self._inviteUser({
                email: email,
                firstName: names.firstName,
                lastName: names.lastName,
                data: {}
              });
            }
          });
      
      },
      
      _followProject: function(user){
        var self = this;
        //console.log("follow project", user);

        xhr("/coordel/"+self.project._id, {handleAs:"json"}).then(function(proj){
          //console.log("refreshed the project", proj);
          
          var assigned = false;
          
          //check if this person is already a member of the project;
          array.forEach(proj.assignments, function(assign){
            if (assign.username === user.appId){
              //notify already part of project and quit
              //console.log("user is part of this project already");
              assigned = true;
            }
          });
          
          if (!assigned){
            //console.log("add this user to project as follower", user);
            proj.users.push(user.appId);
            if (!proj.assignments){
              proj.assignments = [];
            }
            proj.assignments.push({
              username: user.appId,
              role: "FOLLOWER",
              status: "ACCEPTED"
            });
        	  var hist = {
        			actor: {id:user.appId, name:user.first + " " + user.last, type:"PERSON"},
        			object: {id: self.project._id, name: self.project.name, type: "PROJECT"},
        		  time: (new Date()).toISOString(),
        		  users: self.project.users,
        		  verb: "FOLLOW"
        		};
        		//make sure there is a place to put history
        		if (!proj.history){
        		  proj.history = [];
        		}
        		proj.history.unshift(hist);
            
            xhr("/coordel/"+proj._id, {
              handleAs: "json",
              method: "PUT",
              data: JSON.stringify(proj),
              headers: 	{"Content-Type": "application/json; charset=UTF-8"}
            }).then(function(res){
              if (res.error){
                //console.log("notify error");
                self.setResponse("Error Following the Opportunity. Please try again.", "c-color-error");
              } else {
                //console.log("following", res);
                self.setResponse("You are now Following <strong>" + proj.name + "</strong>", "c-color-active");
                var count = parseInt(self.oppUsers.innerHTML, 10);
                count += 1;
                self.oppUsers.innerHTML = count.toString();
                //disable the follow button
                self.follow.set("disabled", true);
              }
            });
  
          } else {
            //console.log("this user was already part of the project");
            self.setResponse("You already joined that Opportunity", "c-color-active");
            self.follow.set("disabled", true);
          }
        });
      },
      
      _inviteUser: function(invite){
        //the invite will have email, subject and optional data members
        
        //console.log("invite", invite);
     
        var self = this;
        
        var defInvite = {
          firstName: "",
          lastName: "",
          email: "",
          fromAppId: "COORDEL-ROBOT",
          fromFirstName: "Coordel",
          fromLastName: "Robot",
          fromEmail: "robot@coordel.com",
          subject: "The Coordel Robot carried out your request to Follow an Opportunity",
          template: "followInvite.txt"
        };
        
        invite = dojo.mixin(defInvite, invite);
        
        //format the start and deadline fields if present
        if (invite.data.deadline){
          invite.data.deadline = dtFormat.prettyISODate(invite.data.deadline);
        }
        
        if (invite.data.calendar){
          invite.data.calendar.start = dtFormat.prettyISODate(invite.data.calendar.start);
        }
        
        //console.log("invite", invite);
        
        xhr("/invite", { method: "POST",
            handleAs: "json", data: invite
          }).then(function(res){
            if (res.error){
              //console.log("show this error", res.error);
              self.setResponse(res.error, "c-color-error");
            } else {
              //console.log("did the invitation, now follow the project");
              //console.log("user", res);
              self._followProject(res);
            }
          });
      
      }

  });
  
  
});