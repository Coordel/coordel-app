define(["dojo",
        "dojo/store/JsonRest",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "app/store/ObservableCache",
        "dojo/store/Observable",
        "app/util/Sort"], function(dojo,store, couch, mem, cache, obs, util){
        //return an object to define the "./newmodule" module.
        var appStore = {
            db: "/" + djConfig.couchdb + "/",
            _app: null,
            obsTemplates: null, 
            //store: null,
            username: null,
            init: function(){
              //console.debug("initializing appStore");
              //this.username = username;
              var self = this;
              var def = new dojo.Deferred();
              var load = this._loadApp();
              load.then(function(app){
                
                def.callback(app);
              });
            	return def;
            },
            
            post: function(app){
              var self = this;
              var def = new dojo.Deferred();
              
              return new dojo.xhrPost({
                url: "/app/",
                handleAs: "json",
                postData: dojo.toJson(app),
                headers:{
        					"Content-Type": "application/json; charset=UTF-8",
        					"Accept": "application/json"
        				}
              });
              
              
            },
            
            app: function(){
              //console.debug("appstore app", this._app);
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
                var funcs = [];
                self._app = app;
                //console.log("APP LOADED", app);  
                self.username = app.id;
                funcs.push(self.loadTemplates());
                funcs.push(self.loadSharedTemplates());
                var list = new dojo.DeferredList(funcs);
                list.then(function(res){
                  def.callback(app);
                });
              });
              
              return def;
            },
            
            searchTemplates: function(query, filter){
              
              if (!filter){
                filter = "all";
              }
              
              var def = new dojo.Deferred();

              if(!query.trim().length){
                def.callback([]);
              } else {
                var list = this.memTemplates.query(filter, {sort: [{attribute: "name"},{attribute: "created"}]});
                dojo.when(list, function(){
                  var matches = list.filter(function(doc){
                    var has = false;
                    var name = "", purpose = "";
                    if (doc.name){
                      name = doc.name;
                    }

                    if (doc.purpose){
                      purpose = doc.purpose;
                    }

                   
                    if (doc.project){
                      if (doc.project.name){
                        name = name + " " +  doc.project.name;
                      }

                      if (doc.project.purpose){
                        purpose = purpose + " " + doc.project.purpose; 
                      }

                    }
                    
                    if (doc.tasks && doc.tasks.length){
                      dojo.forEach(doc.tasks, function(task){
                        if (task.name){
                          name = name + " " + task.name;
                        }

                        if (task.purpose){
                          purpose = purpose + " " + task.purpose; 
                        }
                      });
                    }
                  
                    
                    name = name.toLowerCase();
                    purpose = purpose.toLowerCase();
                    query = query.toLowerCase();
                    
                    console.log("query: " + query, name, purpose);

                    if (name.indexOf(query)> -1) has = true;
                    if (purpose.indexOf(query)>-1) has = true;
                    return has;
                  });
                
                  def.callback(matches);
                });
              }
              
              
              return def;
            }, 
            
            loadTemplates: function(){
            
              this.memTemplates = new mem({idProperty: "_id"});
              this.remTemplates= new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.memTemplates = new obs(this.memTemplates);
              this.templateStore = new cache(this.remTemplates, this.memTemplates);
              
              this.memTemplates.deliverables = function(template){
                return template.templateType === "deliverable" && template.isActive;
              };
              
              this.memTemplates.tasks = function(template){
                return template.templateType === "task" && template.isActive;
              };
              
              this.memTemplates.projects = function(template){
                return template.templateType === "project" && template.isActive;
              };
              
              var queryArgs = {
                view: "coordel/userTemplates",
                startkey: [this._app.id],
                endkey: [this._app.id, {}]
            	};
            	
            	return this.templateStore.query(queryArgs);
            },
            
            loadSharedTemplates: function(){
            
              this.memShared = new mem({idProperty: "_id"});
              this.remShared= new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.memShared = new obs(this.memShared);
              this.sharedStore = new cache(this.remShared, this.memShared);
              
              this.memShared.all = function(template){
                return template.isActive;
              };
              
              this.memShared.deliverables = function(template){
                return template.templateType === "deliverable" && template.isActive;
              };
              
              this.memShared.tasks = function(template){
                return template.templateType === "task" && template.isActive;
              };
              
              this.memShared.projects = function(template){
                return template.templateType === "project" && template.isActive;
              };
              
              var queryArgs = {
                view: "coordel/sharedTemplates",
                limit: 50
            	};
            	
            	return this.sharedStore.query(queryArgs);
            },
            
            searchSharedTemplates: function(query){
              var post = dojo.xhrPost({
                url: "/search",
                handleAs: "json",
                postData: "username="+this.username + "&search=" + query +"&type=template"
              });
              
              var def = new dojo.Deferred();
              
              if(!query.trim().length){
                def.callback([]);
              } else {
                post.then(function(res){
                  console.log("got results from searchSharedTemplates", res);
                  //var results = util.sort(res.results, {sort: [{attribute:"name"}]});
                  var results = [];
                  if (res.results.length){
                    results = util.sort(res.results, {sort:[{attribute:"name"}, {attribute:"created"}]});
                  } 
                  def.callback(results);
                });
              }

              return def;
            }
            
        };
        
        return appStore;
    }
);