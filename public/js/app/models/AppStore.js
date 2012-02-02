define(["dojo",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable"], function(dojo, couch, mem, cache, obs){
        //return an object to define the "./newmodule" module.
        var appStore = {
            db: "/" + djConfig.couchdb + "/",
            memory: null,
            observable: null,
            obsTemplates: null, 
            remote: null,
            store: null,
            username: null,
            init: function(username){
              //console.debug("initializing appStore");
              this.username = username;
              var self = this;
              var def = new dojo.Deferred();
              var load = this._loadApp(username);
              load.then(function(resp){
                var s = self,
                    a = self.app();

          		  if (!a.defaultTemplatesLoaded){
          		    if (!a.deliverableTemplates){
          		      a.deliverableTemplates = [];
          		    }
          		    a.defaultTemplatesLoaded = true;
          		    s.loadTemplates();
          		    s.obsTemplates.then(function(){
          		      s.memTemplates.data.forEach(function(t){

          		        if (t.docType === "deliverable-template"){
          		          a.deliverableTemplates.push(t);
          		        }
          		      });
          		      s.store.put(a, {username: username});
          		    });
          		  } 
          		  def.callback(self);
              });
            	return def;
            },
            app: function(){
              
              //console.debug("app", this.memory.data[0]._rev, this.memory.data);
              
              return this.memory.data[0];
          
            },
            _loadApp: function(username){
              //console.debug("loading appStore");
              this.memory = new mem({idProperty: "_id"});
              this.remote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.remote = new obs(this.remote);
              this.store = new cache(this.remote, this.memory);
              
              var queryArgs = {
                view: "coordel/userApps",
            		startkey: [username],
            		endkey: [username,{}],
            		include_docs: true
            	};
            	
            	return this.store.query(queryArgs);
            },
            loadTemplates: function(){
              this.memTemplates = new mem({idProperty: "_id"});
              this.remTemplates= new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.remTemplates = new obs(this.remTemplates);
              this.templateStore = new cache(this.remTemplates, this.memTemplates);
              
              var queryArgs = {
                view: "coordel/templates",
                include_docs: false
            	};
            	
            	this.obsTemplates = this.templateStore.query(queryArgs);
            }
            
        };
        
        return appStore;
    }
);