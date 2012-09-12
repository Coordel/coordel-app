var App         = require('./userApp'),
    config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    data        = {},
    Invite      = require('./invite'),
    Email       = require('./../lib/emailer');
    
//authenticate the redis client
redis.auth(redisOpts.auth);

var User = exports = module.exports = function User(args){
  data.id = args.email.toLowerCase();
  data.appId = args.appId;
  data.firstName = args.firstName;
  data.lastName = args.lastName;
  data.email = args.email.toLowerCase();
  data.password = args.password;
  data.invited = args.invited || 0;
};

User.prototype.add = function(fn){
  _save(data, function(err, res){
    if (err){
      fn(err, false);
    } else {
      fn(null, true);
    }
  });
};

User.prototype.update = function(fn){
  _save(data, function(err, res){
    if (err){
      fn(err, false);
    } else {
      fn(null, true);
    }
  });
};

exports.remove = function(id, fn){
  var key = 'coordel-users';
  var multi = redis.multi();
  multi.srem(key, 'user:'+id);
  multi.exec(function(err, reply){
    if (err) return fn(err, false);
    return fn(null, reply);
  });
};

User.prototype.destroy = function(fn){
  exports.destroy(data.id, fn);
};



exports.emailAlert = function(id, alert, fn){
  //use the id to get the userpreferences from couch
  
  //send the email with the user prefs and alert
  
  Email.send({
    to: alert.to.email.toLowerCase(),
    from: alert.from.email.toLowerCase(),
    subject: alert.subject,
    template: template,
    data: data
    }, function(err, res){
      console.log("ERROR SENDING EMAIL", err);
  });
};

exports.register = function(userData, fn){
  var multi = redis.multi();
  multi.incr('userKeys');
  multi.incr('appKeys');
  
  multi.exec(function(err, ids){
    if (err) fn(err, false);
    
    userData.userId = ids[0];
    userData.appId = ids[1];
    //console.log("REGISTERING: ", userData);
    var user = new User(userData);
    user.add(function(err, user){
      if (err) {
        fn(err, false);
      } else {
        //add the default objects (private project, private role, delegated project, user profile)
        App.addAppObjects(userData, function(err, objIds){
          //console.log('OBJECT IDS', objIds);
          //add the app with the returned ids of the default objects
          var app = new App({
            id : userData.appId,
            user: objIds.user,
            email: userData.email.toLowerCase(),
            firstName : userData.firstName,
            lastName : userData.lastName,
            myDelegatedProject : objIds.delegatedProject,
            myPrivateProject : objIds.privateProject,
            myPrivateRole : objIds.privateRole,
            people: [userData.appId]
          });
          app.add(function(err, reply){
            if (err){
              fn(err, false);
            } else {
              User.get(userData.email.toLowerCase(), function(err, registered){
                if (err){
                  fn(err, false);
                } else {
                  fn(null, registered);
                }
              });
            }
          });
        });
      }
    });
  });
};

exports.invite = function(inviteData, fn){
  
  //console.log("invite data", inviteData);
      
  function rand(digits){
    return Math.floor(Math.random()* parseInt(digits+1, 10));
  }
  
  var year = (1970 + rand(500)),
      month = rand(11),
      day = rand(28),
      hour = rand(23),
      min = rand(59),
      sec = rand(59),
      mills = rand(999);
  
  var dt = new Date(year, month, day, hour, min, sec, mills);
  
  var time = dt.getTime().toString(),
      password = new Buffer(time).toString('base64'),
      self = this;
      
  //this is an invitation and won't have a password so use the generated one
  inviteData.password = password;     
  
  //check if the user exists
  this.get(inviteData.to.email.toLowerCase(), function(err, user){
    if (!err && user){
      if (user.invited){
        fn(inviteData.to.firstName + ' ' + inviteData.to.lastName + ' already invited to Coordel', false);
      } else {
        fn(inviteData.to.firstName + ' ' + inviteData.to.lastName + ' already joined Coordel', false);
      }
    } else if (err){
      if (err !== "Login not found"){
        fn(err, false);
      } else {
        //register the user
        self.register({
          email: inviteData.to.email.toLowerCase(),
          firstName: inviteData.to.firstName,
          lastName: inviteData.to.lastName,
          password: password,
          invited: true
        }, function(err, registeredUser){
          if (err){
            fn(err, false);
          } else {
            //add an invitation with a new id to track that the user has been invited
            redis.incr('inviteKeys', function(err, inviteid){
              if (err){
                fn(err, false);
              } else {
                var i = new Invite({
                  id: inviteid,
                  to: inviteData.to.email.toLowerCase(),
                  from: inviteData.from.appId
                });
                i.add(function(err, reply){
                  if (err){
                    fn(err, false);
                  } else {
                    //console.log("registered user", registeredUser.appId, inviteData.from.appId);
                    //don't send back the password
                    delete registeredUser.password;
                    
                    //add each person to the other's people list
                    var multi = redis.multi(),
                        uKey = 'coordelapp:' + inviteData.from.appId + ':people',
                        pKey = 'coordelapp:' + registeredUser.appId + ':people';

                    multi.sadd(uKey, registeredUser.appId);
                    multi.sadd(pKey, inviteData.from.appId);
                    multi.exec();
                    
                    fn(null, registeredUser);
                    var template =  './lib/templates/invite.txt';
                    if (inviteData.template){
                      template = './lib/templates/' + inviteData.template;
                    }
                    if (inviteData.data.docType === 'task'){
                      template = './lib/templates/taskInvite.txt';
                    }
                    
                    var data = {
                      firstName: inviteData.to.firstName,
                      fromFirstName: inviteData.from.firstName,
                      fromLastName: inviteData.from.lastName,
                      inviteId: inviteid,
                      name: inviteData.data.name
                    };
                    
                    if (inviteData.data.purpose){
                      data.purpose = inviteData.data.purpose;
                    }
                    
                    if (inviteData.data.deadline){
                      data.deadline = inviteData.data.deadline;
                    }
                    
                    if (inviteData.data.calendar){
                      data.start = inviteData.data.calendar.start;
                    }
                    
                    
                    Email.send({
                      to: inviteData.to.email.toLowerCase(),
                      from: inviteData.from.email.toLowerCase(),
                      subject: inviteData.subject,
                      template: template,
                      data: data
                      }, function(err, res){
                        console.log("ERROR SENDING EMAIL", err);
                    });
                  }
                });
              }
            });
          }
        });
      }
    } 
  });
};

