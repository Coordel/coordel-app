var config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    templates   = require('./../templates'),
    data        = {},
    _           = require('underscore');
    
//authenticate the redis client
redis.auth(redisOpts.auth);

var App = exports = module.exports = function App(args){
  
  console.log("userApp args", args);
  //auths, contacts, defaultTemplatesLoaded, deliverableTemplates, email, firstName, lastName, license, 
  //myDelegatedProject, myPrivateProject, myPrivateRole,  notifications, vips 
  data.id = args.id;
  data.user = args.user;
  data.email = args.email.toLowerCase();
  data.auths = args.auths;
  data.people = args.people || [args.id];
  data.defaultTemplatesLoaded = args.defaultTemplatesLoaded || false;
  data.firstName = args.firstName || '';
  data.lastName = args.lastName || '';
  data.license = args.license || '';
  data.myDelegatedProject = args.myDelegatedProject;
  data.myPrivateProject = args.myPrivateProject;
  data.myPrivateRole = args.myPrivateRole;
  data.vips = args.vips;
  
  
  
  //handle the incoming preferences
  if (args.suppressEmail){
    data.suppressEmail = args.suppressEmail;
  } else {
    delete data.suppressEmail;
  }
  
  if (args.dndActive){
    data.dndActive = args.dndActive;
  } else {
    delete data.dndActive;
  }
  
  if (args.showQuickStart){
    data.showQuickStart = args.showQuickStart;
  } else {
    delete data.showQuickStart;
  }
  
  //console.log("in userapp", data);
};

App.prototype.add = function(fn){
  _save(data, function(err, res){
    if (err){
      fn(err, false);
    } else {
      fn(null, true);
    }
  });
  
};

App.prototype.update = function(fn){
  //console.log("updating app", data);
  _save(data, function(err, res){
    if (err){
      fn(err, false);
    } else {
      fn(null, true);
    }
  });
};

exports.remove = function(id, fn){
  var key = 'coordel-apps';
  var multi = redis.multi();
  multi.srem(key, 'coordelapp:'+id);
  multi.exec(function(err, reply){
    if (err) return fn(err, false);
    return fn(null, reply);
  });
};

function _save(app, fn){
  if (data.id && data.user && data.firstName && data.lastName && 
      data.myDelegatedProject && data.myPrivateProject && data.myPrivateRole){
    //console.log('adding coordelapp to redis store', this);
    var multi = redis.multi(),
        key = 'coordelapp:' + data.id;
        
    multi.hset(key, 'id', data.id);
    
    if (data.auths){
      //{facebook: {key: 1, key:2}, linkedin: {key:1, key:2}}
      //hget coordelapp:1 auths:facebook -> {key:1, key:2}
      for (var a in data.auths){
        multi.hset(key, 'auths:' + a, JSON.stringify(data.auths[a]));
      }
    }
    
    if (data.people && data.people.length){
      var peopleKey = key + ':people';
      
      data.people.forEach(function(p){
        //console.log("ADD PERSON, KEY ", peopleKey, p);
        multi.sadd(peopleKey, p);
      });
    }
    
    multi.hset(key, 'defaultTemplatesLoaded', data.defaultTemplatesLoaded);
    multi.hset(key, 'email', data.email);
    multi.hset(key, 'firstName', data.firstName);
    multi.hset(key, 'lastName', data.lastName);
    multi.hset(key, 'user', data.user);
    multi.hset(key, 'myDelegatedProject', data.myDelegatedProject);
    multi.hset(key, 'myPrivateProject', data.myPrivateProject);
    multi.hset(key, 'myPrivateRole', data.myPrivateRole);
    
    var vipsKey = key + ':vips';
    if (data.vips && data.vips.length > 0){
      multi.del(vipsKey);
      data.vips.forEach(function(v){
        //console.log("adding vip", v);
        multi.sadd( vipsKey, v);
      });
    } else {
      //console.log("deleting vips");
      multi.del(vipsKey);
    }
  
    if (data.suppressEmail){
      multi.hset(key,'suppressEmail', data.suppressEmail);
    } else {
      multi.hdel(key,'suppressEmail');
    }
    
    if (data.dndActive){
      multi.hset(key,'dndActive', data.dndActive);
    } else {
      multi.hdel(key,'dndActive');
    }
    
    if (data.showQuickStart){
      multi.hset(key,'showQuickStart', data.showQuickStart);
    } else {
      multi.hdel(key,'showQuickStart');
    }

    multi.sadd('coordel-apps', key);
    multi.exec(function(err, replies){
      
      if (err) fn(err, false);
      //console.log("_save replies", replies);
      fn(null, true);
    });
  } else {
    fn('App is not valid. id, user, firstName, lastName, ' +
        'myDelegatedProject, myPrivateProject, and myPrivateRole are all required', false);
  }
}

