var App        = require('./../models/app');

module.exports = function(app, validate){
  
  function verify(req, res, next){
    if (req.session.auth && req.session.auth.appId){
      next();
    } else {
      res.redirect('/logout');
    }
  }
  
  app.get('/app', validate, function(req, res){
    //loads the current user's app
    App.get(req.session.auth.appId, function(err, app){
      if (err) {
        res.redirect('/logout');
      } else {
        res.json(app);
      }
    });
  });
  
  app.post('/app/person', validate, function(req, res){
    App.addPerson({
      userAppId: req.session.auth.appId,
      personAppId: req.body.personAppId
    }, function(err, reply){
      if (err){
        res.json({error: 'Error adding person'});
      } else {
        res.json({success: 'ok'});
      }
    });
  });
  
  app.post('/app/vip', validate, function(req, res){
    App.addVip({
      userAppId: req.session.auth.appId,
      personAppId: req.body.personAppId
    }, function(err, reply){
      if (err){
        res.json({error: 'Error adding vip'});
      } else {
        res.json({success: 'ok'});
      }
    });
  });
  
  app.get('/app/people', validate, function(req, res){
    App.getPeople(req.session.auth.appId, function(err, people){
      if (err) {
        res.json({error: 'Error getting people'});
      } else {
        res.json({rows: people});
      }
    });
  });
  
  app.get('/app/vips', validate, function(req, res){
    App.getVips(req.session.auth.appId, function(err, vips){
      if (err) {
        res.json({error: 'Error getting vips'});
      } else {
        res.json(vips);
      }
    });
  });
    
};