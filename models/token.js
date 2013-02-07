/* Coordel Token
  A token is used in the authentication process
*/
var config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    redisOpts   = settings.config.redisOptions,
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host);
    
//authenticate the redis client
redis.auth(redisOpts.auth);


module.exports = function() {

  var Token;

  var Schema = {
    properties: {
      // enter any properties required for validation here
    }
  };

  Token = {

    find: function(username, fn){
      var key = 'token:' + username.toLowerCase();

      redis.hgetall(key, function(e, o){
        if (e){
          return fn('not_found');
        } else {
          return fn(null, o);
        }
      });
    },

    randomToken: function(){
      return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    refresh: function(token){
      return {
        username: token.username.toLowerCase(),
        token: this.randomToken(),
        series: token.series
      };
    },

    generate: function(username){
      var token = {
        username: username.toLowerCase(),
        token: this.randomToken(),
        series: this.randomToken()
      };
      this.save(token, function(){});
      return token;
    },

    save: function(token, fn){
      var multi = redis.multi()
        , key = 'token:' + token.username.toLowerCase();

      multi.hset(key, 'username', token.username.toLowerCase());
      multi.hset(key, 'token', token.token);
      multi.hset(key, 'series', token.series);
      multi.exec(function(e, o){
        if (e) fn(e, false);
        fn(null, true);
      });
      
    },

    remove: function(username, fn){
      var key = 'logintoken:' + username.toLowerCase()
        , multi = redis.multi();

      multi.hdel(key, 'username');
      multi.hdel(key, 'token');
      multi.hdel(key, 'series');
      multi.exec(function(e, o){
        if (e) return fn(e, false);
        fn(null, true);
      });
    }
  };

  return Token;

};