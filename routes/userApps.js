var App        = require('./../models/userApp');

module.exports = function(app, validate){
  
  function verify(req, res, next){
    if (req.session.auth && req.session.auth.appId){
      next();
    } else {
      res.redirect('/logout');
    }
  }
  
  app.get('/app', function(req, res){
    
    //loads the current user's app
    App.get(req.session.auth.appId, function(err, app){
      if (err) {
        res.redirect('/logout');
      } else {
        //console.log("userApp", app);
        res.json(app);
      }
    });
  });
  
  app.post('/app', function(req, res){
    var body = req.body;
    //console.log("body", body);
    var a = new App(body);
    //updates a submitted app
    a.update(function(err, app){
      if (err) {
        res.json({err: err});
      } else {
        res.json({success: true});
      }
    });
  });
  
  app.post('/app/person', function(req, res){
  
    //console.log('ADDING PERSON userAppId', req.body.userAppId, 'personAppId', req.body.personAppId);
    App.addPerson({
      userAppId: req.body.userAppId,
      personAppId: req.body.personAppId
    }, function(err, reply){
      if (err){
        console.log('ERROR adding person', err);
        res.json({error: 'Error adding person: ' + err});
      } else {
        res.json({success: 'ok'});
      }
    });
  });
  
  app.del('/app/person', function(req, res){
    //console.log('REMOVING PERSON userAppId', req.body.userAppId, 'personAppId', req.body.personAppId);
    App.remPerson({
      userAppId: req.body.userAppId,
      personAppId: req.body.personAppId
    }, function(err, reply){
      if (err){
        console.log('ERROR removing person', err);
        res.json({error: 'Error removing person: '+ err});
      } else {
        res.json({success: 'ok'});
      }
    });
  });
  
  app.post('/app/vip', function(req, res){
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
  
  app.get('/app/people', function(req, res){
    App.getPeople(req.query.appId, function(err, people){
      if (err) {
        res.json({rows: [], error: 'Error getting people'});
      } else {
        res.json(people);
      }
    });
  });
  

  app.get('/app/people/:id', function(req, res){
    App.get(req.params.id, function(err, person){
      if (err) {
        res.json({rows: [], error: 'Error getting person ' + req.params.id});
      } else {
        res.json(person);
      }
    });
  });
  
  app.get('/app/vips/:id', function(req, res){
    App.getVips(req.body.id, function(err, vips){
      if (err) {
        res.json({rows: [], error: 'Error getting vips'});
      } else {
        res.json({rows: vips});
      }
    });
  });
    
};