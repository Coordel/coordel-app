var CoordelApp = require('./coordelapp');

var redis;

var User = exports = module.exports = function User(args){
  this.id = args.email;
  this.appId = args.appId;
  this.userId = args.userId;
  this.firstName = args.firstName;
  this.lastName = args.lastName;
  this.email = args.email;
  this.password = args.password;
};

exports.setRedis = function(client){
  redis = client;
};

User.prototype.add = function(fn){
  
  if (this.id && this.appId && this.email && this.password){
    //console.log('adding user to redis store', this);
    var multi = redis.multi(),
        key = 'user:' + this.email;
        
    multi.hset(key, 'id', this.id);
    multi.hset(key, 'appId', this.appId);
    multi.hset(key, 'userId', this.userId);
    multi.hset(key, 'email', this.email);
    multi.hset(key, 'password', this.password);
    if (this.firstName) multi.hset(key, 'firstName', this.firstName);
    if (this.lastName) multi.hset(key, 'lastName', this.lastName);
    multi.sadd('coordel-users', key);
    multi.exec(function(err, replies){
      if (err) fn(err, false);
      
      
      fn(null, true);
    });
  } else {
    fn("not valid user", false);
  }
};

User.prototype.update = function(user, fn){

};

User.prototype.validate = function(data, fn){
  
};

User.prototype.destroy = function(fn){
  exports.destroy(this.id, fn);
};

exports.register = function(userData, fn){
  var multi = redis.multi();
  multi.incr('userKeys');
  multi.incr('appKeys');
  
  multi.exec(function(err, ids){
    if (err) fn(err, false);
    
    userData.userId = ids[0];
    userData.appId = ids[1];
    console.log("REGISTERING: ", userData);
    var user = new User(userData);
    user.add(function(err, user){
      if (err) return fn(err, false);
      return fn(null, userData);
    });
  });
};

exports.invite = function(userData, fn){
  //register the user with the incoming userData
  
  //create an invitation with a new id to track that the user has been invited
  
  //create a url to place in the user invitation email based on the user and invite
  
  //send the user an email with the link
  
};

exports.get = function(id, fn){
  //this defaults to getting a coordel user. use specific functions otherwise
  _getUser({authGroup: 'coordel-users', id: id}, function(err, res){
    if (err) return fn(err, false);
    return fn(null, res);
  });
};

function _getUser(args, fn){
  //args will have authGroup and id
  //this function loads the user from the correct group [coordel, facebook, twitter, etc]
  redis.sismember([args.authGroup, 'user:' + args.id], function(err, reply) {
    console.log("after testing  sismember", err, reply);
    if (err){
      //no user
      console.log("error getting user from store", err);
      fn(err, false);
    } else if (!reply){
      console.log("user didn't exist");
      fn("Login not found", false);
    } else if (reply) {
      console.log("user existed, loading");
      var key = 'user:' + args.id;
      //console.log("key for get", key);
      redis.hgetall(key, function(err, user){
        if (err){
          console.log("couldn't load existing user from store",err);
          fn(err, false);
        } else {
          console.log("found the user", user);
          fn(false, user);
        }
      }); 
    }
  });
}

function _getProviderUser(args, fn){
  _getUser(args, function(err, user){
    console.log('getting ' + args.provider + ' user', err, user);
      if (err && err !== 'Login not found'){
        fn(err, false);
      } else if (user){
        fn(null, user);
      } else if (err === 'Login not found') {
      console.log('registering new facebook user');
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
    email: userData.email
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
  console.log("GOOGLE", userData);
  
  var data = {
    id: userData.id,
    first: userData.firstName,
    last: userData.lastName,
    email: userData.email
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