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
                this._loadBlockers(username)
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
                view: "coordel/userPrereqs",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	//this.obsBlock = this.blockStore.query(queryArgs);
            	return this.blockStore.query(queryArgs);
            },
            getBlocking: function(task){
              var blocking = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              
              var queryArgs = {
                view: "coordel/taskBlocking",
            		startkey: [task],
            		endkey: [task,{}],
            		include_docs: true
            	};
            	
            	var def = blocking.query(queryArgs);
            	
            	//console.debug("returning getBlocking");
            	return def;
            
            }
            
            
        };
        
        return taskStore;
    }
);