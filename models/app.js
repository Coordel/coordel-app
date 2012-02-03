var settings    = require('./../settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    templates   = require('./../templates');
    
//authenticate the redis client
redis.auth(redisOpts.auth);

var App = exports = module.exports = function App(args){
  //auths, contacts, defaultTemplatesLoaded, deliverableTemplates, email, firstName, lastName, license, 
  //myDelegatedProject, myPrivateProject, myPrivateRole,  notifications, vips 
  
  this.id = args.id;
  this.user = args.user;
  this.auths = args.auths;
  this.contacts = args.contacts;
  this.defaultTemplatesLoaded = args.defaultTemplatesLoaded || false;
  this.deliverableTemplates = args.deliverableTemplates;
  this.firstName = args.firstName || 'None';
  this.lastName = args.lastName || 'Given';
  this.license = args.license || "";
  this.myDelegatedProject = args.myDelegatedProject;
  this.myPrivateProject = args.myPrivateProject;
  this.myPrivateRole = args.myPrivateRole;
  this.vips = args.vips;
};

App.prototype.add = function(fn){
  //console.log("APP ADD" , this);
  if (this.id && this.user && this.firstName && this.lastName && 
      this.myDelegatedProject && this.myPrivateProject && this.myPrivateRole){
    //console.log('adding coordelapp to redis store', this);
    var multi = redis.multi(),
        key = 'coordelapp:' + this.id;
        
    multi.hset(key, 'id', this.id);
    if (this.auths){
      //{facebook: {key: 1, key:2}, linkedin: {key:1, key:2}}
      //hget coordelapp:1 auths:facebook -> {key:1, key:2}
      for (var a in this.auths){
        multi.hset(key, 'auths:' + a, JSON.stringify(this.auths[a]));
      }
    }
    if (this.contacts){
      multi.rpush(key, 'contacts', this.contacts);
    }
    multi.hset(key, 'defaultTemplatesLoaded', this.defaultTemplatesLoaded);
    if (this.deliverableTemplates){
      multi.rpush(key, 'contacts', this.deliverableTemplates);
    }
    multi.hset(key, 'email', this.email);
    multi.hset(key, 'firstName', this.firstName);
    multi.hset(key, 'lastName', this.lastName);
    multi.hset(key, 'myDelegatedProject', this.myDelegatedProject);
    multi.hset(key, 'myPrivateProject', this.myPrivateProject);
    multi.hset(key, 'myPrivateRole', this.myPrivateRole);
  
    multi.sadd('coordel-apps', key);
    multi.exec(function(err, replies){
      if (err) fn(err, false);
      fn(null, true);
    });
  } else {
    fn('App is not valid. id, user, firstName, lastName, ' +
        'myDelegatedProject, myPrivateProject, and myPrivateRole are all required', false);
  }
};

exports.addAppObjects = function(userData, fn){
  //console.log("ADD APP OBJECTS", userData);
  //this function creates the private project, private role, delegated project, and user profile
  //for a new user and returns the identifiers of the objects
  cn.uuids(4, function(err, uuids){
    if (err){
      fn(err, false);
    } else {
      //console.log("uuids", uuids);
      var privProj = templates.privateProject,
          privRole = templates.privateRole,
          delegate = templates.delegatedProject,
          user = {},
          objs = [],
          timestamp = (new Date()).toISOString(),
          toReturn = {};
      
      privProj._id = uuids[0];
      toReturn.privateProject = uuids[0];
      privProj.responsible = userData.appId;
      privProj.users = [userData.appId];
      privProj.assignments = [{
        username: userData.appId,
        role: uuids[1],
        status: "ACCEPTED"
      }];
      privProj.created = timestamp;
      privProj.creator = userData.appId;
      
      objs.push(privProj);
      
      privRole._id = uuids[1];
      toReturn.privateRole = uuids[1];
      privRole.project = uuids[0];
      privRole.username = userData.appId;
      
      objs.push(privRole);
      
      delegate._id = uuids[2];
      toReturn.delegatedProject = uuids[2];
      delegate.responsible = userData.appId;
      delegate.users = [userData.appId];
      delegate.assignments = [{
        username: userData.appId,
        role: "RESPONSIBLE",
        status: "ACCEPTED"
      }];
      delegate.created = timestamp;
      delegate.creator = userData.appId;
      
      objs.push(delegate);
      
      user._id = uuids[3];
      toReturn.user = uuids[3];
      user.first = userData.firstName;
      user.last = userData.lastName;
      user.email = userData.email;
      user.app = userData.appId;
      user.docType = "user";
      user.isTemplate = false; 
      user.created = timestamp;
      user.creator = userData.appId;
      
      objs.push(user);
      //console.log("appObjects", objs);
      db.save(objs, function(err, res){
        if (err){
          fn(err, false);
        } else {
          fn(null, toReturn);
        }
      });
    }
  });
  
};
