define(["dojo", 
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        "app/store/ObservableCache"], function(dojo, couch, mem, cache, obs, obsCache) {
        //return an object to define the "./newmodule" module.
        var roleStore = {
            db: "/" + djConfig.couchdb + "/",
            username: null,
            memory: null,
            observable: null,
            remote: null,
            store: null,
            isLoaded: false,
            init: function(username){
              //console.debug("initializing contacts");
              this.username = username;
              var self = this;
              var def = new dojo.Deferred();
              var load = this._loadRoles(username);
              load.then(function(resp){
                //console.debug("contacts loaded", resp);
                self.isLoaded = true;
                def.callback(self);
              });
            	return def;
            },
            _loadRoles: function(username){
              this.memory = new mem({idProperty: "_id"});
              this.memory = new obs(this.memory);
              this.remote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.store = new obsCache(this.remote, this.memory);
              
              var query = {
                view: "coordel/userRoles",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	return this.store.query(query);
            }
        };
        
        return roleStore;
    }
);