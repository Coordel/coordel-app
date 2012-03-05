define(
  ["dojo",
  "i18n!app/nls/coordel",
  "text!app/views/ProjectForm/templates/ProjectForm.html",
  "text!app/views/ProjectForm/templates/ProjectFormTip.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/models/CoordelStore",
  "dojo/date/stamp",
  "dijit/Tooltip",
  "dojo/data/ItemFileWriteStore",
  "app/views/ProjectFormPill/ProjectFormPill",
  "app/util/dateFormat",
  "dijit/layout/ContentPane",
  "app/views/ProjectFormRoles/ProjectFormRoles",
  "app/views/ProjectFormAttachments/ProjectFormAttachments",
  "app/widgets/ContainerPane"], 
  function(dojo,coordel, html, htmlTip, w, t, db, stamp, Tooltip, ws, Pill, format) {
  
  dojo.declare(
    "app.views.ProjectForm", 
    [w, t], 
    {
      
      project: {},
      
      coordel: coordel,
      
      templateString: html,
      
      rolePills: [],
      
      widgetsInTemplate: true, 
      
      isNew: true,
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        if (!self.project._id){
          var id = db.uuid();
          console.debug("created new uuid for ProjectForm",id);
          self.project._id = id;
        }
        
        if (self.project.users && self.project.users.length > 0){
          self._setPills("people");
        }
        
        if (self.project.responsible){
          self._setPills("responsible");
        }
        
        if (self.project.assignments && self.project.assignments.length > 0){
          self._setPills("roles");
        }
        
        //set the project of roles dropdown and the attachments dropdown
        self.projectFormRoles.setDropDown(self.project);
        self.projectFormAttachments.setDropDown(self.project);
        
        
        
        if (!self.isNew){
          var purpose = self.project.purpose;
          if (!purpose || purpose.length === 0){
            purpose = coordel.projectForm.phPurpose;
          }
          //hide the reuse button
          dojo.addClass(self.showReuseTemplates, "hidden");
          
          //set the values
          self.projectFormName.set("value", self.project.name);
          self.projectFormPurpose.set("value", purpose);
          if (self.project.deadline){
            self.projectFormDeadline.set("value", stamp.fromISOString(self.project.deadline));
          }
          if (self.project.calendar && self.project.calendar.start){
            self.projectFormDefer.set("value", stamp.fromISOString(self.project.calendar.start));
          }
          self.projectFormAttachments.dropDown.setData();
        }
        
        //set the min-dates on defer and deadline
        self.projectFormDeadline.set("constraints",{min: stamp.toISOString(new Date(), {selector: "date"})});
        self.projectFormDefer.set("constraints",{min: stamp.toISOString(new Date(), {selector: "date"})});
        
        //set the contacts into the responsible and people filtering selects
        self._setFilteringSelect(self.projectFormPeople, db.contacts(), true);
        self._setFilteringSelect(self.projectFormResponsible, db.contacts(), true);
        
        console.log("after filtering selects", self.project);
        
        dojo.connect(self.projectFormRoles, "closeDropDown", this, function(){
          dojo.forEach(this.rolePills, function(pill){
            pill.reset();
          });
        });
        
        //the dijit.textarea placeHolder doesn't work. these functions
        //enable matching functionality. the attribute is in the template with the
        //correct variables so just remove these two connections when a release comes
        //that has it fixed - textarea used for name and purpose
        dojo.connect(this.projectFormName, "onFocus", this.projectFormName, function(){
          console.debug ("onFocus projectFormName", this.value);
          if(this.value === coordel.projectForm.phName){
            console.debug("name was 'placeholder' blank it");
            this.set("value", "");
            dojo.removeClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.projectFormName, "onBlur", this.projectFormName, function() {
          console.debug ("onblur projectFormName", this.value);
        
          if(dojo.trim(this.value).length == 0){
            console.debug("name was blank set it to the placeholder");
            
            this.set("value", coordel.projectForm.phName); 
            dojo.addClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.projectFormPurpose, "onFocus", this.projectFormPurpose, function(){
          console.debug ("onFocus projectFormPurpose", this.value);
          if(this.value === coordel.projectForm.phPurpose){
            console.debug("purposse was 'placeholder' blank it");
            this.set("value", "");
            dojo.removeClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.projectFormPurpose, "onBlur", this.projectFormPurpose, function() {
          console.debug ("onblur projectFormPurpose", this.value);
        
          if(dojo.trim(this.value).length == 0){
            console.debug("it was blank set it to the placeholder");

            this.set("value", coordel.projectForm.phPurpose); 
            dojo.addClass(this.domNode, "c-placeholder");
          }
        });
        
        /*------------------------------------------------------------------------------------*/
        //watch fields for changes
        //name
        this.projectFormName.watch("value", function(prop, oldVal, newVal){
          //protect from saving the placeholder value
          if(this.value !== coordel.projectForm.phName){
            //console.debug("project name changed", prop, oldVal, newVal);
            self.project.name = newVal;
            //self.set("name", newVal);
          }
        });
        
        //purpose
        this.projectFormPurpose.watch("value", function(prop, oldVal, newVal){
          
          //protect from saving the placeholder value
          if(this.value !== coordel.projectForm.phPurpose){
            //console.debug("project purpose changed", prop, oldVal, newVal);
            self.project.purpose = newVal;
            //self.set("purpose", newVal);
          }
         
        });
        
        //deadline
        this.projectFormDeadline.watch("value", function(prop, oldVal, newVal){
          //console.debug("project deadline changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          self.project.deadline = stamp.toISOString(new Date(newVal), {selector: "date"});
        });
        
        //responsible
        this.projectFormResponsible.watch("value", function(prop, oldVal, newVal){
          //console.debug("project responsible changed", prop, oldVal, newVal);
          //self.set("project", newVal);
          self.project.responsible = newVal;
          //console.debug("responsible after change change", self.project.responsible);
        });
        
        //people
        this.projectFormPeople.watch("value", function(prop, oldVal, newVal){
          
          console.debug("project people changed", prop, oldVal, newVal, self.project.users);
          //self.set("project", newVal);
          var has = false;
          dojo.forEach(self.project.users, function(user){
            if (user === newVal){
              has = true;
            }
          });
          
          if (!has){
            if (!self.project.users){
              self.project.users = [];
            }
            self.project.users.push(newVal);
          }
          console.debug("people after change", self.project.users);
          
        });
        
        
       //defer
        this.projectFormDefer.watch("value", function(prop, oldVal, newVal){
          //console.debug("project defer changed", prop, oldVal, newVal, stamp.toISOString(new Date(newVal)));
          if (!self.project.calendar){
            self.project.calendar = {};
          }
          self.project.calendar.start = stamp.toISOString(new Date(newVal));
          //self.set("deadline", newVal);
          //self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "date"});
        });
        
        /*------------------------------------------------------------------------*/
        /* CHANGES - watch for changes to deal with setting pills                 */
        
        //responsible
        dojo.connect(this.projectFormResponsible, "onChange", this, function(args){
          //console.debug("projectFormResponsible onChange");
          //same as project except that this is for the user of the task
          this._setPills("responsible");
          this.projectFormResponsible._status = "select";
        });
        
        //deadline
        dojo.connect(this.projectFormDeadline, "onChange", this, function(args){
          this._setPills("deadline");
        });

        //defer
        dojo.connect(this.projectFormDefer, "onChange", this, function(args){
          this._setPills("defer");
        });
        
        
        dojo.connect(this.projectFormPeople, "onChange", this, function(args){
          //console.debug("projectFormPeople onChange");
          var u = self.projectFormPeople.get("value");
          var has = false;
          dojo.forEach(self.project.users, function(user){
            if (user === u || u === ""){
              has = true;
            }
          });
          
          if (!has){
            var p = db.getProjectModel(this.project, true);
            if (!self.project.users){
              self.project.users = [];
            }
            
            self.project = p.invite(u, self.project);
            //self.project.users.push(u);
            self.projectFormRoles.setDropDown(self.project);
          }
          //console.debug("people after change", self.project.users);
          
          this.projectFormPeople._status = "select";
          this.projectFormPeople.reset();
          this.projectFormPeople.focus();
          this._setPills("people");
        });
        
        
        /*------------------------------------------------------------------------------*/
        
        //watch for clicking of remove on the pill (responsible and people only). blockers and deliverables
        //have to be handled as pills are added so removal is handled in _setPills
        
        //deadline
        dojo.connect(this.projectFormDeadlineValue.removeValue, "onclick", this, function(){
          this.projectFormDeadline.reset();
          delete this.project.deadline;
          //hide the pill
          dojo.addClass(this.projectFormDeadlineValue.domNode, "hidden");
          dojo.removeClass(this.projectFormDeadline.domNode, "hidden");
          //make sure we don't react to onChange and set the pill again when we reset to nothing
          this.projectFormDeadline.focus();
          //now make sure we can reset the pill when selected
        });
        
        //defer
        dojo.connect(this.projectFormDeferValue.removeValue, "onclick", this, function(){
          this.projectFormDefer.reset();
          delete this.project.calendar;
          //hide the pill
          dojo.addClass(this.projectFormDeferValue.domNode, "hidden");
          dojo.removeClass(this.projectFormDefer.domNode, "hidden");
          //make sure we don't react to onChange and set the pill again when we reset to nothing
         
          this.projectFormDefer.focus();
          //now make sure we can reset the pill when selected
        });
        
        //responsible
        dojo.connect(this.projectFormResponsibleValue.removeValue, "onclick", this, function(){
          //console.debug("should remove the responsible value");
          
          //get rid of the project
          delete this.project.responsible;
          
          //hide the pill
          dojo.addClass(this.projectFormResponsibleValue.domNode, "hidden");
          dojo.removeClass(this.projectFormResponsible.domNode, "hidden");
          //make sure we don't react to onChange and set the pill again when we reset to nothing
          this.projectFormResponsible.reset();
          this.projectFormResponsible.focus();
          //now make sure we can reset the pill when selected
        });
        
        self._initTips();
      },
      
      _initTips: function(){
        //show tooltips when a field gets focus
        //project name
        this._setFieldConnection("name");
        //purpose
        this._setFieldConnection("purpose");
        //deadline
        this._setFieldConnection("deadline");
        //responsible
        //this._setFieldConnection("responsible");
        //people
        //this._setFieldConnection("people");
        //roles
        //this._setFieldConnection("roles");
        //defer
        this._setFieldConnection("defer");
        //attachments
        //this._setFieldConnection("attachments");
 
      },
      
      _setFieldConnection: function(field){
        //get the right object
        var c = {};
        switch (field){
          case "name":
            c = this.projectFormName;
            break;
          case "purpose":
            c = this.projectFormPurpose;
            break;
          case "deadline":
            c = this.projectFormDeadline;
            break;
          case "responsible":
            c = this.projectFormResponsible;
            break;
          case "people":
            c = this.projectFormPeople;
            break;
          case "roles":
            c = this.projectFormRoles;
            break;
          case "defer":
            c = this.projectFormDefer;
            break;
          case "attachments":
            c = this.projectFormAttachments;
            break;
        }
        
        dojo.connect(c, "onFocus", this, function(){
          this._setTip(field, this._getTipTemplate(field));
          //this._resetDropDowns(field);
        });
        
        dojo.connect(c, "onBlur", this, function(){
          //dojo.destroy("taskFormTipContainer");
          dojo.style(this[field+"Tip"],{
            visibility: "hidden"
          });
      
        });
        
      },
      
      _getTipTemplate: function(field){

          var map = {
            tipTitle: coordel.projectFormTip[field+"Title"],
            tipText: coordel.projectFormTip[field+"Text"]
          };

          return dojo.string.substitute(htmlTip, map);

      },
        
      _setPills: function(field){

        var self = this;
        //project and delegate because there can only be one
        //pill at a time and the TaskFormPill is in the html. for blockers and deliverables there can be
        //multiple, so there is a ContainerPane where they can be added. 
        switch(field){
          case "responsible":
          if (this.project.responsible){
            //console.debug("showing responsible pill", this.project.responsible);
            dojo.addClass(this.projectFormResponsible.domNode, "hidden");
            dojo.removeClass(this.projectFormResponsibleValue.domNode, "hidden");
            this.projectFormResponsibleValue.showPill(this.project.responsible);
          }
          break;
          case "deadline":
          if (this.project.deadline){
            dojo.addClass(this.projectFormDeadline.domNode, "hidden");
            dojo.removeClass(this.projectFormDeadlineValue.domNode, "hidden");
            this.projectFormDeadlineValue.showPill(format.prettyISODate(this.project.deadline));
          }
          break;
          case "defer":
          if (this.project.calendar && this.project.calendar.start){
            dojo.addClass(this.projectFormDefer.domNode, "hidden");
            dojo.removeClass(this.projectFormDeferValue.domNode, "hidden");
            this.projectFormDeferValue.showPill(format.prettyISODate(this.project.calendar.start));
          }
          break;
          case "roles": 
          //console.debug("show role pills");
          var assigns = self.project.assignments;
          self.rolePills = [];
          dojo.empty(self.projectFormRolesValue);
          dojo.forEach(assigns, function(assign){
            if (assign.role !== "RESPONSIBLE" && assign.role !== "FOLLOWER"){

              var p = new Pill({formField: "assignment"}).placeAt(self.projectFormRolesValue);
              p.showPill(assign);
              self.rolePills.push(p);
              dojo.connect(p.domNode, "onclick", this, function(evt){
                
                //a pill was clicked so need to set the value of the assignment and show the form
                //reset any selected pills
                dojo.forEach(self.rolePills, function(pill){
                  //console.debug("iterating role values", pill);
                  pill.reset();
                });
                //console.debug("pill clicked");
                var form = self.projectFormRoles;
                form.isNew = false;
                form.role = assign;
                if (assign.name){
                  form.dropDown.focusPoint.set("value", assign.name);
                }
                form.dropDown.people.set("value", assign.username);
                form.openDropDown();
                p.select();
                dojo.connect(form, "onChange", this, function(){
                  self._setPills("roles");
                  p.reset();
                });
              });

              dojo.connect(p.removeValue, "onclick", this, function(evt){
                evt.preventDefault();
                var dKey = -1;
                dojo.forEach(self.project.assignments, function(assign, key){
                  if(assign.role === p.value.role){
                    dKey = key;
                  }
                });

                if (dKey !== -1){
                  self.project.assignments.splice(dKey, 1);
                }

                self._setPills("roles");

                //console.debug("remove this assignment", p.value);
              });
            }
          });
          break;
          case "people":
          dojo.empty(self.projectFormPeopleValue);
          var people = self.project.users;
          dojo.forEach(people, function(user){
            //need to create a new pill for each user
            var pill = new Pill({
              formField: "people"
            }).placeAt(self.projectFormPeopleValue);
            
            //need to see if this user has a role that isn't follower and if so,
            //add an image class to the pill
            
            //wire up removal of the user
            //if the user has a role that isn't following, can't remove them until
            //after assigning someone else to the role
            //wire up the removal of the pill
            dojo.connect(pill.removeValue, "onclick", function(){
              var removeId = pill.value;

              //first delete the correct pill and remove the deliverable
              var dKey;
              dojo.forEach(people, function(d, key){
                //console.debug("user in remove pill", d);
                if (removeId === d){
                  //console.debug("removing pill", d);
                  //capture which deliverable to remove because deleting it here 
                  //caused an error
                  dKey = key;
                }
              });

              //now delete the deliverable
              people.splice(dKey,1);

              //close in case we were editing
              self.forceClose(true);
              self.focus();

              //now reset the pills with the updated data
              self._setPills("people");
            });
            
            pill.showPill(user, db);
          });
        }
      },
    
      _setTip: function(field, template){
        
        //console.debug("in _setTip", field, template);
        
        //var li = dojo.query(".project-" + field)[0];
        
        var li = this[field+"Around"];
        
        var tipInfo = dojo.position(li, true),
            left = tipInfo.x + tipInfo.w + 12,
            top = tipInfo.y - tipInfo.h;
            
        //to position the tip appropriately, we want the pointer to to be 12 px to the right center
        //of the li element, the top of the tipContainer to be the top of the li element
        
        
        var tip = this[field + "Tip"];
        tip.innerHTML = template;
      
        
        /*
        var tip = new Tooltip({
          connectId: [this[field+"Around"]],
          label: template,
          position: "after"
        });
        */
        
        
        dojo.style(tip, {
          position: "absolute",
          left: left + "px",
          top:  top + "px",
          display: "block",
          "z-index": 1000,
          visibility: "visible"
        });
      
      },
      
      _setFilteringSelect: function(control, list, isContact){
        
        console.log("control", control, "list", list, "isContact", isContact);
        var ident = "_id";
        if (isContact){
          ident = "id";
        }
        
         var store = new ws({data: {identifier: ident, items:[]}});
         
         dojo.forEach(list, function(obj, key){
           if (isContact){
             store.newItem({name: obj.firstName + " " + obj.lastName, id: obj.id});
           } else {
             store.newItem({name: obj.name, _id: obj._id});
           }
         });
         
         control.displayMessage = function(){
           return false;
         };
         
         control.set("store" , store);
      },
      
      save: function(){
        //console.debug("save project");
        var self = this;
        var p = db.getProjectModel(this.project, true);
        var def;
        if (this.isNew){
          def = p.add(this.project);
        } else {
          def = p.update(this.project);
        }
    
        dojo.when(def, function(res){
          self.onSave(res);
        });
        
      },
      
      onSave: function(project){

      },
      
      baseClass: "project-form"
  });
  return app.views.ProjectForm;     
});