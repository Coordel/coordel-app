/** 
 * Wrapper to interface with couchdb
 */

var cradle = require('cradle'),
    http = require('http'),
    crypto = require('crypto'); 

var Database = exports.Database = function(name, config){
  if (!name) name = 'coordel';
  
  var setup = config || {
      host: 'localhost',
      port: 5984,
      cache: true, 
      raw: false
    };
  
  cradle.setup(setup);
  
  var cn = new(cradle.Connection);

  var db = cn.database(name);
  
  db.setup = setup;

  db.uuidCache = [];
  
  db.newUUID = function(cacheNum){
    if (cacheNum === undefined) {
      cacheNum = 5;
    }
    if (!db.uuidCache.length > 0) {

      cn.uuids(cacheNum, function(err, cache){
        if (err){
          //"Failed to retrieve UUID batch."
        } else {
          db.uuidCache = cache;
        }
      });
    }
    return db.uuidCache.shift();
  }; 
  
  db.login = function(auth, callback){
    
    var user ={};
    user.id = auth.name;
    user.username = auth.name;
    
    
    var querystring = require('querystring');

    var post_domain = db.setup.host;
    var post_port = db.setup.port;
    var post_path = '/_session';
  
    var post_data = querystring.stringify({
      'name' : auth.name,
      'password': auth.password
    });
    
    var data = auth.name + ":" + auth.password;

    
    var post_options = {
      host: post_domain,
      port: post_port,
      path: post_path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length,
        'Authorization': 'Basic ' + new Buffer(data).toString('base64')
      }
    };

    console.log("post_options", post_options, post_data);

    var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var doc = JSON.parse(chunk);
        
        if (doc.ok){
          user.cookie = res.headers['set-cookie'];
          callback(null, user);
        } else {
          callback(doc, null);
        }
  
      });
    });

    // write parameters to post body
    post_req.write(post_data);
    post_req.end();
  };
  
  db.newUUID();
  return db;
};