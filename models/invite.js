var settings    = require('./../settings'),
    redisOpts   = settings.config.redisOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host);
    
//authenticate the redis client
redis.auth(redisOpts.auth);

var Invite = exports = module.exports = function Invite(args){
  //an invite has a to and from and date
  this.id = args.id;
  this.to = args.to;
  this.from = args.from;
  this.created = (new Date()).toISOString();
};

Invite.prototype.add = function(fn){
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
