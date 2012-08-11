define(["dojo"], function(dojo) {
	return {
	  
  	sort: function(results, options){
  	  console.log("results incoming", results);
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
			console.log("sort results");
			return results;
  	},
  	
  	//this function sorts by execution order
    byBlocking: function(list, args){

      var resList = [],
    		noBlocker = [],
    		visitMap = {};

    	//options default to task configuration
    	var options = {
    	  id: "_id",
    	  attribute: "coordinates"
    	};

    	options = dojo.mixin(options, args);

    	//get the tasks that don't have coordinates
    	list.forEach(function(item) {
    		if (!item[options.attribute] || item[options.attribute].length === 0){
    			noBlocker.push(item);
    		}
    	});

    	//now compute the dependencies
    	noBlocker.forEach(function(item) {
    	  //console.log("no blocker", item.name);
    		visit (item);
    	});

    	function visit(item){
    	  console.log("visit", item.name);
    		if (!visitMap[item[options.id]]){
    			visitMap[item[options.id]] = true;

    			list.forEach(function(l) {

    				if (l[options.attribute] && l[options.attribute].length > 0 && dojo.indexOf(l[options.attribute], item.id) > -1 ){
    				  //console.log("item.id = l.blocker", _.indexOf(l[options.attribute], item.id));
    				  //console.log("blocker",l.name,l.id, l[options.attribute], l[options.attribute].length);
    				 	visit(l);	
    				}
    			});	
    			console.log("adding " + item.name + " to resList");
    			resList.unshift(item);
    		}
    	}
    	console.log("res list", resList);
    	return resList;
    }
	};
});