define(
  ["dojo", 
  "app/util/dateFormat",
  "dijit/form/CheckBox", 
  "i18n!app/nls/coordel",
  "text!./templates/task.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "dojo/date/stamp",
  "app/views/TaskInfo/TaskInfo",
  "app/views/Dialog/Dialog",
  "dijit/TooltipDialog",
  "dijit/TitlePane",
  "app/widgets/ContainerPane",
  "app/views/TaskActionsMenu/TaskActionsMenu",
  "app/models/CoordelStore",
  "app/views/TaskForm/TaskForm",
  "app/views/ConfirmDialog/ConfirmDialog",
  "app/views/TaskInfoDialog/TaskInfoDialog",
  "app/views/ProjectInfo/ProjectInfo",
  "app/models/ProjectStatus",
  "app/views/Stream/Stream",
  "app/views/Dialog/Dialog"], 
  function(dojo, dt, chk, coordel, html, w, t, stamp, ti, dialog, toolDialog, tp, cp, ActionsMenu, db, TaskForm, Confirm, TaskInfoDialog, ProjectInfo, pStatus, Stream, cDialog) {
  
  dojo.declare(
    "app.views.Task", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      widgetsInTemplate: true,
      
      subHandlers: [],
      
      actionsDialog: null,
      
      isProjectInvite: false,
      
      role: "project",
      
      showProjectLabel: false,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        //task.docType = project then we need to convert
        //this project into an invite Task
        //this.projectStatus starts with taskListControl that tests for project invites
        //it is passed to TaskListGroup and then into task
        if (this.task.docType === "project"){
          
          //console.debug("this was a project task");
          //need to save the project for use when detecting status
          this.project = this.task;
          
          //project type tasks can be regular invitations or opportunity invitations
          if (this.task.substatus === "OPPORTUNITY"){
             this.task = this._createOpportunityTask(this.task);
          } else {
            //turn the project into a project invite task
            this.task = this._createInviteTask(this.task, this.projectStatus);
          }
          
          this.isProjectInvite = true;
				}
				
				if (!this.task.name){
				  this.task.name = "";
				}
        
      },
      
      _createOpportunityTask: function(proj){
        //since this is a potential opportunity for the person looking at it, need to make them the user
        //so they can be provided the opportunity to follow
        var username = db.username();
        
        //create the task here. the project created is used as the id, name as name
        //inviteType is added with the value opportunity because in effect everyone seeing it is invited
        //OPPORTUNITY is used as the substatus of the task
        var task = {
					_id: proj.created,
					name: proj.name,
					docType: "task",
					inviteType: "opportunity",
					hasMulti: false,
					created: proj.created,
					updated: proj.updated,
					isNew: proj.isNew,
					responsible: proj.responsible,
					project: proj._id,
					status: "PROJECT",
					substatus: "OPPORTUNITY",
					deadline: proj.deadline
			  };
			  
			  this.role = "opportunity";
			  
			  return task;
        
        
      },
      
      _createInviteTask: function(proj, status){
        if (!status){
          status = "INVITE";
        }
        //it's possible that more than one person role is creating an invite of this type
        //so need to create a holder for the usernames. If there's more than one, 
        //we'll append them as a supplemental field to the task. if there's one, that will be the 
        //username
        var users = [];
        
        var role = "project"; //when roleid is project, then this isn't responsible or follower
        
        
        //we know the type of invite this is based on the incoming status, so just need to 
        //inspect the project to find the assignment(s) with a matching status
        dojo.forEach(proj.assignments, function(assign){
          //if the status matches the incoming status, push the user and then need
          //to check if this is just a follower role so we know what buttons to show. if it's project,
          //it means that they need to participate. if it's follower, then they need to follow the project
          //console.debug("testing assignments in taskInvite", proj.name, assign.status, status);
          if (assign.status === status){
            if (proj.responsible === db.username()){
              //if i'm the project responsible, then i need to see everyone that might have generated
              //an invite with this status (PROPOSED, DECLINED, LEFT)
              
              //ignore responsible assignments when tracking users,responsibles know about themselves,
              //only care about declined participate.
              if (assign.role !== "RESPONSIBLE"){
                if (assign.role === "FOLLOWER"){
                  role = "follower";
                }
                //track any users that meet all the criteria
                users.push(assign.username);
              }
               
            } else if (assign.username == db.username()){
              //otherwise this is just for me (AGREED, INVITE)
              if (assign.role === "FOLLOWER"){
                role = "follower";
              }
              users.push(assign.username);
            }
          } else if (assign.status === "INVITE" && assign.role === "FOLLOWER"){
            role = "follower";
            users.push(assign.username);
          }
          
        });
        
        this.role = role;
        
        //create the task here. the project created is used as the id, name as name
        //inviteType is added with the value role became
        //the status is used as the substatus of the task
        var task = {
					_id: proj.created,
					name: proj.name,
					docType: "task",
					inviteType: role,
					hasMulti: false,
					created: proj.created,
					updated: proj.updated,
					isNew: proj.isNew,
					responsible: proj.responsible,
					project: proj._id,
					status: "PROJECT",
					substatus: status
			  };
			  
			  //finally deal with the users
			  if (users.length === 0){
			    console.debug("ERROR: coverting project to task, no username");
			  } else if (users.length === 1){
			    //console.debug("there was one user", users, users[0]);
			    task.username = users[0];
			  } else if (users.length > 1){
			    //console.debug("there was more than one user", users);
			    task.hasMulti = true;
			    task.userList = users;
			  }
			  
			  return task;

			},
      
      
      handleGlow: function(args){
        if (this.task._id === args.id){
          if (args.isGlowing){
            //console.debug("show glow: ", this.task.name);
            if (this.domNode){
               dojo.addClass(this.domNode, "glow");
               dojo.window.scrollIntoView(this.domNode);
            }
           
          } else {
            //console.debug("hide glow: ", this.task.name);
            if (this.domNode){
              dojo.removeClass(this.domNode, "glow");
            }
            
          }
           
        }
      },
      
      handleBlock: function(args){
        var list = args.list;
        var self = this;
        dojo.forEach(list, function(id){
          //console.log("task", self.task._id, "id", id);
          if (self.task._id === id){
            if (args.show){
              //console.debug("show block: ", self.task.name);
              if (self.domNode){
                 dojo.addClass(self.domNode, "block");
              }

            } else {
              //console.debug("hide glow: ", self.task.name);
              if (self.domNode){
                dojo.removeClass(self.domNode, "block");
              }

            }

          }
        });
        
      },
      
      handleTurboDone: function(args){
        if (this.task._id === args.id){
          if (args.isDone){
            if (this.domNode){
              dojo.removeClass(this.turboIcon, "hidden");
            }
            
          } else {
            if (this.domNode){
              dojo.addClass(this.turboIcon, "hidden");
            }
            
          }
        }
      },
      
      postCreate: function(){
        this.inherited(arguments);
        
        var username = db.username(),
            t = db.getTaskModel(this.task, true),
            self = this;
            
        if ((this.task.username !== username && !t.isSubmitted()) || (this.task.responsible !==username && t.isSubmitted())){
          
          //console.log("removing mine");
          //if I don't own this task, then it shouldn't have a link to go to task details;
          dojo.removeClass(this.showDetails, "mine");
         
        }
        
        //if it's an opportunity, it heeds to have the link
        if (this.role === "opportunity"){
          dojo.addClass(this.showDetails, "mine");
        }
        
        if (t.isDone() || t.isCancelled()){
          //then it shouldn't have a link to go to task details
           dojo.removeClass(this.showDetails, "mine");
        }
          
        if (this.task.inviteType){
          this.isProjectInvite = true;
          //console.debug("isProjectInvite", this.isProjectInvite, t.isInvite());
        }
        
        //set the dropdown for the choose action tooltipdialog
        this.chooseAction.dropDown = this.actionsDialog;
        
        this.subHandlers.push(dojo.subscribe("coordel/timeUpdate", this, "_setDeadline"));
        
        //handle when the actionsMenu is clicked
        this.subHandlers.push(dojo.subscribe("coordel/taskAction", this, "doTaskAction"));
        
        //handle making this task glow
        this.subHandlers.push(dojo.subscribe("coordel/glow", this, "handleGlow"));
        
        //handle making this task glow
        this.subHandlers.push(dojo.subscribe("coordel/block", this, "handleBlock"));
        
        //handle showing and hiding the turbo done icon
        this.subHandlers.push(dojo.subscribe("coordel/turboDone", this, "handleTurboDone"));
        
        //if i'm not the project responsible, delegator, or user of the task, then the
        //checkbox needs to be disabled so other members of the project can't mark it done
        if (t.projResponsible() !== username && t.delegator !== username && t.username !== username && !t.isDone()){
          this.taskCheckbox.set("disabled", true);
        }
        
        //if this is current, delegated or invite, the user needs to see metainfo added to the task (Issue, Cleared, etc)
        if (this.focus === "search" || this.focus === "current" || this.focus==="blocked" || this.focus==="delegated" || this.focus === "project" || this.focus === "task-invited" || this.focus === "project-invited" && !t.isDone()){
          this._setMetaInfo();
        }
        
        //set the deadline. not all tasks will have deadlines, so project deadline will default if there is one
        //except for delegated and private projects (unless a deadline is set on the task
        this._setDeadline();
        
        
        
        if (t.isPending()){
          //disable the checkbox
          this.taskCheckbox.set("disabled", true); 
        }
        
        //if a task isn't ready (there is more work to do on the deliverables) then it can't be marked
        //done, so disable the checkbox;
        if(!t.isReady() && !t.isDone()){
          this.taskCheckbox.set("disabled", true);
        }
        
        //if this is blocked or blocking, then use the alternate colored checkboxes
        if (t.hasBlocking() && !t.isDone() && !t.isCancelled()){
          dojo.addClass(this.domNode, 'blocking');
        }
        
        //if this is blocked, checkboxes are disabled
        if (t.isBlocked()){
          this.taskCheckbox.set("disabled", true);
          dojo.addClass(this.domNode, 'blocked');
        }
        
        //if a task is blocked because it's paused, add paused meta info so the user knows
        if (t.isPaused()){
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.paused + " : ");
        }
        
        //if this is submitted and i'm not the responsible, checkbox is disabled
        if (t.isSubmitted() && t.projResponsible() !== username){
          this.taskCheckbox.set("disabled", true);
        }
        
        //if this is deferred, set defered date as task metainfo
        if (t.isDeferred() || t.isContactDeferred()){
          
          
          //when a task is deferred, it might also need to show that it was cleared as an issue
          //i.e. i raise an issue that I can't start til next week. the responsible changes the defer 
          //date on the task to next week then clears it. it's now deferred, but the user needs to 
          //see that it was cleared. (doesn't apply to the deferred view or the project view)
          if (t.substatus === "CLEARED" && this.focus ==="deferred"){
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.cleared + " : ");
          }
          
          //console.debug("it's deferred");
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.starts + " " + dt.deferred(t.calendar.start) + " : ");
          
          //if it's deferred and we're the focus is deferred, show the remove defer button
          if (this.focus === "deferred"){
            dojo.removeClass(this.removeDeferDate, "hidden");
          }
    
        }
        
        
        //hide the delete button. it only shows on delegated and private tasks
        dojo.query(".delete", this.domNode).addClass("hidden");
        
        // unless this is an opportunity, if the user isn't the project responsible or delegator of task or user of task
        //only has the ability to view the stream and see the info
        if (!this.role === "opportunity" && t.projResponsible() !== username && t.delegator !== username && t.username !== username){
          dojo.query(".edit", this.domNode).addClass("hidden");
          dojo.query(".actions", this.domNode).addClass("hidden");
          dojo.query(".stream", this.domNode).addClass("task-actions-corner-left");
        }
        
        if (t.isProjectInvite()){
          //you can't mark an invite done
          this.taskCheckbox.set("disabled", true);
        }
        
        //this is a task invite
        if (t.isInvite()){
          
          //you can't mark an invite done
          this.taskCheckbox.set("disabled", true);
          
          //show accept/decline on invite/agreed/amended
          if ((t.username === username && t.status === "CURRENT" && t.substatus === "DELEGATED") || t.isAgreed() || t.isAmended()){
            dojo.removeClass(this.declineTask, "hidden");
            dojo.removeClass(this.acceptTask, "hidden");
          }
        }
 
        //if isProjectInvite, this is a task created from a project so it's  a project invite
        //this isn't the same as t.isProjectInvite() because it's just a local variable set by the 
        //_createInviteTask() function
        if (this.isProjectInvite){
          
          //it's a fake task so won't edit it so need to round the actions button
          dojo.query(".edit", this.domNode).addClass("hidden");
          dojo.query(".actions", this.domNode).addClass("task-actions-corner-left");
      
          //hide the check box and show the project opportunity, follow or participate icon
          dojo.addClass(this.taskCheckbox.domNode, "hidden");
          //console.log("this role", this.role);
          if (this.role === "project"){
            dojo.removeClass(this.participateIcon, "hidden");
          } else if (this.role === "follower"){
            dojo.removeClass(this.followIcon, "hidden");
          } else if (this.role === "opportunity"){
            dojo.removeClass(this.opportunityIcon, "hidden");
          }
          
          if (pStatus.isInvitedNew(this.project, username)){
            //show the decline button
            dojo.removeClass(this.declineProject, "hidden");
            if (this.role === "follower"){
              //show and round follow button and hide the actions button
              dojo.removeClass(this.followProject, "hidden");
              dojo.addClass(this.followProject, "task-actions-corner-left");
              dojo.query(".actions", this.domNode).addClass("hidden");
              
            } else {
              //show participate and actions(propose) buttons
              dojo.removeClass(this.acceptProject, "hidden");
            }
            
          } else if (pStatus.isInvitedAgreed(this.project, username)){
            //show participate/decline and actions button
            dojo.removeClass(this.declineProject, "hidden");
            dojo.removeClass(this.acceptProject, "hidden");
            
          } else if (pStatus.isInvitedAmended(this.project, username)){
            //show participate/decline and actions button
            dojo.removeClass(this.declineProject, "hidden");
            dojo.removeClass(this.acceptProject, "hidden");
          } else if (pStatus.isOpportunity(this.project)){
            //show and round follow button and hide the actions button
            dojo.removeClass(this.followProject, "hidden");
            dojo.addClass(this.followProject, "task-actions-corner-left");
            dojo.query(".actions", this.domNode).addClass("hidden");
          }
        }
      
        if (t.isPrivate()){
          //this is private so hide the actions and show the delete
          dojo.query(".actions", this.domNode).addClass("hidden");
          dojo.query(".delete", this.domNode).removeClass("hidden");
        }
        
        if (t.isDone()){
          var chk = dijit.byId(this.taskCheckbox);
          this.taskCheckbox.checked = true;
          //disable the checkbox because it's been approved
          //NOTE: the only options for an approved task is to make it a template and start a new one
          //at this point. It might be better to leave the actions menu, need to see. same with cancelled
          chk.set("disabled", true);
          dojo.query(".meta-deadline", this.domNode).addClass("hidden");
          dojo.query(".edit", this.domNode).addClass("hidden");
          dojo.query(".actions", this.domNode).addClass("hidden");
          dojo.query(".delete", this.domNode).addClass("hidden");
          dojo.query(".stream", this.domNode).addClass("task-actions-corner-left");
        }
        
        if (t.isCancelled()){
          //disable the checkbox so I can't submit or approve it
          dijit.byId(this.taskCheckbox).set("disabled", true);
          //hide the task buttons and round the corner of the stream button
          dojo.query(".meta-deadline", this.domNode).addClass("hidden");
          dojo.query(".edit", this.domNode).addClass("hidden");
          dojo.query(".actions", this.domNode).addClass("hidden");
          dojo.query(".delete", this.domNode).addClass("hidden");
          dojo.query(".stream", this.domNode).addClass("task-actions-corner-left");
        }
        
        
        
        //wire up the task checkbox so clicking it submits to approve if not project responsible
        //or approves if project responsible. There won't be a message when checking the box
        //the user can give a message by choosing submit or approve from actions menu
        dojo.connect(this.taskCheckbox, "onChange", this, function(){
          
          //console.debug("task checkbox onChange user, responsible", this.username, t.projResponsible());
          t.markDone(this.task);
          
        });
      
        //wire up the task name so clicking it goes to details if I'm the user of the task
        dojo.connect(this.showDetails, "onclick", this, function(){
          //console.debug("focus in Task", this.task.username);
          if (t.isDone() || t.isCancelled()){
            return;
          }
          if (this.role === "opportunity" || (this.task.username === db.username() && !t.isSubmitted()) || (this.task.responsible === db.username() && t.isSubmitted())){
             //if this is a projectInvite, navigate to the project
            if (this.isProjectInvite){
              dojo.publish("coordel/primaryNavSelect", [ {name: "project", focus: this.focus, id: this.task.project}]);
            } else {
              dojo.publish("coordel/primaryNavSelect", [ {name: "task", focus: this.focus, id: this.task._id, task: this.task}]);
            }
          } 
        
        });
        
        //wire up the showStream button so it shows the task stream
        dojo.connect(this.showStream, "onclick", this, function(){
          
          var query,
              title =  coordel.stream.taskStream;
          
          if (this.isProjectInvite){
            query = db.streamStore.loadProjectStream(this.project._id);
            title = coordel.stream.projectStream;
          } else {
            query = db.streamStore.loadTaskStream(this.task._id);
          } 

          dojo.when(query, function(resp){
            //console.debug("stream in taskDetailsControl", resp);
            var stream = new Stream({
              stream: resp,
              style: "max-height: 400px; overflow-y: auto;"
            });
            
            var d = new cDialog({
              style: "width: 320px; overflow-x:hidden",
              "class": "tasklist-titlepane alerts",
              title: title,
              content: stream,
              onCancel: function(){
                d.destroy();
              }
            });
            
            d.show();
          });
        });

        //wire up the edit button
        dojo.connect(this.editTask, "onclick", this, function(){
          var form = new TaskForm({isNew: false, task: this.task});
          var cont = this.taskFormContainer;
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
          cont.addChild(form);
          this.taskDialog.show();
          
          var confirm = dojo.connect(this.taskDialog, "onConfirm", this, function(){
            //console.debug("should save the task");
            form.save();
          });
        });
      
        //wire up the actions menu button
        dojo.connect(this.chooseAction ,"onClick", this, function(){
          
          //console.debug("chooseAction clicked");
          //set up the menu for the actions button
          
          var menu = new ActionsMenu({
            task: this.task,
            username: db.username(),
            responsible: t.projResponsible()
          });
          
          this.actionsDialog.set("content", menu);
          this.chooseAction.openDropDown();
        
        });
        
        
        //when the task form dropdown or actions menu are shown, keep the task-actions buttons highlighted
        dojo.connect(this.taskDialog, "onOpen", this, function(){
          //console.debug("added active");
          dojo.addClass(this.taskActions, "active");
        });
        
        dojo.connect(this.taskDialog, "onClose", this, function(){
          //console.debug("removed active");
          dojo.removeClass(this.taskActions, "active");
        });
        
        //wire up the followProject button
        dojo.connect(this.followProject, "onclick", this, function(){
          t.p.follow(db.username(), t.p.project);
        });
        
        //wire up the acceptProject button
        dojo.connect(this.acceptProject, "onclick", this, function(){
          //console.debug("accept Project", t);
          var proj = db.projectStore.store.get(t.project);
          
          dojo.publish("coordel/projectAction", [{action: "participate", project: proj, validate: false}]);
     
        });

       //wire up the declineProject button
       dojo.connect(this.declineProject, "onclick", this, function(){
         //console.debug("decline Project", t);
         dojo.publish("coordel/projectAction", [{action: "decline", project: this.project, validate: true,  cssClass: "warning-button"}]);
         //var proj = db.getProjectModel(t.project);
         //dojo.when(proj, function(model){
           //proj.decline(db.username(), model.project);
         //});
       });
      
       //wire up the accept button
       dojo.connect(this.acceptTask, "onclick", this, function(){
          //console.debug("acepting task", this.task);
          //t.accept(this.task);
          dojo.publish("coordel/taskAction", [{action: "accept", task: this.task}]);
        });
        
       //wire up the decline button
       dojo.connect(this.declineTask, "onclick", this, function(){
         //console.debug("removing task", this.task);
          dojo.publish("coordel/taskAction", [{action: "decline", task: this.task, validate: true, cssClass: "warning-button"}]);
         //dojo.publish("coordel/removeTask", [this.task]);
       });
       
       //wire up the remove-defer button
       dojo.connect(this.removeDeferDate, "onclick", this, function(){
         //call version to make a version of this taskModel's task
         t.version();
         delete (this.task.calendar);
         this.task = t.logActivity(this.task);
         t.update(this.task);
       });
    
       //wire up the delete button
       dojo.connect(this.removeTask, "onclick", this, function(){
         //console.debug("removing task", this.task);
         t.remove(this.task);
         //dojo.publish("coordel/removeTask", [this.task]);
        
       });
        
        
        //wire up the info button
        dojo.connect(this.showInfo, "onclick", this, function(){
          //console.debug("task in showInfo", this.task);
          //console.debug("dialog", i);
          var cont = this.infoContainer;
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
     
          if (this.isProjectInvite){
            db.get(this.task.project).then(function(item){
              cont.addChild(new ProjectInfo({project:item}));
            });
          } else {
            cont.addChild(new TaskInfoDialog({task: this.task}));
          }
  
          this.infoDialog.show();
        });
        
        //wire up the info button so that if this is blocking it publishes to show what's blocking it
        dojo.connect(this.showInfo, "onmouseover", this, function(){
          if (t.hasBlocking()){
            dojo.publish("coordel/block", [{list: t.blocking, show: true}]);
          }
        });
        
        dojo.connect(this.showInfo, "onmouseout", this, function(){
          if (t.hasBlocking()){
            dojo.publish("coordel/block", [{list: t.blocking, show: false}]);
          }
        });
        
        
      },
      
      doTaskAction: function(args){
        if (args.action === "reuse" && args.task._id === this.task._id){
          //console.log("show the form");
          var form = new TaskForm({isNew: false, task: args.task});
          var cont = this.blueprintFormContainer;
          if (cont.hasChildren()){
            cont.destroyDescendants();
          }
          cont.addChild(form);
          this.blueprintDialog.show();
          
          var confirm = dojo.connect(this.blueprintDialog, "onConfirm", this, function(){
            //console.debug("should blueprint the task");
            var t = db.getTaskModel(args.task, true);
            t.reuse(args.task);
            dojo.disconnect(confirm);
          });
        }
        
        //if the args action is reuse, then we need to pop up a task form
        
        
        //just close the task action dropdown
        if (this.chooseAction){
          this.chooseAction.closeDropDown();
        }
      },
      
      _setMetaInfo: function(){
 
        var t = db.getTaskModel(this.task, true);
        
        var resp = t.projResponsible(),
        del = "",
        u = db.username(),
        isProjInvite = this.isProjectInvite,
        text = "",
        con,
        self = this;
        
        if (t.delegator){
          del = t.delegator;
        }
        
        var username = t.username;
        
        if(t.isIssue()){
          username = resp;
        }
        
        if (t.isSubmitted()){
          username = resp;
        }
        
        //cancelled
        if (t.isCancelled() &&  self.focus === "search"){
       
          //console.debug("issue");
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.cancelled + " : ");
        }
        
        //if the username of the task isn't the logged on user, then show the name unless this is the
        //contact view when all the tasks belong to the contact selected
        if (u !== username && this.focus !== "contact"){
          
          
          //need to test for states, sometimes need to show the project responsible owning the task
          //if the status is issue, need to show responsible, not user
          
          if (username === "UNASSIGNED" || this.task.substatus === "UNASSIGNED" && !t.isCancelled()){
            dojo.query(".meta-info", this.domNode).addClass("c-color-error");
          } 
          
          //if it's proposed or agreed, that metadata will have the right name, so don't put it here
          if (!t.isProposed() && !t.isAgreed() && t.status !== "PROJECT"){
            var name = db.contactFullName(username);
            if (this.task.substatus === "UNASSIGNED"){
              name = coordel.unassigned;
            }
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(name + " : ");
          }
           
        }
        
        //if it's project Left put who left
        if (t.status === "PROJECT" && t.substatus === "LEFT"){
          var left = db.contactFullName(this.task.username);
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addClass("c-color-error").addContent(left + " : ");
        }
        
        //private
        if (t.isPrivate()){
          //console.debug("t.focus", t.focus);
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.isPrivate + " : ");
          
        }
        
        //invite
        if (t.isInvite()){
          
          text = "";
          
          //get who sent the invite, might be project responsible, might be the delegator
          con = db.contactFullName(resp);
        
          if (t.hasDelegator()){
            del = t.delegator;
            con = db.contactFullName(del);
            //console.log("it's an invite and there was a delegator", con, u, del);
          }
 
          //console.log("delegation", t.hasDelegator(), con, del, u, username);
          
          //don't need to show from if this is me or if it's a project invite
          if (!t.hasDelegator() && resp !== u || t.hasDelegator() && del !== u){
            //text = coordel.taskDetails.by + " " + con + " : ";
          }
          
          if (!t.isProposed() && !t.isAgreed() && !t.isAmended()){
            //don't need to say it's from me
            //console.debug("it's not from me", text);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(text);
          }
    
        } else {
          //if there is a delegator then everyone needs to see who did the delegation in the project view
          if (t.hasDelegator() && t.delegator !== t.responsible && db.focus === "project"){
            del = t.delegator;
            con = db.contactFullName(del);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.taskDetails.by + " " + con + " : ");
          }
          //if it's not an invite but it's a task in myDelegated then show who delegated it
          if (t.isMyDelegated && t.responsible !== db.username()){
            del = t.responsible;
            con = db.contactFullName(del);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.taskDetails.by + " " + con + " : ");
          }
          
        }

        //project invites
        if (this.isProjectInvite){
          text = "";
          
          //don't show project label if this is a project invite
          self.showProjectLabel = false;
          
          //get who sent the invite, might be project responsible, might be the delegator
          con = db.contactFullName(resp);

          if (t.delegator && t.delegator !== ""){
            del = t.delegator;
            con = db.contactFullName(del);
          }
          
          //don't need to show from if this is me
          if (resp !== u && del !== u){
            text = coordel.metainfo.invite + " " + con + " : ";
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(text);
          }
        }
        
        //pending
        if (t.isPending()){
          /*
          text = "";
          
          //get who sent the invite, might be project responsible, might be the delegator
          con = db.contactFullName(resp);

          if (t.delegator && t.delegator !== ""){
            del = t.delegator;
            con = db.contactFullName(del);
          }
          
          //don't need to show from if this is me
          if (resp !== u && del !== u){
            text = coordel.metainfo.invite + " " + con + " : ";
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(text);
          }
          */
        }
        
        //proposed
        if (t.isProposed()){
          var pText;
          if (t.status === "PROJECT"){
            pText = db.contactFullName(t.username);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(pText + " : ");
          } else {
            pText = db.contactFullName(t.username) + " " + coordel.metainfo.proposed;
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(pText + " : ");
          }
          
          
        }
        
        //agreed
        if (t.isAgreed()){
          //console.debug("task was agreed");
          var aText = "";
          if (t.status === "PROJECT"){
            aText = db.contactFullName(t.responsible);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(aText + " : ");
          } else {
            aText = con + " " + coordel.metainfo.agreed;
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(aText + " : ");
          }
          
        }
        
        //amended
        if (t.isAmended()){
          //console.debug("task was agreed");
          var amText = "";
          if (t.status === "PROJECT"){
            amText = db.contactFullName(t.responsible);
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(amText + " : ");
          } else {
            amText = con + " " + coordel.metainfo.amended;
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(amText + " : ");
          }
          
        }
        
        //delegated
        if (t.hasDelegator() && t.delegator !== t.responsible && t.delegator !== db.username() && db.focus !== "project"){
          del = t.delegator;
          con = db.contactFullName(del);
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.taskDetails.by + " " + con + " : ");
        }
        
        //issue
        if (t.isIssue()){
       
          //console.debug("issue");
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addClass("c-color-error").addContent(coordel.metainfo.issue + " : ");
        }
        
        //cleared
        if (t.isCleared()){
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.cleared + " : ");
        }
        
        //submitted for approval
        if (t.isSubmitted()){
          
          //console.debug("it's submitted");
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.submitted + " : ");
          var subUser = t.username;
          con = db.contactFullName(subUser);
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.taskDetails.from + " " + con + " : ");
        }
        
        //returned
        if (t.isReturned()){
          //console.debug("it's returned");
          dojo.query(".meta-info", this.domNode).removeClass("hidden").addContent(coordel.metainfo.returned + " : ");
        }
        
        //declined
        if (t.isDeclined()){
          //this could be a project invite need to test
          var user = db.contactFullName(t.username);
          //console.debug("it's declined", t, user);
          if (t.status === "PROJECT"){
            var multi = [];
            //console.debug("this was a project invite", t);
            //need to test the users to see if there is more than one
            if (t.hasMulti){
              dojo.forEach(t.userList, function(username){
                multi.push(db.contactFullName(username));
              });
              
              dojo.query(".meta-info", this.domNode).removeClass("hidden").addClass("c-color-error").addContent(multi.join(", ") + " : ");
            } else {
              //console.debug("it wasn't hasMulti, user was: ", user);
              dojo.query(".meta-info", this.domNode).removeClass("hidden").addClass("c-color-error").addContent(user + " : ");
            }
            
          } else {
            dojo.query(".meta-info", this.domNode).removeClass("hidden").addClass("c-color-error").addContent( coordel.metainfo.declined + " : ");
          }
        }  
        
        //console.log("show project label", self.showProjectLabel);
        //show project name
        if (self.showProjectLabel){
          var p = t.p.project;
              
          dojo.when(p, function(project){
  
            var show = false;
            if (!project.isMyDelegated && !project.isMyPrivate && self.focus !== "project"){
              show = true;
            } else if (self.focus === "project" && t.project !== db.projectStore.currentProject){
              show = true;
              dojo.removeClass(self.linkIcon,"hidden");
            }
            
            if (show && self.metaProjectInfo){
              dojo.removeClass(self.metaProjectInfo, "hidden");
              self.metaProjectInfo.innerHTML = project.name + " : ";
            }
          });
          
        }
        
      },
      
      _setDeadline: function(){

        var t = db.getTaskModel(this.task, true);

        var has = t.hasDeadline(),
            pdead = t.projDeadline(),
            contextDeadline = this.task.contextDeadline,
            deadline = "2200-01-01",  //if no project deadline, it's blank (this will be the case with delegated and private tasks)
            past = false, //if it does have a deadline, then need to make sure that it gets colored active
            today = false,
            showTime = false,
            self = this; 

        //don't update the deadline for done and cancelled tasks
        if (t.isDone() || t.isCancelled()){
          return;
        }
        
        
        
        
        if (contextDeadline){
          //console.log("had contextDeadline", t.name, contextDeadline);
          set();
        } else {
          
          t.getContextDeadline().then(function(dead){
            //console.log("derived contextDeadline", t.name, dead);
            contextDeadline = dead;
            set();
          });
          
        }
        
        
        function set(){
          var now = new Date();
          //console.log("in set", contextDeadline, t.name);
          //the getDeadline function returns 2200-01-01 when derived
          if (contextDeadline === "2200-01-01"){
            contextDeadline = "";
          } else {
            var test = contextDeadline.split("T");

            if (test.length>1){
              showTime = true;
            }
          }



          //check if this deadline has passed?
          var c = dojo.date.compare(stamp.fromISOString(contextDeadline), now, "date"); 
          if (showTime){
            c = dojo.date.compare(stamp.fromISOString(contextDeadline), now, "datetime");
          }
          
          //console.log("c", c, "now", now, "contextDeadline", contextDeadline, "task", self.task.name);

          if ( c < 0){
            past = true;
          } else if (c === 0){
            today = true;
            showTime = true;
          }

          deadline = dt.deadline(contextDeadline, showTime);

          if (deadline.length > 0){
            if (past) {
              //project deadline is past, so set error color
              dojo.query(".meta-deadline", self.domNode).removeClass("hidden").addClass("c-color-error").empty().addContent(deadline);
            } else if (today){
              
              var timeTest = dojo.date.compare(stamp.fromISOString(contextDeadline), now, "datetime");
              var className = "";
              
              if (timeTest < 0){
                className = "c-color-error";
              }
              
              if (!has){
                if (!timeTest < 0){
                  className = "c-color-diabled";
                }
                //project deadline today, but not explicit deadline so set label color
                dojo.query(".meta-deadline", self.domNode).removeClass("hidden").addClass(className).empty().addContent(deadline);
              } else {
                //project deadline today, but not explicit deadline so set label color
                dojo.query(".meta-deadline", self.domNode).removeClass("hidden").addClass(className).empty().addContent(deadline);
              }
              
            }
            else {
              //deadline not past
              if (!has){
                //not explicit deadline so disable active color
                dojo.query(".meta-deadline", self.domNode).removeClass("hidden").addClass("c-color-disabled").empty().addContent(deadline);
              } else {
                 dojo.query(".meta-deadline", self.domNode).removeClass("hidden").empty().addContent(deadline);
              }
            }
          }
        }
        
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.subHandlers.length > 0){
          dojo.forEach(this.subHandlers, function(h){
            dojo.unsubscribe(h);
          });
          this.subHandlers = [];
        }
      },
      
      baseClass: "tasklist-item"
  });
  return app.views.Task;     
});