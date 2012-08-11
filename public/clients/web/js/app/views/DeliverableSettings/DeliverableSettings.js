define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/deliverableSettings.html",
    "app/models/DeliverableModel",
    "app/views/DeliverableFieldSettings/DeliverableFieldSettings",
    "app/views/LabeledCheckbox/LabeledCheckbox",
    "app/views/Label/Label"
    ], 
  function(dojo,coordel, w, t, html, DeliverableModel, DeliverableFieldSettings, CheckBox, Label) {
  
  dojo.declare(
    "app.views.DeliverableSettings", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      id: null,
      
      task: null, //need the task to get the other deliverables in the task if there are any
      
      deliverable: null,
      
      model: null,
      
      currentPane: "",
      
      templateString: html,
      
      baseClass: "deliverable-settings",
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        this.model = new DeliverableModel({deliverable: this.deliverable});
        
        //if this is multipart, then we need to show the wizard header, set the fields pane
        //with this deliverables fields, and show navigation buttons
        if (this.model.isMultipart()){
          //set the values of the fields
          this.detailsName.set("value", this.deliverable.name);
          this.detailsInstructions.set("value", this.deliverable.instructions);
        } else {
          //console.debug("simple field", this.deliverable.fields[0]);
          //set the values of the fields
          this.simpleName.set("value", this.deliverable.name);
          this.simpleInstructions.set("value", this.deliverable.instructions);
          this.simpleFieldContainer.addChild(new DeliverableFieldSettings({
            field: this.deliverable.fields[0],
            showName: false
          })); 
        }
        
        this.showStack();
        
        //if there aren't any other fields in this task, hide the blockers menu item
        if (!this.task.workspace || this.task.workspace.length === 0){
          dojo.addClass(this.blockersMenu, "hidden");
        }
        
        //wire up the menus and buttons
        dojo.connect(this.detailsMenu, "onclick", this, function(evt){
          evt.stopPropagation();
          if (this.model.isMultipart()){
            this.showDetailsPane();
          } else {
            this.showSimplePane();
          }
          
        });
        
        dojo.connect(this.fieldsMenu, "onclick", this, function(evt){
          evt.stopPropagation();
          this.showFieldsPane();
        });
        
        dojo.connect(this.blockersMenu, "onclick", this, function(evt){
          evt.stopPropagation();
          this.showBlockersPane();
        });
        
        dojo.connect(this.navDetails, "onclick", this, function(evt){
          evt.stopPropagation();
          if (this.model.isMultipart()){
            this.showDetailsPane();
          } else {
            this.showSimplePane();
          }
        });
        
        dojo.connect(this.navFieldsPrev, "onclick", this, function(evt){
          evt.stopPropagation();
          this.showFieldsPane();
        });
        
        dojo.connect(this.navFieldsNext, "onclick", this, function(evt){
          evt.stopPropagation();
          this.showFieldsPane();
        });
        
        dojo.connect(this.navBlockers, "onclick", this, function(evt){
          evt.stopPropagation();
          this.showBlockersPane();
        });
        
        //watch the name and instructions
        this.simpleName.watch("value", function(prop, oldVal, newVal){
          //console.debug("simple name changed", prop, oldVal, newVal);
          self.deliverable.name = newVal;
        });
        this.detailsName.watch("value", function(prop, oldVal, newVal){
          //console.debug("details name changed", prop, oldVal, newVal);
          self.deliverable.name = newVal;
        });
        
        this.simpleInstructions.watch("value", function(prop, oldVal, newVal){
          //console.debug("simple instructions changed", prop, oldVal, newVal);
          self.deliverable.instructions = newVal;
        });
        
        this.detailsInstructions.watch("value", function(prop, oldVal, newVal){
          //console.debug("details instructions changed", prop, oldVal, newVal);
          self.deliverable.instructions = newVal;
        });
        
      },
      
      getDeliverable: function(){
        var fields = [];
            deliverable = this.deliverable;
        
        if (this.model.isMultipart()){
          //get fields from the fields container
          dojo.forEach(this.fieldsPane.getChildren(), function(f){
            fields.push(f.getField());
          });
        } else {
          //get fields from the simple container
          dojo.forEach(this.simpleFieldContainer.getChildren(), function(f){
            fields.push(f.getField());
          });
        }
        
        deliverable.fields = fields;
        
        return deliverable;
      },
      
      setNavigation: function(){
        //hide both buttons to start
        dojo.addClass(this.navDetails, "hidden");
        dojo.addClass(this.navFieldsNext , "hidden");
        dojo.addClass(this.navFieldsPrev , "hidden");
        dojo.addClass(this.navBlockers , "hidden");
        
        //hide all menu items to start
        
        showBlockers = (this.task.workspace && this.task.workspace.length > 0);
        isMulti = this.model.isMultipart();
        
        if (!showBlockers && !isMulti){
          //hide the navigation because all we need to see is the simple pane
          dojo.addClass(this.wizardHead, "hidden");
          dojo.addClass(this.navButtons, "hidden");
        }
        
        if (!isMulti){
          //hide the fields menu item because we're using simple
          dojo.addClass(this.fieldsMenu, "hidden");
        }
        
        if (!showBlockers){
          //there are no other fields so don't show the blockers menu
          dojo.addClass(this.blockersMenu, "hidden");
        }
        
        //if this is details or simple, then hide the previous button and if multipart show next as fields
        //if other deliverables and not multipart, show next as blockers
        if (this.currentPane === "details" || this.currentPane === "simple"){
          if (isMulti){
            dojo.removeClass(this.navFieldsNext, "hidden");
          } else {
            if (showBlockers){
              dojo.removeClass(this.navBlockers, "hidden");
            }
          }
        }
        
        //if this is fields
        if (this.currentPane === "fields"){
          dojo.removeClass(this.navDetails, "hidden");
          if (showBlockers){
            dojo.removeClass(this.navBlockers, "hidden");
          }
        }
        
        if (this.currentPane === "blockers"){
          if (isMulti){
            dojo.removeClass(this.navFieldsPrev, "hidden");
          } else {
            dojo.removeClass(this.navDetails, "hidden");
          }
        }
      },
      
      showStack: function(){
        //console.debug("showing stack");
        var isMulti = this.model.isMultipart();
        //this is the function that shows the wizard, details, fields, and navigations buttons
        //and focuses on either the simple or details pane
        //HACK because all three panes show when starting up until all three a clicked?????
        this.showBlockersPane();
        this.showFieldsPane();
        this.showDetailsPane();
        this.showSimplePane();
        if (isMulti){
          this.showDetailsPane();
        }
        this.setNavigation();
      },
      
      showFieldsPane: function(){
        var p = this.fieldsPane,
            fields = this.deliverable.fields,
            self = this;
        
        this.currentPane = "fields";
            
        //clear existing fields in the fields panel
        if (p.hasChildren()){
          p.destroyDescendants();
        }
        
        //add the fields
        dojo.forEach(fields, function(fld){
          //console.debug("should add this field", fld);
          
          self.fieldsPane.addChild(new DeliverableFieldSettings({
            field: fld
          }));
        });
        
        //show the stack pane
        this.settingsStack.selectChild(this.fieldsPane);
        
        //update the header
        dojo.removeClass(this.detailsMenu, "c-color-highlight");
        dojo.removeClass(this.blockersMenu, "c-color-highlight");
        dojo.addClass(this.fieldsMenu, "c-color-highlight");
        
        //update the navigation
        this.setNavigation();
      },
      
      showSimplePane: function(){
        this.currentPane = "simple";
        
        //shows the simple stack panel
        this.settingsStack.selectChild(this.simplePane);
        
        //update the header
        dojo.addClass(this.detailsMenu, "c-color-highlight");
        dojo.removeClass(this.blockersMenu, "c-color-highlight");
        dojo.removeClass(this.fieldsMenu, "c-color-highlight");
        
        //update navigation
        this.setNavigation();
      },
      
      showDetailsPane: function(){
        
        this.currentPane = "details";
        
        //shows the details stack panel
        this.settingsStack.selectChild(this.detailsPane);
        
        //update the header
        dojo.addClass(this.detailsMenu, "c-color-highlight");
        dojo.removeClass(this.blockersMenu, "c-color-highlight");
        dojo.removeClass(this.fieldsMenu, "c-color-highlight");
        
        //update navigation
        this.setNavigation();
      },
      
      showBlockersPane: function(){
        //clears any existing blockers in the blockers stack panel, add the tasks current deliverables, and then
        //shows the blockers panel
        
        this.currentPane = "blockers";
        
        var p = this.blockersPane,
            blockers = this.deliverable.blockers,
            self = this;
            
        //clear existing blockers in the blockers panel
        if (p.hasChildren()){
          p.destroyDescendants();
        }
        
        
        
        //add this task's current deliverables if there are any
        if (this.task.workspace && this.task.workspace.length > 0){
          //there has to be one field that doesn't have a blocker to make sure there is a start point
          //to start
          var count = 0;
          var canStart = false;
          var hasDisabled = false;
          dojo.forEach(this.task.workspace, function(del){
            console.log("del name", del.name, count);
            if (del.id !== self.deliverable.id && (!del.blockers || del.blockers.length === 0)){
              count += 1;
            }
          });
          if (count === 0){
            canStart = true;
          }
          dojo.forEach(this.task.workspace, function(del){
            //don't add this field as a blocker
            //console.debug("testing del and me", del.id, self.deliverable.id);
            
            
            if (del.id !== self.deliverable.id){
              //console.debug("wasn't me disabled currently false", del.name, del.blockers);
              var isDisabled = false;
              //if this deliverable has me as a blocker, disable it otherwise you get a circular reference
              if (del.blockers && del.blockers.length > 0){
                isDisabled = dojo.some(del.blockers, function(b){
                  //console.debug("testing disabled", b, self.deliverable.id);
                  return b === self.deliverable.id;
                });
                if (isDisabled){
                  hasDisabled = true;
                }
                //console.debug("isDisabled", isDisabled);
              }
              
              var name = del.name;
              
              if (isDisabled){
                name = name + "<sup class='c-color-active'>*</sup>";
              }
                
              var check = new CheckBox({
                value: del.id,
                label: name,
                checked: function(){
                  isChecked = false;
                  //if the current deliverable has this deliverable as a blocker, need to show it selected
                  if (self.deliverable.blockers && self.deliverable.blockers.length > 0){
                    dojo.forEach(self.deliverable.blockers, function(id){
                      if (del.id === id){
                        isChecked = true;
                      }
                    });
                  }
                  //console.debug("deliverable blocks" , del.name, isChecked);
                  return isChecked;
                },
                onChange: function(isChecked){
                  //if it's checked then add the id to self.deliverable.blockers. if not, remove it
                  if (isChecked){
                    //make sure there is a coordinates entry
                    //console.debug("it was selected, add the blocker");
                    if (!self.deliverable.blockers){
                      self.deliverable.blockers = [];
                    }
                    //add this value if it doesn't already exist
                    var doAdd = true;
                    var delId = check.get("value");
                    dojo.forEach(self.deliverable.blockers, function(id){
                      if (id === delId){
                        doAdd = false;
                      }
                    });
                    if (doAdd){
                      self.deliverable.blockers.push(check.get("value"));
                      //console.debug("blocker added to deliverable", check, self);
                    }
                    
                  } else {
                    //console.debug("it was deselected, remove the blocker");
                    var blockid = check.get("value");
                    dojo.forEach(self.deliverable.blockers, function(id, key){
                      if (blockid === id){
                        self.deliverable.blockers.splice(key, 1);
                        //console.debug("blocker removed deliverable", id, self);
                      }
                    });
                  }
                }
              });
              //console.debug("should show this deliverable", del);
              check.checkbox.set("disabled", isDisabled);
              if (isDisabled){
                hasDisabled = true;
              }
              if (canStart){
                check.checkbox.set("disabled", true);
              }
              self.blockersPane.addChild(check);
                
            } else {
              //console.debug("don't add because it's me", del.name);
            }
            
          });
          
          if (hasDisabled && !canStart){
            this.blockersPane.addChild(new Label({value: coordel.deliverableMessages.blocked, "class": "c-margin-t"}));
          }

          console.log("canStart", canStart);
          if (canStart){
            this.blockersPane.addChild(new Label({value: coordel.deliverableMessages.circular, "class": "c-margin-t"}));
          }
          
          
        }
        
        //show the blockers pane
        this.settingsStack.selectChild(this.blockersPane);
        
        
        
        //update the header
        dojo.removeClass(this.detailsMenu, "c-color-highlight");
        dojo.addClass(this.blockersMenu, "c-color-highlight");
        dojo.removeClass(this.fieldsMenu, "c-color-highlight");
        
        //update the navigation buttons
        this.setNavigation();
      }
  });
  return app.views.DeliverableSettings;     
});