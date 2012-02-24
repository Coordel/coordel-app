var settings    = require('./../settings');

var Alert = exports = module.exports = function Alert(args){
  //an invite has a to and from and date
  this.id = args.id;
  this.to = args.to;
  this.from = args.from;
  this.created = (new Date()).toISOString();
};

Alert.prototype.add = function(fn){
  //console.log("INVITE ADD" , this);
  if (this.id && this.to && this.from){
    //console.log('adding invite to redis store', this);
    var multi = redis.multi(),
        key = 'invite:' + this.id;
        
    multi.hset(key, 'id', this.id);
    multi.hset(key, 'to', this.to);
    multi.hset(key, 'from', this.from);
    multi.hset(key, 'created', this.created);
  
    multi.sadd('coordel-invites', key);
    multi.exec(function(err, replies){
      if (err) fn(err, false);
      fn(null, true);
    });
  } else {
    fn('Invite is not valid. id, to and from are all required', false);
  }
};

exports.get = function(id, fn){
  //id will be the email of the person invited
  redis.sismember(['coordel-invites', 'invite:' + id], function(err, reply) {
    //console.log("after testing  sismember", err, reply);
    if (err){
      //problem with getting invite 
      //console.log("error getting invite from store", err);
      fn(err, false);
    } else if (!reply){
      //console.log("invite didn't exist");
      fn("Invite not found", false);
    } else if (reply) {
      //console.log("invite existed, loading");
      var key = 'invite:' + id;
      //console.log("key for get", key);
      redis.hgetall(key, function(err, invite){
        if (err){
          //console.log("couldn't load existing invite from store",err);
          fn(err, false);
        } else {
          //console.log("found the invite", invite);
          fn(false, invite);
        }
      }); 
    }
  });
};

exports.getChangeAlertMap = function(change){
  var map = {},
      doc = change;

	if (doc.docType == "project"){
	  //if the project substatus isn't PENDING, then only the responsible gets the project
	  if (!doc.substatus || doc.substatus !== "PENDING"){
	    //this isn't pending so notify everyone with an assignment
	    doc.assignments.forEach(function(assign){
	      if (!map[assign.username]) map[assign.username] = true;
  		});
	  }

	  //this is a pending project so only the responsible gets the channge
	  if (doc.substatus === "PENDING"){
	    if (!map[doc.responsible]) map[doc.responsible] = true;
	  }
	}

	if (doc.docType === "role"){
	  //everyone with a responsbility in this role gets notified
		doc.responsibilities.forEach(function(resp){
		  if (!map[resp.username]) map[resp.username] = true;
		});
	}

	//users get the tasks when they own them
	if(doc.docType == "task") {
	   if (!map[doc.username]) map[doc.username] = true;
	} 

	//only the responsible gets notified of pending tasks
	if (doc.docType === "task" && doc.status === "PENDING"){
	  if (!map[doc.responsible]) map[doc.responsible] = true;
	}

	//make sure the responsible gets gets declined tasks notifications
	if (doc.docType === "task" && doc.substatus === "DECLINED"){
	  if (!map[doc.responsible]) map[doc.responsible] = true;
	}

	//the responsible needs the change to know the issue was raised
	if(doc.docType == "task" && doc.substatus == "ISSUE") {
		if (!map[doc.responsible]) map[doc.responsible] = true;
	}
	//the responsible needs to get the change to know the issue was cleared 
	if(doc.docType == "task" && doc.substatus == "CLEARED") {
		if (!map[doc.responsible]) map[doc.responsible] = true;
	}
	//the responsible needs change to know the task was submitted 
	if(doc.docType == "task" && doc.status == "CURRENT" && doc.substatus == "DONE") {
		if (!map[doc.responsible]) map[doc.responsible] = true;
	}
	//the responsible needs change to know the task was returned 
	if(doc.docType == "task" && doc.substatus == "RETURNED") {
		if (!map[doc.responsible]) map[doc.responsible] = true;
	}
	//the responsible needs change to get the done notification
	if(doc.docType == "task" && doc.substatus == "APPROVED") {
		if (!map[doc.responsible]) map[doc.responsible] = true;
	}

	//make sure the user doesn't get pending tasks notifications
	if (doc.docType === "task" && doc.status === "PENDING"){
	  if (!map[doc.username]) map[doc.username] = true;
	}

	//make sure the user doesn't get declined task notifications
	//make sure the user doesn't get pending tasks notifications
	if (doc.docType === "task" && doc.substatus === "DECLINED"){
	  if (!map[doc.username]) map[doc.username] = true;
	}
	
	if (doc.docType == "message"){
	  //notify all users that a message has been received
		for (var u in doc.users){
		  if (!map[doc.users[u]]) map[doc.users[u]] = true;
		}
	}
	
	//notify about new templates
	if (doc.docType == "template"){
	  //notify the user that a template is available
		if (!map[doc.username]) map[doc.username] = true;
		
	}
	
	if (doc.docType == "file" && doc._attachments != undefined){
    if (!map[doc.updater]) map[doc.updater] = true;
	}

	if (doc.docType == "prerequisite"){
	   if (!map[doc.username]) map[doc.username] = true;
	}
	
	return map;

};