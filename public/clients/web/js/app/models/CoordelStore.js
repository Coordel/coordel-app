define(["dojo",
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        'app/models/AppStore',
        "app/models/TaskStore",
        "app/models/ProjectStore",
        'app/models/ProjectModel',
        'app/models/RoleModel',
        "app/models/TaskModel",
        "app/models/DeliverableModel",
        "app/models/ContactStore",
        "app/models/StreamStore",
        "app/models/RoleStore",
        "app/models/ProfileStore",
        "i18n!app/nls/coordel",
        "app/util/dateFormat",
        "dojo/date/stamp",
        "app/util/Sort"
        ], function(dojo, couch, mem, cache, obs, aStore, tStore, pStore, pModel, rModel, tModel, dm, cStore, sStore,rStore, profStore,coordel, dtFormat, stamp, Sort) {
      
        var uuidCache = [];
        var CoordelStore = {
          
            userStore: null,
          
            taskStore: null,
            
            projectStore: null,
            
            contactStore: null,
            
            streamStore: null,
            
            appStore: null,
            
            roleStore: null,
            
            profileStore: null, 
            
            headers: {Accept: "application/json", "Content-Type": "application/json"},
            
            user: null,
            
            userImage: "/images/default_contact.png",
            
            focus: "task",
            
            username: function(){
              return this.user.id;
            },
            fullName: function(){
              return this.user.firstName + " " + this.user.lastName;
            },
            myPrivate: function(){
            
              return this.user.myPrivateProject;
            },
            myDelegated: function(){
              return this.user.myDelegatedProject;
            },
            db: "/" + djConfig.couchdb + "/",
            changes: null,
            contact: function(username, noYou){
              var def = new dojo.Deferred(),
                  self = this,
                  c;
                  
              //console.debug("getting contact from contactStore", username);
              if (username !== "UNASSIGNED"){
                
                c = self.contactStore.store.get(username);
              } else {
                c = {id: "UNASSIGNED", email: ""};
              }
              
              dojo.when(c, function(contact){
                //console.log("got the contact", contact);
                contact = self._setFullName(contact, noYou);
                def.callback(contact);
              });
              //c = self._setFullName(c, noYou);
    
              return def;
            },
            
            _setFullName: function(contact, noYou){
              //unless noYou is true, if I'm this user i get "You" back
              //for the contact fullName.
              
              //console.log("setting full name for ", contact);
              
              if (noYou === undefined) {
                noYou = false;
              }
              
              contact.fullName = coordel.you;
              
              //console.debug("_setFullName noYou: " + noYou, "contact: " + contact.id);
              
              if (contact.id === "UNASSIGNED"){
                contact.fullName = coordel.unassigned;
              } else if (contact.firsName === "None" && contact.lastName === "Given") {
                contact.fullName = contact.email;
              } else {
                //console.debug("wasn't unassigned", noYou, contact.id, this.user.id);
                
                if (contact.id !== this.user.id || noYou){
                  //console.debug("shouldn't be you");
                  contact.fullName = contact.firstName + " " + contact.lastName; 
                }
              }
              //console.log("sending back contact with fullname", contact, contact.fullName );
              return contact;
            },
            
            contactFullName: function(username, noYou){
              var self = this;
              
              //console.debug("testing contactFullName", username, noYou);
              
              if (username === "UNASSIGNED"){
                 return coordel.unassigned; 
              } else {
                c = self.contactStore.store.get(username); 
              }
              
              c = self._setFullName(c, noYou);
            
              return c.fullName;
            },
            
            
            
            init: function() {
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
              self.profileStore = profStore;
              
              var def = new dojo.Deferred();
              
              var a = aStore.init();
              
              
              
              a.then(function(app){
                //console.debug("APP", app);
                self.user = app;
                //console.log("user",self.user);
                var list = new dojo.DeferredList([
                  
                  pStore.init(app.id),
                  tStore.init(app.id),
                  cStore.init(app.id),
                  sStore.init(app.id),
                  rStore.init(app.id)
                  
                ]);
                
                profStore.init(app.id);

                list.then(function(resp){
    
                  
                  //console.debug("user and appStore loaded, other stores set", resp);
                  def.callback(self);
                });
              }); 
              return def;
            },
            
            uuid: function(){
              return this.newUUID();
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
            
            newUUID: function(cacheNum) {
              if (cacheNum === undefined) {
                cacheNum = 10;
              }
              if (uuidCache.length < 2) {
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
            
            getExtendedTasks: function(project){
              var def = new dojo.Deferred();
              var db = this;
              //get the the extended tasks from the project store
              var ext = this.projectStore.loadExtendedTasks(project);
              dojo.when(ext, function(tasks){
                if (tasks.length === 0){
                  def.callback([]);
                } else {
                  /*
                  //sort the tasks by deadline
                  //need to first make sure the contextDeadline is set
                  var deadFuncs = [];
                  var toReturn = [];
                  
                  function setContextDeadline(task){
                    var deadDef = new dojo.Deferred();
                    var t = db.getTaskModel(task, true);
                    var tDead = t.getDeadline();
                    dojo.when(tDead, function(d){
                      task.contextDeadline = d;
                      //console.log("context deadline", d, task.name, task.contextDeadline);
                      deadDef.callback(task);
                    });
                    return deadDef;
                  }
                  
                  dojo.forEach(tasks, function(task){
                    deadFuncs.push(setContextDeadline(task));
                  });
                  
                  var deadList = new dojo.DeferredList(deadFuncs);
                  dojo.when(deadList, function(res){
                    //console.log("deadList res", res);
                    dojo.forEach(res, function(r){
                      //console.log(r[1].name, r[1].contextDeadline);
                      toReturn.push(r[1]);
                    });
                    toReturn = Sort.sort(toReturn, {sort:[{attribute: "contextDeadline", descending: false},{attribute: "created", descending: false}]});
                    toReturn = Sort.byBlocking(toReturn);
                    def.callback(toReturn);
                  });
                  */
                  dojo.forEach(tasks, function(task){
                    var t = db.getTaskModel(task,true);
                    t.getContextDeadline().then(function(dead){
                      task.contextDeadline = dead;
                    });
                  });
                  tasks = Sort.sort(tasks, {sort:[{attribute: "contextDeadline"}]});
                  tasks = Sort.byBlocking(tasks);
                  def.callback(tasks);
                }
              });
              return def;
            },
            
            getAlerts: function(){
              
              return dojo.xhrGet({
                url: "/alerts/",
                handleAs: "json",
                content: {username: this.username()},
                headers: this.headers
              });
            },
            
            getBlueprintAttachments: function(blueprint){
              
              return dojo.xhrGet({
                url: "/blueprint/attachments/",
                handleAs: "json",
                content: {id: blueprint},
                headers: this.headers
              });
            },
            
            getProjectFromBlueprint: function(templateid){
              var bp = this.appStore.memTemplates.get(templateid),
                  def = new dojo.Deferred(),
                  docs = {},
                  self = this;
              
              if (bp.blueprintAttachments){
                //since there were attachments, get the starter docs for them
                var q = self.getBlueprintAttachments(templateid);
                q.then(function(docs){
                  //console.log("got starter project docs", docs);
                  def.callback(self._getProjectFromBlueprint(bp, docs));
                });
              } else {
                def.callback(self._getProjectFromBlueprint(bp, docs));
              }
              return def;
            },
            
            _getProjectFromBlueprint: function(template, docs){
              var bp = {},
                  username = this.username(),
                  self = this;
              //this function merges the template and the starter docs
              //need to track the old id's and the new mapping
              bp.idMap = {};
              
              //first the project
              bp.project = {};
              bp.project.isNew = true;
              bp.project._id = self.uuid();
              if (docs[template.project._id]){
                bp.project = docs[template.project._id];
                bp.project.isNew = false;
              }
              bp.project.docType = "project";
              bp.project.responsible = template.project.responsible;
              bp.project.users = template.project.users;
              bp.project.status = "ACTIVE";
              bp.project.substatus = "PENDING";
              bp.project.isMyDelegated = template.project.isMyDelegated;
              bp.project.isMyPrivate = template.project.isMyPrivate;
              bp.project.isTemplate = template.project.isTemplate;

              
              if (template.project.assignments){
                bp.project.assignments = template.project.assignments;
                dojo.forEach(bp.project.assignments, function(assign){
                  if (assign.role !== "RESPONSIBLE" && assign.role !== "FOLLOWER"){
                    var id = self.uuid();
                    bp.idMap[assign.role]= id;
                    assign.role = id;
                  }
                  if (assign.username === bp.project.responsible){
                    assign.status = "ACCEPTED";
                  } else {
                    assign.status = "INVITE";
                  }
                });
              }
              
              if (template.project.name){
                bp.project.name = template.project.name;
              }
              
              if (template.project.purpose){
                bp.project.purpose = template.project.purpose;
              }
              
              if (template.project.deadline){
                //we need to calculate the new deadline based on when the project started and when
                //the deadline was. For example, if the project was created on the 9th and deadline was
                //the 19th, then we add 10 days to today for the deadline;
                //if the deadline hasn't past, then figure out how many days left
                //console.log("getting deadline", template.deadline, template.created);
                var now = new Date(),
                    start = stamp.fromISOString(template.project.created),
                    end = stamp.fromISOString(template.project.deadline),
                    diff = 0,
                    compare = 0,
                    deadline,
                    hasTime = false,
                    test = template.project.deadline.split("T");
                
                if (test.length > 1){
                  hasTime = true;
                }
                               
                //if there is a completed entry, use it because it gives a better indication
                //of how long the task took
                if (template.project.completed){
                  end = stamp.fromISOString(template.project.completed);
                }
                
                compare = dojo.date.difference(start, end, "day");
                
                //the start and end are the same day
               if (compare === 0){
                  //if the deadline had a time entry then test if diff in minutes
                  if (hasTime){
                    diff = dojo.date.difference(start, end, "minute");
                    //make sure the start happened before the end
                    if (diff > 0){
                      //set the new deadline based on the diff in minutes
                      bp.project.deadline = stamp.toISOString(dojo.date.add(now, "minute", diff));
                    } else {
                      //console.log("today, has time, diff < 0");
                      //if wasn't positive, then just set the deadline to today
                      bp.project.deadline = stamp.toISOString(now, {selector:"date"});
                    }
                  } else {
                    //console.log("today, noTime, diff < 0");
                    bp.project.deadline = stamp.toISOString(now, {selector: "date"});
                  }
                } else {
                  //get the difference in minutes between the start and end of the task
                  diff = dojo.date.difference(start, end, "minute");

                  //console.log("diff", diff);
                  
                  bp.project.deadline = stamp.toISOString(dojo.date.add(now,"minute", diff));
                } 
                
              }
              
              //blockers have to be the first tasks so they don't hang up
              if (template.blockers && template.blockers.length > 0){
                var blockers = [];
                //check if it was a doc with attachments
                dojo.forEach(template.blockers, function(t){
                  
                  var doc = {},
                      id = self.uuid();
                  bp.idMap[t._id]= id;
                  doc._id = id;
                  doc.isNew = true;
                  if (template.blueprintAttachments && template.blueprintAttachments[t._id]){
                    doc = template.blueprintAttachments[t._id];
                    bp.idMap[t._id]= template.blueprintAttachments[t._id]._id;
                    doc.isNew = false;
                  }
                  doc.role = bp.idMap[t.role];
                  doc.project = bp.project._id;
                  blockers.push(self._getTaskFromBlueprint(t, doc, template._id));
                });
                
                bp.blockers = blockers;
          
              }
              
              //tasks
              if (template.tasks && template.tasks.length > 0){
                var tasks = [];
                //check if it was a doc with attachments
                dojo.forEach(template.tasks, function(t){
                  
                  var doc = {},
                      id = self.uuid();
                  bp.idMap[t._id]= id;
                  doc._id = id;
                  doc.isNew = true;
                  if (template.blueprintAttachments && template.blueprintAttachments[t._id]){
                    doc = template.blueprintAttachments[t._id];
                    bp.idMap[t._id]= template.blueprintAttachments[t._id]._id;
                    doc.isNew = false;
                  }
                  doc.role = bp.idMap[t.role];
                  doc.project = bp.project._id;
                  tasks.push(self._getTaskFromBlueprint(t, doc, template._id));
                });
                
                bp.tasks = tasks;
          
              }
              
              //roles
              if (template.roles && template.roles.length > 0){
                var roles = [];
                dojo.forEach(template.roles, function(r){
                  var role = {};
                  role.isNew = true;
                  //console.log("testing responsiblities", r);
                  role._id = bp.idMap[r._id];
                  role.name = "";
                  if (r.name) role.name = r.name;
                  role.username = r.username;
                  role.project = bp.project._id;
                  role.docType = "role";
                  if (r.responsibilities && r.responsibilities.length > 0){
                    dojo.forEach(r.responsibilities, function(resp){
                      if (resp.username === bp.project.responsible){
                        resp.status = "CURRENT";
                        resp.substatus = "ACCEPTED";
                      } else {
                        resp.status = "PENDING";
                        resp.substatus = "DELEGATED";
                      }
                      resp.task = bp.idMap[resp.task];
                    });
                    role.responsibilities = r.responsibilities;
                  }
                  roles.push(role);
                });
                bp.roles = roles;
              }
            
              return bp;
            },
            
            getTaskFromBlueprint: function(templateid){
          	  //id is the templateid
          	  var bp = this.appStore.memTemplates.get(templateid),
          	      def = new dojo.Deferred(),
          	      doc = {},
          	      self = this;
              
              //console.log("getFromBlueprint", bp);

              if (bp._attachments){
                //load the attachments
                var q = this.getBlueprintAttachments(templateid);
                q.then(function(doc){
                  //console.log("loaded blueprint attachments", doc);
                  def.callback(self._getTaskFromBlueprint(bp.task, doc, templateid));
                });
              } else {
                def.callback(self._getTaskFromBlueprint(bp.task, doc, templateid));
              }
              
              return def;
          	},
          	
          	_getTaskFromBlueprint: function(template, doc, templateid){
              
              doc.docType = "task";
              
              if (template.name && template.name.length > 0){
                doc.name = template.name;
              }

              if (template.purpose && template.purpose.length > 0){
                doc.purpose = template.purpose;
              }

              if (template.deadline){
                //we need to calculate the new deadline based on when the task started and when
                //the deadline was. For example, if the task was created on the 9th and deadline was
                //the 19th, then we add 10 days to today for the deadline;
                //if the deadline hasn't past, then figure out how many days left
                //console.log("getting deadline", template.deadline, template.created);
                var now = new Date(),
                    start = stamp.fromISOString(template.created),
                    end = stamp.fromISOString(template.deadline),
                    diff = 0,
                    compare = 0,
                    deadline,
                    hasTime = false,
                    test = template.deadline.split("T");
                
                if (test.length > 1){
                  hasTime = true;
                }
                               
                //if there is a completed entry, use it because it gives a better indication
                //of how long the task took
                if (template.completed){
                  end = stamp.fromISOString(template.completed);
                }
                
                compare = dojo.date.difference(start, end, "day");
                
                //the start and end are the same day
               if (compare === 0){
                  //if the deadline had a time entry then test if diff in minutes
                  if (hasTime){
                    diff = dojo.date.difference(start, end, "minute");
                    //make sure the start happened before the end
                    if (diff > 0){
                      //set the new deadline based on the diff in minutes
                      doc.deadline = stamp.toISOString(dojo.date.add(now, "minute", diff));
                    } else {
                      //console.log("today, has time, diff < 0");
                      //if wasn't positive, then just set the deadline to today
                      doc.deadline = stamp.toISOString(now, {selector:"date"});
                    }
                  } else {
                    //console.log("today, noTime, diff < 0");
                    doc.deadline = stamp.toISOString(now, {selector: "date"});
                  }
                } else {
                  //get the difference in minutes between the start and end of the task
                  diff = dojo.date.difference(start, end, "minute");

                  //console.log("diff", diff);
                  
                  doc.deadline = stamp.toISOString(dojo.date.add(now,"minute", diff));
                } 
                
              }

               /* NOT SETTING PROJECT because its probably the not the same project and if the user
                   wants to add it to a project, they can select the project and it will be set
              */

              if (template.username){
                doc.username = template.username;
              }

              if (template.calendar && template.calendar.start){
                doc.calendar = template.calendar;
              }

              if (template.workspace){
                doc.workspace = template.workspace;
              }
              
              /* NOT SETTING BLOCKERS because the user should use project templates to 
                 get multiple tasks
              */
              
              if (template.todos){
                dojo.forEach(template.todos, function(todo){
                  todo.done = false;
                });
                doc.todos = template.todos;
              }
              
              if (template.notes){
                doc.notes = template.notes;
              }

              //if there was a template id, then the template was created from a template
              //track the template history to see the evolution
              if (template.templateId){
                if (!doc.templateHistory){
                  doc.templateHistory = [];
                }
                doc.templateHistory.push(template.templateId);
              }

              doc.templateId = templateid;

              return doc;
            },
            
            clearAlerts: function(){
              return dojo.xhrDelete({
                url: "/alerts/",
                handleAs: "json",
                content: {username: this.username()},
                headers: this.headers
              });
            },
            
            get: function(id){
              var store = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              
              var def = new dojo.Deferred();
              store.get(id).then(
                function(doc){
                  //console.log("get the object in get");
                  def.resolve(doc);
                },
                function(err){
                  //console.log("got an error in get", err);
                  def.reject(err);
                });
              
              return def;
            },
            
            batch: function(list){
              var store = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              
              var def = new dojo.Deferred();
              store.get(id).then(
                function(doc){
                  //console.log("get the object in get");
                  def.resolve(doc);
                },
                function(err){
                  //console.log("got an error in get", err);
                  def.reject(err);
                });
              
              return def;
            },
            
            getUser: function(email){
              //console.log("getting user", email);
              
              var store = new couch({
                target: this.db, 
                idProperty: "_id"
              });
              
              var queryArgs = {
                view: "coordel/users",
            		startkey: [email],
            		endkey: [email,{}]
            	};
            	
            	var def = new dojo.Deferred();
            	
            	var query = store.query(queryArgs);
            	
            	query.then(function(res){
            	  //console.log("response", res);
            	  if (res.length > 0){
            	    def.callback(res[0]);
            	  } else {
            	    def.callback(false);
            	  }
            	});
              
              return def;
            },
            
            inviteUser: function(invite){
              
              //the invite will have email, subject and optional data members
           
              var sender = this.user;
              
              var defInvite = {
                firstName: "",
                lastName: "",
                email: "",
                fromAppId: sender.id,
                fromFirstName: sender.firstName,
                fromLastName: sender.lastName,
                fromEmail: sender.email,
                subject: sender.firstName + " " + sender.lastName + " invited you to Coordel"
              };
              
              invite = dojo.mixin(defInvite, invite);
              
              //format the start and deadline fields if present
              if (invite.data.deadline){
                invite.data.deadline = dtFormat.prettyISODate(invite.data.deadline);
              }
              
              if (invite.data.calendar){
                invite.data.calendar.start = dtFormat.prettyISODate(invite.data.calendar.start);
              }
              
              var def = new dojo.Deferred();
              
            
              return dojo.xhrPost({
                url: "/invite",
                handleAs: "json",
                putData: dojo.toJson(invite),
                headers: this.headers
              });
              
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
              var def = new dojo.Deferred();
              
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
                //console.log("getTaskModel", task);
                obj = db.taskStore.store.get(task);
                /*
                if (focus === "task" ){
                  console.log("task to get in getTaskModel", task.name, task.project, db.projectStore.currentProject);
                  obj = db.taskStore.store.get(task);
                } else if (focus === "project") {
                  console.log("task to get in getTaskModel", task.name, task.project, db.projectStore.currentProject);
                  obj = db.projectStore.taskStore.get(task);
                }
                */
              }
              
              
              var t = new tModel(obj);
              t.task = obj;
              return t.init(db);
              
            },
            
            getRoleModel: function(role, isObject){
              if (!isObject){
                isObject = false;
              }
              
         
              var focus = this.focus,
                  db = this,
                  obj; 
                  
              if (isObject){
                obj = role;
              } else {
                //console.debug("getTaskModel is loading the task");
              
                  obj = db.roleStore.store.get(role);
             
              }
              var r = new rModel({db:db});
              r.role = obj;
              return r;
        
            },
            
            getBlockerArray: function(){
              //when a new task notification arrives that isn't mine, it might be a blocker so
              //in that case, need to get an array of all the blockers in memory and test if
              //it's one of them. this function returns that array;
              
              //console.log("get blocker focus", this.focus, this.projectStore.currentProject);
              
              var blocks = this.taskStore.blockMemory.query(),
                  arr = [];
                  
              dojo.forEach(blocks, function(block){
                arr.push(block._id);
              });
              
              //console.log("blocker array called", arr);
              
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
                //if (focus === "task") {
                  obj = new tModel(this.taskStore.blockStore.get(task));
                //} else if (focus === "project"){
                  //obj = new tModel(this.projectStore.blockStore.get(task));
                //}
              }
              
              var t = new tModel(obj);
              t.task = obj;
              return t.init(db);
              
            },
            
            getDeliverableBlockerModel: function(id, task){
              //console.debug("getDeliverableBlockerModel", id, task);
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
              
              
              var p = new pModel({project:obj});
              p.init(db);
              return p; 
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
            
            taskFormProjects: function(){
              //use this function to get the user's project that are not cancelled, not done,
              //not the private, not the delegated
              var list = this.projectStore.memory.query(function(project){
                
                  return (!project.isMyPrivate && !project.isMyDelegated && 
                        project.status === "ACTIVE" && project.substatus !== "CANCELLED");
                
              }, {sort:[{attribute:"name", descending: false}]});
              
              return list;
            },
            
            getUserProjects: function(){
              var list = [];
              dojo.forEach(this.projects(true), function(proj){
                list.push(proj._id);
              });
              return list;
            },
            
            contacts: function(){
              var contacts = this.contactStore.memory.query(null, {sort:[{attribute:"lastName", descending: false},{attribute:"firstName", descending: false}]});
              //console.debug("contacts", this.contactStore.memory);
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
              //console.log("templates filter", filter);
              var templates = this.appStore.memTemplates.query(filter);
              
              return templates;
            }
          	
        };
        
        return CoordelStore;
    }
);