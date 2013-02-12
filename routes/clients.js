var User        = require('./../models/user'),
    config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    App         = require('./../models/userApp');

module.exports = function(app, validate){

  app.get('/web', validate, function(req, res){
    var version = settings.version;
    //console.log("user.appId", req.session.auth.appId);
    //need to validate that the users contacts are up to date
    App.updateContacts(req.session.auth.appId, function(err, reply){
      //console.log("USER SESSION", req.session.auth);
      //loads the dojo web application (other clients might be mobile, etc)
      //res.render('clients/web/preview/index', {layout: 'clients/web/preview', url: settings.url, appId: user.appId});
      res.render('clients/web/index', {layout: 'clients/web/layout', version: version, ideasUrl: settings.ideasUrl});
    });
  });
  
  app.get('/test', function(req, res){
    res.render('clients/web/index', {layout: 'clients/web/test'});
  });
    
};