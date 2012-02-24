define("app/models/TaskModel", 
  ["dojo",
  "i18n!app/nls/coordel", 
  "app/models/CoordelBase", 
  "app/models/DeliverableModel",
  "app/models/ProjectStatus",
  "app/models/RoleModel",
  "dojo/date/stamp",
  "app/models/DeliverableModel2",
  "app/models/FieldModel2",
  "app/util/dateFormat"], function(dojo, coordel, base, del, pStatus, rModel, stamp, dModel, fModel, dt) {
  dojo.declare(
    "app.models.TaskModel", 
    [base], 
    {
      db: null,
      
      p: null,
      
      init: function(db){
        
        //set the database
        this.db = db;
        
        //console.debug("getting the project for ", this.project);
        
        //set the project
        this.p = this.db.getProjectModel(this.project);
        
        //var t = this;
        
        return this;
        
      },
      
      isUserResponsible: function(){
        return this.p.project.responsible === t.username;
      },
      
      projResponsible: function(){
        return this.p.project.responsible;
      },
      
      projDeadline: function(){
        var p = this.p.project;
        if (p.deadline){
          return p.deadline;
        } else {
          return "";
        }
      },
      
      getStarts: function(){
        var t = this,
            starts;
            
        if (!t.hasDeferDate()){
          starts = "";
        } else {
          starts = t.calendar.start;
        }
        //console.debug("start in getStarts", starts);
        return starts;
      },
      
      getDeadline: function(){
        
        var t = this,
            deadline = t.deadline;
            
        //console.debug("deadline", deadline);s
            
        if (!t.hasDeadline() && !t.isPrivate() && !t.isDelegated()){
          //console.debug("no deadline not private", t);
          deadline = t.projDeadline();
          
          //it might be that a project doesn't have a deadline set for some reason
          //so don't try and fix it
          if (deadline !== ""){
            //the idea here is that the derived deadline should be sorted at the last
            //second of the deadline day. That way, when deadlines are added they will always 
            //come before derived deadlines in the stream.
            var test = stamp.fromISOString(deadline, "date");
            var newDate = new Date(test.getFullYear(), test.getMonth(), test.getDate(), 23, 59, 59);
            //console.debug("new Date", newDate.toString(), stamp.toISOString(test));
            deadline = stamp.toISOString(newDate);
          }
          
    
        } else if (!t.hasDeadline() && (t.isPrivate() || t.isDelegated())) {
          deadline = "";
        }
        
        return deadline;
      },
      
      projName: function(){
        var p = this.p.project;
        var name = p.name;
        if (!name){
          name = coordel.sortHeader.noProject;
          if (p.isMyPrivate){
            console.debug ("it's my private project");
            name = coordel.myPrivate;
          } else if (p.isMyDelegated){
            console.debug ("it's my delegated project");
            name = coordel.delegated;
          }
        }
        return name;
      },
      
      getStatus: function(){
    	  var t = this,
    	      status = "";
    	       
    	  if (t.isCurrent()){
    	    status = coordel.current;
    	  } else if (t.isBlocked()){
    	    status = coordel.blocked;
    	  } else if (t.isDeferred()){
    	    status = coordel.deferred;
    	  } else if (t.isDone()){
    	    status = coordel.done;
    	  } else if (t.isCancelled()){
    	    status = coordel.cancelled;
    	  } else if (t.isPaused()){
    	    status = coordel.paused;
    	  } else if (t.isIssue()){
    	    status = coordel.issue;
    	  } else if (t.isSubmitted()){
    	    status = coordel.submitted;
    	  } else if (t.isInvite()){
    	    status = coordel.invited;
    	  }
    	
    	  return status;
    	  
    	},
    	
    	isActive: function(){
    	  var t = this;
    	  
    	  var current = t.isCurrent() && !pStatus.isDeferred(t.p.project) && !pStatus.isPending(t.p.project, t.username);
    	  return (current || t.isDeferred() || t.isBlocked() || (t.status ==="CURRENT" && t.substatus ==="DELEGATED"));
    	},
      
      isOverdue: function(){
        //tests if this task's deadline is past
        var now = new Date(),
            deadline = this.getDeadline(),
            isPast = false;
            
        if (deadline === ""){
          //this was a task in the private project with no deadline
          return false;
        } else {
          var comp = dojo.date.compare(now, stamp.fromISOString(deadline));
          if (comp > 0){
            isPast = true;
          }
          return isPast;
        }
      },
      
      isCurrent: function(){
    		
     		var isCurrent = true,
    			  t = this,
    			  p = this.p,
    			  db = this.db,
    			  username = this.db.username(),
    			  reason = "Task was current";
    			  
    		//console.debug("isCurrent project", p);
    		
    		//if it's deleted, it's not current
    		if (t.isDeleted()){
    		  return false;
    		}
    		
    		if (t.isProjectInvite()){
    		  //if it's project invite, I haven't joined the project yet
    		  return false;
    		}
    		
    		//console.debug("before calling t.isInvite(): ");
    		//if it's an invite, it's not current because I haven't accepted it yet
    		if (t.isInvite()){
    			//console.debug(t.name + " was INVITE, it's current");
    			return false;
    		}
    		
    		//if it's declined and I'm not the delegator or responsible it's not current
    		if (t.isDeclined()){
    		  var test = false;
    		  //console.debug("task is declined", t);
    		  if (t.delegator && t.delegator === username){
    		    //if I'm the delegator, then a declined task is CURRENT up for me
    		    test = true;
    		  } else if (t.projResponsible() === username){
    		    //if I'm the responsible, then a declined task is CURRENT for me
            test = true;
            //console.debug("this task is DECLINED and I'm responsible", test);
    		  }
    		  
    		  return test;
    		}
 
        //console.debug("in isCurrent before calling isDone", t.name, t.isDone());
    		//if it's done or trash, it's not current :)
    		if (t.isDone()){
    			//console.log(t.name + " is DONE");
    			//console.debug(t.name + " was done, it's not current");
    			return false;
    		}
    		
    		//console.debug("coordinates length", task.coordinates.length);
    		//if it's delegated (in my delegated project) it's not current
    		if (t.isDelegated()){
    		  //console.debug(t.name + " was delegated, it's not current");
    		  return false;
    		}
    		
        
    		//if it's cancelled, it's not current :)
    		if (t.substatus === "CANCELLED"){
    		  //console.debug(t.name + " was " + t.substatus + ", it's not current");
    			return false;
    		}

    		//this means that it's not current because the project hasn't been accepted
    		if (t.substatus === "DELEGATED" && !t.isInvite()){
    			//console.debug(t.name + " was found in " + t.projName() + ", which isn't accepted, it's not current");
    			return false;
    		}

    		//if it's deferred, it can't be current
    		if (t.isDeferred()){
    			//console.debug(t.name + " was deferred, it's not current");
    			return false;
    		} 

    		//if an issue has been raised, it's not ok unless I'm the project responsible
    		if (t.isIssue()) {
    		  //console.debug("this task is an issue", t, p.isUserOwner());
    			if (!p.isUserOwner()){
    				//console.log(t.name + " has issue and I'm not the responsible");
    				//console.debug(t.name + " was has an ISSUE and I'm not the project responsible, it's not current");
    				isCurrent = false;
    			};	
    		}

    		//if an issue has been cleared, it's not current if i'm the project responsible
    		if (t.isCleared()) {

    			if (p.isUserOwner()){
    				//console.debug(t.name + " was CLEARED and I'm the project responsible, it's not current");
    				isCurrent = false;
    			};	
    		}
    
    		//if an action has been returned, it's not current if i'm the project responsible
    		if (t.isReturned()) {

    			if (p.isUserOwner()){
    				//console.debug(t.name + " was RETURNED and I'm the project responsible, it's not current");
    				isCurrent = false;
    			};	
    		}

    		//submitted actions are only current for the responsible
    		if (t.isSubmitted()) {
          //console.log("this is a submitted task", t.name, t.status, t.substatus, p.name, p.isUserOwner());
    			if (!p.isUserOwner()){
    				//console.debug(t.name + " was CURRENT-DONE and I'm not the project responsible, it's not current");
    				isCurrent = false;
    			};	
    		}

    		if (t.isBlocked()){
    		  //console.debug(t.name + " was BLOCKED, it's not current");
    		  isCurrent = false;
    		}
    	
    		return isCurrent;
    	},
    	
    	isBlocked: function(){
    	  
    	  //a task is blocked if either it's deliverables or it's blocker's deliverables aren't ready
  		  var t = this,
  		      db = this.db,
  		      isBlocked = false;
  		  
  		      
  		  //if this task is done or cancelled, it's not blocked
  		  if (t.isDone() || t.isCancelled()){
  		    return false;
  		  }
  		  
 		    //if this task is paused, it's blocked by the project responsible pausing the task
  		  //because the user is still responsible, but can't do work on it at this time
  		  //this makes it easier for project responsibles to manage what is current for users
  		  if (t.isPaused()){
  		    return true;
  		  }
  		  
  		  //no blockers, can't be blocked
  		  if (!t.coordinates || t.coordinates === "" || t.coordinates.length === 0){
  		    return false;
  		  }
  		      
  			//check to see if this task's blockers are ready
    		if (t.coordinates && t.coordinates.length > 0) {
    			//console.debug("BLOCKERS for: " + t.name, t);

    			dojo.forEach(t.coordinates, function(coord){
    				var c = db.getBlockerModel(coord);
    				//console.debug("testing blocker", c);
    				if (!c.isReady()){
    					isBlocked = true;
    					//console.log(t.name + " BLOCKER " + c.name + " NOT READY");
    				}
    				//make sure the blocker has been saved once if it's not done or cancelled. 
    				//if not, it's not ready
        		if (!c.hasSaveDone && !c.isDone() && !c.isCancelled()){
        		  //console.log(c.name + " not saved at least once");
        		  isBlocked = true;
        		}
    			});
    		}
    		 
        return isBlocked;
  		  
  		},
  		
  		isProjectInvite: function(){
        //this is invited if it's any of the invited states
        var t = this,
            p = this.p,
            test = false;
        
        
        dojo.forEach(p.project.assignments, function(assign){
          //console.debug(t.name, assign.status);
          if (assign.username === t.username && assign.role === t.role &&
                (assign.status === "INVITE" ||
                assign.status === "DECLINED" ||
                assign.status === "PROPOSED" ||
                assign.status === "AGREED" ||
                assign.status === "AMENDED" ||
                assign.status === "LEFT")
          ){
            test = true;
          }
        });

        
        return test;
        
      },
    
    	isInvite: function(){
    	  //this function indicates that this is an invitation but doesn't filter invites
    	  //for a user
    		var t = this,
    		    isInvite = false,
    		    p = this.p,
    		    username = this.db.username();
        
    		//if it's a project invite, it's not going to be task invite because the user
    		//needs to agree to join the project before then can consider accepting the tasks
    		//it's an invite if DELEGATED
    		if (t.isProjectInvite()){
    		  return false;
    		}
    		
    		//console.debug("task name and project status", t.name, p.isInvite());
    	  if (t.status === "CURRENT" && t.substatus === "DELEGATED"){
    			//console.log(t.name, t._id,  " is DELEGATED. project isn't invite", p);
    			isInvite = true;
    		} else if (t.isDeclined()){
    		  //this task was declined it remains in the invite process
    		  isInvite = true;
    		} else if (t.isProposed()){
    		  //this is a proposed changed to an invite so it's in the invite process
    		  isInvite = true;
    		} else if (t.isAgreed()){
    		  //this is an agreement to a proposed change it's in the invite process
    		  isInvite = true;
    		} else if (t.isAmended()){
      		//this is an amendment to a proposed change it's in the invite process
      		isInvite = true;
      	}
      	
      	/*
    		if (isInvite){
    		  //console.debug(t,t._id, t.name + " is invite ", t.status, t.substatus, " proposed =", t.isProposed(), "agreed =", t.isAgreed(), "declined =", t.isDeclined());
    		}
    	  */
    	  
    		return isInvite;
    	},
    	
    	isPending: function(){
    	  var t = this,
    	      p = this.p;
    	  //pending are tasks created in a project for a user that
    	  //has not yet agreed to participate in the project
    	  //return (t.substatus === "DELEGATED" && p.isInvite(t.username));
    	  //console.debug("testing isPending: ", t, p);
    	  return (t.substatus === "DELEGATED" && p.isInvite(t.username));
    	},
    	
    	isTaskInvite: function(){
    	  //use this function to get task invites for this user;

    	  var t = this,
    		    isCurrent = false,
    		    username = this.db.username();
    		
    		
    		//this is a task invitation for the user that isn't proposed, isn't agreed, and isn't declined
    		if (t.isInvite() && !t.isProposed() && !t.isAgreed() && !t.isDeclined() && t.username === username){
    		  isCurrent = true;
    		}
    		
    		//this is a proposed change to a task with no delegator and this user is responsible
    	  if (t.isProposed() && !t.hasDelegator() && t.projResponsible() === username){
  		    isCurrent = true;
  		  }
  		  
  		  //this is a proposed change and this user is the delegator
  		  if (t.isProposed() && t.hasDelegator() && t.delegator === username){
  		    isCurrent = true;
  		  }
  		  
  		  //this is agreed and this user is assigned to the task, the user can either accept, propose change
  		  //or decline task at this point.
  		  if (t.isAgreed() && t.username === username){
  		    isCurrent = true;
  		  }
  		  
  		  //declined tasks are current for either the responsible or for the delegator when 
  		  //they have accepted the project. If they haven't accepted the project, then 
  		  //it's a project invite for the responsible or delegator
  		  
  		  //this task is declined, has no delegator and this user is responsible
  		  if (t.isInvite() && t.isDeclined() && !t.hasDelegator() && t.projResponsible() === username){
  		    isCurrent = true;
  		  }
  		  
  		  //this task is declined, has a delegator who is this user
  		  if (t.isInvite() && t.isDeclined() && t.hasDelegator() && t.delegator === username){
  		    isCurrent = true;
  		  }
  		  
  		  if (isCurrent){
  		    //console.debug(t._id, t.name + " is task invite", "invite=" + t.isInvite(), "proposed=" + t.isProposed(), "agreed=" + t.isAgreed(), "decline=" + t.isDeclined());
  		  }
  		  
    		//return isCurrent;
    		return isCurrent;
    		
    	},
    	
    	isDelegated: function(){
    	  var t = this,
    	      isDelegated = false,
    	      delProj = this.db.myDelegated(),
    	      username = this.db.username();
    	      
    	  //console.debug ("delegated project", delProj, t.project);
    	  //tasks placed in the delegated project are all delegated  
    	  if (t.project === delProj && !t.isDone()){
    	    isDelegated = true;
    	  } 
    	  
    	  //tasks I've delegated in a project that I'm not responsible also show in the delegated list
    	  //this allows me to track tasks I've delegated in projects
    	  /*
    	  if (t.delegator && t.delegator === username){
    	    isDelegated = true;
    	  }
    	  */
    	  return isDelegated;
    	},
    	
    	isDeclined: function(){
    	  var t = this,
    	    isDeclined = false;
    	    
    	  //console.debug("isDeclined called: ", t.status, t.substatus);
    	  
    	  if(t.substatus === "DECLINED"){
    	    //console.debug("t.status: ", t.status, "t.substatus: ", t.substatus);
    	    isDeclined = true;
    	  }; 
    	  
    	  return isDeclined;
    	},
    	
    	isCancelled: function(){
    	  var t = this;
    	  return (t.status === "DONE" && t.substatus === "CANCELLED");
    	},
    	
    	isPrivate: function(){
    	  var t = this,
    	      isPrivate = false,
    	      privProj = this.db.appStore.app().myPrivateProject;
    	      
    	  //console.debug ("private project", this.db.appStore.app().myTasksProject);
    	      
    	  if (t.project === privProj && !t.isDone()){
    	    isPrivate = true;
    	  }
    	  
    	  return isPrivate;
    	},
    	
    	isDeferred: function(){
    		//hasDeferDate() checks if there is a deferDate
    		//this function checks if it's still deferred now
    		var t = this,
    			  isDeferred = false;
    			  
    		if (t.hasDeferDate()
    			&& !t.isDone()
    			&& stamp.toISOString(new Date()) < t.calendar.start){
    				isDeferred = true;
    				//console.log(t.task.name + " is DEFERRED");
    		}
    		return isDeferred;	
    	},
    	
    	hasDeferDate: function(){
    		//this function just checks if a defer date exists
    		//isDeferred() determines if the task is deferred over time
    		var cal =  this.calendar,
    			  hasDefer = false;

    		if (cal != "" && cal != undefined){
    			hasDefer = true;
    		}
    		return hasDefer;
    	},
    	
    	hasBlockers: function(){
    	  return (this.coordinates && this.coordinates.length > 0);
    	},
    	hasDelegator: function(){
    	  return (this.delegator && this.delegator !== "");
    	},
    	hasDeliverables: function(){
    	  var t = this;
    	  return (t.workspace && t.workspace.length > 0);
    	},
    	readyDeliverables: function(){
    	  var t = this,
    	      ready = [];
    	  dojo.forEach(t.workspace, function(del){
    	    dModel.deliverable = del;
    	    
    	    //console.debug("deliverable in workspace", dModel);
    	    
    	    //set the ready flag on this deliverable
    	    var isBlocked = false;
    	        
    	    //now check the blockers if there are any
    	    if (dModel.hasBlockers()){
		        var blockers = dojo.filter(t.workspace, function(de){
                //console.debug("iterating over the deliverables for the task", del);
                //if the blocker is in this deliverables blockers return true
                var has = false;
                dojo.forEach(del.blockers, function(blockid){
                  if (de.id === blockid){
                    has = true;
                  }
                });
                return has;
              });
              
            blockers.forEach(function(de){
              dModel.deliverable = de;
              if (!dModel.isReady()){
               isBlocked = true;
              }
            });           
		      } 
		      
		      //if this deliverable is ready and it's not blocked it's ready
		      if (!isBlocked) {
		        ready.push(del);
		      }
    	  });
    	  return ready;
    	},
    	hasAttachments: function(){
    	  
    	  var t = this,
    	      count = 0,
    	      files = this._attachments;
    	      
        if (files){
          for (var key in files){
            count += 1;
          }
        }
        
        return (count > 0);
    	},
    	isReady: function(){
    		//this function checks to see if the deliverables are ready
    		var isReady = true,
    			t = this;

    		if (!t || t == null || t == undefined){
    			return true;
    		}

    		//test that deliverables in this workspace are ready if there are any
    		if(t.hasDeliverables()){
    			
    			dojo.forEach(t.workspace, function(deliverable){
    			  
    			  var d = new del({
    			    task: t,
    			    deliverable: deliverable
    			  });
    			  
    			  if (!d.isReady()){
    			    isReady = false;
    			  }
    			  
    			});	
    		}
    		return isReady;
    	},
    	isDone: function(){
    		var t = this,
    			isDone = false;

    		if (t.status === "DONE" && (t.substatus === "APPROVED" || t.substatus === "DONE" || t.substatus === "FINISHED")){
    			isDone = true;
    		} else if (t.status === "ARCHIVE" || t.status === "SOMEDAY"){
    		  isDone = true;
    		}
    		return isDone;
    	},
    	isDeleted: function(){
    	  var t = this;
    	  return (t.status === "TRASH" || t.substatus === "TRASH" || t.status === "ARCHIVE" && t.substatus === "DELETED");
    	}, 
    	isIssue: function(){
    	  var t = this;
    	  return (t.status === "CURRENT" && t.substatus === "ISSUE");
    	},
    	isPaused: function(){
    	  var t = this;
    	  return (t.status === "CURRENT" && t.substatus === "PAUSED");
    	},
    	isCleared: function(){
    	  var t = this;
    	  return (t.status === "CURRENT" && t.substatus === "CLEARED");
    	},
    	isSubmitted: function(){
    	  var t = this;
    	  return (t.status === "CURRENT" && t.substatus === "DONE");
    	},
    	isReturned: function(){
    	  var t = this;
    	  return (t.status === "CURRENT" && t.substatus === "RETURNED");
    	},
    	isAgreed: function(){
    	  
    	  var t = this;
    	  return (t.status === "DELEGATED" && t.substatus === "AGREED");
    	},
    	isProposed: function(){
    	  var t = this;
    	  return (t.status === "DELEGATED" && t.substatus === "PROPOSED");
    	},
    	isAmended: function(){
    	  var t = this;
    	  return (t.status === "DELEGATED" && t.substatus === "AMENDED");
    	},
    	hasDeadline: function(){
    		var val = this.deadline,
    			hasDeadline = false;

    		if (val != "" && val != undefined){
    			//console.debug("no deadline", this);
    			hasDeadline = true;
    		}	
    		return hasDeadline;
    	},
    	
    	_validateTask: function(task){
    	  //use this function to apply validation to the task such as making sure task.project is
    	  //in uuid format etc. it returns the task with invalid values fixed for now
    	  //it's only used in the add function.
    	  
    	  var uuidPat = new RegExp("([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})");
    	  
        if (task.project && task.project !== "" && !uuidPat.test(task.project)){
          //task.project was provided and wasn't blank and didn't match the uuid format
          //delete what was sent and it will default accordingly
          console.debug("task.project was provided, but wasn't in uuid format", task.project);
          delete (task.project);
        }
        
        if (task.role && task.role !== "" && !uuidPat.test(task.role)){
          //task.role was provided and wasn't blank and didn't match the uuid format
          //delete what was sent and it will default accordingly
          console.debug("task.role was provided, but wasn't in uuid format", task.role);
          delete (task.role);
        }
        
        return task;
    	},
    	add: function(task){
    	  
    	  task = this._validateTask(task);
    	  
    	  var t = this,
    	      p = this.p;
    	  
    	  //console.debug("add task", task, task.username, p.project.substatus);
        
  	    var db = this.db,
  	        app = db.appStore.app(),
  	        username = db.username(),
  	        id = db.uuid(),
  	        projResponsible = this.projResponsible();
        
        if (!task._id){
          task._id = id;
        }
        
        //make the POST activity for the task creation
        task = t.addActivity({
    			verb: "POST",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.post
    		}, task);
        
        
  	    //default status and substatus
  	    //CURRENT means that it can show in the Current list if not deferred or blocked
  	    task.status = "CURRENT"; 
  	    //if I created this task, then I've already accepted by default
  	    task.substatus = "ACCEPTED"; 
  	    
  	    //if the substatus of the project is PENDING then the task status should be pending
  	    //if this user isn't the responsible
  	    if (p.project.substatus === "PENDING" && task.responsible !== username){
  	      task.status = "PENDING";
  	      console.debug("project substatus is PENDING, updated task status to PENDING");
  	    }
  	    
  	    //default to the current user if username not set yet
  	    if (!task.username){
  	      //console.debug("no username, set to me", username);
  	      //no username was set, so it's my task
  	      task.username = username;
  	    }
  	    
  	    //default to noName if there's no name set
  	    if (!task.name){
  	      task.name = coordel.noName;
  	    }
  	    
  	    //if i'm not the task user, then this is delegated
  	    if (task.username !== username){
  	      task.substatus = "DELEGATED";
  	      
  	      //console.debug("adding DELEGATE activity");
  	      task = t.addActivity({
      			verb: "DELEGATE",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.delegateItem
      		}, task);
  	    }
  	    
  	    //if a project was set, set the responsible and, if applicable, the delegator
  	    if (task.project){
  	      //the task responsible is the project responsible
          task.responsible = projResponsible;
          
          //if task isn't for me and the project responsible isn't me, then i'm the delegator
          if (projResponsible !== username && task.username !== username){
            task.delegator = username;
          }
  	    }
  	    
  	    //if no project and the task is mine then assign it to my private project
  	    if (!task.project || task.project === null || task.project === ""){
  	      //i'm the responsible when it's a private or delegated task
  	      task.responsible = username;
  	      task.project = app.myPrivateProject;
  	      //it's a delegated project if the username isn't me
  	      if (task.username !== username){
  	        //assign it to my delegated project
  	        task.project = app.myDelegatedProject;
  	      }
  	    }
    		
        //set the type and template info
        task.docType = "task";
        task.isTemplate = false;
        
        var def = p.updateAssignments(task);
        
        //need to make sure the update to the project happens before the task is added
        def.then(function(taskResp){
          console.debug("adding task with status", taskResp.status);
          db.taskStore.store.add(taskResp, {username: username});
          dojo.publish("coordel/updatePrimaryBoxCount");
        });
    
        //return task;
        
      },
      updateWorkspace: function(task, values){
        //this function is used when the user saves/updates deliverable values. the values submitted
        //should an object that has fieldid=value entries. the function will iterate over
        //this workspace and check if the deliverable's fields have entries in the submitted object
        //and update the value. it will then put the task to the store.
        
        task.workspace.forEach(function(d){
          
          d.fields.forEach(function(fld){
            
            if (values[fld.id]){
              
              //get the value of this field
              var fldValue = values[fld.id];
              
              //check the field type and update accordingly
              switch (fld.fieldType){
                case "checkbox":
                  //the value will be an array of ids that are checked
                  fld.children.forEach(function(child){
                    //set the value to false by default
                    child.value = false;
                    fldValue.forEach(function(val){
                      if(child.id === val){
                        child.value = true;
                      }
                    }); 
                  });
                  break;
                case "radio":
                  //the value will be the id of the selected child
                  fld.children.forEach(function(child){
                    //set value to false by default
                    child.value = false;
                    if (child.id === fldValue){
                      child.value = true;
                    }
                  });
                  break;
                case "input":
                  //handle submitted files
                  if (fld.inputType === "file"){
                    
                  }
                  break;
                default:
                  fld.value = fldValue;
                
              }
            }
          });
        });
      },
      update: function(task){
        
        //console.debug("update task", task);
        
        var db = this.db,
            username = this.db.username(),
            p = this.p;
        task.isNew = false;
        p.updateAssignments(task);
        db.taskStore.store.put(task, {username: username});
        dojo.publish("coordel/setPrimaryBoxCounts");
      },
  
      archive: function(task){
        var t = this,
    			db = this.db,
          p = this.p,
          username = db.username();

    		task.status = "ARCHIVE";
    		task.substatus = "";
    		task = t.addActivity({
    			verb: "ARCHIVE",
    			target: {id:task.username, name: db.contactFullName(p.project.responsible, true), type: "PERSON"},
    			icon: t.icon.archive
    		}, task);
    		t.update(task);
      },
      someday: function(task){
        var t = this,
    			db = this.db,
          p = this.p,
          username = db.username();

    		task.status = "SOMEDAY";
    		task.substatus = "";
    		task = t.addActivity({
    			verb: "SOMEDAY",
    			target: {id:task.username, name: db.contactFullName(p.project.responsible, true), type: "PERSON"},
    			icon: t.icon.someday
    		}, task);
    		t.update(task);
      },
      removeTodo: function(task, todo){
        var t = this,
            toRemove = -1;
        
        dojo.forEach(task.todos, function(item, key){
          if (item._id === todo._id){
            toRemove = key;
          }
        });
        
        if (key !== -1){
          task.todos.splice(key, 1);
        }
        
        t.update(task);
      },
    	remove: function(task){
        //delete can only be done on private tasks so if this isn't a private project
        //update the status and do a put
        
        var t = this,
            db = this.db,
            p = this.p;
        
        if (task.project !== db.myPrivate()){
          task.status = "TRASH";
          task.substatus = "";
          if (p.project.status === "TRASH"){
      			task.substatus = "TRASH";
      		} else if (p.project.substatus === "ARCHIVE"){
      			task.substatus = "ARCHIVE";
      		}
      		t.addActivity({
      		  actor: {id:db.username(), name:db.fullName, type:"PERSON"},
      			object: {id: t._id, name: t.name, type: "TASK"},
      			verb: "DELETE",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.trash,
      			users: p.project.users
      		}, task);
 
          t.update(task);
          //console.debug("not a private task, put was used", t);
        } else {
          //db.taskStore.store.remove(task._id);
          task.status = "TRASH";
          task.substatus = "";
        
          t.update(task);
          //console.debug("private task, remove was used", task._id);
        }
       
       dojo.publish("coordel/setPrimaryBoxCounts");
      },
      addBlocker: function(task, blocker){
        var t = this;
        
        //first make sure that this blocker doesn't already exist
        if (t.hasBlockers()){
          dojo.forEach(t.coordinates, function(id){
            if (blocker === id){
              //this blocker already exists, don't do anything
              return;
            }
          });
        }
        //now deal with the task
        if (task.coordinates){
          task.coordinates = [];
        }
        
        task.coordinates.push(blocker);
        
        task = t.addActivity({
    			verb: "UPDATE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.update,
    			body: message
    		}, task);
        
        return task;
      },
      returnNotDone: function(task, message){
        if (!message){
          message = "";
        }
    		var t = this,
    			db = this.db,
          p = this.p,
          username = db.username();

    		task.status = "CURRENT";
    		task.substatus = "RETURNED";
    		task = t.addActivity({
    			verb: "RETURN",
    			target: {id:task.username, name: db.contactFullName(p.project.responsible, true), type: "PERSON"},
    			icon: t.icon.returnItem,
    			body: message
    		}, task);
    		t.update(task);
    	},
      submitToApprove: function(task, message){
        
        if (!message){
          message = "";
        }

    		var t = this,
    			db = this.db,
          p = this.p,
          username = db.username();

    		task.status = "CURRENT";
    		task.substatus = "DONE";
    		task = t.addActivity({
    			verb: "SUBMIT",
    			target: {id:p.project.responsible, name: db.contactFullName(p.project.responsible, true), type: "PERSON"},
    			icon: t.icon.submitItem,
    			body: message
    		}, task);
        t.update(task);
    	},
    	approve: function(task, message){
    	  if (!message){
    	    message = "";
    	  }
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "DONE";
    		task.substatus = "APPROVED";
    		task = t.addActivity({
    			verb: "APPROVE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.approve,
    			body: message
    		}, task);
    		
    	  t.update(task);
    	},
    	finish: function(task, message){
    	  if (!message){
    	    message = "";
    	  }
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "DONE";
    		task.substatus = "FINISHED";
    		task = t.addActivity({
    			verb: "FINISH",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.finish,
    			body: message
    		}, task);
    		
    	  t.update(task);
    	},
    	raiseIssue: function(task, issue, solution){
    	  
    		var t = this,
    			db = this.db,
          p = this.p,
          body = {
            issue: issue,
            solution: solution
          };

        //convert the body object to a json string to store it in the body of the activity
    		task.status = "CURRENT";
    		task.substatus = "ISSUE";
    		task = t.addActivity({
    			verb: "RAISE-ISSUE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.raiseIssue,
    			title: issue,
    			body: dojo.toJson(body)
    		}, task);	
    		
    		t.update(task);
    	},
    	clearIssue: function(task, message){
    	  
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "CURRENT";
    		task.substatus = "CLEARED";
    		task = t.addActivity({
    			verb: "CLEAR-ISSUE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.clearIssue,
    			body: message
    		}, task);
    		
    		t.update(task);
    	},
    	pause: function(task, message){
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "CURRENT";
    		task.substatus = "PAUSED";
    		task = t.addActivity({
    			verb: "PAUSE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.pause,
    			body: message
    		}, task);
        t.update(task);
    	},
    	resume: function(task, message){
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "CURRENT";
    		task.substatus = "RESUMED";
    		task = t.addActivity({
    			verb: "RESUME",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.resume,
    			body: message
    		}, task);
        t.update(task);
    	},
    	cancel: function(task, message){
    		var t = this,
    			db = this.db,
          p = this.p;

    		task.status = "DONE";
    		task.substatus = "CANCELLED";
    		task = t.addActivity({
    			verb: "CANCEL",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.cancel,
    			body: message
    		}, task);
        t.update(task);
    	},
    	defer: function(task, date){
    	  
    	  //date is an iso string
    	  var t = this,
    	      db = this.db,
    	      p = this.p;
    	      
    	  if (!task.calendar){
    	    task.calendar = {};
    	  }
    	      
    	  task.calendar.start = date;
    	  task = t.addActivity({
    			verb: "DEFER",
    			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.defer,
    			body: coordel.taskDetails.starts + " " + dt.prettyISODate(date)
    		}, task);
    		
    	  t.update(task);
    	      
    	},
    	accept: function(task, message){
    	  //console.debug("accept called in TaskModel", task);
    		var t = this,
    			db = this.db,
          p = this.p;
          
        if (!message){
      	  message = "";
      	}

    		task.status = "CURRENT";
    		task.substatus = "ACCEPTED";
    		task = t.addActivity({
    			verb: "ACCEPT",
    			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.accept,
    			body: message
    		}, task);
    		
        t.update(task);
    	},
    	decline: function(task, message){
    	  
    	  //console.debug("declining task", task);
    	  
    		var t = this,
    			db = this.db,
          p = this.p;
          
        if (!message){
      	  message = "";
      	}
      	
      	//if the user declines this task, it needs to go back to the person who delegated it
      	//or to the project responsible if there isn't a delegator
      	
    		task.status = "DELEGATED";
    		task.substatus = "DECLINED";
    		task = t.addActivity({
    			verb: "DECLINE",
    			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.decline,
    			body: message
    		}, task);
    		console.debug("task to decline", task);
    		t.update(task);
    	},
    	proposeChange: function(task, message){
    	  //when a task is delegated to a user, they might want clarification about what they should
    	  //do, they might want to define the deliverables more completely, or they might need
    	  //to create blocking tasks that need to happen first.
    	  
    	  var t = this,
    			db = this.db,
          p = this.p;
          
        if (!message){
      	  message = "";
      	}
      	
      	//if the user proposes changes this task, it needs to go back to the person who delegated it
      	//or to the project responsible if there isn't a delegator
      	
    		task.status = "DELEGATED";
    		task.substatus = "PROPOSED";
    		task = t.addActivity({
    			verb: "PROPOSE-CHANGE",
    			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.decline,
    			body: message
    		}, task);
    		
    		t.update(task);
    	  
    	},
    	agreeChange: function(task, message){
    	  //if a task is in the proposed state, the delegator or responsible needs to then
    	  //agree to the proposal by ammending it. There can be further clarifications
    	  //to the task in the amendment. propose and amend can iterate indefinitely until
    	  //the person delegated the task accepts/declines or the responsible/delegator delegates
    	  //the task to someone else or cancels it.
    	  
    	  var t = this,
    			db = this.db,
          p = this.p;
          
        if (!message){
      	  message = "";
      	}
      	
    		task.status = "DELEGATED";
    		task.substatus = "AGREED";
    		task = t.addActivity({
    			verb: "AGREE-CHANGE",
    			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.decline,
    			body: message
    		}, task);
    		
    		t.update(task);
    	},
    	markDone: function(task){
    	  //submits to approve if not project responsible
        //or approves if project responsible. There won't be a message when checking the box
        //the user can give a message by choosing submit or approve from actions menu
        var t = this,
      			db = this.db,
      			username = db.username();
      			
      	dojo.publish("coordel/playSound", ["done"]);
          
        //console.debug("user, responsible", this.username, t.projResponsible());

        if (username === t.projResponsible()){
          if (t.username === username){
            //i'm responsible and the task user so finish it
            t.finish(task);
          } else {
            //if the username of task isn't current user and
            //this user is the project responsible approve it
            //console.debug("I'm project responsible, approving task", this.task);
            t.approve(task);
          }
          
        } else {
          //console.debug("I'm not project responsible, submitting task", task);
          t.submitToApprove(task);
        }

    	},
    	addActivity: function(opts, task){
    	  var db = this.db,
          p = this.p,
          username = db.username();
    	  
    	  var defaults = {
    			actor: {id:username, name:db.fullName(), type:"PERSON"},
    			object: {id: task._id, name: task.name, type: "TASK"},
    		  time: stamp.toISOString(new Date(),{milliseconds:true})
    		};
    		opts = dojo.mixin(defaults, opts || {});
    		
    		//make sure there is a place to put history
    		if (!task.history){
    		  task.history = [];
    		}
    		
    		task.history.unshift(opts);
    		return task;
    	}
  });
  return app.models.TaskModel;    
}
);
