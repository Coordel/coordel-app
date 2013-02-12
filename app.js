/**
 * Module dependencies.
 *
 * Redis generates user.id and appId at userKeys and appKeys
 *
 */

var express   = require('express'),
    config      = require('konphyg')(__dirname + '/config'),
    settings    = config('settings'),
    redisOpts = settings.config.redisOptions,
    couchOpts = settings.config.couchOptions,
    couchName = settings.config.couchName,
    RedisStore  = require('connect-redis')(express),
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch     = cn.database(couchName),
    store     = require('redis').createClient(redisOpts.port, redisOpts.host),
    follow      = require('follow'),
    everyauth = require('everyauth'),
    app       = module.exports = express.createServer(),
    ddoc        = require('./couchdb/ddoc'),
    io          = require('socket.io').listen(app),
    util        = require('util'),
    User        = require('./models/user'),
    Alert     = require('./models/alert'),
    App       = require('./models/userApp'),
    nls       = require('i18n'),
    passHash    = require('password-hash'),
    loggly      = require('loggly'),
    logger      = loggly.createClient(settings.config.logglyOptions),
    logId     = settings.config.logId,
    home        = true,
    fs          = require('fs'),
    source      = JSON.parse(fs.readFileSync(__dirname + '/public/support/source.json', 'utf-8')),
    pages      = JSON.parse(fs.readFileSync(__dirname + '/public/support/pages.json', 'utf-8'));

var auth = settings.auth;

