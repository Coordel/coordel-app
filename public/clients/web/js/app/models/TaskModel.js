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
      
      headers: {Accept: "application/json", "Content-Type": "application/json"},
      
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
            deadline = t.deadline,
            db = this.db;
        
            
        //console.debug("deadline", deadline);
            
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
          
          if (t.hasBlocking()){
            var derived = deadline,
                now = new Date();
            //need to load the blocking and see when their deadlines are;
            //console.log("t.task.blocking", t.task.name, t.task.blocking, t.task);
            dojo.forEach(t.task.blocking, function(id){
              var block = db.taskStore.blockingStore.get(id);
              //console.log("blocking task: ", block.name);
              var b = db.getTaskModel(block, true);
              //console.log("blocking deadline: ", deadline, derived, b.getDeadline(), b.getDeadline()< derived);
              //var comp = dojo.date.compare(dojo.date.stamp.fromISOString(b.getDeadline()),dojo.date.stamp.fromISOString(derived));
              //console.log("comp", comp);
              //console.log("testing blocking task", b.task.name, b.task.duration);
              //need to test if this blocker's duration is greater than other durations
              var dur = block.duration,
                  testDiff = 0;
              //console.log("block duration", block, block.duration);
              if (dur){
                switch (dur.unit){
                  case "m":
                  testDiff = dojo.date.difference(now, dojo.date.add(now, "minute", dur.number), "minute");
                  break;
                  case "h":
                  testDiff = dojo.date.difference(now, dojo.date.add(now, "hour", dur.number), "minute");
                  break;
                  case "d":
                  testDiff = dojo.date.difference(now, dojo.date.add(now, "day", dur.number), "minute");
                  break;
                  case "w":
                  testDiff = dojo.date.difference(now, dojo.date.add(now, "week", dur.number), "minute");
                  break;
                }
                
                //console.log("derived before add", derived, -testDiff);
                //subtract the duration required by the blocking task
                var diffDate = dojo.date.add(dojo.date.stamp.fromISOString(derived), "minute", -testDiff);

                derived = dojo.date.stamp.toISOString(diffDate);
                //console.log("derived after add", derived);
              }
              

              //console.log("deadline derived test", dojo.date.compare(dojo.date.stamp.fromISOString(b.getDeadline()), dojo.date.stamp.fromISOString(derived)));
              if (dojo.date.compare(dojo.date.stamp.fromISOString(b.getDeadline()), dojo.date.stamp.fromISOString(derived)) < 0){
                
                derived = b.getDeadline();
                //console.log("Sooner: ", block.name, b.getDeadline(), derived, deadline);
              }
            });
            deadline = derived;
            /*
            if (durDiff > 0){
              console.log("deadline before add", deadline, durDiff, -durDiff);
              var diffDate = dojo.date.add(dojo.date.stamp.fromISOString(deadline), "minute", -durDiff);
              
              deadline = dojo.date.stamp.toISOString(diffDate);
              console.log("deadline after add", deadline);
            }
            */
          }
    
        } else if (!t.hasDeadline() && (t.isPrivate() || t.isDelegated())) {
          //the only tasks that don't have deadlines are those that are in the private project or
  		    //in the delegated project and get deadline returns "" for them. set it to 200 years in 
  		    //the future so it comes last in any sorted list
  		    deadline = "2200-01-01";
        }
        
        //console.log("deadline to return", deadline);
        return deadline;
      },
      
      projName: function(){
        var p = this.p.project;
        var name = p.name;
        if (!name){
          name = coordel.sortHeader.noProject;
          if (p.isMyPrivate){
            //console.debug ("it's my private project");
            name = coordel.myPrivate;
          } else if (p.isMyDelegated){
            //console.debug ("it's my delegated project");
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
      
      isUnassigned: function(){
        var t = this;
        return (t.username === "UNASSIGNED" || t.substatus === "UNASSIGNED") && !t.isCancelled() && !t.isDone();
      },
      
      isCurrent: function(){
    		
     		var isCurrent = true,
    			  t = this,
    			  p = this.p,
    			  db = this.db,
    			  username = this.db.username(),
    			  reason = "Task was current",
    			  test = false;
    			  
    		//console.log("isSubmitted", t.isSubmitted(), "isDelegated", t.isDelegated(), "isProjectDelegated", t.isProjectDelegated());

       	//if it's deleted, it's not current
    		if (t.isDeleted()){
    		  return false;
    		}
    		
    		if (t.isBlocked()){
    		  //console.debug(t.name + " was BLOCKED, it's not current");
    		  return false;
    		}
    	 
    	  //if it's unassigned, it's current if I'm delegator or responsible
    		if (t.isUnassigned()){
    		  if (t.delegator && t.delegator === username){
    		    return true;
    		  } else if (t.projResponsible() === username){
    		    return true;
    		  } else {
    		    return false;
    		  }
    		}
    		
    		//if it's declined and I'm not the delegator or responsible it's not current
    		//it's not current when viewing a project list
    		if (t.isDeclined()){
    		  test = false;
    		  //console.debug("task is declined", t);
    		  if (t.delegator && t.delegator === username && db.focus !== "project"){
    		    //if I'm the delegator, then a declined task is CURRENT up for me
    		    test = true;
    		  } else if (t.projResponsible() === username && db.focus !== "project"){
    		    //if I'm the responsible, then a declined task is CURRENT for me
            test = true;
            //console.debug("this task is DECLINED and I'm responsible", test);
    		  }
    		  
    		  return test;
    		}
    		
    		if (t.isProjectInvite()){
    		  //if it's project invite, I haven't joined the project yet
    		  return false;
    		}
    		
    		//console.debug("before calling t.isInvite(): ");
    		//if it's an invite, it's not current because I haven't accepted it yet
    		if (t.isInvite()){
    			console.debug(t.name + " was INVITE, it's not current");
    			return false;
    		}
    		
        //console.debug("in isCurrent before calling isDone", t.name, t.isDone());
    		//if it's done or trash, it's not current :)
    		if (t.isDone()){
    			//console.log(t.name + " is DONE");
    			//console.debug(t.name + " was done, it's not current");
    			return false;
    		}
    		
    		//console.debug("coordinates length", task.coordinates.length);
    		//if it's delegated (in my delegated project) or delegated to someone else
    		//it's not current
    		if (t.isDelegated() || t.isProjectDelegated()){
    		  //console.log("isDelegated", t.isDelegated(), "isProjectDelegated", t.isProjectDelegated());
    		  test = false;
    		  //if the task is delegated and it submitted for approval, then it's current
    		  //for the responsible
    		  if (t.isSubmitted() && t.projResponsible() === username){
    		    test = true;
    		  }
    		  
    		  //if the task is delegated and it's is an issue, then it's current for the 
    		  //responsible
    		  if (t.isIssue() && t.projResponsible() === username){
    		    test = true;
    		  }
    		  
    		  //console.debug(t.name + " was delegated, it's not current");
    		  return test;
    		}
    		
    		//if it's paused, it's not current
    		if (t.isPaused()){
    		  return false;
    		}
    		
    		//if it's cancelled, it's not current :)
    		if (t.isCancelled()){
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
  		  
  		  //if the task is unassigned, it will only show in the project list, so shouldn't be blocked
  		  if (t.isUnassigned() && db.focus === "project"){
  		    return false;
  		  }
 		    //if this task is paused, it's blocked by the project responsible pausing the task
  		  //because the user is still responsible, but can't do work on it at this time
  		  //this makes it easier for project responsibles to manage what is current for users
  
  		  if (t.isPaused()){
  		    
  		    //if the task is delegated and i'm the responsible, then it's not blocked for me
  		    if (t.isDelegated() && t.responsible === db.username()){
  		      return false;
  		    }
  		  
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
  		
  		isBlocking: function(){
  		  //returns true if this task is blocking other tasks
  		  
  		},
  		
  		isProjectInvite: function(){
        //this is invited if it's any of the invited states
        var t = this,
            p = this.p,
            test = false;
            
        //if the task is unassigned, it should only show as unassigned
  		  if (t.isUnassigned()){
  		    return false;
  		  }
         
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
    		    
    		if (t.isCancelled()){
    		  return false;
    		}
    		    
        //if the task is unassigned, it should only show as unassigned
  		  if (t.isUnassigned()){
  		    return false;
  		  }
    
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
    		
   	    //if the task is unassigned, it should only show as unassigned
  		  if (t.isUnassigned()){
  		    return false;
  		  }
    		
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
  		  
  		  //console.log("before isCurrent in isTaskInvite", isCurrent);
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
    	      
    	  //if i'm responsible and this is submitted or issue, it's not delegated
    	  if (t.responsible === username && (t.isSubmitted() || t.isIssue())){
    	    return false;
    	  }
    	  
    	      
    	  //console.debug ("delegated project", delProj, t.project);
    	  //tasks placed in the delegated project are all delegated  
    	  if (t.project === delProj && !t.isDone() && !t.isCancelled()){
    	    isDelegated = true;
    	    //console.log("task in my delegated project", delProj, t);
    	  } 
    	  
    	  //tasks I've delegated in a project that I'm not responsible also show in the delegated list
    	  //this allows me to track tasks I've delegated in projects
    	  if (t.hasDelegator() && t.responsible !== t.delegator && t.delegator === username && !t.isDone()){
    	    
    	    //if this task is submitted and there is a delegator, it's not delegated if i'm the responsible
    	    isDelegated = true;
    	    //console.log("task delegated by non-responsible", t.responsible, t.delegator, username, t.isDone(), t);
    	  }
        
    	  return isDelegated;
    	},
    	
    	isProjectDelegated: function(){
    	  var t = this,
    	      username = this.db.username(),
    	      test = false;
    	      
    	  //tasks that are delegated by the project responsible
    	  if (t.status === "CURRENT" && (t.substatus === "DELEGATED" || t.substatus === "ACCEPTED") && t.responsible === username && t.username !== username && this.db.focus !== "project"){
    	    //console.log("task delegated by project responsible", t.responsible, t.username, t);
    	    test = true;
    	  }
    	  
    	  return test;
    	  
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
    	  return (t.status === "DONE" && t.substatus === "CANCELLED") || pStatus.isCancelled(t.p.project);
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
    			  
        //if the task is unassigned, it should only show as unassigned
  		  if (t.isUnassigned()){
  		    return false;
  		  }	

  		  //the assumption is that once a task gets going, it's not deferred any more
    		if (t.hasDeferDate()
    		  && !t.isSubmitted()
    		  && !t.isBlocked()
    		  && !t.isPaused()
    		  && !t.isIssue()
    		  && !t.isProjectDelegated()
    		  //&& !t.isCleared()
    		  //&& !t.isReturned()
    			&& !t.isDone()
    			&& !t.isCancelled()
    			&& !t.isInvite()
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
    	hasBlocking: function(){
    	  return (this.blocking && this.blocking.length > 0);
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
    	  return (t.status === "CURRENT" && t.substatus === "PAUSED") || pStatus.isPaused(t.p.project);
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
          //console.debug("task.project was provided, but wasn't in uuid format", task.project);
          delete (task.project);
        }
        
        if (task.role && task.role !== "" && !uuidPat.test(task.role)){
          //task.role was provided and wasn't blank and didn't match the uuid format
          //delete what was sent and it will default accordingly
          //console.debug("task.role was provided, but wasn't in uuid format", task.role);
          delete (task.role);
        }
        
        return task;
    	},
    	add: function(task){
    	  
    	  task = this._validateTask(task);
    	  
    	  var t = this,
    	      p = this.p,
    	      isDelegated = false,
    	      //track project name because it can change to private or delegated if no project given
    	      projId = p.project._id,
    	      projName = p.project.name;
    	  
    	  //console.debug("add task", task, task.username, p.project.substatus);
        
  	    var db = this.db,
  	        app = db.appStore.app(),
  	        username = db.username(),
  	        id = db.uuid(),
  	        projResponsible = this.projResponsible();
        
        if (!task._id){
          task._id = id;
        }
        
  	    //default status and substatus
  	    //CURRENT means that it can show in the Current list if not deferred or blocked
  	    task.status = "CURRENT"; 
  	    //if I created this task, then I've already accepted by default
  	    task.substatus = "ACCEPTED"; 
  	    //not private or delegated by default
  	    task.isMyPrivate = false;
	      task.isMyDelegated = false;
  	    
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
  	      isDelegated = true;
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
  	      task.isMyPrivate = true;
  	      projId = app.myPrivateProject;
  	      projName = coordel.myPrivate;
  	      //it's a delegated project if the username isn't me
  	      if (task.username !== username){
  	        //assign it to my delegated project
  	        task.project = app.myDelegatedProject;
  	        task.isMyPrivate = false;
  	        task.isMyDelegated = true;
  	        projId = app.myDelegatedProject;
    	      projName = coordel.delegated + " (" + db.fullName() + ")";
  	      }
  	    } 
  	    
  	    //if the substatus of the project is PENDING then the task status should be pending
  	    //if this user isn't the responsible
  	    //console.log("testing pending", p.project.substatus, task.responsible, task.username);
  	    if (p.project.substatus === "PENDING" && task.responsible !== task.username){
  	      task.status = "PENDING";
  	      //console.debug("project substatus is PENDING, updated task status to PENDING");
  	    }
    		
        //set the type and template info
        task.docType = "task";
        task.isTemplate = false;
        
        /*
        //if this is in in myDelegatedProject, need to flag it delegated so the view can find it
        task.isMyPrivate = false;
        if (task.project === app.myPrivateProject){
          task.isMyPrivate = true;
        }
        
        //if this is in in myDelegatedProject, need to flag it delegegated so the view can find it
        task.isMyDelegated = false;
        if (task.project === app.myDelegatedProject){
          task.isMyDelegated = true;
        }
        */
        
        //handle the activity stream
        //make the POST activity for the task creation
        task = t.addActivity({
    			verb: "POST",
    			target: {id:projId, name: projName, type: "PROJECT"},
    			icon: t.icon.post
    		}, task);
        
        //make the DELEGATE entry if delegated
        if (isDelegated){
          //console.debug("adding DELEGATE activity");
  	      task = t.addActivity({
      			verb: "DELEGATE",
      			target: {id:projId, name: projName, type: "PROJECT"},
      			icon: t.icon.delegateItem
      		}, task);
        }
        
       
  
        var def = p.updateAssignments(task);
        
        //need to make sure the update to the project happens before the task is added
        def.then(function(taskResp){
          console.debug("adding task with status", taskResp, taskResp.status);
          //db.taskStore.store.add(taskResp, {username: username});
          var save;
          switch(db.focus){
            case "project":
          
            save = db.projectStore.taskStore.add(taskResp, {username: username});
            break;
            case "task":
            save = db.taskStore.store.add(taskResp, {username: username});
            break;
            case "contact":
            save = db.contactStore.taskStore.add(taskResp, {username: username});
            break;
          }
          
          dojo.when(save, function(){
             t.updateBlocking(taskResp);
             dojo.publish("coordel/updatePrimaryBoxCount");
          });

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
      
      blueprint: function(task){
        var db = this.db,
            username = this.db.username(),
            p = this.p,
            t = this;
            
        if (t.isNew){
          db.taskStore.store.add(task, {username: username});
        } else {
          db.taskStore.store.put(task, {username: username});
        }
      },
      
      update: function(task){

        var db = this.db,
            app = db.appStore.app(),
            username = this.db.username(),
            p = this.p,
            t = this,
            projResponsible = this.projResponsible();;
            
        
            
        console.debug("update task", task, task._rev, db.focus, p.project);
            
        task.isNew = false;
        
        //get rid of the calculated fields
        delete task.contextDeadline;
        delete task.contextStarts;
        
        //default to the current user if username not set yet
  	    if (!task.username){

  	      //no username was set, so it's my task. in an update, this will only happen if the 
  	      //existing username was removed.
  	      task.username = username;
  	    }
  	    
  	    //when a user is removed from a task, then the existing status was also removed
  	    //so need to reset it accordiningly here
  	    if (!task.status){
  	      
  	      //CURRENT means that it can show in the Current list if not deferred or blocked
  	      //since there was no name, need to make this task the responsibility of the user 
  	      //that removed the existing name
    	    task.status = "CURRENT"; 
    	    //if I created this task, then I've already accepted by default
    	    task.substatus = "ACCEPTED";
          
          //if i'm not the task user, then this is delegated
    	    if (task.username !== username){
    	      task.substatus = "DELEGATED";
    	      isDelegated = true;
    	    }
    	    
    	    //make a note that this was reassigned from the initial user since this was an update
    	    task = t.addActivity({
      			verb: "REASSIGN",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.reassign
      		}, task);
        }
  	    
  	    //default to noName if there's no name set
  	    if (!task.name){
  	      task.name = coordel.noName;
  	    }
  	    
  	    //if a project was set, set the responsible and, if applicable, the delegator
  	    if (task.project){
  	      //the task responsible is the project responsible
          task.responsible = projResponsible;
          
          //if task is delegated and isn't for me and the project responsible isn't me, then i'm the delegator
          if (projResponsible !== username && task.username !== username && task.status === "DELEGATED"){
            task.delegator = username;
          }
  	    }
  	    
  	    //if no project and the task is mine then assign it to my private project
  	    if (!task.project || task.project === null || task.project === ""){
  	      //i'm the responsible when it's a private or delegated task
  	      task.responsible = username;
  	      task.project = app.myPrivateProject;
  	      task.isMyPrivate = true;
  	      projId = app.myPrivateProject;
  	      projName = coordel.myPrivate;
  	      //it's a delegated project if the username isn't me
  	      if (task.username !== username){
  	        //assign it to my delegated project
  	        task.project = app.myDelegatedProject;
  	        task.isMyPrivate = false;
  	        task.isMyDelegated = true;
  	        projId = app.myDelegatedProject;
    	      projName = coordel.delegated + "(" + db.fullName() + ")";
  	      }
  	    } 
        
        /*
        //if this is in in myDelegatedProject, need to flag it delegegated so the view can find it
        task.isMyPrivate = false;
        if (task.project === db.myPrivate()){
          task.isMyPrivate = true;
        }
        
        //if this is in in myDelegatedProject, need to flag it delegegated so the view can find it
        task.isMyDelegated = false;
        if (task.project === db.myDelegated()){
          task.isMyDelegated = true;
        }
        */
        
        
        /*
        //make the UPDATE activity for the task update
        task = t.addActivity({
    			verb: "UPDATE",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
    			icon: t.icon.update
    		}, task);
    		
    		*/
    		//updating the assignments loads the role of the task, then updates the responsibilities
    		//status of the role and saves it. If the project doesn't have a role for this user, it the 
    		//adds the assignment (using th)
        dojo.when(p.updateAssignments(task), function(updatedTask){
          
          //console.log("updated assignments", updatedTask, p.project);
          //use the appropriate store based on the focus of the db
          
          var save;
           
          switch(db.focus){
            case "project":
            //console.log("do projectStore.store.put", updatedTask);
            save = db.projectStore.taskStore.put(updatedTask, {username: username});
            break;
            case "task":
            //console.log("do taskStore.store.put", updatedTask);
            save = db.taskStore.store.put(updatedTask, {username: username});
            break;
            case "contact":
            //console.log("do contactStore.store.put", updatedTask);
            save = db.contactStore.taskStore.put(updatedTask, {username: username});
            break;
          }
          
          dojo.when(save, function(args){
            console.log("updating blocking", updatedTask);
            t.updateBlocking(updatedTask);

            dojo.publish("coordel/setPrimaryBoxCounts");
          }); 
        });
        
        
      },
      
      updateBlocking: function(task){
        
        //this function keeps blocking tasks in sync with this one.
        var db = this.db,
            p = this.p;
      
        //console.log("updateBlocking for task: ", task._id, task.name);
        
        var tModel = db.getTaskModel(task, true);
        var body = {
          project: tModel.p.project.name,
          task: task.name
        };
        
        
        //first get any existing blocking tasks for this task
        var qBlocking = db.taskStore.getBlocking(task._id);
        
        dojo.when(qBlocking, function(blocking){
          console.log("got blocking for task", task.name, blocking);
          if (task.coordinates && task.coordinates.length > 0){
            console.log("task has coordinates entry");
            var query;
            //if (task.coordinates.length > 0){
              //console.log("has more than 0 coordinates");

              //if a task has blockers, then get the blockers and 
              //make a blocking entry for each
              query = db.taskStore.getBlockers(task._id);
              dojo.when(query, function(blockers){
  
                //iterate over the existing blocking tasks to make sure they are still blocked
                //if not remove them
                dojo.forEach(blocking, function(item){
                  console.log("iterating blocking", task.coordinates, item._id);
                  if (dojo.indexOf(task.coordinates, item._id) === -1){
                    //this blocking task isn't blocking any more
                    console.log(task._id + " is no longer blocked, removing blocking entry: ", item._id);
                    item.blocking = dojo.filter(item.blocking, function(id){
                      return id !== task._id;
                    });
                    var t = db.getTaskModel(item, true);

                    item = t.addActivity({
                			verb: "REMOVE-BLOCKING",
                			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
                			icon: t.icon.removeBlocking,
                			body: dojo.toJson(body)
                		}, item);
                    t.update(item);
                  }
                });
                
                //iterate over the existing blockers to make sure there are blocking entries
                dojo.forEach(blockers, function(item){
                  if (!item.blocking){
                    item.blocking = [];
                  }
                  console.log("testing if this has the blocking item", item.blocking, task._id);
                  if (dojo.indexOf(item.blocking, task._id) === -1){
                    console.log(task.name + " is now blocked, making blocking entry: ", item.name);
                    item.blocking.push(task._id);
                    var t = db.getTaskModel(item, true);

                    item = t.addActivity({
                			verb: "ADD-BLOCKING",
                			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
                			icon: t.icon.addBlocking,
                			body: dojo.toJson(body)
                		}, item);
                    t.update(item);
                  }
                });
              });

            } else {
              //if a task doesn't have blockers, load any tasks that have blocking
              //entries for this task and clear them
                if (blocking.length > 0){
                  console.log("task has no blockers, removing existing");
                  dojo.forEach(blocking, function(item){
                    console.log("blocking", item);
                    if (dojo.indexOf(item.blocking, task._id) > -1){
                      console.log(task.name + " doesn't have blockers, remove blocking entry: ", item.name);
                      item.blocking = dojo.filter(item.blocking, function(id){return id !== task._id ;});
                      var t = db.getTaskModel(item, true);
                      item = t.addActivity({
                  			verb: "REMOVE-BLOCKING",
                  			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
                  			icon: t.icon.removeBlocking,
                  			body: dojo.toJson(body)
                  		}, item);
                      t.update(item);
                    }
                  });
                }
         
            //}
          }
        });
        
  
        /*
        if (task.coordinates && task.coordinates.length > 0){
          console.log("task has coordinates entry");
          var query;
          //if (task.coordinates.length > 0){
            //console.log("has more than 0 coordinates");
            
            //if a task has blockers, then get the blockers and 
            //make a blocking entry for each
            query = db.taskStore.getBlockers(task._id);
            dojo.when(query, function(blockers){
              console.log("got blockers for this task", blockers);
              dojo.forEach(blockers, function(item){
                console.log("updating blocked task", item);
                if (!item.blocking){
                  item.blocking = [];
                }
                //console.log("testing if this has the blocking item", item.blocking, task._id);
                if (dojo.indexOf(item.blocking, task._id) === -1){
                  //console.log(task.name + " has blockers, making blocking entry: ", item.name);
                  item.blocking.push(task._id);
                  var t = db.getTaskModel(item, true);
                  
                  item = t.addActivity({
              			verb: "ADD-BLOCKING",
              			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
              			icon: t.icon.addBlocking,
              			body: dojo.toJson(body)
              		}, item);
                  t.update(item);
                }
              });
            });
          
          } else {
            //if a task doesn't have blockers, load any tasks that have blocking
            //entries for this task and clear them
            console.log("coordinates length isn't > 0");
            
            query = db.taskStore.getBlocking(task._id);
            dojo.when(query, function(blocking){
              console.log("blocking entries for this task", blocking);
              if (blocking.length > 0){
                dojo.forEach(blocking, function(item){
                  console.log("blocking", item);
                  if (dojo.indexOf(item.blocking, task._id) > -1){
                    console.log(task.name + " doesn't have blockers, remove blocking entry: ", item.name);
                    item.blocking = dojo.filter(item.blocking, function(id){return id !== task._id ;});
                    var t = db.getTaskModel(item, true);
                    item = t.addActivity({
                			verb: "REMOVE-BLOCKING",
                			target: {id: p.project._id, name: p.project.name, type: "PROJECT"},
                			icon: t.icon.removeBlocking,
                			body: dojo.toJson(body)
                		}, item);
                    t.update(item);
                  }
                });
              }
            });
          //}
        }
        */
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
          task.substatus = "TRASH";
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
          task.substatus = "TRASH";
        
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
          
        //console.log("p in submitToApprove", p);

    		task.status = "CURRENT";
    		task.substatus = "DONE";
    		task = t.addActivity({
    			verb: "SUBMIT",
    			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
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
            raiseIssue: {
              issue: issue,
              solution: solution
            }
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
    		
    		console.log("cancelling task", task);
    		
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
    		//console.debug("task to decline", task);
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
        
        task.completed = (new Date()).toISOString();
        task.hasSaveDone = true;

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
    	
    	leave: function(task){
    	  	var t = this,
      			db = this.db,
            p = this.p;

      		task.username = "UNASSIGNED";
      		task = t.addActivity({
      			verb: "LEAVE",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.leave
      		}, task);
          t.update(task);
    	},
    	
    	reassign: function(task, username){
    	  	var t = this,
      			db = this.db,
            p = this.p;

      		task.username = username;
      		task = t.addActivity({
      			verb: "REASSIGN",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.reassign
      		}, task);
          t.update(task);
    	},
    	
    	reuse: function(task, isDeliverables){
    	  var bp = {
    	    username: this.db.username(),
    	    templateType: "task",
    	    task: task
    	  };
    	  /*
    	  var bp = task;
    	  if (isDeliverables){
    	    var dbp = {};
    	    dpb.docType = "deliverable";
    	    dbp.deliverables = task.workspace;
    	    bp = dbp;
    	    console.log("reuse deliverable", bp);
    	  } else {
    	    console.log("reuse task", bp);
    	  }
    	  */
    	  return  dojo.xhrPost({
          url: "/blueprint",
          handleAs: "json",
          postData: dojo.toJson(bp),
          headers: this.headers,
          load: function(res){
            //console.log("blueprint", res);
          }
        });
    	},
    	
    	version: function(){
    	    //create a version of this task when doing an edit
          var task = this.task;

          if (!task.versions){
            task.versions = {};
          }

          if (!task.versions.latest){
             task.versions.latest = dojo.clone(task);
          } else {
            if (!task.versions.history){
              task.versions.history = [];
            }
            task.versions.history.push(task.versions.latest);
            task.versions.latest = dojo.clone(task);
          }

          delete task.versions.latest.contextStarts;
          delete task.versions.latest.contextDeadline;
          delete task.versions.latest.history;
          delete task.versions.latest.versions;
          //console.log("setVersion in TaskModel", task.versions);
    	},
    	
    	logActivity: function(task){
    	  
    	  var t = this,
    			  db = this.db,
            p = this.p,
            changes = [],
    	      latest = task.versions.latest,
    	      hasChange = false,
    	      recap;
    	      
        function prettyDate(date){
          var hasTime = false,
              test = date.split("T");
          if(test.length > 1){
            hasTime = true;
          }
          return dt.prettyISODate(date, hasTime);
        }
	      
    	  function fix(val){
    	    //use this function to make sure that we don't send undefined values in the 
    	    //changes
    	    if (val === undefined){
    	      val = "";
    	    }
    	    return val;
    	  }
    	  
    	  //purpose 
    	  if (task.purpose){
    	    if (!latest.purpose || latest.purpose === ""){
    	      //added
    	      hasChange = true;
      	    //console.log("purpose changed");
      	    changes.push({field: "purpose", prev: false, value: fix(task.purpose)});
    	    } else {
    	      if (task.purpose !== latest.purpose){
    	        //changed
      	      hasChange = true;
        	    //console.log("purpose changed");
        	    changes.push({field: "purpose", prev: fix(latest.purpose), value: fix(task.purpose)});
    	      }
    	    }
    	  } else {
    	    if (latest.purpose){
    	      //removed 
    	      hasChange = true;
      	    //console.log("purpose changed");
      	    changes.push({field: "purpose", prev: fix(latest.purpose), value: false});
    	    }
    	    
    	  }
    	  
    	  //deferred
  	    if (task.calendar){
  	      if (!latest.calendar){
  	        hasChange = true;
  	        //console.log("deferred changed");
    	      changes.push({field: "deferred", prev: false, value: fix(prettyDate(task.calendar.start))});
  	      } else {
  	        if (task.calendar.start !== latest.calendar.start){
    	        hasChange = true;
    	        //console.log("deferred changed");
      	      changes.push({field: "deferred", prev: fix(prettyDate(latest.calendar.start)), value: fix(prettyDate(task.calendar.start))});
    	      }
  	      }
  	    } else {
  	      if (latest.calendar){
    	      hasChange = true;
  	        //console.log("deferred changed");
    	      changes.push({field: "deferred", prev: fix(prettyDate(latest.calendar.start)), value: false});
    	    }
  	    }
  	     
  	    //deliverables
  	    if (task.workspace){
  	      //there are deliverables now, see if there were before
    	    if(!latest.workspace){
    	      //there weren't any deliverables before so all existing now were added
    	      hasChange = true;
    	      dojo.forEach(task.workspace, function(del){
    	        //console.log("deliverable added");
    	        changes.push({field: "deliverable", prev: false, value: fix(del.name)});
    	      });
    	    } else {
    	      //there were deliverables before so need to do analysis to see what happend
            recap = {
              removed: [],
              added: []
            };
            
    	      //see if any of the deliverables have been removed
    	      dojo.forEach(latest.workspace, function(l){
    	        var isRemoved = true;
    	        dojo.forEach(task.workspace, function(t){
    	          if (l.id === t.id) isRemoved = false; 
    	        });
    	        if (isRemoved) recap.removed.push(l);
    	      });
    	      
    	      //add change entries for removed deliverables
    	      if (recap.removed.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.removed, function(del){
    	          //console.log("deliverable removed");
      	        changes.push({field: "deliverable", prev: fix(del.name), value: false});
    	        });
    	      }
    	      
    	      //see if any of the deliverables have been added
    	      dojo.forEach(task.workspace, function(t){
    	        var isAdded = true;
    	        dojo.forEach(latest.workspace, function(l){
    	          if (t.id === l.id) isAdded = false;
    	        });
    	        if (isAdded) recap.added.push(t);
    	      });
    	      
    	      //add change entries for added deliverables
    	      if (recap.added.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.added, function(del){
    	          //console.log("deliverable added");
      	        changes.push({field: "deliverable", prev: false, value: fix(del.name)});
    	        });
    	      }
    	      
    	      //compare the task deliverable update dates with latest to see if they have changed
    	      //and make entries as required
    	      dojo.forEach(task.workspace, function(t){
  
    	        dojo.forEach(latest.workspace, function(l){
    	          if (t.id === l.id && t.updated !== l.updated){
    	            hasChange = true;
        	        //console.log("deliverables changed");
        	        changes.push({field: "deliverable", prev: fix(l.name), value: fix(t.name)});
    	          }
    	        });
    	      });
    	    }
    	  } else {
    	    //there isn't a workspace, need to see if there was one before
    	    if (latest.workspace){
    	      //there was a previous workspace so that means all the previous deliverables were removed
    	      hasChange = true;
    	      dojo.forEach(latest.workspace, function(del){
    	        //console.log("deliverable removed");
    	        changes.push({field: "deliverable", prev: fix(del.name), value: false});
    	      });
    	      
    	    }
    	  }
        
        //deadline
    	  if (task.deadline){
    	    if (!latest.deadline){
    	      //added
    	      hasChange = true;
      	    //console.log("deadline changed");
      	    changes.push({field: "deadline", prev: false, value: fix(prettyDate(task.deadline))});
    	    } else {
    	      if (task.deadline !== latest.deadline){
    	        //changed
      	      hasChange = true;
        	    //console.log("deadline changed");
        	    changes.push({field: "deadline", prev: fix(prettyDate(latest.deadline)), value: fix(prettyDate(task.deadline))});
    	      } 
    	    }
    	  } else {
    	    if (latest.deadline){
    	      //removed
    	      hasChange = true;
      	    //console.log("deadline changed");
      	    changes.push({field: "deadline", prev: fix(prettyDate(latest.deadline)), value: false});
    	    }
    	  }
    	  
    	  //name
    	  if (task.name !== latest.name){
    	    var name = task.name;
    	    if (!name || name === ""){
    	      name = coordel.noName;
    	    }
    	    hasChange = true;
    	    //console.log("name changed");
    	    changes.push({field: "name", prev: fix(latest.name), value: fix(name)});
    	  }
    	  
    	  //blockers
    	  if (task.coordinates){
    	    function getBlocker(task){
    	      var def = new dojo.Deferred();
    	      var mod = db.getBlockerModel(task);
    	      dojo.when(mod, function(t){
    	        var blocker = coordel.task + ": "  + t.task.name + " | " + coordel.project + ": " + t.p.project.name;
    	        def.callback(blocker);
    	      });
    	      return def;
    	    }
    	    
    	    if (!latest.coordinates){
    	      //all of these were added
    	      hasChange = true;
    	      dojo.forEach(task.coordinates, function(b){
    	        var blocker = getBlocker(b);
    	        dojo.when(blocker, function(bl){
    	          changes.push({field: "blocker", prev: false, value: fix(bl)});
    	        });
    	      });
    	    } else {
            recap = {
              removed: [],
              added: []
            };
            
    	      //see if any of the blockers have been removed
    	      dojo.forEach(latest.coordinates, function(l){
    	        var isRemoved = true;
    	        dojo.forEach(task.coordinates, function(t){
    	          if (l === t) isRemoved = false; 
    	        });
    	        if (isRemoved) recap.removed.push(l);
    	      });
    	      
    	      //add change entries for removed blockers
    	      if (recap.removed.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.removed, function(b){
    	          console.log("blocker removed");
      	        var blocker = getBlocker(b);
      	        dojo.when(blocker, function(bl){
      	          changes.push({field: "blocker", prev: fix(bl), value: false});
      	        });
    	        });
    	      }
    	      
    	      //see if any of the blockers have been added
    	      dojo.forEach(task.coordinates, function(t){
    	        var isAdded = true;
    	        dojo.forEach(latest.coordinates, function(l){
    	          if (t === l) isAdded = false;
    	        });
    	        if (isAdded) recap.added.push(t);
    	      });
    	      
    	      //add change entries for added blockers
    	      if (recap.added.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.added, function(b){
    	          console.log("blocker added");
      	        var blocker = getBlocker(b);
      	        dojo.when(blocker, function(bl){
      	          changes.push({field: "blocker", prev: false, value: fix(bl)});
      	        });
    	        });
    	      }
    	    }
    	  
    	  } else {
    	    if (latest.coordinates){
    	      //all of these were removed
    	      hasChange = true;
    	      dojo.forEach(latest.coordinates, function(b){
    	        console.log("blocker removed");
    	        var blocker = getBlocker(b);
    	        dojo.when(blocker, function(bl){
    	          changes.push({field: "blocker", prev: fix(bl), value: false});
    	        });
    	      });
    	      
    	    }
    	  }
    	  
    	  //attachments
    	  if (task._attachments){
    	    if (!latest._attachments){
    	      //all of these were added
    	      hasChange = true;
    	      for (var add in task._attachments){
    	        changes.push({field: "attachment", prev: false, value: fix(add)});
    	      }
    	    } else {
            recap = {
              removed: [],
              added: []
            };
            
    	      //test for removed attachments
    	      for (var lrem in latest._attachments){
    	        var isRemoved = true;
    	        for (var trem in task._attachments){
    	          if (lrem === trem) isRemoved = false;
    	        }
    	        if (isRemoved) recap.removed.push(lrem);
    	      }
    	     
    	      //add change entries for removed attachments
    	      if (recap.removed.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.removed, function(file){
    	          //console.log("deliverable removed");
      	        changes.push({field: "attachment", prev: fix(file), value: false});
    	        });
    	      }
    	      
    	      //test for added attachments
    	      for (var tadd in task._attachments){
    	        var isAdded = true;
    	        for (var ladd in latest._attachments){
    	          if (ladd === tadd) isAdded = false;
    	        }
    	        if (isAdded) recap.added.push(tadd);
    	      }
    	      
    	      //add change entries for added attachments
    	      if (recap.added.length > 0){
    	        hasChange = true;
    	        dojo.forEach(recap.added, function(file){
    	          //console.log("deliverable added");
      	        changes.push({field: "attachment", prev: false, value: fix(file)});
    	        });
    	      }
    	    }
    	  
    	  } else {
    	    if (latest._attachments){
    	      //all of these were removed
    	      hasChange = true;
    	      for (var rem in latest._attachments){
    	        changes.push({field: "attachment", prev: fix(rem), value: false});
    	      }
    	    }
    	  }
    	  
    	  
    	  //project
    	  if (task.project !== latest.project){
    	    hasChange = true;
    	    //console.log("project changed");
    	    changes.push({field: "project", prev: fix(latest.project), value: fix(task.project)});
    	  }
    	  
    	  //check now if there were any changes and log them if there were
    	  //otherwise, just return the task as it was;
    	  if (hasChange){
    	    task = t.addActivity({
      			verb: "UPDATE",
      			target: {id:p.project._id, name: p.project.name, type: "PROJECT"},
      			icon: t.icon.update,
      			body:  dojo.toJson({changes: changes})
      		}, task);
    	  }
    	  
    		return task;
    	   
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

