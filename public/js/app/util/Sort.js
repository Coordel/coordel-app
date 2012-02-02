define(["dojo"], function(dojo) {
	return {
	  
  	sort: function(results, options){
  	  results.sort(function(a, b){
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
			return results;
  	},
  	
  	//this function sorts by execution order
  	sortByBlocked: function(taskList){
  		var resList = [],
  			noBlocker = [],
  			visitMap = {};

  		//get the actions that don't have prereqs
  		dojo.forEach(taskList, function(key, task) {
  			if (task.coordinates.length === 0){
  				noBlocker.push(task);
  			}
  		});

  		//now compute the dependencies
  		dojo.forEach(noBlocker, function(key, task) {
  			visit (task);
  		});

  		function visit(task){
  			if (!visitMap[task._id]){
  				visitMap[task._id] = true;

  				dojo.forEach(taskList, function(key, t) {
  					if (t.coordinates.length > 0){
  					 	visit(t);	
  					}
  				});	
  				resList.unshift(task);
  			}
  		}
  		return resList;
  	}
	};
});