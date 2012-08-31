define(["dojo",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "app/store/ObservableCache",
        "dojo/store/Observable",
        "app/store/util/TaskQueryEngine"], function(dojo, couch, mem, cache, obsCache, obs, tqe){
        //return an object to define the "./newmodule" module.
        var taskStore = {
            db: "/" + djConfig.couchdb + "/",
            username: null,
            appData: null,
            memory: null,
            blockMemory: null,
            //observable: null,
            obsBlock: null,
            remote: null,
            blockRemote: null,
            store: null,
            blockStore: null,
            isLoaded: false,
            
            init: function(username){
              var self = this;
              //console.debug("initializing taskStore", username);
              this.username = username;
              var def = new dojo.Deferred();

              var loadDef = new dojo.DeferredList([
                this._loadTasks(username),
                this._loadBlockers(username),
                this._loadBlocking(username)
              ]);
              
              loadDef.then(function(resp){
                //console.debug("tasks and blockers loaded");
                self.isLoaded = true;
                def.callback(self);
              });
            	return def;
            },
            _loadTasks: function(username){
              //console.debug("loading tasks");
              this.memory = new mem({
                idProperty: "_id",
                queryEngine: tqe});
              this.remote = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              //this.remote = new obs(this.remote);
              this.memory = new obs(this.memory);
              this.store = new obsCache(this.remote, this.memory);
              //this.store = new obs(this.store);
              var queryArgs = {
                view: "coordel/userTasks",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	//this.observable = this.store.query(queryArgs);
              return this.store.query(queryArgs);
            },
            _loadBlockers: function(username){
              //console.debug("loading blockers");
              this.blockMemory = new mem({idProperty: "_id"});
              this.blockRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.blockMemory = new obs(this.blockMemory);
              this.blockStore = new obsCache(this.blockRemote, this.blockMemory);
              
              var queryArgs = {
                view: "coordel/userBlockers",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	//this.obsBlock = this.blockStore.query(queryArgs);
            	return this.blockStore.query(queryArgs);
            },
            _loadBlocking: function(username){
     
              this.blockingMemory = new mem({idProperty: "_id"});
              this.blockingRemote = new couch({target: this.db, idProperty: "_id", queryEngine: tqe});
              this.blockingMemory = new obs(this.blockingMemory);
              this.blockingStore = new obsCache(this.blockingRemote, this.blockingMemory);
              
              var queryArgs = {
                view: "coordel/userBlocking",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	//this.obsBlock = this.blockStore.query(queryArgs);
            	return this.blockingStore.query(queryArgs);
            },
            getBlockers: function(task){
              //this function gets the blockers from the dbase to make sure they are completely up to date
              var def = new dojo.Deferred(),
                  blocking = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              
              var queryArgs = {
                view: "coordel/taskBlockers",
            		startkey: [task],
            		endkey: [task,{}],
            		include_docs: true
            	};
            	
            	var query = blocking.query(queryArgs);
            	
            	dojo.when(query, function(res){
            	  var map = {};
            	  var toReturn = [];
            	  dojo.forEach(res, function(b){
            	    if (!map[b._id]){
            	      map[b._id] = true;
            	      toReturn.push(b);
            	    }
            	  });
            	  //console.log("blocking", res);
            	  def.callback(toReturn);
            	});
            	
            	//console.debug("returning getBlocking");
            	return def;
            },
            getBlocking: function(task){
              //this function gets the blockers from the dbase to make sure they are completely up to date
              var def = new dojo.Deferred(),
                  blocking = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              
              var queryArgs = {
                view: "coordel/taskBlocking",
            		startkey: [task],
            		endkey: [task,{}],
            		include_docs: true
            	};
            	
            	var query = blocking.query(queryArgs);
            	
            	dojo.when(query, function(res){
            	  //console.log("blocking", res);
            	  def.callback(res);
            	});
            	
            	//console.debug("returning getBlocking");
            	return def;
            
            },
            search: function(query){
              
              
              
              var post = dojo.xhrPost({
                url: "/search",
                handleAs: "json",
                postData: "username="+this.username + "&search=" + query
              });
              
              var def = new dojo.Deferred();
              
              if(!query.trim().length){
                def.callback([]);
              } else {
                post.then(function(res){
                  def.callback(res.results);
                });
              }
              
              
              return def;
            }

        };
        
        return taskStore;
    }
);