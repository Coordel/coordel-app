
var redis;

var CoordelApp = exports = module.exports = function CoordelApp(args){
  //auths, contacts, defaultTemplatesLoaded, deliverableTemplates, email, firstName, lastName, license, 
  //myDelegatedProject, myPrivateProject, myPrivateRole,  notifications, vips 
  
  this.id = args.id;
  this.auths = args.auths;
  this.contacts = args.contacts;
  this.defaultTemplatesLoaded = args.defaultTemplatesLoaded || false;
  this.deliverableTemplates = args.deliverableTemplates;
  this.email = args.email;
  this.firstName = args.firstName || 'None';
  this.lastName = args.lastName || 'Given';
  this.license = args.license || "";
  this.myDelegatedProject = args.myDelegatedProject;
  this.myPrivateProject = args.myPrivateProject;
  this.myPrivateRole = args.myPrivateRole;
  this.vips = args.vips;
};

exports.setRedis = function(client){
  redis = client;
};

CoordelApp.prototype.add = function(fn){
  
  if (this.id && this.email && this.firstName && this.lastName && 
      this.myDelegatedProject && this.myPrivateProject && this.myPrivateRole){
    console.log('adding coordelapp to redis store', this);
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
    fn('CoordelApp is not valid. id, email, firstName, lastName, ' +
        'myDelegatedProject, myPrivateProject, and myPrivateRole are all required', false);
  }
};
