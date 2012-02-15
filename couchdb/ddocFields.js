module.exports = {
  version: "0.1.2",
  language: 'javascript',
  views: {
    /******************************* CONTACTS *****************************************************/
    
    contactStream: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType === "project"){

      		doc.history.forEach(function(item){
      			emit(
      				[item.actor.id, toDateArray(new Date(item.time))],
      				item
      			);	
      		});	

      	}

      	if (doc.docType === "role"){

      		doc.history.forEach(function(item){
      			emit(
      				[item.actor.id, toDateArray(new Date(item.time))],
      				item
      			);
      		});
      	}


      	if (doc.docType === "activity"){	
      		emit(
      			[doc.actor.id, toDateArray(new Date(doc.created))],
      			doc
      		);	
      	}

      	if (doc.docType === "task"){
      		doc.history.forEach(function(item){

      			emit(
      				[item.actor.id, toDateArray(new Date(item.time))],
      				item
      			);

      		});
      	}
      }
    },
    
    contactTasks: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "task" 
      			&& doc.status !== "IN-ITEM"
      			&& doc.status !== "TRASH"
      			&& doc.status !== "ARCHIVE"
      			&& doc.status !== "SOMEDAY"
      			&& doc.substatus !== "TRASH"
      			&& doc.substatus !== "ARCHIVE"
      			&& doc.substatus !== "APPROVED"
      			&& doc.substatus !== "CANCELLED"){
      		var user = doc.username;
      		if (doc.status == "CURRENT" && (doc.substatus == "DONE" || doc.substatus == "ISSUE" || doc.substatus == "DECLINED")){
      			//the user has indicated they are done with the task, have flagged an issue, or declined a task
      			//so if there is a delegator they get it back otherwise, the responsible now needs to take action
      			user = doc.responsible;
      			if (doc.delegator && doc.delegator !== ""){
      			  user = doc.delegator;
      			}

      		}

      		if (doc.status === "DELEGATED" && doc.substatus === "PROPOSED" || doc.substatus === "DECLINED"){
      		  //before a user accepts a task, they can propose what they think they should do by creating
      		  //deliverables, setting the defer date, refining the purpose, setting blockers etc
      		  //it then goes back to the invited of the responsible or delegator to agree 
      		  //or further refine and send back.

      		  //a user can always decline to accept a task. if they do, it goes back to the responsible or delegator

      		  //A user can't delegate the task to someone else until they have accepted
      		  user = doc.responsible;
      		  if (doc.delegator && doc.delegator !==""){
      		    user = doc.delegator;
      		  }
      		}

      		if (doc.status === "PENDING"){
      		  //when a responsible creates a task as part of a project, it gets the pending status 
      		  //when the user sends the project, then the task status is updated to CURRENT
      		  user = doc.responsible;
      		  if (doc.delegator && doc.delegator !==""){
      		    user = doc.delegator;
      		  }
      		}

      		//emit the task
      		emit(
      			[user, doc.status, doc._id, 0, toDateArray(new Date(doc.updated))],
      			{"_id": doc._id}
      		);


      	}
      }
    },
    
    /******************************* TEMPLATES ****************************************************/
    
    userTemplates:{
      map: function (doc){
      	if (doc.docType === 'template' && doc.isUserTemplate && doc.isActive){
      		emit(
      			[doc.username, doc.name], doc
      		);	
      	}
      } 
    },
    
    defaultTemplates: {
      map: function(doc){
        if (doc.docType === 'template' && doc.isDefault){
          emit(
            [doc.name], doc
          );
        }
      } 
    },
    
    publicTemplates: {
      map: function(doc){
        if (doc.docType === 'template' && doc.isPublic){
          emit(
            [doc.name], doc
          );
        }
      }
    },
    
    /******************************* PROJECTS *****************************************************/
    projectAssignments: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "project"){
      		doc.assignments.forEach(function(assign){
      		  if (assign.role !== "RESPONSIBLE" && assign.role !== "FOLLOWER"){
      			  emit([doc._id, assign.username], {"_id": assign.role});
      			}	
      		});
      	}
      }
    },
    
    projectBlockers: {
      map:function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "task" 
      			&& doc.status !== "IN-ITEM"
      			&& doc.status !== "TRASH"
      			&& doc.status !== "ARCHIVE"
      			&& doc.status !== "SOMEDAY"
      			&& doc.substatus !== "TRASH"
      			&& doc.substatus !== "ARCHIVE"){

      		//emit all blockers for this task
      		if (doc.coordinates){
      		  doc.coordinates.forEach(function(coord){
        			emit(
        				[doc.project, toDateArray(new Date(doc.updated))], 
        				{"_id": coord}
        			);
        		});
      		}

      	}
      }
    },
    
    projectMessages: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}


      	if (doc.docType === "activity"){
      		emit(
      			[doc.project, toDateArray(new Date(doc.created)), "message"],
      			doc
      		);
      	}

      	/* keep in case need to emit task messages for issue, return, approve */
      	/*
      	if (doc.docType === "task" && doc.status != "IN-ITEM" && doc.status !== "SOMEDAY"){
      		doc.history.forEach(function(item){
      			emit(
      				[doc.project, toDateArray(new Date(item.time)), "task"],
      				item
      			);	
      		});
      	}
      	*/
      }
    },
    
    projectRoles: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "role"){
      		//emit the role
      		emit(
      			[doc.project, toDateArray(new Date(doc.updated))],
      			doc
      		);
      	}
      }
    },
    
    projectStream: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	function toISODateArray (date){
      	  var dtString = date.split("T")[0];
      	  dtString = dtString.split("-");
      	  var tmString = date.split("T")[1];
      	  tmString = tmString.split(".");
      	  tmString = tmString[0].split(":");
      	  return [
      	    parseInt(dtString[0],10), 
      	    parseInt(dtString[1],10), 
      	    parseInt(dtString[2],10), 
      	    parseInt(tmString[0],10), 
      	    parseInt(tmString[1],10), 
      	    parseInt(tmString[2],10)];
      	}

      	if (doc.docType === "project"){
      		doc.history.forEach(function(item){
      			emit(
      				[doc._id, toDateArray(new Date(item.time)), "project"],
      				item
      			);	
      		});
      	}

      	if (doc.docType === "role"){
      		doc.history.forEach(function(item){
      			emit(
      				[doc.project, toDateArray(new Date(item.time)), "role"],
      				item
      			);
      		});
      	}


      	if (doc.docType === "message"){
      		emit(
      			[doc.project, toISODateArray(doc.created), "message"],
      			doc
      		);
      	}

      	if (doc.docType === "task" && doc.status != "IN-ITEM" && doc.status !== "SOMEDAY"){
      		doc.history.forEach(function(item){
      			emit(
      				[doc.project, toDateArray(new Date(item.time)), "task"],
      				item
      			);	
      		});
      	}
      }
    },
    
    projectTasks: {
      map: function (doc){


      	if (doc.docType == "task"){
      		//emit the task
      		emit(
      			[doc.project],
      			{"_id": doc._id}
      		);
      	}
      }
    },
    
    /******************************* FIELDS *****************************************************/
    
    fieldFiles: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "file"){
      		emit([doc.field, toDateArray(new Date(doc.updated))],null);	
      	}
      }
    },
    
    /******************************* USERS ********************************************************/
    
    userBlockers: {
      map: function (doc){

      	if (doc.docType == "task"){

      	  if (doc.coordinates){
      	    doc.coordinates.forEach(function(coord){
        			emit(
        				[doc.username],
        				{
        				  "_id": coord,
        				  task: doc._id,
        				  docType: "prequisite",
        				  username: doc.username
        				}
        			);
        		});
      	  }
      	}
      }
    },
    
    userContacts: {
      map: function(doc){
        //this emits all the contacts in a users app. contacts are added to the app as people are added to
        //projects in which the user participates. This allows the contact list to grow as the user 
        //works on more and more projects
        if (doc.docType === "user"){
          doc.contacts.forEach(function(contact){
            emit([doc.username],{"_id": contact});
          });	
        }
      }
    },
    
    userMessages: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}


      	if (doc.docType === "message"){
      		if (doc.users && doc.users.length > 0){
      			doc.users.forEach(function(user){
      				emit(
      					[user, toDateArray(new Date(doc.created))],
      					doc
      				);	
      			});	
      		}	
      	}

      	/* keep because it might be necessary to show messages from issues, returns, approvals*/
      	/*
      	if (doc.docType === "task"){
      		doc.history.forEach(function(item){
      			if (item.users && item.users.length > 0){
      				item.users.forEach(function(user){
      					emit(
      						[user, doc.status, toDateArray(new Date(item.time))],
      						item
      					);	
      				});	
      			} else {
      				emit(
      					[doc.username, doc.status, toDateArray(new Date(item.time))],
      					item
      				);
      			}	
      		});
      	}
      	*/	
      }
    },
  
    userProjects: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	//taken from Paul Sowden http://delete.me.uk/2005/03/iso8601.html
      	//Date.prototype.setISO8601 = function (string) {
      	function getISOArray (string){
            var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
                "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
            var d = string.match(new RegExp(regexp));
            return d;
        };

      	if (doc.docType === "project"){	

      	  //only allows projects through where users have accepted the project

      	  //current
      	  if (doc.status === "ACTIVE" && (doc.substatus === "SENT" || doc.substatus === "RESUMED" || doc.substatus === "PAUSED")){
      	    //returns current project for all users with an assignment in the project
            //if this project ACTIVE SENT, RESUMED, PAUSED and I have a role with status ACCEPTED it's current

      	    doc.assignments.forEach(function(assign){

      	      if (assign.status === "ACCEPTED" || assign.status === "INVITE" || assign.status === "AGREED" || assign.status === "AMENDED"){
      	        emit([assign.username, doc.status, doc.priority, toDateArray(new Date(doc.updated)), doc._id ], {"_id": doc._id, "name": doc.name});
      	      }

      	    });
      	  } 

      	  //pending
      	  if (doc.status === "ACTIVE" && doc.substatus === "PENDING"){
      	    //only show the project to the responsible
      	    //returns all projects to responsible that have been created but not sent
            //if i'm responsible and project is ACTIVE PENDING it's pending
      	    emit([doc.responsible, doc.status, doc.priority, toDateArray(new Date(doc.updated)), doc._id ], {"_id": doc._id, "name": doc.name});
      	  }

          //done/cancelled only show up for two weeks after the date finished or cancelled, 
          //or until the user has acked done or cancelled
          if ((doc.status === "ACTIVE" && doc.substatus === "CANCELLED") || (doc.status === "ARCHIVE" && doc.substatus === "DONE")){
            var one_day = 1000*60*60*24;
            var cancelled = new Date();
            var today = new Date();
            var days_passed = 0;

            var iso = getISOArray(doc.updated);

            var test = new Date(iso[1], iso[3], iso[5]);

            days_passed = Math.ceil((today.getTime() - test.getTime())/one_day);

            doc.assignments.forEach(function(assign){
              var show = false;
      	      if (days_passed < 14){
      	        show = true;
      	        if (assign.status === "ACK"){
      	          show = false;
      	        }
      	        if (show){
      	          emit([assign.username, doc.status, doc.priority, toDateArray(new Date(doc.updated)), doc._id ], {"_id": doc._id, "name": doc.name});
      	        }
      	      }
      	    });
          }
      	}
      }
    },
  
    userRoles: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "role"){
      		//emit the role
      		emit(
      			[doc.username, doc.name, toDateArray(new Date(doc.updated))],
      			doc
      		);
      	}
      }
    },
    
    userStream: {
      map: function (doc){
      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	function toISODateArray (date){
      	  var dtString = date.split("T")[0];
      	  dtString = dtString.split("-");
      	  var tmString = date.split("T")[1];
      	  tmString = tmString.split(".");
      	  tmString = tmString[0].split(":");
      	  return [
      	    parseInt(dtString[0],10), 
      	    parseInt(dtString[1],10), 
      	    parseInt(dtString[2],10), 
      	    parseInt(tmString[0],10), 
      	    parseInt(tmString[1],10), 
      	    parseInt(tmString[2],10)];
      	}

      	if (doc.docType === "project"){
      		doc.users.forEach(function(user){
      			doc.history.forEach(function(item){
      				emit(
      					[user, toDateArray(new Date(item.time))],
      					item
      				);	
      			});	
      		});
      	}

      	if (doc.docType === "role"){

      		doc.history.forEach(function(item){
      			emit(
      				[doc.username, toDateArray(new Date(item.time))],
      				item
      			);
      		});
      	}


      	if (doc.docType === "message"){
      		if (doc.users && doc.users.length > 0){
      			doc.users.forEach(function(user){
      				emit(
      					[user, toISODateArray(doc.created)],
      					doc
      				);	
      			});	
      		}	
      	}

      	if (doc.docType === "task"){
      		doc.history.forEach(function(item){
      			if (item.users && item.users.length > 0){
      				item.users.forEach(function(user){
      					emit(
      						[user, toDateArray(new Date(item.time))],
      						item
      					);	
      				});	
      			} else {
      				emit(
      					[doc.username, toDateArray(new Date(item.time))],
      					item
      				);
      			}	
      		});
      	}
      }
    },
    
    userTasks: {
      map: function (doc){

      	function toDateArray (date){

      		var dtArray = [
      			date.getFullYear(),
      			date.getMonth(), 
      			date.getDate(), 
      			date.getHours(), 
      			date.getMinutes(), 
      			date.getSeconds()
      		];

      		return dtArray;
      	}

      	if (doc.docType == "task" 
      			&& doc.status !== "IN-ITEM"
      			&& doc.status !== "TRASH"
      			&& doc.status !== "ARCHIVE"
      			&& doc.status !== "SOMEDAY"
      			&& doc.substatus !== "TRASH"
      			&& doc.substatus !== "ARCHIVE"
      			&& doc.substatus !== "APPROVED"
      			&& doc.substatus !== "CANCELLED"){
      		var user = doc.username;
      		if (doc.status == "CURRENT" && (doc.substatus == "DONE" || doc.substatus == "ISSUE" || doc.substatus == "DECLINED")){
      			//the user has indicated they are done with the task, have flagged an issue, or declined a task
      			//so if there is a delegator they get it back otherwise, the responsible now needs to take action
      			user = doc.responsible;
      			if (doc.delegator && doc.delegator !== ""){
      			  user = doc.delegator;
      			}

      		}

      		if (doc.status === "DELEGATED" && doc.substatus === "PROPOSED" || doc.substatus === "DECLINED"){
      		  //before a user accepts a task, they can propose what they think they should do by creating
      		  //deliverables, setting the defer date, refining the purpose, setting blockers etc
      		  //it then goes back to the invited of the responsible or delegator to agree 
      		  //or further refine and send back.

      		  //a user can always decline to accept a task. if they do, it goes back to the responsible or delegator

      		  //A user can't delegate the task to someone else until they have accepted
      		  user = doc.responsible;
      		  if (doc.delegator && doc.delegator !==""){
      		    user = doc.delegator;
      		  }
      		}

      		if (doc.status === "PENDING"){
      		  //when a responsible creates a task as part of a project, it gets the pending status 
      		  //when the user sends the project, then the task status is updated to CURRENT
      		  user = doc.responsible;
      		  if (doc.delegator && doc.delegator !==""){
      		    user = doc.delegator;
      		  }
      		}

      		//emit the task
      		emit(
      			[user, doc.status, doc._id, 0, toDateArray(new Date(doc.updated))],
      			{"_id": doc._id}
      		);

      		//if there's a delegator, they need to see the task as well because they are responsible
      		//and need to be able to do the task if they don't have other current tasks

      		if (doc.delegator){
      		  emit(
        			[doc.delegator, doc.status, doc._id, 0, toDateArray(new Date(doc.updated))],
        			{"_id": doc._id}
        		);
      		}
      	}
      }
    },
    
    /******************************* ADMIN ********************************************************/
    
    allProjectFiles: {
      map: function (doc){
        //this view gets all the files related to a single project. it isn't used by the application
        //but can be used to clean up

        if (doc.project){
          emit([doc.project], {_id:doc._id, docType:doc.docType});
        }

        if (doc.docType === "project"){
          emit([doc._id], {_id:doc._id, docType:doc.docType});
        }
      }
    },
    
    allProjects: {
      map: function (doc){
        if (doc.docType === "project"){
          emit(["1"], doc);
        }
      }
    },
    
    allRoles: {
      map: function (doc){
        if (doc.docType === "role"){
          emit(["1"], doc);
        }
      }
    },
    
    allTasks: {
      map: function (doc){
        if (doc.docType === "task"){
          emit(["1"], doc);
        }
      }
    },
    
    allTestData: {
      map:function (doc){
        //this function gets all documents that were added as test data

        if (doc.isTest){
          emit(null, doc);
        }

      }
    }
  }
};