exports.get = function(id, fn){
  //id will be the email of the person invited
  redis.sismember(['coordel-apps', 'coordelapp:' + id], function(err, reply) {
    //console.log("after testing  sismember", err, reply);
    if (err){
      //problem with getting invite 
      //console.log("error getting invite from store", err);
      fn(err, false);
    } else if (!reply){
      //console.log("invite didn't exist");
      fn("App not found", false);
    } else if (reply) {
      //console.log("invite existed, loading");
      var key = 'coordelapp:' + id;
      //console.log("key for get", key);
      redis.hgetall(key, function(err, app){
        if (err){
          //console.log("couldn't load existing invite from store",err);
          fn(err, false);
        } else {
          
          //now we need to get the vips
          var vipKey = key+':vips';
          //console.log('vipKey', vipKey);
          redis.smembers(vipKey, function(err, vips){
            if (vips && vips.length > 0){
              app.vips = vips;
            }
            //console.log("found the app", app);
            var tLoaded = app.defaultTemplatesLoaded;
            //redis converts boolean values to strings, so need to convert them to bool on return
            //this might be a problem!
            if (!JSON.parse(app.defaultTemplatesLoaded)){
              //create the default templates for the user
              db.view('coordel/defaultTemplates',{}, function(err, templates){
                if (err){
                  console.log("ERROR loading default templates", err);
                } else {
                  var userTemplates = [];
                  templates.forEach(function(t){
                    //get rid of _id, _rev, default and public
                    delete t._id;
                    delete t._rev;
                    delete t.isPublic;
                    delete t.isDefault;
                    //add the username and flag as user template
                    t.username = app.id;
                    t.isUserTemplate = true;
                    t.isActive = true;
                    userTemplates.push(t);
                  });

                  db.save(userTemplates,function(err, reply){
                    if (err){
                      console.log("ERROR saving default user templates", err);
                    } else {
                      app.defaultTemplatesLoaded = true;
                      var newApp = new App(app);
                      newApp.update(function(err, reply){
                        if (err){
                          console.log("ERROR updating defaultTemplatesLoaded", err);
                        } else {
                          fn(false, app);
                        }
                      });
                    }
                  });
                }
              });
            } else {
              fn(false, app);
            }
          });
        }
      }); 
    }
  });
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
      privProj.responsible = userData.appId.toString();
      privProj.users = [userData.appId.toString()];
      privProj.assignments = [{
        username: userData.appId.toString(),
        role: uuids[1],
        status: "ACCEPTED"
      }];
      privProj.created = timestamp;
      privProj.creator = userData.appId.toString();
      privProj.updated = timestamp;
      privProj.updater = userData.appId.toString();
      
      objs.push(privProj);
      
      privRole._id = uuids[1];
      toReturn.privateRole = uuids[1];
      privRole.project = uuids[0];
      privRole.username = userData.appId.toString();
      privRole.isNew = false;
      privRole.created = timestamp;
      privRole.creator = userData.appId.toString();
      privRole.updated = timestamp;
      privRole.updater = userData.appId.toString();
      
      objs.push(privRole);
      
      delegate._id = uuids[2];
      toReturn.delegatedProject = uuids[2];
      delegate.responsible = userData.appId.toString();
      delegate.users = [userData.appId.toString()];
      delegate.assignments = [{
        username: userData.appId.toString(),
        role: "RESPONSIBLE",
        status: "ACCEPTED"
      }];
      delegate.created = timestamp;
      delegate.creator = userData.appId.toString();
      delegate.updated = timestamp;
      delegate.updater = userData.appId.toString();
      
      objs.push(delegate);
      
      user._id = uuids[3];
      toReturn.user = uuids[3];
      user.first = userData.firstName;
      user.last = userData.lastName;
      user.email = userData.email.toLowerCase();
      user.app = userData.appId.toString();
      user.docType = "user";
      user.isTemplate = false; 
      user.created = timestamp;
      user.creator = userData.appId.toString();
      user.updated = timestamp;
      user.updater = userData.appId.toString();
      
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


exports.getContacts = function(appId, fn){
  db.view("coordel/userContacts", {
    group: true,
    startkey: [appId],
    endkey: [appId, {}]
  },
  function(err, rows){
    if (err) return fn(err, false);
    var contacts = [];
    rows.forEach(function(row){
      contacts.push(row.key[1]);
    });
    return fn(null, contacts);
  });
};

exports.updateContacts = function(appId, fn){
  //this function is called when the app is loaded to make sure contacts are up to date
  this.getContacts(appId, function(err, contacts){
    if (err){
      fn(err, false);
    } else {
       var key = 'coordelapp:'+ appId+':people';

       if (contacts.length > 0){
        var multi = redis.multi();
        contacts.forEach(function(contact){
          //console.log("add contact", contact);
          multi.sadd(key, contact);
        });
        multi.exec(function(err, reply){
          if (err) return fn(err, false);
          return fn(null, true);
        });
      } else {
        fn(null, true);
      }
    }
  });
};


exports.getVips = function(appId, fn){
  getUserApps(appId, 'vips', function(err, vips){
    if (err) return fn(err, false);
    return fn(null, vips);
  });
};

exports.getPeople = function(appId, fn){
  //console.log("getPeople", appId);
  getUserApps(appId, 'people', function(err, people){
    if (err) return fn(err, false);
    return fn(null, people);
  });
};

function getPeople(key, fn){
  //console.log("GET PEOPLE", key);
  var arr = redis.smembers(key, function(err, keyArr){
    //console.log("after getKeyArray", err, keyArr);
    if (err) return fn(err, false);
    return fn(null, keyArr);
  });
}


function getUserApps(appId, field, fn){
  var multi = redis.multi();
  var key = 'coordelapp:'+appId+':' + field;
  getPeople(key, function(err, appIds){
    if (!appIds) appIds = [];
    
    //console.log('appIds', appIds);

    appIds.forEach(function(id){
      var akey = 'coordelapp:' + id;
      //console.log("GET USER APP FOR KEY", akey);
      multi.hgetall(akey);
    });

    multi.exec(function(err, apps){
      if (err) return fn(err, false);
      
      //need to make sure that there aren't any nulls
      apps = _.filter(apps, function(a){
        return a;
      });
      return fn(null, apps);
    });
  });
}

exports.addVip = function(args, fn){
  //args will have the appId of the vip and the appId of the user adding the vip
  var key = 'coordelapp:'+ args.userAppId+':vips';
  redis.sadd(key, args.personAppId, function(err, reply){
    if (err) return fn(err, false);
    return fn(null, reply);
  });
};

exports.addPerson = function(args, fn){
  //args will have the appId of the person and the appId of the user adding the person
  var key = 'coordelapp:'+ args.userAppId+':people';
  var multi = redis.multi();
  multi.sadd(key, args.personAppId);
  multi.exec(function(err, reply){
    if (err) return fn(err, false);
    return fn(null, reply);
  });
};

exports.remPerson = function(args, fn){
  //args will have the appId of the person and the appId of the user adding the person
  var key = 'coordelapp:'+ args.userAppId+':people';
  var multi = redis.multi();
  multi.srem(key, args.personAppId);
  multi.exec(function(err, reply){
    if (err) return fn(err, false);
    return fn(null, reply);
  });
};



