define("app/models/ProjectStatus",
  ["dojo", 
  "i18n!app/nls/coordel", 
  "dojo/date", 
  "dojo/date/stamp"], function(dojo, coordel, date, stamp) {
 
    return {
      
      _isUserInvite: function(project, username, status){
        var test = false;
        
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.username === username && assign.status === status){
              test = true;
            }
          });
        }
        
        return test;
      },
      
      _isRespInvite: function(project, username, status){
        var test = false;
        
        if (project.responsible !== username){
          return false;
        }
        
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.status === status){
              test = true;
            }
          });
        }
        
        return test;
      },
      
      isInvitedFollow: function(project, username){
        var test = false;
        
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.username === username && assign.role === "FOLLOWER" && assign.status === "INVITE"){
              test = true;
            }
          });
        }
        //console.log("isInvitedFollow", project, username, isNew, test);
        return test;
      },
      
      
      isInvitedNew: function(project, username){
        
        return this._isUserInvite(project, username, "INVITE");
       
      },
      
      isInvitedDeclined: function(project, username){
        //an invite is declined if any of the assignments.status is DECLINED and i'm the 
        //project responsible. It's not necessary to see a project invite for FOLLOWERS who decline.
        //the Stream and Notifications will do.
        
        var test = false;
        
        if (project.responsible !== username){
          return false;
        }
        
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.status === "DECLINED" && assign.role !== "FOLLOWER"){
              test = true;
            }
          });
        }
        
        return test;
      },
      
      assignStatus: function(project, username){
        var status = "";
        
        dojo.forEach(project.assignments, function(assign){
          if (assign.username === username){
            status = assign.status;
          }
        });
        
        return status;
      },
      
      isInvitedProposed: function(project, username){
        //it's proposed if any of the assignments are PROPOSED and I'm the project responsible
        return this._isRespInvite(project, username, "PROPOSED");
      },
      
      isInvitedAgreed: function(project, username){
        //it's agreed if username has an assignment and its status is AGREED
        return this._isUserInvite(project, username, "AGREED");
      },
      
      isInvitedAmended: function(project, username){
        //it's amended if username has an assignment and its status is AMENDED
        return this._isUserInvite(project, username, "AMENDED");
      },
      
      isInvitedLeft: function(project, username){
        //it's left if i'm the project responsible and any of the assignments have the status LEFT
        return this._isRespInvite(project, username, "LEFT");
      },
      
      isDeferred: function(project){
        //return all projects that have a defer date that is after today
        var isDef = false,
            cal = project.calendar,
            diff = 0;
        
        if (!this.isActive(project, project.responsible)){
          return false;
        }
        
        if (cal && cal.start){
          diff = date.difference(new Date(), stamp.fromISOString(cal.start), "day");
          //console.debug("defer difference: ", diff);
          if (diff > 0){
            isDef = true;
          }
        }
        
        return isDef;
      },
      
      isActive: function(project, username){
        
        if (project === undefined || project.name === undefined){
          //console.debug("ERROR: project sent was undefined");
          return false;
        }
        
        //console.debug("project in isActive", project);
        //active project is not myPrivate
        //they are active when the status is ACTIVE and substatus is SENT or RESUMED
        var test = false;
        
        if (project.isMyPrivate || project.isMyDelegated){
          return false;
        }
        
        /*
        if (project.isMyDelegated && project.responsible === username){
          return false;
        }
        */
        
        test = (project.status === "ACTIVE" && (project.substatus === "SENT" || project.substatus === "RESUMED" || project.substatus === "OPPORTUNITY"));
        
        /*
        if (!test){
          console.debug(project.name + " is not active: ", " status=" + project.status," substatus=" + project.substatus );
        }
        */
        
        //console.log("testing isActive", project.status, project.substatus, test);
        
        return test;
      },
      
      isLatestOpportunity: function(project, username){
        //console.log("testing isLatestOpportunity", project, username);
        var isLatest = true;
        if (project.status === "ACTIVE" && project.substatus === "OPPORTUNITY"){
          //console.log("it's an opportunity");
          dojo.forEach(project.assignments, function(assign){
            if (username === assign.username){
              //console.log("username found", username, assign.username);
              isLatest = false;
            } 
          });
        }
        return isLatest;
      },
      
      isPending: function(project, username){
        //returns all projects to responsible that have been created but not sent by the responsible
        //if i'm responsible and its ACTIVE PENDING it's pending
        var test = false;
        if (username === project.responsible && project.status === "ACTIVE" && project.substatus==="PENDING"){
          test = true;
        }
        return test;
      },
      
      isPaused: function(project, username){
        //returns all projects that have been paused by the project responsible
        //if it's ACTIVE PAUSED and i have an assignment in the project, it's paused
        var isPaused = false;
        if (project.status === "ACTIVE" && project.substatus === "PAUSED"){
          isPaused = true;
          /*
          dojo.forEach(project.assignments, function(assign){
            if (username === assign.username){
              isPaused = true;
            }
          });
          */
        }
        return isPaused;
      },
      
      getDaysPassed: function(project, status){
        //TODO: need to test history for the latest CANCEL verb because each time someone
        //updates their status, the updated value will change.
      
        //use this function to see how many days have passed since the last project update 
        var updated = stamp.fromISOString(project.updated);
        
        var days = dojo.date.difference(updated, new Date(), "day");
        //console.debug("days in getDaysPassed", days);
        return days;
      },
      
      isCancelled: function(project, username){
        //returns all projects that have been cancelled by the project responsible
        //if it's ACTIVE CANCELLED and i have an assignment in the project, it's CANCELLED
        //cancelled shows for 14 days or until user clears
        //console.debug("cancelled projects requested");
        var isCancelled = false;
        if (project.status === "ACTIVE" && project.substatus === "CANCELLED"){
          isCancelled = true;
          var days = this.getDaysPassed(project, project.substatus);
          dojo.forEach(project.assignments, function(assign){
            if (username === assign.username && days < 14){
              //console.debug("isCancelled = true", username, days);
              if (assign.status === "LEFT-ACK" || assign.ack){
                //console.debug("assign.status was ACK", username, days);
                isCancelled = false;
              }
            } 
          });
        }
        return isCancelled;
      },
      
      isResponsible: function(project, username){
        //return all projects for which this username is responsible
        var test = false;
        
        //this isn't responsible if the username isn't the responsible
        if (project.responsible !== username){
          return false;
        }
        
        //isn't responsible if the project is deferred
        if (this.isDeferred(project)){
          return false;
        }
        
        //this function returns all projects for which the username is responsible
        //if this project isActive
        //and the role status is ACCEPTED and the username is the project responsible
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.username === username && assign.status === "ACCEPTED"){
              test = true;
            }
          });
        }
        return test;
      },
      
      isMyDelegated: function(project, username){
        
        if (project.isMyDelegated && project.responsible === username){
          return true;
        }
        
        return false;
        
      },
      
      isParticipating: function(project, username){
        var test = false;
        
        //this isn't participating if the username is the responsible
        if (project.responsible === username){
          return false;
        }
        
        //not participating if deferred
        if (this.isDeferred(project)){
          return false;
        }
      
        //this function returns all projects in which the logged on user is participating
        //if this project is ACTIVE SENT or RESUMED it's participating for each user assigned a role
        //an ACCEPTED role and the role isn't FOLLOWING
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.username === username && assign.status === "ACCEPTED" && assign.role !== "FOLLOWER"){
              test = true;
            }
          });
        }
        return test;
      },
      
      isFollowing: function(project, username){
        var test = false;
    
        //this function returns all projects for which the username is following
        //if this project isActive it's isFollowing for each user assigned a role that is ACCEPTED
        //and the role status is FOLLOWING
        if (this.isActive(project, username)){
          dojo.forEach(project.assignments, function(assign){
            if (assign.username === username && assign.status === "ACCEPTED" && assign.role === "FOLLOWER"){
              test = true;
            }
          });
        }
        return test;
      },
      
      isDone: function(project, username){
        //returns all projects that have been marked done by the project responsible
        //if it's DONE FINISHED and i have an assignment in the project, it's done
        //done shows up for 14 days by default or the user can ack and clear it.
        //console.debug("done projects requested");
        var isDone = false;
        
        if (project.status === "ARCHIVE" && project.substatus === "DONE"){
          var days = this.getDaysPassed(project);
          isDone = true;
          dojo.forEach(project.assignments, function(assign){
            if (username === assign.username && days < 14){
              if (assign.ack){
                isDone = false;
              }
            }
          });
        }
        return isDone;
      }
      
  };
});

