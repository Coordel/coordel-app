/**
 * Module dependencies.
 * 
 * Redis generates user.id and appId at userKeys and appKeys
 *
 * CRADLE WARNING: in cradle/lib/cradle.js, the key, startkey, and endkey options were JSON.stringified
 * which caused those parameters not to work. Had to comment out line 510 to stop that. make sure that if 
 * cradle is updated that that is either changed in the cradle code or that it is recommented
 */

var express     = require('express'),
    settings      = require('./config'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    RedisStore  = require('connect-redis')(express),
    redis       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch       = cn.database(settings.config.couchName),
    everyauth   = require('everyauth'),
    app         = module.exports = express.createServer(),
    util        = require('util'),
    Promise     = everyauth.Promise,
    User        = require('./models/user'),
    CoordelApp  = require('./models/coordelapp'),
    nls         = require('i18n'),
    passHash    = require('password-hash');
    

//set the redis and couch properties on the users
User.setRedis(redis);
CoordelApp.setRedis(redis);

//settings.auth contains all the security strings 
var auth = settings.auth;

//configure everyauth email
/*
everyauth.everymodule
  .findUserById( function (id, fn) {
    User.get(id, function(err, res){
      if (err) return fn([err], false);
      return fn(null, res);
    });
  });
*/

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login')
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var promise = new Promise();
      User.get(login, function(err, user){
        if (err) promise.fulfill([err]);
        if (user.password !== password){
          promise.fulfill(['Login failed: invalid username or password']);
        }
        promise.fulfill(user);
      });
      return promise;
    })
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register')
    .extractExtraRegistrationParams( function (req) { 
      return { 
          firstName: req.body.firstName,
          lastName: req.body.lastName
      }; 
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.email;
      var promise = new Promise();
      User.get(login, function(err, user){
        if (err && err !=='Login not found') errors.push(err);
        if (user) errors.push('Login already taken');
        if (errors.length){
           promise.fulfill(errors);
           return;
        }
        promise.fulfill(true);
      });
      return promise;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      var promise = new Promise();
      
      User.register(newUserAttrs, function(err, user){
        if (err) return promise.fulfill([err]);
        return promise.fulfill(user);
      });
  
      return promise;
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');


everyauth.linkedin
  .consumerKey(auth.linkedin.apiKey)
  .consumerSecret(auth.linkedin.apiSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, linkedinUser) {
    var promise = new Promise();
    User.getLinkedinUser(linkedinUser, function(err, user){
      if (err) promise.fulfill([err]);
      promise.fulfill(user);
    });
    return promise;
  })
  .redirectPath('/');

everyauth.google
  .appId(auth.google.clientId)
  .appSecret(auth.google.clientSecret)
  .scope('https://www.google.com/m8/feeds/')
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;
    var promise = new Promise();
    User.getGoogleUser(googleUser, function(err, user){
      if (err) promise.fulfill([err]);
      promise.fulfill(user);
    });
    return promise;
  })
  .redirectPath('/');
  
//configure everyauth facebook
everyauth.facebook
  .appId(auth.fb.appId)
  .appSecret(auth.fb.appSecret)
  .scope('email')
  .findOrCreateUser(function(session, accessToken, accessTokExtra, fbUserMetadata){
    var promise = new Promise();
    User.getFacebookUser(fbUserMetadata, function(err, user){
      if (err) promise.fulfill([err]);
      promise.fulfill(user);
    });
    return promise;
  })
  .redirectPath('/');
  
//authenticate the redis client
redis.auth(redisOpts.auth);

//express redis store options
var options = {
  client: redis,
  db: redisOpts.db,
  prefix: redisOpts.expressSessionPrefix
 };

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ 
    secret: 'coordelsecretpassword',
    store: new RedisStore(options)
  }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express["static"](__dirname + '/public'));
  
});

app.register('.html', require('ejs'));

function validate(req, res, next){
  if (req.session.auth && req.session.auth.loggedIn){
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', validate, function(req, res){
  //console.log("/GET", req.user, req.session);
  //res.render('index', { user: req.user});
  
  console.log("/GET", req.session.auth);
  res.render('index', {everyauth: everyauth, layout: 'app'});
  
  //res.redirect('http://dev.coordel.com:8095/coordel/view/userTasks?include_docs=true');
  //res.redirect('http://dev.coordel.com:8095/coordel/view/userTasks?startkey=%5B%22jeff.gorder%40coordel.com%22%5D&endkey=%5B%22jeff.gorder%40coordel.com%22%2C%7B%7D%5D&include_docs=true');
  //http://localhost:5984/coordel/_design/coordel/_view/userTasks?startkey=%5B%22jeff.gorder%40coordel.com%22%5D&endkey=%5B%22jeff.gorder%40coordel.com%22%2C%7B%7D%5D&include_docs=true
});

app.get('/login',function(req, res){
  console.log("USER", req.session);
  //res.render('login', {auth: req.session.user});
  res.render('login');
});

app.get('/reset',function(req, res){
  //res.render('login', {auth: req.session.user});
  res.render('reset');
});

app.get('/flushdb', function(req, res){
  redis.flushdb();
  console.log('redis flushed');
  res.redirect('/logout');
});

app.get('/coordel/uuids', function(req, res){
  console.log("UUIDS", req.query.count);
  cn.uuids(req.query.count, function(err, uuids){
    console.log("UUID response", uuids);
    res.json({uuids:uuids});
  });
});

app.get('/coordel/:id', function(req, res){
  console.log('GET ID', req.params.id);
  couch.get(req.params.id, function(err, obj){
    if (err) console.log("ERROR getting " + req.params.id);
    res.json(obj);
  });
});

app.get('/coordel/view/:id', function(req, res){
  var view = req.params.id;
  view = 'coordel/' + view;
  console.log('GET VIEW', view);
  var opts = {};
  console.log('queryString params', req.query);
  for (var key in req.query){
    opts[key] = req.query[key];
  }
  couch.view(view, req.query, function(err, resView){
    var ret = [];
    if (err){
      ret.push({error: err});
    } else {
      console.log("VIEW ROWS", resView);
      resView.rows.forEach(function(row){
        ret.push(row);
      });
    }
    var toReturn = {rows: ret};
    console.log("returning", toReturn);
    res.json(toReturn);
  });
});

app.listen(8095);
console.log("Coordel App Server listening on port %d in %s mode", app.address().port, app.settings.env);
