define("app/store/util/TaskQueryEngine", 
  ["dojo", 
  "app/models/ProjectStatus"], function(dojo, pStatus) {

dojo.getObject("app.store.util", true);
app.store.util.TaskQueryEngine = function(query, options){

	// summary:
	//		Engine to query the current tasks in memory according to incoming focus
	//
	// description:
	//		The coordel store has of a user's task in memory. use this engine to filter according to focus
	//    (i.e. current, blocked, deferred, delegated, private). Since the memory store is observable
	//    then the resulting query can be observed from the calling controller.
	//
	// query: Object
	//		The query that comes in will must have an instance of the CoordelStore and a focus
	//    {db: CoordelStoreInstance, focus: "current"}
	//
	// options: dojo.store.util.SimpleQueryEngine.__queryOptions?
	//		An object that contains optional information such as sort, start, and count.
	//
	// returns: Function
	//		A function that caches the passed query under the field "matches".  See any
	//		of the "query" methods on dojo.stores.
	//
	var db;
	if (query.db){
	  db = query.db;
	}
	if (query.focus){
	  //if a query is provided, it will be for one of the main task focus groups
	  var queryObject = query;

  	//if there are additional attributes to deal with in the query, they will be here
  	//examples include, get current tasks for a particular project, an attribute 
  	//would be project: id (the project identifier)
  	var filters = queryObject.filters;
  	
  	// create our matching query function based on the incoming focus
  	switch(queryObject.focus){
  	  case "calendar":
  	  query = function(task){
  	    var t = db.getTaskModel(task, true);
  	    return t.isActive() && t.getDeadline() !== "" && applyFilter(task);
  	  };
  	  break;
  	  case "task-invited":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isTaskInvite() && applyFilter(task);
  		};
  		break;
  		case "projectTaskInvited":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isInvite() && applyFilter(task);
  		};
  		break;
  		case "projectNew":
  		query = function(task){
  		 var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is INVITE
  			return (pStatus.assignStatus(t.p.project, t.username) === "INVITE" && applyFilter(task));
  		};
  		break;
  		case "projectDeclined":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is DECLINED
  			return (pStatus.assignStatus(t.p.project, t.username) === "DECLINED" && applyFilter(task));
  		};
  		break;
  		
  		case "projectProposed":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is PROPOSED
  			return (pStatus.assignStatus(t.p.project, t.username) === "PROPOSED" && applyFilter(task));
  		};
  		break;
  		
  		case "projectAmended":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is AMENDED
  			return (pStatus.assignStatus(t.p.project, t.username) === "AMENDED" && applyFilter(task));
  		};
  		break;
  		case "projectAgreed":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is AGREED
  			return (pStatus.assignStatus(t.p.project, t.username) === "AGREED" && applyFilter(task));
  		};
  		break;
  		
  		case "projectLeft":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			//if the assignment status for the task username is LEFT
  			return (pStatus.assignStatus(t.p.project, t.username) === "LEFT" && applyFilter(task));
  		};
  		break;
  		
  		//this gets the current list for a user
  	  case "current":
  		query = function(task){
  		  var t = db.getTaskModel(task, true);
  			return t.isCurrent() && !pStatus.isDeferred(t.p.project) && !pStatus.isPending(t.p.project, t.username) && applyFilter(task);
  		};
  		break;
  		//this gets all the current tasks across the project
  		//cleared tasks won't be current for the responsible, issues wouldn't be cleared for the user, etc
  		case "projectCurrent":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isCurrent() || t.isCleared() || t.isIssue() || t.isSubmitted() || t.isReturned() && applyFilter(task);
  		};
  		break;
  		case "blocked":
      query = function(task){
        var t = db.getTaskModel(task, true);
  			return t.isBlocked() && applyFilter(task);
  		};
  		break;
  		case "deferred": 
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			task.contextStarts = t.getStarts();
  			return t.isDeferred() && applyFilter(task);
  		};
  		break;
  		case "delegated":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isDelegated() && applyFilter(task);
  		};
  		break;
  		case "private":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return (t.isPrivate() && !t.isBlocked() && !t.isDeferred() && applyFilter(task));
  		};
  		break;
  		case "submitted":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isSubmitted() && applyFilter(task);
  		};
  		break;
  	  case "done":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isDone() && applyFilter(task);
  		};
  		break;
  		case "cancelled":
  		query = function(task){
  			var t = db.getTaskModel(task, true);
  			return t.isCancelled() && applyFilter(task);
  		};
  		break;
  	}
	} else {
	  
	  //console.debug("no focus in tqe");
	  
	  //just return everything, or apply filters to everything if no focus
		query = function(task){
	    if (filters){
	      return applyFilters(task);
	    }
		  return true;
		};
		
		//sorted alphabetically if no sort options
		if (!options){
		  options = {};
		  if (!options.sort){
		    options.sort = [];
		  }
		  options.sort.push({attribute: "name", descending: false});
		} 
	}
	
	function applyFilter(task){
	  //console.debug("applyFilters in TQE", filters, task);
	  if (filters){
	    
  	  for(var key in filters){
  			var required = filters[key];
  			//console.debug("required", required, required.test);
  			if(required && required.test){
  				if(!required.test(task[key])){
  					return false;
  				}
  			}else if(required != task[key]){
  				return false;
  			}
  		}
	  }
	  
		return true;
	}

	function execute(array){
    //console.debug("here is the query in the TaskQueryEngine", query);
		// execute the whole query, first we filter
		//console.debug("executing query in TQE");
		var results = dojo.filter(array, query);

		// next we sort
		if(options && options.sort){
		  
		  //console.debug("sorting", options.sort);
		  
		  if (results){
		    dojo.forEach(results, function(task){
		      //console.debug("in execute TQE", db, task);
    		  var t = db.getTaskModel(task, true);
    		  
    		  
    		  //not every task has a deadline, but we show a deadline anyway
    		  //this allows setting project deadlines to keep people informed when
    		  //tasks are due when there isn't a specific deadline set for the task
    		  //this makes sure that that deadline can move with the project
    		  var dead = t.getDeadline();
    		  if (dead === ""){
    		    //the only tasks that don't have deadlines are those that are in the private project or
    		    //in the delegated project and get deadline returns "" for them. set it to 100 years in 
    		    //the future so it comes last in any sorted list
    		    dead = "2100-01-01";
    		  }
    		  task.contextDeadline = dead;
    		  //console.debug("contextDeadline", dead, task.deadline, task.name, task._id);
    		});
    		
		  }
 

		  //console.debug("executing the query, options.sort ", options.sort);
			results.sort(function(a, b){
			  
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					//console.debug("comparing a and b", aValue, bValue);
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
		}
		// now we paginate
		if(options && (options.start || options.count)){
			var total = results.length;
			results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			results.total = total;
		}
		return results;
	}
	execute.matches = query;
	return execute;
};

return app.store.util.TaskQueryEngine;
});
