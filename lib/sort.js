var _ = require('underscore');

//this function sorts by execution order
exports.byBlocking = function(list, args){
  
  var resList = [],
		noBlocker = [],
		visitMap = {};
	
	//options default to task configuration
	var options = {
	  id: "_id",
	  field: "coordinates"
	};
	
	options = _.extend(options,args);

	//get the tasks that don't have coordinates
	list.forEach(function(item) {
		if (!item[options.field] || item[options.field].length === 0){
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
			  
				if (l[options.field] && l[options.field].length > 0 && _.indexOf(l[options.field], item.id) > -1 ){
				  //console.log("item.id = l.blocker", _.indexOf(l[options.field], item.id));
				  //console.log("blocker",l.name,l.id, l[options.field], l[options.field].length);
				 	visit(l);	
				}
			});	
			console.log("adding " + item.name + " to resList");
			resList.unshift(item);
		}
	}
	console.log("res list", resList);
	return resList;
};
