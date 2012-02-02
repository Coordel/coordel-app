define(["dojo",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        'app/models/AppStore',
        "app/models/TaskStore",
        "app/models/ProjectStore",
        'app/models/ProjectModel',
        "app/models/TaskModel",
        "app/models/DeliverableModel",
        "app/models/ContactStore",
        "app/models/StreamStore",
        "app/models/RoleStore",
        "i18n!app/nls/coordel",
        "dojox/encoding/digests/_base",
        "dojox/encoding/digests/SHA1"
        ], function(dojo, couch, mem, cache, obs, aStore, tStore, pStore, pModel, tModel, dm, cStore, sStore,rStore, coordel,dxd, sha1) {
      
        var uuidCache = [];
        var CoordelStore = {
          
            taskStore: null,
            
            projectStore: null,
            
            contactStore: null,
            
            streamStore: null,
            
            appStore: null,
            
            roleStore: null,
            
            headers: {Accept: "application/json", "Content-Type": "application/json"},
            
            user: null,
            
            focus: "task",
            
            username: function(){
              return this.user._id;
            },
            fullName: function(){
              return this.user.first + " " + this.user.last;
            },
            myPrivate: function(){
              return this.appStore.app().myPrivateProject;
            },
            myDelegated: function(){
              return this.appStore.app().myDelegatedProject;
            },
            db: "/" + djConfig.couchdb + "/",
            changes: null,
            contact: function(username, noYou){
              
              if (username !== "UNASSIGNED"){
                c = this.contactStore.store.get(username);;
              } else {
                c = {_id: "UNASSIGNED", email: ""};
              }
              this._setFullName(c, noYou);
              return c;
            },
            
            _setFullName: function(contact, noYou){
              //unless noYou is true, if I'm this user i get "You" back
              //for the contact fullName.
              
              if (noYou === undefined) {
                noYou = false;
              }
              
              //console.debug("_setFullName contact, noYou", contact._id, noYou, this.user._id);
              
              contact.fullName = coordel.you;
              
              if (contact._id === "UNASSIGNED"){
                contact.fullName = coordel.unassigned;
              } else {
                //console.debug("wasn't unassigned", noYou, contact._id, this.user._id);
                
                if (contact._id !== this.user._id || noYou){
                  //console.debug("shouldn't be you");
                  contact.fullName = contact.first + " " + contact.last; 
                }
              }
              
              return contact;
            },
            
            contactFullName: function(username, noYou){
              if (username !== "UNASSIGNED"){
                c = this.contactStore.store.get(username);;
              } else {
                c = {_id: "UNASSIGNED", email: ""};
              }
              this._setFullName(c, noYou);
              return c.fullName;
            },
            
            
            
            init: function(username) {
              //this initializes all the stores and returns the logged on users app
              //console.debug("initializing CoordelStore");
              var self = this;
              self.newUUID(10);
              self.taskStore = tStore;
              self.projectStore = pStore;
              self.contactStore = cStore;
              self.streamStore = sStore;
              self.appStore = aStore;
              self.roleStore = rStore;
              
              var def = new dojo.Deferred();
              var list = new dojo.DeferredList([
                this._loadUser(username),
                aStore.init(username),
                pStore.init(username),
                tStore.init(username),
                cStore.init(username),
                sStore.init(username),
                rStore.init(username)
              ]);
              
              list.then(function(resp){
                //console.debug("user and appStore loaded, other stores set", resp[0][1]);
                def.callback(self);
              });
              return def;
            },
            
            userDb: function(){
              var def = this.session;
              dojo.when(def, function(resp){
                def.callback(resp.info.authentication_db);
              });
              return def;
            },
            
            signUp: function(userdoc, password, options){
              var self = this;
              options = options || {};
              // prepare user doc based on name and password
              userdoc = prepareUserDoc(userdoc, password);
              
              var userDb = this.userDb();
              
              dojo.when(userDb, function(target){
                var store = new couch({
                  target: "/" + target + "/", 
                  idProperty: "_id"
                });
                console.debug("signUp userdoc", userdoc);
                //var add = store.add(userdoc, {username: self.username()});
              });
            },
            
            createApp: function(username, options){
              var a = {},
          			p = {},
          			r = {},
          			project = this.uuid(),
          			role = this.uuid();

          		//application
          		//TODO: look up the licence (via Node and verify it matches the username
          		//if it doesn't return error;
          		a._id = user.app;
          		a.username = user._id;
          		a.license = user.license;
          		//update the application with the default templates
          		a.templates = data.templates;
          		a.templates.controls = data.templates.controls;
          		a.templates.tasks = data.templates.tasks;
          		a.templates.projects = data.templates.projects;
          		a.context = Coordel.defaultContext();
          		a.users.push(user._id);
          		a.projects.push(project);
          		a.myTasksProject = project;
          		a.myTasksRole = role;

          		//project	
          		p.init();
          		p._id = project;
          		p.name = "Private Actions";
          		p.assignments.push({
          			"username": user._id,
          			"role": role	
          		});
          		p.responsible = user._id;
          		p.users.push(user._id);
          		p.isMyTasks = true;

          		//role
          		r.init();
          		r._id = role;
          		r.name = "Private Role";
          		r.username = user._id;
          		r.project = project;

          		//save the docs async
          		async.parallel([
          				function(cb){
          					a.saveDoc({
          						success: function(res){
          							//$.log("here's the app response after saveDoc");
          							//$.log(res);
          							a._rev = res.rev;
          							Coordel.app(a);
          							$(document).trigger("onAppLoaded", a);
          							cb(null,res);
          						}
          					});
          				},
          				function(cb){
          					p.saveDoc({
          						success: function(res){
          							Coordel.currentProject(Coordel.project(project));
          							cb(null,res);
          						}
          					});
          				},
          				function(cb){
          					r.saveDoc({
          						success: function(res){

          							cb(null,res);
          						}
          					});
          				},
          				function(cb){
          					user.hasApp = true;
          					user.saveDoc({
          						success: function(res){

          							cb(null,res);
          						}
          					});
          				}
          			],
          			function(err, results){
          				if (err){
          					$.log("Failed to create app");
          					$.log(err);
          					return;
          				}
          				//$.log("successfully completed Admin.createApp()");
          				//$.log(results);
          				//$.log("updating contacts");
          				Coordel.updateContacts();
          				if (options){
          					options.success();
          				}	
          			}
          		);
            },
            
            _prepareUserDoc: function(user_doc, new_password){
              var user_prefix = "org.couchdb.user:";
              user_doc._id = user_doc._id || user_prefix + user_doc.name;
              if (new_password) {
                // handle the password crypto
                user_doc.salt = this.newUUID();
                user_doc.password_sha = sha1(new_password + user_doc.salt, dxd.outputTypes.Hex);
              }
              user_doc.type = "user";
              if (!user_doc.roles) {
                user_doc.roles = [];
              }
              return user_doc;
            },
            
            login: function(options){
              options = options || {};
              //console.debug("calling login", options);
              var def =  dojo.xhrPost({
                url: "/_session",
                handleAs: "json",
                content: {name:options.username, password:options.password}
              });
              
              return def;
            },
            
            changePassword: function(username, password){
              //NOTE: this is just administrative at the moment. it changes the password without doing any verification
              //it should only be called from a logged on user and the user's old password should be verified
              var store = new couch({
                target: "/" + djConfig.couchdb + "/", 
                idProperty: "_id"
              });
              
              var def = new dojo.Deferred();
              
              var self = this;
            
              var doc = store.get("org.couchdb.user:" +username);
              dojo.when(doc, function(userdoc){
                console.debug("userdoc", userdoc, password);
                userdoc = self._prepareUserDoc(userdoc, password);
                def.call(userdoc);
              });
              return def;
            },
  
            uuid: function(){
              return this.newUUID(10);
            },
            
            allDocs: function(options) {
              var type = "GET";
              var data = null;
              if (options["keys"]) {
                var keys = options["keys"];
                return  dojo.xhrPost({
                  url: this.db + "_all_docs",
                  handleAs: "json",
                  putData: dojo.toJson({ "keys": keys }),
                  headers: this.headers
                });
              } else {
                return dojo.xhrGet({
                  url: this.db + "_all_docs",
                  handleAs: "json",
                  headers: this.headers
                });
              }
            },
            
            _loadUser: function(username){
              //console.debug("loading user");
              var app = this;
              return dojo.xhrGet({
                  url: app.db + username,
                  handleAs: "json",
                  headers: this.headers, 
                  load: function(resp){
                    app.user = resp;
                  }
              });
              
            },
            
            session: function(options) {
              options = options || {};
              return dojo.xhrGet({
                url: "/_session",
                handleAs: "json",
                headers: this.headers,
                load: function(resp){
                  if (resp.status === 200){
                    if(options.success){
                      options.success(resp);
                    }
                  } else if (options.error){
                    options.error(resp.status, resp.error, resp.reason);
                  }
                },
                error: function(err){
                  if (options.error){
                    options.error(resp.status, resp.error, resp.reason);
                  } else {
                    console.log("ERROR getting session info: " + resp.reason);
                  }
                }
              });
            },
            
            newUUID: function(cacheNum) {
              if (cacheNum === undefined) {
                cacheNum = 1;
              }
              if (!uuidCache.length) {
                dojo.xhrGet ({
                  headers: this.headers,
                  url: "/coordel/uuids",
                  content: {count: cacheNum},
                  handleAs: "json",
                  sync: true,
                  load: function(resp){
                    uuidCache = resp.uuids;
                  },
                  error: function(resp){
                    console.log("Failed to retrieve UUID batch",resp);
                  }
                });
              }
              return uuidCache.shift();
            },
            
            bulkRemove: function(doc){
              
              dojo.forEach(doc.docs, function(d){
                d._deleted = true;
              });
              
              //console.debug("bulkRemove", doc);
              
              var def =  dojo.xhrPost({
                url: this.db + "_bulk_docs",
                handleAs: "json",
                putData: dojo.toJson(doc),
                headers: this.headers
              });
              
              return def;
              
              
            },
        
            getTaskModel: function(task, isObject){
              if (!isObject){
                isObject = false;
              }
              
              //if isFullTask is true then task is a task object otherwise it's a taskid
              //console.debug("getTaskModel task", task, "isObject",isObject, "focus", this.focus);
              var focus = this.focus,
                  db = this,
                  obj; 
                  
              if (isObject){
                obj = task;
              } else {
                console.debug("getTaskModel is loading the task");
                if (focus === "task"){
                  obj = db.taskStore.store.get(task);
                } else if (focus === "project") {
                  obj = db.projectStore.taskStore.get(task);
                }
              }
              var t = new tModel(obj);
              t.task = obj;
              return t.init(db);
        
            },
            getBlockerArray: function(){
              //when a new task notification arrives that isn't mine, it might be a blocker so
              //in that case, need to get an array of all the blockers in memory and test if
              //it's one of them. this function returns that array;
              
              var blocks = this.taskStore.blockMemory.query(),
                  arr = [];
                  
              dojo.forEach(blocks, function(block){
                arr.push(block._id);
              });
              
              return arr;
            },
            getBlockerModel: function(task, isObject){
              //console.debug("getBlockerModel id focus", id, this.focus);
              var focus = this.focus,
                  db = this,
                  obj;
              
              if (isObject){
                obj = task;
              } else {
                //console.debug("getBlockerModel is loading blocker");
                if (focus === "task") {
                  obj = new tModel(this.taskStore.blockStore.get(task));
                } else if (focus === "project"){
                  obj = new tModel(this.projectStore.blockStore.get(task));
                }
              }
              
              var t = new tModel(obj);
              t.task = obj;
              return t.init(db);
              
            },
            getDeliverableBlockerModel: function(id, task){
              console.debug("getDeliverableBlockerModel", id, task);
            },
            getProjectModel: function(project, isObject){
              var db = this, 
                  obj;
              
              if (!project){
                //if no id is given or the id is undefined, return the private project
                project = this.myPrivate();
              }
              
              if (!isObject){
                isObject = false;
              }
              
              if (isObject){
                obj = project;
              } else {
                obj = this.projectStore.store.get(project);
              }
              //console.debug("called getProjectModel", id);
              return new pModel({project: obj, db: db});
            
              
            },
            projects: function(showMine){
              
              //if showMine is true, then show the private and delegated projects
              return this.projectStore.memory.query(function(project){
                if (showMine){
                  return (project.status === "ACTIVE");
                } else {
                  return (!project.isMyPrivate && !project.isMyDelegated && project.status === "ACTIVE");
                }
              }, {sort:[{attribute:"name", descending: false}]});
            
            },
            getUserProjects: function(){
              var list = [];
              dojo.forEach(this.projects(true), function(proj){
                list.push(proj._id);
              });
              return list;
            },
            contacts: function(){
              var contacts = this.contactStore.memory.query(null, {sort:[{attribute:"last", descending: false},{attribute:"first", descending: false}]});
              //console.debug("contacts", contacts);
              return contacts;
            },
            
            getTemplate: function(filter, id){
              //filter can be deliverable, task, or project, is what is used in the template dropdown
              var templates = this.templates(filter);
              var toReturn;
              dojo.forEach(templates,function(t){
                if (t._id === id){
              
                  toReturn = t;
                }
              });
              return toReturn;
            },
            
            //this returns a template configured to create a new deliverable
            getDeliverableTemplate: function(filter, id){
              
              //console.debug("in getDeliverableTemplate", filter, id);
              var template = this.getTemplate(filter, id),
                  self = this,
                  newId = self.uuid();
                  
              
              template = dojo.clone(template);
          		//create the new ids for the new template
          		template.templateId = template.id;
          		template.id = newId;
          		
          		//console.debug("found the deliverable template and altered ids", template, newId);

          		//create ids for the controls fields and field-children
          		dojo.forEach(template.fields, function(fld){
          			fld.id = self.uuid();
          			if (fld.children && fld.children.length > 0){
                  dojo.forEach(fld.children, function(child) {
          					child.id = self.uuid();
          				});	
          			}
          		});
          		
          		return template;
              
            },
            
            templates: function(filter){
              if (!filter){
                filter = "all";
              }
              
              var templates = [];
              
              switch (filter) {
                case "deliverable":
                templates = this.appStore.app().deliverableTemplates;
                break;
              }
              
              return templates;
            },
            
            changes: function(since, options) {
              options = options || {};
              // set up the promise object within a closure for this handler
              var timeout = 100, db = this.db, active = true,
                //listeners = [],
                changeHandler = null,
                promise = {
                onChange : function(fun) {
                  //console.debug("onChange", fun);
                  changeHandler = fun;
                },
                stop : function() {
                  active = false;
                }
              };
              // call each listener when there is a change
              
              function triggerListeners(resp) {
                //console.debug("in triggerListeners", resp);
                changeHandler(resp);
                /*
                dojo.forEach(listeners, function(fun) {
                  //console.debug("in forEach", fun);
                  fun(resp);
                });
                */
              };
            
              
              function encodeOptions(options) {
                var buf = [];
                if (typeof(options) === "object" && options !== null) {
                  for (var name in options) {
                    if (dojo.indexOf(["error", "success", "beforeSuccess", "ajaxStart"],name) >= 0)
                      continue;
                    var value = options[name];
                    if (dojo.indexOf(["key", "startkey", "endkey"],name) >= 0) {
                      value = dojo.toJson(value);
                    }
                    buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
                  }
                }
                return buf.length ? "?" + buf.join("&") : "";
              }
              
              // actually make the changes request
              function getChangesSince() {
                var opts = {};
                dojo.mixin(opts,{heartbeat : 10 * 1000});
                dojo.mixin(opts, options);
                dojo.mixin(opts, {
                  feed : "longpoll",
                  since : since
                });
                var headers = {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                };
                var args = {
                  url: db + "_changes"+encodeOptions(opts),
                  headers: headers,
                  handleAs: "json",
                  load: function(resp){
                    //console.debug("in load in getChangesSince, active, since, resp", active,since, resp);
                    // when there is a change, call any listeners, then check for another change
                    timeout = 100;
                
                    if (active){
                      since = resp.last_seq;
                      console.log("it's active, trigger the listeners", resp);
                      triggerListeners(resp);
                      getChangesSince();
                    }
                  },
                  error: function(resp){
                    //console.debug("in error in getChangesSince", resp);
                   if (active) {
                      setTimeout(getChangesSince, timeout);
                      timeout = timeout * 2;
                    }
                  }
                };
                dojo.xhrGet(args);
              }
            
              // start the first request
              if (since) {
                getChangesSince();
              } else {
                //console.debug("just about to do the xhrGet to", db);
                dojo.xhrGet({
                  url: db,
                  headers: this.headers,
                  handleAs: "json",
                  load: function(resp){
                    since = resp.update_seq;
                    getChangesSince();
                  }
                });
              }
              return promise;
            },
            changeHandler: function(resp){
              //console.debug("in the changeHandler", resp);
          		var streamSound = false,
          			files = [],
          			store = this.restTasks;
          			
          		//console.debug("restTasks", store);

          		resp.results.map(function(r){
          			var chg = r.doc;
                
          			//console.debug("here's a change row to test", chg);
          	    store.notify(chg, chg._id);
          	    var item = this.taskStore.get("1b4d593ad598c7d627c7b91eef23750d");
          	    //item.then(console.debug("item from store", item));
                /*
          			switch (chg.docType){
          				case "app":
          					$.log("app change");
          					Coordel.app(chg);
          					$(document).trigger("onAppLoaded", chg);
          					break;
          				case "project":
          					$.log("sending a project change");
          					Coordel.projectChange(chg);
          					break;
          				case "task":
          					$.log("sending a task change");
          					//$.log(chg.username === Coordel.username());
          					Coordel.taskChange(chg);
          					break;
          				case "activity":
          					if (chg.object.type !== "NOTE"){
          						streamSound = true;
          					}
          					break;
          				case "file":
          					files.push(chg);
          					break;
          			  }
          			  */
          		});
              /*
          		if (streamSound){
          			if (Coordel.streamState()){
          				//NOTE: need to check if the user is editing and if so, don't scrolltop
          				$("#streamEntries").trigger("entries").scrollTop(0);
          				Coordel.messageSound();
          				$.log("played message");
          			}
          		}

          		$.each(files, function(key, file) {
          			$.log("got a File change");
          			$.log("about to trigger: #file-span-"+ file.field);
          			$("#file-span-"+ file.field).trigger("file", file.field);
          		});

          		$.log("here's the change received");
          		$.log(resp);

          		Coordel.tempData("last_seq",resp.last_seq);
          		$.log(Coordel.tempData("last_seq"));
          		*/
          	}
          	
        };
        
        return CoordelStore;
    }
);