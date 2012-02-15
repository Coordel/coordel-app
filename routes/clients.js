var User        = require('./../models/user');

module.exports = function(app, validate){
  
  app.get('/web', validate, function(req, res){
    User.get(req.session.auth.userId, function(err, user){
      if (err) res.redirect('/logout');
      req.session.auth.appId = user.appId;
      console.log("USER SESSION", req.session);
      //loads the dojo web application (other clients might be mobile, etc)
      //res.render('clients/web/preview/index', {layout: 'clients/web/preview', url: settings.url, appId: user.appId});
      res.render('clients/web/index', {layout: 'clients/web/layout'});
    });
  });
  
  app.get('/test', function(req, res){
    res.render('clients/web/index', {layout: 'clients/web/test'});
  });
    
};