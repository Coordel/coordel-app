define(["dojo", 
        "app/store/CouchDbStore",
        "app/store/ObservableCache",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable"], function(dojo, couch, obsCache, mem, cache, obs) {
        //return an object to define the "./newmodule" module.
        var streamStore = {
            db: "/" + djConfig.couchdb + "/",
            remote: null,
            memory: null,
            store: null,
            username: null,
            currentContext: null,
            currentContextId: null,
            isLoaded:false,
            observable: null,
            init: function(username){
              var def = new dojo.Deferred();
              
              this.username = username;
              var self = this;
              var load = this.loadUserStream();
              load.then(function(resp){
                self.isLoaded = true;
                def.callback(self);
              });
            	return def;
            },
          
            loadUserStream: function(start, limit){
              
              //console.debug("doing userStream query");
          	  this.remote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.memory = new mem({idProperty: "_id"});
              this.memory = new obs(this.memory);
              this.store = new obsCache(this.remote, this.memory);
              
              this.currentContext = "userStream";
            	this.currentContextId = null;
              
              this.memory.messages = function(entry){
                return entry.docType === "message";
              };
              
              this.memory.all = function(entry){
                return true;
              };
         
              var query = {
                view: "coordel/userStream",
            		startkey: [this.username,{}],
            		endkey: [this.username],
            		descending: "true",
            		limit: 50
            	};
    
            	return this.store.query(query);
            },
            loadProjectStream: function(project){
              console.log("loadProjectStream called", project);
              var query = {
                view: "coordel/projectStream",
            		startkey: [project, {}],
            		endkey: [project],
            		descending: "true",
            		limit: 50
            	};
            	this.projectRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.projectMemory = new mem({idProperty: "_id"});
              this.projectMemory = new obs(this.memory);
              this.projectStore = new obsCache(this.remote, this.memory);
  
              
            	this.currentContext = "projectStream";
            	this.currentContextId = project;
            	
            	return this.projectStore.query(query);
            },
            loadTaskStream: function(task){
              var query = {
                view: "coordel/taskStream",
            		startkey: [task, {}],
            		endkey: [task],
            		descending: "true"
            	};
            	this.taskRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.taskMemory = new mem({idProperty: "_id"});
    
              this.taskStore = new obsCache(this.remote, this.memory);
            	
            	this.currentContext = "taskStream";
            	this.currentContextId = task;
            	
            	return this.taskStore.query(query);
            },
            loadContactStream: function(contact){
              var query = {
                view: "coordel/contactStream",
            		startkey: [contact, {}],
            		endkey: [contact],
            		descending: "true"
            	};
            	this.contactRemote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.contactMemory = new mem({idProperty: "_id"});
              this.contactStore = new obsCache(this.remote, this.memory);
            	
            	this.currentContext = "contactStream";
            	this.currentContextId = contact;
            	
              return this.contactStore.query(query);
            }
        };
        
        return streamStore;
    }
);

