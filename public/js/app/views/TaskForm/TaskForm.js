define(
  ["dojo",
    "dijit",
    "app/models/ProjectModel",
    "i18n!app/nls/coordel",
    "app/models/CoordelStore",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/TaskForm.html",
    "text!./templates/TaskFormTip.html",
    "text!./templates/Instructions.html",
    "text!./templates/NoneFound.html",
    "dijit/Tooltip",
    "dijit/TooltipDialog",
    "dijit/form/DropDownButton",
    "dijit/form/TextBox",
    "app/views/LabeledCheckbox/LabeledCheckbox",
    "app/widgets/PositionComboBox",
    "app/widgets/PositionFilteringSelect",
    "dijit/form/Textarea",
    "app/widgets/PositionDateTextBox",
    "dojo/date/locale",
    "dojo/data/ItemFileWriteStore",
    "dijit/form/Button",
    "dojo/date/stamp",
    "dijit/layout/ContentPane",
    "app/views/TaskFormSelect/TaskFormSelect",
    "app/views/TaskFormAdd/TaskFormAdd",
    "app/views/TaskFormPill/TaskFormPill",
    "app/views/DeliverableSettings/DeliverableSettings",
    "app/views/TaskFormAttachments/TaskFormAttachments"
    ], 
  function(dojo,dijit,pm,coordel,db, w, t, html,htmlTip, htmlInstructions, htmlNone, tip, tipd, drop, tb, CheckBox, cb,fs, ta, dtb, dtl,ws,btn, stamp, ContentPane, TaskFormSelect, TaskFormAdd, TaskFormPill, DeliverableSettings,TaskFormAttachments) {
  
  dojo.declare(
    "app.views.TaskForm", 
    [w, t], 
    {
      
      id: null,
      
      isNew: true,
      
      coordel: coordel,
      
      task: {},
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      taskFormTitle: coordel.taskForm.titleNew,
      
      tipTitle: null,
      
      showAddFormHandler: null,
      
      showNoneFoundHandler: null,
      
      postMixInProperties : function() {
        if (!this.isNew){
          //console.debug("not a new TaskForm");
          this.taskFormTitle = coordel.taskForm.titleEdit;
        }
        
      },
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        //console.debug("task in TaskForm", self.task);
        
        if (!self.task._id){
          var id = db.uuid();
          //console.debug("created new uuid for TaskForm",id);
          self.task._id = id;
        }
        
        //set the min and max dates for deadline and defer
        //NOTE: need to update the project select to update max and update deadline
        //if it's set later than the project deadline
        var min = stamp.toISOString(new Date(), {selector: "date"});
        if (self.isNew){
          self.taskFormDeadline.set("constraints",{min: min});
          self.taskFormDefer.set("constraints",{min: min});
        } else {
          var tmod = db.getTaskModel(self.task, true);
          if (tmod.p.isMyPrivate() || tmod.p.isMyDelegated()){
            self.taskFormDeadline.set("constraints",{min: min});
            self.taskFormDefer.set("constraints",{min: min});
          } else {
            var max = tmod.projDeadline();
            self.taskFormDeadline.set("constraints",{min: min, max:max});
            self.taskFormDefer.set("constraints",{min: min, max: max});
          }
        }
          
        //set the url for attachments
        self.taskFormAttachments.setUrl(db.db + self.task._id);
        self.taskFormAttachments.set("task", self.task);
        self.taskFormAttachments.set("username",db.username());
        
        //console.debug("postCreate in TaskForm", this.task);
        if (!self.isNew){
          self._setPills("project");
          self._setPills("delegate");
          self._setPills("blockers");
          self._setPills("deliverables");
          self.taskFormName.set("value", self.task.name);
          self.taskFormPurpose.set("value", self.task.purpose);
          if (self.task.deadline){
            self.taskFormDeadline.set("value", stamp.fromISOString(self.task.deadline));
          }
          if (self.task.calendar && self.task.calendar.start){
            self.taskFormDefer.set("value", stamp.fromISOString(self.task.calendar.start));
          }
          //console.debug("setting rev in task form", self.task._rev);
          self.taskFormAttachments.set("rev", self.task._rev);
          self.taskFormAttachments.setData();
        }
        self._setFilteringSelect(self.taskFormProject, db.projects());
        self._setFilteringSelect(self.taskFormDelegate, db.contacts(), true);
        self._setFilteringSelect(self.taskFormBlockers, db.projects());
        self._setFilteringSelect(self.taskFormDeliverables, db.templates("deliverable"));
        
        //if this isn't a new task, then hide the templates button. 
        if (!this.isNew){
          dojo.addClass(this.showReuseTemplates,"hidden");
          dojo.removeAttr(this.taskNameInnerNode, "style");
        }
        
        //make the datetextbox dropdown on focus rather than waiting to a click
        //dojo.connect(this.taskFormDeadline, "onFocus", this.taskFormDeadline, "openDropDown");
        //dojo.connect(this.taskFormDefer, "onFocus", this.taskFormDefer, "openDropDown");
        
        
        //the dijit.textarea placeHolder doesn't work. these functions
        //enable matching functionality. the attribute is in the template with the
        //correct variables so just remove these two connections when a release comes
        //that has it fixed - textarea used for name and purpose
        dojo.connect(this.taskFormName, "onFocus", this.taskFormName, function(){
          //console.debug ("onFocus taskFormPurpose", this);
          if(this.value === coordel.taskForm.phName){
            //console.debug("it was placeholder blank it");
            this.setValue("");
            dojo.removeClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.taskFormName, "onBlur", this.taskFormName, function() {
          //console.debug ("onblur taskFormPurpose", this);
        
          if(dojo.trim(this.value).length == 0){
            //console.debug("it was blank set it to the placeholder");
            this.setValue(coordel.taskForm.phName);  
            dojo.addClass(this.domNode, "c-placeholder");
          }
        });
        dojo.connect(this.taskFormPurpose, "onFocus", this.taskFormPurpose, function(){
          //console.debug ("onFocus taskFormPurpose", this);
          if(this.value === coordel.taskForm.phPurpose){
            //console.debug("it was placeholder blank it");
            this.setValue("");
            dojo.removeClass(this.domNode, "c-placeholder");
          }
        });
        
        dojo.connect(this.taskFormPurpose, "onBlur", this.taskFormPurpose, function() {
          //console.debug ("onblur taskFormPurpose", this);
        
          if(dojo.trim(this.value).length == 0){
            //console.debug("it was blank set it to the placeholder");
            this.setValue(coordel.taskForm.phPurpose);  
            dojo.addClass(this.domNode, "c-placeholder");
          }
        });
        
        
        dojo.connect(this.taskFormDeliverables, "closeDropDown", this, function(){
          //when this closes, need to reset all the pills
          //console.debug("resetting the pills");
    	    var cont = self.taskFormDeliverablesValue;
  	      if (cont.hasChildren()){
  	        dojo.forEach(cont.getChildren(), function(pill){
  	          pill.reset();
  	        });
  	      }
    	    //self.taskFormDeliverables._status = "select";
        });
        
       
    
    /*-----------------------------------------------------------------------------------------*/
        //need to watch for selections in the filtering selects to set the pills
        //project
        dojo.connect(this.taskFormProject, "onChange", this, function(args){
          //when a project is selected from the list, onChange will fire
          //can't use the watch because value changes as you navigate
          //and the value will be set. Getting to the add form happens when the user
          //will be adding a new project
          this._setPills("project");
          this.taskFormProject._status = "select";
        });
        
        //delegate
        dojo.connect(this.taskFormDelegate, "onChange", this, function(args){
          //same as project except that this is for the user of the task
          this._setPills("delegate");
          this.taskFormDelegate._status = "select";
        });
        
        //deliverables
        dojo.connect(this.taskFormDeliverables, "onChange", this, function(deliverableId){
          var del = this.taskFormDeliverables;
          //console.debug("taskFormDeliverables ONCHANGE", del._status, deliverableId);
          
          /*
          if (!del.dropDown){
            
            console.debug("no dropdown");
            return;
          }
          */
          
          var template,
              hasTemplate = false;
              
          if (del._status === "select" || del._status === "none"){
            
            //we're in step one
            //get the template
            var templateId = this.taskFormDeliverables.get("value");
            if (templateId){
              hasTemplate = true;
             
              template = db.getDeliverableTemplate("deliverable", templateId);
              //console.debug("got the template to add", template, templateId);
            }
           
          } else if (del._status === "edit"){
            
            //clicked a pill, so the template is the deliverableId sent
            hasTemplate = true;
            var id = deliverableId;
            //console.debug("we're about to get the deliverable", id);
            template = dojo.filter(this.task.workspace, function(d){
              //console.debug("checked this deliverable", d.id, id);
              return d.id === id;
            })[0];
            
            
          } else if (del._status === "saved"){
            //we saved and the change is happening, now get ready to do another
            del._status = "select";
            //console.debug("deliverables status set to select");
          } else if (del._status === "closed"){
            del._status = "reset";
            del.reset();
          } else if (del._status === "reset"){
            del._status = "closed";
            del._onBlur();
          }
          
          if (hasTemplate){
            this.taskFormDeliverables.openAltDropDown("add");
            
            //get the settings container embedded in the altdropdown
            var cont = this.taskFormDeliverables.altDropDown.settingsContainer;
            
            //add a deliverablesettings component to it
            if (cont.hasChildren()){
              cont.destroyDescendants();
            }
            
            cont.addChild(new DeliverableSettings({task: this.task, deliverable: template}));
            //console.debug("got the template, setting the setting to select", template);
            //del._status = "select";
          }
        });
        
        //blockers
        dojo.connect(this.taskFormBlockers, "onChange", this, function(args){
          
          var block = self.taskFormBlockers;
          //there can be more than one blocker so need to be able to add them
          //on demand. There will always be two steps: choose the project, then 
          //choose the tasks from that project that block
          //console.debug("onChange", this.taskFormBlockers.dropDown);
          //console.debug("onChange taskFormBlockers TaskForm", this.taskFormBlockers._status);
          
          //need to make sure we weren't cancelled otherwise, the altDropdown will be shown when
          //the taskform is closed
          
          if (!block.dropDown){
            return;
          }
          
          
          if (block._status === "select" || block._status === "none"){
            
            //we're in step one
            //need to load the project (if it isn't already) to get the tasks
             
            //get the current project from the filtering select's value
            var project = this.taskFormBlockers.get("value");
            
            var store = db.projectStore;
            
            var current = this.task;
            
            this.taskFormBlockers.openAltDropDown("add");
            
            //get the checkedmultiselect
            var cp = this.taskFormBlockers.altDropDown.projectTasksContainer;
            var def = db.projectStore.loadProject(project);
            
            def.then(function(){
              var all = store.taskMemory.query({db: db});
              //console.debug("all tasks sorted alphabetically", all);
              
              dojo.forEach(all, function(task){
                //console.debug("here's the task", task);
                var check = new CheckBox({
                  value: task._id,
                  label: task.name,
                  checked: function(){
                    isChecked = false;
                    //if the current task has this projectTask as a blocker, need to show it selected
                    if (current.coordinates && current.coordinates.length > 0){
                      dojo.forEach(current.coordinates, function(id){
                        if (task._id === id){
                          isChecked = true;
                        }
                      });
                    }
                    //console.debug("projectTask blocks" , task.name, isChecked);
                    return isChecked;
                  },
                  onChange: function(isChecked){
                    //if it's checked then add the id to this.task's coordinates. if not, remove it
                    if (isChecked){
                      //make sure there is a coordinates entry
                      //console.debug("it was selected, add the blocker");
                      if (!current.coordinates){
                        current.coordinates = [];
                      }
                      //add this value if it doesn't already exist
                      var doAdd = true;
                      var taskId = check.get("value");
                      dojo.forEach(current.coordinates, function(id){
                        if (id === taskId){
                          doAdd = false;
                        }
                      });
                      if (doAdd){
                        current.coordinates.push(check.get("value"));
                      }
                      
                    } else {
                      //console.debug("it was deselected, remove the blocker");
                      var blockid = check.get("value");
                      dojo.forEach(current.coordinates, function(id, key){
                        if (blockid === id){
                          current.coordinates.splice(key, 1);
                        }
                      });
                    }
                  }
                });
                
                //disable the checkbox if this projectTask has current as a blocker
                //to avoid causing a circular reference 
                if (task.coordinates && task.coordinates.length > 0){
                  dojo.forEach(task.coordinates, function(id){
                    if (current._id === id){
                      check.set("disabled", true);
                    }
                  });
                  
                }
                cp.addChild(check);
              });
           
            });
            
          } else if (block._status === "closed"){
            block._status = "reset";
            block.reset();
          } else if (block._status === "reset"){
            block._status = "closed";
            block._onBlur();
          }
          
          //this.taskFormBlockers._status = "select";
          
        });
    /*------------------------------------------------------------------------------------------*/
        //watch for clicking of remove on the pill (project and delegate only). blockers and deliverables
        //have to be handled as pills are added so removal is handled in _setPills
        //project
        dojo.connect(this.taskFormProjectValue.removeValue, "onclick", this, function(){
          //console.debug("should remove the project value");
          
          //get rid of the project
          delete this.task.project;
          
          //hide the pill
          dojo.addClass(this.taskFormProjectValue.domNode, "hidden");
          dojo.removeClass(this.taskFormProject.domNode, "hidden");
          //make sure we don't react to onChange and set the pill again when we reset to nothing
          this.taskFormProject.reset();
          this.taskFormProject.focus();
          //now make sure we can reset the pill when selected
        });
        
        //delegate
        dojo.connect(this.taskFormDelegateValue.removeValue, "onclick", this, function(){
          //console.debug("should remove the username value");
          
          //get rid of the project
          delete this.task.username;
          
          //hide the pill
          dojo.addClass(this.taskFormDelegateValue.domNode, "hidden");
          dojo.removeClass(this.taskFormDelegate.domNode, "hidden");
          //make sure we don't react to onChange and set the pill again when we reset to nothing
          this.taskFormDelegate.reset();
          this.taskFormDelegate.focus();
          //now make sure we can reset the pill when selected
        });
        
    /*------------------------------------------------------------------------------------------*/
        //watch for adds from the form of the four (project,deliverables,delegate, and blockers)
        //project
        dojo.connect(this.taskFormProject, "onAddOption", this, function(project){
          //console.debug("should add a new project", project);
          var p = new pm({project: project, db: db});
         
          
          
          //need to get a new id so we can set the project for this task and save the new project
          project._id = db.uuid();

          //add the new project to the taskFormProject store in case the user wants to start over later;
          self.taskFormProject.store.newItem({name: project.name, _id: project._id});
          
          //save the project to the projectStore
          p.add(project);
          
          //set the project of this task
          self.task.project = project._id;
          
          //reset the filtering select
          self.taskFormProject.reset();
          
          //show the pill of the the task's project
          self._setPills("project");
          
          //console.debug("project to add, task", project, self.task);
          
        });
        
        //blockers
        dojo.connect(this.taskFormBlockers, "onAddOption", this, function(){
          //console.debug("adding blockers");
          
          self.taskFormBlockers.reset();
          self.taskFormBlockers.focus();
          
          self._setPills("blockers");
        });
        
        //deliverables
        dojo.connect(this.taskFormDeliverables, "onAddOption", this, function(deliverable){
          //console.debug("adding deliverable", deliverable);
          if (!self.task.workspace){
            self.task.workspace = [];
          }
          self.task.workspace.push(deliverable);
          self.taskFormDeliverables.reset();
          self.taskFormDeliverables.focus();
          
          self._setPills("deliverables");
        });
      
        
        
    /*---------------------------------------------------------------------------------------*/
        //deliverables
        dojo.connect(this.taskFormDeliverables, "onEditOption", this, function(deliverable){
          //console.debug("editing deliverable", deliverable);
          var dels = this.task.workspace;
          dojo.forEach(dels, function(d, key){
            if (d.id === deliverable.id){
              dels.splice(key,1,deliverable);
            }
          });
          self.taskFormDeliverables.isEditing = false;
          self.taskFormDeliverables.reset();
          self.taskFormDeliverables.focus();
          
          self._setPills("deliverables");
        }); 
        
    /*----------------------------------------------------------------------------------------*/
        dojo.connect(this.taskFormProject, "onAdd", this, function(evt){
          //when a project is added, this event will fire, so show the instructions for the project
          //console.debug("project change", evt);
          this._showInstructions(evt);
        });
        
    /*----------------------------------------------------------------------------------------*/
        //watch fields for changes
        //name
        this.taskFormName.watch("value", function(prop, oldVal, newVal){
          //protect from saving the placeholder value
          if(this.value !== coordel.taskForm.phName){
            //console.debug("task name changed", prop, oldVal, newVal);
            self.task.name = newVal;
            //self.set("name", newVal);
          }
        });
        
        //purpose
        this.taskFormPurpose.watch("value", function(prop, oldVal, newVal){
          
          //protect from saving the placeholder value
          if(this.value !== coordel.taskForm.phPurpose){
            //console.debug("task purpose changed", prop, oldVal, newVal);
            self.task.purpose = newVal;
            //self.set("purpose", newVal);
          }
         
        });
        //deadline
        this.taskFormDeadline.watch("value", function(prop, oldVal, newVal){
          //console.debug("task deadline changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          if (newVal){
            self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "date"});
          } else {
            self.task.deadline = "";
          }
          
        });
        
        //project
        this.taskFormProject.watch("value", function(prop, oldVal, newVal){
          //console.debug("task project changed", prop, oldVal, newVal);
          //self.set("project", newVal);
          self.task.project = newVal;
        });
        
        //delegate
        this.taskFormDelegate.watch("value", function(prop, oldVal, newVal){
          //console.debug("task delegate changed", prop, oldVal, newVal);
          //self.set("project", newVal);
          self.task.username = newVal;
          //console.debug("username after delegate change", self.task.username);
        });
        
        //defer
        this.taskFormDefer.watch("value", function(prop, oldVal, newVal){
          //console.debug("task defer changed", prop, oldVal, newVal, stamp.toISOString(new Date(newVal)));
          if (!self.task.calendar){
            self.task.calendar = {};
          }
          self.task.calendar.start = stamp.toISOString(new Date(newVal));
          //self.set("deadline", newVal);
          //self.task.deadline = stamp.toISOString(new Date(newVal), {selector: "date"});
        });
        
        //deliverables
        //don't need to watch because filtering select handles changing the values
        
        //blockers
        //don't need to watch because the filtering select handles changing the values
        
        //attachments
        
    /*--------------------------------------------------------------------------------------------------*/
        //focus on the task name field on show and focus
        var once = dojo.connect(this, "onReady", self, function(){
          //console.debug("taskForm onFocus", this);
          //need to give a little time before focusing because it gets confused with its own focus
          var t = setTimeout(function(){
            //console.debug("TaskForm focused");
            self.taskFormName.focus();
          }, 200);
          
          dojo.disconnect(once);
        
        });
        
        if (self.isNew){
          this._initTips();
        }
        
        //if the db focus is "project" and there isn't a project yet then default the form project to 
        //the currently focused one
        if (db.focus === "project" && !self.task.project){
          //console.debug("db.focus", db.focus, db.projectStore.currentProject, self.task.project);
          //set the project of this task
          self.task.project = db.projectStore.currentProject;
          
          //show the pill of the the task's project
          self._setPills("project");
        }
        
        //TODO: need to default delegation to a contact if focus is contact
        
        this.onReady();
      },
      
      onReady: function(){
         
        //this is here to enable the focus to be set on the task name on load
      },
      
      
      _setPills: function(field){
      
        var self = this;
        //project and delegate because there can only be one
        //pill at a time and the TaskFormPill is in the html. for blockers and deliverables there can be
        //multiple, so there is a ContainerPane where they can be added. 
        switch(field){
          case "project":
          if (this.task.project){
            dojo.addClass(this.taskFormProject.domNode, "hidden");
            dojo.removeClass(this.taskFormProjectValue.domNode, "hidden");
            this.taskFormProjectValue.showPill(this.task.project);
          }
          break;
          case "delegate":
          if (this.task.username){
            dojo.addClass(this.taskFormDelegate.domNode, "hidden");
            dojo.removeClass(this.taskFormDelegateValue.domNode, "hidden");
            this.taskFormDelegateValue.showPill(this.task.username);
          }
          break;
          case "deliverables":
          var dcont = this.taskFormDeliverablesValue;
          var deliverables = this.task.workspace;
          var dfs = this.taskFormDeliverables;
          //console.debug("should create pills for", this.task.workspace);
          if (dcont.hasChildren()){
            dcont.destroyDescendants();
          }
          dojo.forEach(deliverables, function(del){
            var pdel = new TaskFormPill({
              taskFormField: "deliverables"
            });
            
            //show a small icon on the left of the pill so a user can see that the deliverable
            //has blockers
            if (del.blockers && del.blockers.length > 0){
              pdel.imageClass = "pill-blocker";
            }
            
            //wire up the removal of the pill
            dojo.connect(pdel.removeValue, "onclick", function(){
              var removeId = pdel.value;
              
              //first delete the correct pill and remove the deliverable
              var dKey;
              dojo.forEach(deliverables, function(d, key){
                //console.debug("deliverable in remove pill", d);
                if (removeId === d.id){
                  //console.debug("removing pill");
                  //capture which deliverable to remove because deleting it here 
                  //caused an error
                  dKey = key;
                }
              });

              //then make sure that the one removed isn't a blocker in any of the remaining
              dojo.forEach(deliverables, function(d, key){
                //make sure what we're deleting doesn't block another deliverable in this task
                if (d.blockers && d.blockers.length > 0){
                  dojo.forEach(d.blockers, function(b, key2){
                    if (removeId === b){
                      //console.debug("removing blocker from other deliverable");
                      d.blockers.splice(key2,1);
                    }
                  });
                }
              });
              //now delete the deliverable
              deliverables.splice(dKey,1);
              
              //close in case we were editing
              dfs.forceClose(true);
              dfs.focus();
              
              //now reset the pills with the updated data
              self._setPills("deliverables");
            });
            
            //wire up what happens when we click the pill
            dojo.connect(pdel.displayValue, "onclick", function(){
              
              dfs._status = "edit";
              pdel.select();
              self.taskFormDeliverables.isEditing = true;
              self.taskFormDeliverables.focus();
              //console.debug("calling onChange with", pdel.value);
              self.taskFormDeliverables.onChange(pdel.value);
              
            });
            
            pdel.showPill(del, db);
            
            dcont.addChild(pdel);
          });
          break;
          case "blockers":
          var model = db.getTaskModel(this.task, true);
          var cont = this.taskFormBlockersValue;

          //console.debug("model in task form blockers", model, this.task);
          
          //if there are blockers, deal with them
          if (model.hasBlockers()){
            
            var blockers = this.task.coordinates;
            
            //iterate over the existing pills (if there are any) and remove any
            //that aren't in the blocker list
            if (cont.hasChildren()){
              dojo.forEach(cont.getChildren(), function(pill){
                var remove = true;
                dojo.forEach(blockers, function(id){
                  //console.debug("should remove", (pill.value === id), pill);
                  if (pill.value === id){
                    remove = false;
                  }
                });
                if (remove){
                  pill.destroy();
                }
              });
            }
          
            //add any new pills
            dojo.forEach(blockers, function(id){
              var add = true;
              if(cont.hasChildren()){
                dojo.forEach(cont.getChildren(), function(pill){
                  //console.debug("should add", (pill.value === id), pill);
                  if (pill.value === id){
                    add = false;
                  }
                });
              }
              if (add){
                var p = new TaskFormPill({
                  taskFormField: "blockers"
                });
                
                //connect the removeValue button
                dojo.connect(p.removeValue, "onclick", function(){
                  dojo.forEach(blockers, function(id, key){
                    if (p.value === id){
                      blockers.splice(key,1);
                      p.destroy();
                    }
                  });
                });
                
                p.showPill(id, db);
                cont.addChild(p);
              }
            });
          } else {
            //no blockers, need to clear any existing pills
            if (cont.hasChildren()){
              cont.destroyDescendants();
            }
          }
        }
      },
          
      _resetDropDowns: function(current){
        var items = ["Project", "Blockers", "Delegate", "Deliverables"],
            self = this;
        
        items.forEach(function(item){
          //so, want to reset everything except me if I'm the field
          if (current !== item.toLowerCase()) {
            //console.debug("resetting DropDowns", item);
      	    var fldId = "taskForm" + item;
      	    var dd = dijit.byId(self[fldId]);
      	    //console.debug("dropdown", dd, fldId, self[fldId]);
      	    dd.forceClose();
          };
        });
      },
      
      _setFilteringSelect: function(control, list, isContact){
         
         var store = new ws({data: {identifier: "_id", items:[]}});
         
         dojo.forEach(list, function(obj, key){
           if (isContact){
             store.newItem({name: obj.first + " " + obj.last, _id: obj._id});
           } else {
             store.newItem({name: obj.name, _id: obj._id});
           }
         });
         
         control.displayMessage = function(){
           return false;
         };
         
         control.set("store" , store);
      },
      
      _initTips: function(){
        //show tooltips when a field gets focus
        //task name
        this._setFieldConnection("name");
        //purpose
        this._setFieldConnection("purpose");
        //deadline
        this._setFieldConnection("deadline");
        //project
        this._setFieldConnection("project");
        //delegate
        this._setFieldConnection("delegate");
        //defer
        this._setFieldConnection("defer");
        //deliverables
        this._setFieldConnection("deliverables");
        //blockers
        this._setFieldConnection("blockers");
        //attachments
        this._setFieldConnection("attachments");
 
      },
      
      cancel: function(){
        var btn = dijit.byId("addTaskDropdown");
        
        btn.closeDropDown();
        this.destroy();
      },
      
      save: function(){
        //console.debug("count before add", db.taskStore.memory.data.length);
        //dojo.publish("coordel/addTask",[this.task]);
        
        //console.debug("task to save", this.task, this.task.username);
    
        var t = db.getTaskModel(this.task, true);
        if (this.isNew){
          t.add(this.task);
        } else {
          t.update(this.task);
        }
        this.cancel(); 
      },
      
      _getTipTemplate: function(field){
        
        var map = {
          tipTitle: coordel.taskFormTip[field+"Title"],
          tipText: coordel.taskFormTip[field+"Text"]
        };
        
        return dojo.string.substitute(htmlTip, map);
        
      },
      
      _getInstructionsTemplate: function(field){
        
        var map = {
          instructions: coordel.taskFormInstructions[field+"Title"],
          instructionsText: coordel.taskFormInstructions[field+"Text"]
        };
        
        return dojo.string.substitute(htmlInstructions, map);
      },
      
      _setFieldConnection: function(field){
        //get the right object
        var tc = {};
        switch (field){
          case "name":
            tc = this.taskFormName;
            break;
          case "purpose":
            tc = this.taskFormPurpose;
            break;
          case "deadline":
            tc = this.taskFormDeadline;
            break;
          case "project":
            tc = this.taskFormProject;
            break;
          case "delegate":
            tc = this.taskFormDelegate;
            break;
          case "defer":
            tc = this.taskFormDefer;
            break;
          case "deliverables":
            tc = this.taskFormDeliverables;
            break;
          case "blockers":
            tc = this.taskFormBlockers;
            break;
          case "attachments":
            tc = this.taskFormAttachments;
            break;
        }
        
        dojo.connect(tc, "onFocus", this, function(){
          this._setTip(field, this._getTipTemplate(field));
          this._resetDropDowns(field);
        });
        dojo.connect(tc, "onBlur", this, function(){
          //dojo.destroy("taskFormTipContainer");
          dojo.addClass(this[field+"Tip"], "hidden");
        });
      },
      
      _showInstructions: function(field){
        //call this to add instructions to the exposed tip. for example, if the user is adding
        //a new project, when the add project dropdown shows, the tip should get instructions 
        //about adding the project
        
        var tip = dojo.query(".task-form-tip", this[field+"Tip"])[0];
        
        var template = this._getInstructionsTemplate(field);
        
        dojo.create("div", {
          id: field+"Instructions",
          innerHTML: template
        }, tip);
      },
      
      _hideInstructions: function(field, template){
        
      },
      
      _setTip: function(field, template){
        
        //console.debug("in _setTip", field, template);
        
        var li = dojo.query(".task-" + field)[0];
        
        var tipInfo = dojo.position(li, true),
            left = tipInfo.x + tipInfo.w + 12,
            top = tipInfo.y - tipInfo.h;
            
        //to position the tip appropriately, we want the pointer to to be 12 px to the right center
        //of the li element, the top of the tipContainer to be the top of the li element
         
         var tip = this[field + "Tip"];
         tip.innerHTML = template;
          
          dojo.style(tip, {
            position: "absolute",
            left: left + "px",
            top:  top + "px",
         
            display: "block"
          });
          
          //console.debug("here is the tip to place", tip);
          
          //dojo.place(tip,"addTaskDialog");
          
          dojo.removeClass(tip, "hidden");
          
      }
  });
  return app.views.TaskForm;     
});