function getBackground(){
  return "bg" + Math.floor((Math.random()*10)+1);
}

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
    .loginView('users/login', {layout: 'users/corp'})
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var promise = this.Promise();
      User.get(login, function(err, user){
        //console.log(logId, "User Login: " + user.email);
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
    .registerView('users/register')
    .extractExtraRegistrationParams( function (req) {
      return {
          firstName: req.body.firstName,
          lastName: req.body.lastName
      };
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.email.toLowerCase();
      var promise = this.Promise();
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

      var promise = this.Promise();
      newUserAttrs.invited = 0;
      User.register(newUserAttrs, function(err, user){
        //console.log(logId, "Registered User: " + JSON.stringify(user));
        if (err) return promise.fulfill([err]);
        return promise.fulfill(user);
      });

      return promise;
    })

    .loginSuccessRedirect('/web?re=login')
    .registerSuccessRedirect('/web?re=register');


everyauth.linkedin
  .consumerKey(auth.linkedin.apiKey)
  .consumerSecret(auth.linkedin.apiSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, linkedinUser) {
    var promise = this.Promise();
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
    var promise = this.Promise();
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
    var promise = this.Promise();
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

//configure cross domain authorization
var allowCrossDomain = function(req, res, next) {
  // Add other domains you want the server to give access to
  // WARNING - Be careful with what origins you give access to

  var allowedHost = settings.allowedHosts;

  if(allowedHost.indexOf(req.headers.host) !== -1) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.host);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
  } else {
    res.send({auth: false});
  }
};

function httpsRedirect(req, res, next) {
  // see above
  res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');

  if (app.settings.env === "production" && req.headers['x-forwarded-proto'] !== 'https') {
    console.log("not https", req.headers['x-forwarded-proto']);
    return res.redirect(301, 'https://' + req.headers.host + '/');
  }
  next();
}


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.cookieParser('c00rd3lsecretpa$$word'));
  app.use(express.session({
    secret: 'c00rd3lsecretpa$$word',
    store: new RedisStore(options)
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use(httpsRedirect);
  //app.use(express.session({ secret: 'c00rd3lsecretpa$$word' }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express["static"](__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
});

if (app.settings.env === "development") console.log("development environment");

app.register('.html', require('ejs'));

//get the cookie domain
function getCookieDomain(){
  //get the cookie domain
  var parts = settings.ideasUrl.split('.')
    , host1 = parts[parts.length - 2]
    , host2 = parts[parts.length - 1]
    , domain;

  if (host2.split(":").length > 1){
    host2 = host2.split(":")[0];
  }

  domain = '.' + host1 + '.' + host2;

  return ".coordel.com";
}


var validate = function(req, res, next){

  var cookie
    , Token = require('./models/token')()
    , redirect = settings.ideasUrl + '/'
    , domain = getCookieDomain();


  function findByUsername(username, fn){
    var key = 'users:' + username;
    store.get(key, function(e, userid){
      //console.log("looked for the username key", key, e, userid);
      if (e){
        fn('error-user-login');
      } else if (userid === null){
        fn('user-not-found');
      } else {

        key = 'users:' + userid;
        //console.log("USER GET KEY", key);
        store.hgetall(key, function(e, user){
          //console.log("USER", e, user);
          if (e){
            //console.log("couldn't load existing user from store",err);
            fn('user-not-found');
          } else {
            //console.log("found the user", user);
            fn(null, user);
          }
        });
      }
    });
  }

  //console.log('logintoken', req.cookies, req.cookies.logintoken, domain);

  if (req.cookies.logintoken){
    cookie = JSON.parse(req.cookies.logintoken);
    Token.find(cookie.username, function(e, token){

      //console.log("got token", e, token);
      if (e){
        //console.info("error finding token from cookie", e);
        res.redirect(redirect);
      } else if (!token){
        //console.info("token not found");
        res.redirect(redirect);
      } else if (!token.username) {
        //console.info("no token username found");
        res.redirect(redirect);
      } else {
        //console.log("before cookie test",cookie,token, cookie.token === token.token && cookie.series === token.series);
        if (cookie.token === token.token && cookie.series === token.series){
          //console.info("cookie matched");
          //console.log("USER", User);

          findByUsername(token.username, function(e, o) {
            //console.log("tried to do the account");
            if (o) {
              req.session.username = token.username;
              req.session.auth = o;
              token = Token.refresh(cookie);
              Token.save(token, function(){});
              res.cookie('logintoken', JSON.stringify(token), {expires: new Date(Date.now() + 2 * 604800000), path: '/', domain: domain});
              next();
            } else {
              //console.log("didn't find a user");
              res.redirect(redirect);
            }
          });
        } else {
          //there was a cookie, but it doesn't match so clear it and destroy the session
          //console.log("clearing cookie");
          res.clearCookie('logintoken');
          req.session.destroy(function() {});
          res.redirect(redirect);
        }
      }
    });
  } else {
    res.redirect(redirect);
  }


  
  /*
  var idx = req.header('Accept').indexOf('application/json');
  console.log("testing",req.cookies, req.session);

  if (req.session.auth && req.session.auth.loggedIn){
    console.log("authenticated");
    next();
  } else {

    if (app.settings.env === "development"){

      req.session.auth = {};
      req.session.auth.loggedIn = true;
      req.session.auth.userId = 'jeff.gorder@coordel.com';
      next();
    } else {

      if (idx < 0){
        //go ahead and redirect
        res.redirect('/login');
      } else {
        res.json({error: "Unauthorized"});
      }
    }
  }
  */
};

// Routes
require('./routes/users')(app, validate); //login, registration, invites
require('./routes/userApps')(app, validate); //app settings, people, vips
require('./routes/clients')(app, validate); //web NOTE provide acces to others (i.e. mobile)
require('./routes/coordeldb')(app, validate); //all couch access
require('./routes/admin')(app, validate);//admin features
require('./routes/blueprints')(app, validate);//blueprint and share objects
require('./routes/icons')(app, validate);//listing of all app icons
require('./routes/alerts')(app, validate);//alert management



function getFeatureList(){
  return source.features.filter(function(f){
    return f.order !== 0;
  });
}

//root
app.get('/', function(req, res){

  if (req.query.p){
    var page = req.query.p;
    var pageTitle = pages[page];

    var list  = getFeatureList();

    if (req.query.f){
      var feature = req.query.f;
      list.forEach(function(f){

        if (f.code === feature){
          pageTitle = pages[page] + " – " + f.title;
        }
      });
    }

    var layout = {layout: 'nimble/page', features: list, pageTitle: pageTitle};

    //this is a request for a page
    res.render('nimble/page/' + page, layout);


  } else {
    res.render('nimble/home', {layout: 'nimble/home'});
  }

  /*
  if (home){
    home = false;

    if (req.query.p){

      //this is a request for a page
      res.render('corp/page/' + req.query.p, {layout: 'corp/page', background: "bg" + req.cookies.bg});
    } else {
      //show the home page
      res.render('corp/home/content-a', {layout: 'corp/home', color: 'c-bg-purple', background: "bg" + req.cookies.bg});
    }
  } else {
    home = true;
    if (req.query.p){
      //this is a request for a page
      console.log("page", req.query.p);
      res.render('corp/page/' + req.query.p, {layout: 'corp/page', background: "bg" + req.cookies.bg});
    } else {
      console.log("page", req.query.p);
      //show the alt home page
      res.render('corp/home/content-b', {layout: 'corp/home', color: 'c-bg-green', background: "bg" + req.cookies.bg});
    }
  }
  */
});

/* *********************************************** CHANGES AND ALERTS ****************************/

var changesIO = io.sockets.on('connection', function (client) {

});

function alertContacts(change){
  //is this a project
  if (change.docType === 'project'){
    //NOTE: might want to test if this is an add or invite history entry
    //console.log('substatus not PENDING', change.name );
    change.users.forEach(function(user){
      var doUpdate = false;
      if (change.substatus === "PENDING" && user === change.responsible){
        doUpdate = true;
      } else if (change.substatus === "SENT"){
        doUpdate = true;
      }
      if (doUpdate){
        change.users.forEach(function(person){
          if (user !== person){
            //console.log("user: " + user + " person:" + person);
            App.addPerson({
              userAppId: user, personAppId: person
            },
            function(err, reply){
              //console.log("after addPerson", err, reply);
              if (err) return;
              if (reply[0]){
                App.get(person, function(err, contact){
                  changesIO.emit('contacts:' + user, contact);
                });
              }
            });
          }
        });
      }
    });
  }
}



//Get the the update sequence of the dbase and start following changes
couch.info(function(err, info){
  if (err){
    console.log(logId, "ERROR getting update sequence when starting to monitor couch changes: " + JSON.stringify(err));
  } else {
    var since = info.update_seq;
    //start the changes stream using the latest sequence
    var dbUrl = 'http://'+ couchOpts.host + ':' + couchOpts.port + '/' + settings.config.couchName;
    //console.log("URL", dbUrl);
    follow({db:dbUrl, since: since, include_docs:true}, function(error, change) {
      if(!error) {
        var map = Alert.getChangeAlertMap(change.doc);
        alertContacts(change.doc);
        //console.log("ALERT MAP", map, change.doc.docType, change.doc.name);
        for (var key in map){
          //console.log("CHANGE", key, change.doc.updater);
          changesIO.emit('changes:' + key, change.doc);

          //if this user didn't do the update, then alert when history exists
          if (change.doc.username !== "UNASSIGNED" && change.doc.updater !== key && change.doc.history && change.doc.history.length > 0){
            //console.log(logId, "Alert: ", change.doc.docType, change.doc.name);
            var doc = change.doc;
            //get the history of this doc
            var history = change.doc.history;
            //for now there are only messages tracked for projects and tasks
            if (doc.docType === 'project' || doc.docType === 'task'){
              //console.log("it's a project or task: versions: ", doc.versions);
              //it might be that a project or task doesn't have versions (an old entry)
              if (doc.versions && doc.versions.latest){
                //when an activity is added, the _rev of the current doc is appened to the activity in the rev field
                //assume that there isn't a rev
                var rev = false;
                var latest = false;

                //check if there's a _rev and if so, assign it to rev
                if (doc._rev){
                  rev = doc._rev;
                  if (doc.versions.latest && doc.versions.latest._rev){
                    latest = doc.versions.latest._rev;
                    //console.log("there was a rev ", latest);
                  }

                }



                //there was a latest rev so now iterate over the history to find all entries for this rev
                //console.log("iterate history entries with this rev", latest);

                history.forEach(function(alert){
                  if (alert.rev && alert.rev === latest){
                    //console.log("rev matched: alert this", alert.verb);
                    sendAlert(alert);
                  }
                });


              } else {

                //this is the first save, so show all history entries that equal
                //console.log("first save, iterate all history entries");
                history.forEach(function(alert){
                  //console.log("alert: ", alert.verb);
                  if (alert.rev === "-1"){
                    sendAlert(alert);
                  }
                });
              }
              //var alert = change.doc.history.shift();
              function sendAlert (alert){
                //console.log("sending alert", key, alert);
                changesIO.emit('alerts:' + key, alert);
                var a = new Alert({
                  username: key,
                  alert: alert
                });

                a.add(function(err, res){
                  if (err) console.log(logId, "ERROR adding alert: " + err);
                });
              }
            }


          } else if (change.doc.docType === "message" && change.doc.updater !== key){
            //console.log(logId, "message alert", change.doc);
            changesIO.emit('alerts:' + key, change.doc);

            var b = new Alert({
              username: key,
              alert: change.doc
            });

            b.add(function(err, res){
              if (err) console.log(logId, "ERROR adding alert: " + err);
            });
          }
        }
      }
    });
  }

});

/* **************************** UTILITY DELETE FOR DEV and PRODUCTION *************************/

if (app.settings.env === "development"){
  //console.log("resetting dbases", app.settings.env);
  app.get('/flushdb', function(req, res){
    store.flushdb();
    console.log('redis flushed');
    couch.destroy(function(){
      console.log('couch destroyed');
      couch.create(function(){
        console.log('couch recreated');
        ddoc.update();
        res.redirect('/admin');
      });
    });


  });
}

app.get('/loadTemplates', function(req, res){
  var templates = require('./couchdb/defaultTemplates');
  couch.save(templates, function(err, reply){
    if (err) {
      console.log("ERROR adding temlates");
      res.redirect('/admin');
    } else {
      //console.log("Loaded default templates");
      res.redirect('/admin');
    }
  });
});

/* ********************************     CATCH ALL                   ******************************/

everyauth.helpExpress(app);
app.listen(8090);