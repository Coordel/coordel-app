define(["dojo", 
        "app/store/CouchDbStore",
        "dojo/store/JsonRest",
        "dojo/store/Memory",
        "app/store/ObservableCache",
        "dojo/store/Observable",
        "app/store/util/TaskQueryEngine"], function(dojo, couch, json, mem, cache, obs, tqe) {
        //return an object to define the "./newmodule" module.
        var contactStore = {
            db: "/" + djConfig.couchdb + "/",
            username: null,
            memory: null,
            observable: null,
            remote: null,
            store: null,
            isLoaded: false,
            currentContact: null,
            init: function(username){
              //console.debug("initializing contacts");
              this.username = username;
              var self = this;
              var def = new dojo.Deferred();
              var load = this._loadContacts(username);
              load.then(function(resp){
                //console.debug("contacts loaded", resp);
                self.isLoaded = true;
                def.callback(self);
              });
            	return def;
            },
            addContact: function(appId){
              var def = new dojo.Deferred(),
                  self = this;
              
              var post =  dojo.xhrPost({
                url: "/app/person",
                handleAs: "json",
                content: {userAppId: self.username, personAppId: appId},
                headers: this.headers
              });
              
              post.then(function(response){
                console.log("added contact to user", response);
                var query = self.store.get(appId);
                //var query = self._loadContacts(self.username);
                dojo.when(query, def.callback());
              });
              return def;
            },
            _loadContacts: function(username){
              this.memory = new mem({idProperty: "id"});
              this.remote = new json({target: "/app/people/", idProperty: "id", queryEngine: dojo.store.util.QueryResults});
              this.memory = new obs(this.memory);
              this.store = new cache(this.remote, this.memory);
            	return this.store.query({appId: username});
            },
            _loadTasks: function(contact, userProjects){
              this.taskMemory = new mem({
                idProperty: "_id",
                queryEngine: tqe});
              this.taskRemote = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              //this.remote = new obs(this.remote);
              this.taskStore = new cache(this.taskRemote, this.taskMemory);
              this.taskMemory = new obs(this.taskMemory);
              
              var queryArgs = {
                view: "coordel/userTasks",
            		startkey: [contact],
            		endkey: [contact,{}],
            		include_docs: true
            	};
            	
            	return this.taskStore.query(queryArgs);
              
            },
            loadContactTasks: function(contact, userProjects){
              //the userProjecs is an array of project ids of the the logged on user
              //only tasks that are in that list should be returned
              
              //NOTE: this is obviously insecure on the client side so must be moved client side.
              //it works for purpose of the initial product
              
              //console.debug("loading contact tasks for contact", contact);
              this.currentContact = contact;
              return this._loadTasks(contact, userProjects);
            }
        };
        
        return contactStore;
    }
);