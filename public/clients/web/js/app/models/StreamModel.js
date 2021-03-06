define(
  "app/models/StreamModel",["dojo","app/models/CoordelBase","dojo/date/stamp"],
   function(dojo,base, stamp) {
  dojo.declare("app.models.StreamModel", [base], {
    
      
    activity: {
      actor: {},
      target: {},
    	object: {} 	
    },
    
    init: function(db){
      this.db = db;
    },
    
    _getMessage: function(message, project){
      //messages are fundamentally targeted at the project level
      //they can be overridden to target different levels (task, group, objective, etc)
      var a = this.activity,
  		  db = this.db,
  			proj = db.projectStore.store.get(project);
  		
  		console.log("_getMessage", db.user, proj);
  			
  		a.actor.id = db.username();
      a.actor.name = db.user.firstName + " " + db.user.lastName;
      a.actor.type = "PERSON";
  		a.target.id = proj._id;
  		a.target.name = proj.name;
  		a.target.type = "PROJECT";
  		a.project = proj._id;
  		a.users = proj.users;
  		a._id = db.uuid();
  		a.object.id = a._id;
  		a.object.name = "";
  		a.object.type = "COMMENT";
  		a.body = message;
  		a.verb = "POST";
  		a.icon = this.icon.reply;
  		a.docType = "message";
  		a.time = stamp.toISOString(new Date(),{milliseconds:true});
  		
  		//console.debug("here's the returned activity", a);
  		return a;
    },
    
    sendMessage: function(message, project){
      //console.debug("in StreamModel sendMessage", message, project);
      var a = this._getMessage(message, project),
          db = this.db;
          
      if (db.focus === "project"){
        return db.projectStore.streamStore.add(a, {username: db.username()});
      }
  		console.debug("here's the message to send", a);
  		return db.streamStore.store.add(a, {username: db.username()});
  		
  	},
  	
  	sendTaskMessage: function(message, task){
  	  
  	  var a = this._getMessage(message, task.project),
  	      db = this.db;
  	  
  	  //a task messages also has the task id
  		a.task = task._id;
  		if (task.delegator){
  		  //unless there's a delegator then all three get the message
  		  a.users.push(task.delegator);
  		};
      //console.debug("here's the message to send", a, db.focus);
      
      if (db.focus === "task"){
        //console.log("adding to streamStore.taskStore");
        return db.streamStore.taskStore.add(a, {username: db.username()});
      }
  		return db.streamStore.store.add(a, {username: db.username()});
  	}
      
  });
  
  return app.models.StreamModel;
      
});

