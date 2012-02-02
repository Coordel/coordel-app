
var couch, redis;

exports.setRedis = function(client){
  redis = client;
};

exports.setCouch = function(db){
  couch = db;
};

function addApp(userData, callback){
  
}

function addCouchObjects(userData, callback){
  
}

exports.inviteCoordelUser = function(userData, promise){
  
};

exports.addCoordelUser = function(userData, callback){
  //this adds a new user to the coordel users redis store
  console.log("adding user to redis store");
  
  var id = redis.incr('userKeys', function(err, id){
    if (err){
      
    } else {
      //create an app
      
      //add the user
      promise.fulfill("test", userData);
    }
  });
};

exports.getCoordelUser = function(login, callback){
  //this gets the user from the users redis store based on the login provided
  console.log("getting user from redis store");
  
  redis.sismember(['coordel-users', 'user:' + login], function(err, reply) {
    console.log("after testing  sismember", err, reply);
    if (err){
      //no user
      console.log("error getting user from store", err);
      callback(err, false);
    } else if (!reply){
      console.log("user didn't exist");
      callback("user didn't exist", false);
    } else if (reply) {
      console.log("user existed, loading");
      redis.get('user:' + login, function(err, user){
        if (err){
          console.log("couldn't load existing user from store");
          callback(err, false);
        } else {
          console.log("found the user");
          callback(false, user);
        }
      }); 
    }
  });
  
  /*
  var user = {
    id: "test" + login,
    first: "first",
    last: "last",
    email: login,
    password: "password"
  };
  promise.fulfill(user);
  */
};

exports.addCoordelUser = function(userData, promise){
  
  //create app in redis
  console.log("creating app in redis");
  
  //create profile, private proj and role, and delegated project in couch
  console.log("adding profile, priv proj and role, and del proj to couch");
  
  promise.fulfill("test", userData);
};

exports.getTwitterUser = function(redis, userData, promise){
  //either returns an existing app or creates a new one and returns it

  
  var data = {
    id: userData.id,
    first: userData.name.split(" ")[0],
    last: userData.name.split(" ")[1]
  };
  
  console.log("TWITTER DATA: ", data);
  promise.fulfill(data);
  
  //since this is a twitter login, try and get this user's twitter id from the twitter db

  //if we get it, get the app associated with this profile
  
  //there isn't a user, create an new app for this twitter id

  //return the app id
  
};

exports.getFacebookUserApp = function(redis, userData, promise){
  //either returns an existing app or creates a new one and returns it
  
  
  var data = {
    id: userData.id,
    first: userData.first_name,
    last: userData.last_name,
    email: userData.email
  };
  
  //console.log("FACEBOOK DATA: ", data);
  promise.fulfill(data);
  
  //since this is a twitter login, try and get this user's twitter id from the twitter db

  //if we get it, get the app associated with this profile
  
  //there isn't a user, create an new app for this twitter id

  //return the app id
  
};
