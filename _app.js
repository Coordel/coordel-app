/**
 * Module dependencies.
 */

var express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    RedisStore = require('connect-redis')(express),
    http = require('http'),
    userDb = require('./couchdb').Database('_users'),
    db = require('./couchdb').Database();
    

//***************************************************************  
/* 
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
  , { id: 3, username: 'admin', password:'password', email:'jeff.gorder@coordel.com'}
  , { id: 4, username: 'jeff.gorder@coordel.com', password:'jrg0289', email:'jeff.gorder@coordel.com'}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
*/
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  var cookie = req.cookies.authsession;
  console.log("ensureAuthenticated", req.cookies );
  
  if (cookie){return next();}
  //if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
/*
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne(id, function (err, user) {
    done(err, user);
  });
});
*/
// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  
  function(username, password, done) {
    console.log("in passport", username, password);
    
    
    var auth = {
      name: username,
      password: password
    };
    
    db.login(auth, function(err, user){
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
    
    
    
  
    // asynchronous verification, for effect...
    //process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure.  Otherwise, return the authenticated `user`.
      /*
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (user.password != password) { return done(null, false); }
        return done(null, user);
      });
      */
    //});
 
  }
));

//********************************************************************************************
    
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  //app.use(passport.initialize());
  //app.use(passport.session());
  app.use(app.router);
  app.use(express["static"](__dirname + '/public'));
  
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', ensureAuthenticated, function(req, res){
  //console.log("COOKIES", req.cookies);
  //res.render('index', { user: req.user });
  res.redirect('/index.html');
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  //res.render('login', { user: req.user });
  res.redirect('/login.html');
});

app.get('/coordeldb', ensureAuthenticated, function(req, res){
  console.log("get",req.query, req.params, req.body, req.user);
});

app.get('/coordeldb/:id', ensureAuthenticated, function(req, res){
  console.log("get",req.query, req.params, req.body, req.user);
  
  db.get(req.params.id, function(err, res){
    if (err){
      console.log("ERROR:", err);
    } else {
      console.log("SUCCESS: ", res);
    }
  });
  
});

app.post('/coordeldb', ensureAuthenticated, function(req, res){
  console.log("post",req.query, req.params, req.body);
});

app.put('/coordeldb', ensureAuthenticated, function(req, res){
  console.log("put",req.query, req.params, req.body);
});

app.del('/coordeldb', ensureAuthenticated, function(req, res){
  console.log("delete", req.query, req.params, req.body);
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.post('/login', function(req, res){
  //passport.authenticate('basic', { session: false})
  
  db.login({name: req.body['username'], password:req.body['password']}, function(err, user){
    if (err){
      console.log("ERROR: ", err);
      res.redirect('/login');
    } else {
      console.log("SUCCESS: ", user);
      res.header('set-cookie', user.cookie);
      console.log("HEADER: ", res.header('set-cookie'));
      res.redirect('/');
    }
  });
  
});

/*
app.post('/login',function(req, res){
  var login = req.body.email,
      password = req.body.password,
      errors = [];

  console.log("LOGIN", login, password);
  
  if (!login) {
     errors.push('Missing Email');
  } else {
    if (!validateEmail(login)) errors.push('Invalid Email Format');
  }
  if (!password) errors.push('Missing password');
  if (errors.length){
    res.render('login', {errors: errors});
    return;
  } 
  User.get(login, function(err, user){
    if (err) errors.push(err);
    if (!passHash.verify(password, user.password)){
      errors.push('Login failed: invalid username or password');
    }
    if (errors.length){
      res.render('login', {errors:errors});
      return;
    }
    req.session.user = user;
    res.redirect('/');
  });
});

app.get('/register', function(req, res){
  res.render('register');
});

app.post('/register', function(req,res){
  var user = {
    email : req.body.email,
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    password : req.body.password
  }, errors = [];
  
  if (!user.email) errors.push('Missing Email');
  if (user.email && !validateEmail(user.email)) errors.push('Invalid Email Format');
  if (!user.password) errors.push('Missing Password');
  if (user.password) user.password = passHash.generate(user.password);
  if (errors.length){
    res.render('register', {errors:errors});
    return;
  }
  
  var multi = redis.multi();
  multi.incr('userKeys');
  multi.incr('appKeys');
  
  multi.exec(function(err, ids){
    if (err) errors.push(err);
    user.userId = ids[0];
    user.appId = ids[1];
    console.log("ADDING USER: ", user);
    var newUser = new User(user);
    newUser.add(function(err, reply){
      if (err) errors.push(err);
      if (errors.length){
        res.render('register', {errors:errors});
        return;
      }
      //console.log("putting in session", user);
      req.session.user = user;
      res.redirect('/');
    });
  }); 
});
*/
  

app.get('/logout', function(req, res){
  res.clearCookie('authsession');
  res.redirect('/');
});


app.listen(8080);
console.log("Coordel App Server listening on port %d in %s mode", app.address().port, app.settings.env);
