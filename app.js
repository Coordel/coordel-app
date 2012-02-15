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
    settings    = require('./settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    RedisStore  = require('connect-redis')(express),
    store       = require('redis').createClient(redisOpts.port, redisOpts.host),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch       = cn.database(settings.config.couchName),
    ddoc        = require('./couchdb/ddoc'),
    follow      = require('follow'),
    everyauth   = require('everyauth'),
    app         = module.exports = express.createServer(),
    io          = require('socket.io').listen(app),
    util        = require('util'),
    Promise     = everyauth.Promise,
    User        = require('./models/user'),
    Alert       = require('./models/alert'),
    nls         = require('i18n'),
    passHash    = require('password-hash'),
    loggly      = require('loggly'),
    log         = loggly.createClient(settings.config.logglyOptions),
    home        = true;
    
//settings.auth contains all the security strings 
var auth = settings.auth;

//set io log level
io.set('log level', 1);

//make sure the couchdb dbase exists and that the design doc has the latest views
ddoc.update();

//configure everyauth
everyauth.everymodule.logoutRedirectPath('/login');

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('users/login', {layout: 'users/layout'})
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var promise = new Promise();
      User.get(login, function(err, user){
        console.log("USER", user);
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
    .registerView('users/register', {layout: 'users/layout'})
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
      newUserAttrs.invited = 0;
      User.register(newUserAttrs, function(err, user){
        console.log("REGISTERED USER", user);
        if (err) return promise.fulfill([err]);
        return promise.fulfill(user);
      });
  
      return promise;
    })

    .loginSuccessRedirect('/web')
    .registerSuccessRedirect('/web');


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
  .redirectPath('/web');

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
  .redirectPath('/web');
  
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
  .redirectPath('/web');

//authenticate the redis clients
store.auth(redisOpts.auth);

//express redis store options 
var options = {
  client: store,
  db: redisOpts.db,
  prefix: redisOpts.expressSessionPrefix
 };

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  //app.use(express.logger());
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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.register('.html', require('ejs'));

var validate = function(req, res, next){
  
  if (req.session.auth && req.session.auth.loggedIn){
    next();
  } else {
    req.session.auth = {};
    req.session.auth.loggedIn = true;
    req.session.auth.userId = 'jeff.gorder@coordel.com';
    next();
    //res.redirect('/login');
  }
};

// Routes
require('./routes/users')(app, validate); //login, registration, invites
require('./routes/userApp')(app, validate); //app settings, people, vips
require('./routes/clients')(app, validate); //web NOTE provide acces to others (i.e. mobile)
require('./routes/coordeldb')(app, validate); //all couch access
require('./routes/admin')(app, validate);//admin features

//root 
app.get('/', function(req, res){
  if (home){
    home = false;
    if (req.query.p){
      //this is a request for a page
      res.render('corp/page/' + req.query.p, {layout: 'corp/page'});
    } else {
      //show the home page
      res.render('corp/home/content-a', {layout: 'corp/home', color: 'c-bg-purple'});
    }
  } else {
    home = true;
    if (req.query.p){
      //this is a request for a page
      res.render('corp/page/' + req.query.p, {layout: 'corp/page'});
    } else {
      //show the alt home page
      res.render('corp/home/content-b', {layout: 'corp/home', color: 'c-bg-green'});
    }
    
  }
});

/* *********************************************** CHANGES AND ALERTS ****************************/

var changesIO = io.sockets.on('connection', function (client) {
  
});

//Get the the update sequence of the dbase
couch.info(function(err, info){
  var since = info.update_seq;
  //start the changes stream using the latest sequence
  var dbUrl = 'http://'+ couchOpts.host + ':' + couchOpts.port + '/' + settings.config.couchName;
  //console.log("URL", dbUrl);
  follow({db:dbUrl, since: since, include_docs:true}, function(error, change) {
    if(!error) {
      var map = Alert.getChangeAlertMap(change.doc);
      //console.log("ALERT MAP", map);
      for (var key in map){
        //console.log("ALERT TO", key);
        changesIO.emit('changes:' + key, change.doc);
      }
    } 
  });
});

/* ****************************  UTILITY DELETE FOR PRODUCTION  *************************/

app.get('/flushdb', function(req, res){
  store.flushdb();
  console.log('redis flushed');
  couch.destroy();
  couch.create();
  console.log('couch recreated');
  delete req.session.auth;
  res.redirect('/admin');
});

app.get('/loadTemplates', function(req, res){
  var templates = require('./couchdb/defaultTemplates');
  couch.save(templates, function(err, reply){
    if (err) {
      console.log("ERROR adding temlates");
      res.redirect('/admin');
    } else {
      console.log("Loaded default templates");
      res.redirect('/admin');
    }
  });
});
/* ************************************************************************************/

everyauth.helpExpress(app);
app.listen(8080);
console.log("Coordel App Server listening on port %d in %s mode", app.address().port, app.settings.env);