exports.get = function(id, fn){
  //this defaults to getting a coordel user which uses email as the id. use specific functions otherwise
  _getUser({authGroup: 'coordel-users', id: id}, function(err, user){
    if (err) return fn(err, false);
    return fn(null, user);
  });
};

function _save(user, fn){
  if (user.id && user.appId && user.email && user.password){
    //console.log('adding user to redis store in _save', user);
    var multi = redis.multi(),
        key = 'user:' + user.email.toLowerCase();
        
    multi.hset(key, 'id', user.id);
    multi.hset(key, 'appId', user.appId);
    multi.hset(key, 'email', user.email.toLowerCase());
    multi.hset(key, 'password', user.password);
    multi.hset(key, 'invited', user.invited);
    if (user.firstName) multi.hset(key, 'firstName', user.firstName);
    if (user.lastName) multi.hset(key, 'lastName', user.lastName);
    multi.sadd('coordel-users', key);
    multi.exec(function(err, replies){
      if (err) fn(err, false);
      fn(null, true);
    });
  } else {
    fn("Invalid User", false);
  }
}

function _getUser(args, fn){
  //args will have authGroup and id
  //this function loads the user from the correct group [coordel, facebook, twitter, etc]
  redis.sismember([args.authGroup, 'user:' + args.id], function(err, reply) {
    //console.log("after testing  sismember", err, reply);
    if (err){
      //no user
      //console.log("error getting user from store", err);
      fn(err, false);
    } else if (!reply){
      //console.log("user didn't exist");
      fn("Login not found", false);
    } else if (reply) {
      //console.log("user existed, loading");
      var key = 'user:' + args.id;
      //console.log("USER GET KEY", key);
      redis.hgetall(key, function(err, user){
        //console.log("USER", user);
        if (err){
          //console.log("couldn't load existing user from store",err);
          fn(err, false);
        } else {
          //console.log("found the user", user);
          fn(false, user);
        }
      }); 
    }
  });
}

function _getProviderUser(args, fn){
  _getUser(args, function(err, user){
    //console.log('getting ' + args.provider + ' user', err, user);
      if (err && err !== 'Login not found'){
        fn(err, false);
      } else if (user){
        fn(null, user);
      } else if (err === 'Login not found') {
      //console.log('registering new facebook user');
      User.register(args.userData, function(err, regUser){
        if (err){
          fn(err, false); 
        } else {
          fn(null, regUser);
        } 
      });
    }
  });
}

exports.getFacebookUser = function(userData, fn){
  //either returns an existing app or creates a new one and returns it
  
  var data = {
    id: userData.id,
    first: userData.first_name,
    last: userData.last_name,
    email: userData.email.toLowerCase()
  };
  
  //this is facebook, so load the user from facebook
  _getProviderUser({authGroup: 'facebook', id: data.id, userData: data}, function(err, user){
    if (err){
      fn(err, false);
    } else {
      fn(null, user);
    } 
  });
};

exports.getLinkedinUser = function(userData, fn){
  //either returns an existing app or creates a new one and returns it
  //console.log("LINKEDIN", userData);
  
  var data = {
    id: userData.id,
    first: userData.firstName,
    last: userData.lastName
  };
  
  //this is linkedin, so load the user from linkedin
  _getProviderUser({authGroup: 'linkedin', id: data.id, userData: data}, function(err, user){
    if (err){
      fn(err, false);
    } else {
      fn(null, user);
    } 
  });
};

exports.getGoogleUser = function(userData, fn){
  //either returns an existing app or creates a new one and returns it
  //console.log("GOOGLE", userData);
  
  var data = {
    id: userData.id,
    first: userData.firstName,
    last: userData.lastName,
    email: userData.email.toLowerCase()
  };
  

  //this is linkedin, so load the user from linkedin
  _getProviderUser({authGroup: 'google', id: data.id, userData: data}, function(err, user){
    if (err){
      fn(err, false);
    } else {
      fn(null, user);
    } 
  });

};