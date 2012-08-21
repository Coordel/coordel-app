/**
 * Alerts enable users to know that someone else did something that affects them. The
 * couchdb changes feed is the primary source of alerts
 
 * Alerts are saved in the redis store but are very volitile. In other words, they only last long
 * enough for the user to see what the alert was. As soon as they are viewed, they are cleared
 * since the Stream holds alert data structured into the correct object. There will not ever be
 * more than 99 alerts because they will also be trimmed
 
 * this way, alerts are a bit stickier than a growl, but don't create something like an inbox
 
 * to get the user used to using coordel, when an alert is added, an email is sent by default
 * The user can then disable the email alerts when they get used to logging onto coordel regularly
 */
 var config = require('konphyg')(__dirname + './../config'),
     settings = config('settings'),
     redisOpts   = settings.config.redisOptions,
     redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
     emailer     = require('./../lib/emailer');

//authenticate the redis client
redis.auth(redisOpts.auth);

var Alert = exports = module.exports = function Alert(args){
  this.username = args.username;
  this.alert = args.alert;
};

Alert.prototype.add = function(fn){
  var key = 'coordel-alerts:'+ this.username,
      multi = redis.multi();
      
  //console.log("ADD ALERT", this.username, this.alert);
      
  multi.lpush(key, JSON.stringify(this.alert));
  multi.ltrim(key, 0, 99);
  multi.exec(function(err, res){
    if (err){
      console.log("ERROR adding alert", err);
      fn(err, null);
    } else {
      //console.log("saved alert", res);
      fn(false, res);
    }
  });
  
};

exports.getUserAlerts = function(username, fn){
  //console.log("GETTING USER ALERTS");
  var key = 'coordel-alerts:' + username;
  redis.lrange(key,0,-1, function(err, res){
    if (err){
      console.log("ERROR getting alerts", err);
      fn(err, null);
    } else {
      var alerts = [];
      //console.log("GOT ALERTS");
      res.forEach(function(alert){
        //console.log("ALERT", alert);
        try {
          alerts.push(JSON.parse(alert));
        } catch (err){
          console.log("ALERT ERROR", err, alert);
        }
      });
      fn(false, alerts);
    }
  });
};

exports.deleteUserAlerts = function(username, fn){
  
  var key = 'coordel-alerts:' + username;
  //console.log('deleting Alerts', key);
  redis.ltrim(key, 2, 1, function(err, res){
    if (err){
      console.log("ERROR deleting alerts", err);
      fn(err, null);
    } else {
      //console.log("ltrim results", res);
      fn(false, true);
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
	      
	      //notify everyone who didn't decline or leave the project
	      if (assign.status !== "LEFT" && assign.status !== "LEFT-ACK"){
	        if (!map[assign.username]) map[assign.username] = true;
	      }
  		});
	  }

	  //this is a pending project so only the responsible gets the channge
	  if (doc.substatus === "PENDING"){
	    if (!map[doc.responsible]) map[doc.responsible] = true;
	  }
	}

	if (doc.docType === "role"){
	  //everyone with a responsbility in this role gets notified
	  if (doc.responsibilities){
	    doc.responsibilities.forEach(function(resp){
  		  if (!map[resp.username]) map[resp.username] = true;
  		});
	  }
	  if (!map[doc.responsible]) map[doc.responsible] = true;
	}

	//users get the tasks when they own them and they aren't pending, declined, or left (set to unassigned)
	if(doc.docType == "task" && doc.status !== "PENDING" && doc.substatus !== "DECLINED" && doc.substatus !=="UNASSIGNED") {
	   if (!map[doc.username]) map[doc.username] = true;
	   if (doc.delegator && doc.delegator !== doc.responsible){
	     if (!map[doc.delegator]) map[doc.delegator] = true;
	   }
	} 
	
	//users get the tasks when they own them and they are blocking
	if (doc.docType === "task" && doc.blocking && doc.blocking.length > 0){
	  doc.blocking.forEach(function(id){ 
	    if (!map[doc.username]) map[doc.username] = true;
	    console.log("notify blocking");
	  });
	  if (doc.delegator && doc.delegator !== doc.responsible){
	     if (!map[doc.delegator]) map[doc.delegator] = true;
	  }
	}
	
	//responsible and delegator get notified of changes to tasks
	if(doc.docType == "task") {
	  if (doc.history && doc.history.length){
	    var alert = doc.history[0];
  	  if (alert.verb !== "SAVE"){
  	    //the responsible doesn't need to get notified when the user saves the workspace
  	    if (!map[doc.responsible]) map[doc.responsible] = true;
  	  
  	    //need to alert the delegator if there is one
  	    if (doc.delegator){
  	      if (!map[doc.delegator]) map[doc.delegator] = true;
  	      console.log("notify delegator");
  	    }
  	  } 
	  } else {
	    //the responsible doesn't need to get notified when the user saves the workspace
	    if (!map[doc.responsible]) map[doc.responsible] = true;
	  
	    //need to alert the delegator if there is one
	    if (doc.delegator){
	      if (!map[doc.delegator]) map[doc.delegator] = true;
	      console.log("notify delegator");
	    }
	  }
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
	
	if (doc.docType == "message"){
	  //notify all users that a message has been received
		for (var u in doc.users){
		  if (!map[doc.users[u]]) map[doc.users[u]] = true;
		}
	}
	
	//notify about new templates
	if (doc.docType == "template" && doc.username){
	  //notify the user that a template is available
		if (!map[doc.username]) map[doc.username] = true;
	}
	
	if (doc.docType == "file" && doc._attachments != undefined){
    if (!map[doc.updater]) map[doc.updater] = true;
	}

	if (doc.docType == "prerequisite"){
	   if (!map[doc.username]) map[doc.username] = true;
	}
	console.log("MAP", map);
	return map;

};