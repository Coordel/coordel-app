define(["dojo",
        "dojo/store/JsonRest",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "app/store/ObservableCache",
        "dojo/store/Observable"], function(dojo,store, couch, mem, cache, obs){
        //return an object to define the "./newmodule" module.
        var appStore = {
            db: "/" + djConfig.couchdb + "/",
            _app: null,
            obsTemplates: null, 
            //store: null,
            username: null,
            init: function(){
              console.debug("initializing appStore");
              //this.username = username;
              var self = this;
              var def = new dojo.Deferred();
              var load = this._loadApp();
              load.then(function(app){
          		  def.callback(app);
              });
            	return def;
            },
            app: function(){
              //console.debug("app", this._app);
              
              return this._app;
          
            },
            _loadApp: function(){
              var self = this;
              var def = new dojo.Deferred();
              
              var get = dojo.xhrGet({
                url: "/app/",
                handleAs: "json"
              });
              
              get.then(function(app){
                self._app = app;
                console.log("APP LOADED", app);  
                self.username = app.id;
                var temp = self.loadTemplates();
                temp.then(function(res){
                  def.callback(app);
                });
              });
              
              return def;
            },
            loadTemplates: function(){
            
              this.memTemplates = new mem({idProperty: "_id"});
              this.remTemplates= new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.memTemplates = new obs(this.memTemplates);
              this.templateStore = new cache(this.remTemplates, this.memTemplates);
              
              this.memTemplates.deliverables = function(template){
                return template.templateType === "deliverable";
              };
              
              this.memTemplates.tasks = function(template){
                return template.templateType === "task";
              };
              
              this.memTemplates.projects = function(template){
                return template.templateType === "project";
              };
              
              var queryArgs = {
                view: "coordel/userTemplates",
                startkey: [this._app.id],
                endkey: [this._app.id, {}]
            	};
            	
            	return this.templateStore.query(queryArgs);
            }
            
        };
        
        return appStore;
    }
);