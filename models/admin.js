var config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    data        = {},
    App         = './userApp';
    
//authenticate the redis client
redis.auth(redisOpts.auth);

exports.getCoordelUsers = function(fn){
  var multi = redis.multi();
  multi.smembers("coordel-users");
  multi.exec(function(err, ids){
    if (err) {
      fn(err, false);
    } else {
      var users = [];
      console.log("ids", ids);
      ids = ids[0];
      ids.forEach(function(key){
        console.log("key", key);
        multi.hgetall(key, function(err, user){
          users.push(user);
        });
      });
      multi.exec(function(err, results){
        //console.log("users", users);
        if (err){
          fn(err, false);
        } else {
          fn(null, users);
        }
      });
    }
  });
};

exports.getCoordelApps = function(fn){
  var multi = redis.multi();
  multi.smembers("coordel-apps");
  multi.exec(function(err, ids){
    if (err) {
      fn(err, false);
    } else {
      var apps = [];
      console.log("ids", ids);
      ids = ids[0];
      ids.forEach(function(key){
        console.log("key", key);
        multi.hgetall(key, function(err, app){
          apps.push(app);
        });
      });
      multi.exec(function(err, results){
        console.log("apps", results);
        if (err){
          fn(err, false);
        } else {
          fn(null, apps);
        }
      });
    }
  });
};

exports.getUserPeople = function(user){
  console.log("in admin getUserPeople", user);
  var a = new App({});
  a.getPeople(user, function(err, people){
    if (err) console.log("error", err);
    console.log("people", people);
  });
};