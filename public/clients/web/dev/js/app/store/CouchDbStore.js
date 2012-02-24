define(["dojo", "dojo/store/JsonRest", "dojo/date/stamp"],
function(dojo, JsonRest, stamp) {
    dojo.declare("app.store.CouchDbStore",
    JsonRest,
    {
        idProperty: "_id",
        add: function(object, options){
          //console.debug("add override", object.username);
          //console.debug("add override called", object, options);
          //username and _id must be provided or this is an error
          var t = stamp.toISOString(new Date(),{milliseconds:true});
      		object.created = t;
      		object.updated = t;
      		object.creator = options.username;
      		object.updater = options.username;
      		object.isNew = true;
          return dojo.store.JsonRest.prototype.add.call(this, object, options);
        },
        put: function(object, options){
      		// summary:
      		//		Stores an object. This will trigger a PUT request to the server
      		//		if the object has an id, otherwise it will trigger a POST request.
      		// object: Object
      		//		The object to store.
      		// options: dojo.store.api.Store.PutDirectives?
      		//		Additional metadata for storing the data.  Includes an "id"
      		//		property if a specific id is to be used.

      		options = options || {};
      		
      		//stamp object with time and username
      		var t = stamp.toISOString(new Date(),{milliseconds:true});
      		object.updater = options.username;
      		object.updated = t;

      		
      		var id = ("id" in options) ? options.id : this.getIdentity(object);
      		var hasId = typeof id != "undefined";
      		
      	  //console.debug("CouchDbStore put called object, options, id, hasId", object, options, id, hasId);
      		
      		dojo.when(dojo.xhr(hasId && !options.incremental ? "PUT" : "POST", {
     				url: hasId ? this.target + id : this.target,
    				putData: dojo.toJson(object),
    				handleAs: "json",
    				headers:{
    					"Content-Type": "application/json; charset=UTF-8",
    					"Accept": "application/json"
    				}
    			}), function(res){
    			  //console.debug("response received in CouchDBStore put", res);
  				  if (object._id === res.id){
  				    object._rev = res.rev;
  				  }
    			  //return object;
    			  return object;
    			});
    			
      	},
        query: function(query, options) {
            // summary:
            //		Queries the store for objects. This will trigger a GET request to the server, except
            //		in the case of _all_docs, which will do a POST
            //		GET /db/_design/app/_view/view_name + QUERY OPTIONS -- gets a view
            //		POST db/_all_docs + [KEYS]--  selects docs in collection
            // query: Object
            //		The view to use for retrieving objects from the store. set view=_all_docs for all
            //		the query will come in the format app/view
            // options:
            //		The optional arguments to append to the view query string
            //	returns: dojo.store.api.Store.QueryResults
            //		The results of the query, extended with iterative methods.
            //need to see if any of the options are key, startkey or endkey because
            //those need to be json encoded
            var headers = {
              Accept: "application/javascript, application/json"};
            options = options || {};
            
            if(options.start >= 0 || options.count >= 0){
        			headers.Range = "items=" + (options.start || '0') + '-' +
        				(("count" in options && options.count != Infinity) ?
        					(options.count + (options.start || 0) - 1) : '');
        		}
        		if(dojo.isObject(query)){
        		  //console.debug("isObject(query)");
        		  var view, 
        		      pre = "";
        	
        		  if (query.view){
        		    //console.debug("query.view", query.view);
        		    //the query is an object that looks like
          		  /*
          		  {
          		    view: "coordel/viewName",
          		    include_docs: true,       optional
          		    key: [key],      optional but it,startkey,endkey need to be converted to json before querified
          		    startkey: [key],       optional
          		    endkey: [key],      optional
          		    descending: true,     optional
          		    limit: 25    optional
          		  }
          		  */
        		    view = query.view.split("/");
        		    delete query.view; //going to handle building prefix so get rid of it
        		    //pre = "_design/" + view[0] + "/_view/" + view[1];
        		    pre = 'view/' + view[1];
        		    
        		    //console.debug("pre", pre);
        		    
        		    if (query.key){
        		      query.key = dojo.toJson(query.key);
        		    }
        		    if (query.startkey){
        		      query.startkey = dojo.toJson(query.startkey);
        		    }
        		    if (query.endkey){
        		      query.endkey = dojo.toJson(query.endkey);
        		    }
        		  }
        		  //console.debug("before querification", query);
        			query = dojo.objectToQuery(query);
        			//console.debug("after querification", query);
        			query = query ? pre + "?" + query : "";
        			//console.debug("after conditional", query);
        		}
        		if(options && options.sort){
        			query += (query ? "&" : "?") + "sort(";
        			for(var i = 0; i<options.sort.length; i++){
        				var sort = options.sort[i];
        				query += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute);
        			}
        			query += ")";
        		}
        		
        		//console.debug("target, query", this.target, query);
            
            //console.log("target", this.target + query);
            var results = dojo.xhrGet({
                url: this.target + query,
                handleAs: "json",
                headers: headers,
                
                load: function(res){
                  //the couchdb views can return rows of doc or rows containing values
                  //depending on whether or not include_docs parameter is provided
                  
                  //console.log("QUERY RESULT: ", res, query);
                  var map = dojo.map(res.rows, function(r){
                    return r;
                  });
                  return map;
                }
                
            });
            
            /*
            results.total = results.then(function(){
        			var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
        			return range && (range=range.match(/\/(.*)/)) && +range[1];
        		});
            */
            
            return dojo.store.util.QueryResults(results);
        },
        remove: function(id){
      		// summary:
      		//		The Dojo Store api takes the id to remove an object, so need to get the doc
      		//    from it to get the _rev and then send a delete
      		// id: couchdb _id,
      		//		The identity to use to delete the object
      	  var self = this;
      	  
      	  var def = new dojo.Deferred();
      		
      		var doc = dojo.xhrGet({
      		  url: this.target + id,
      		  handleAs: "json",
      		  headers: {
      		    "Content-Type": "application/json"
      		  },
      		  load: function(doc){
      		    var del = dojo.xhrDelete({
          				url: self.target + doc._id + "?rev=" + doc._rev,
          				handleAs: "json",
          				headers:{
          					"Content-Type": "application/json"
          				}
          		});
          		del.then(function(){
          		  def.callback();
          		});
      		  }
      		});
      		
      		return def;
      	}

    });
    return app.store.CouchDbStore;
});

