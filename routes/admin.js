var admin       = require('./../models/admin'),
    loggly      = require('loggly'),
    config = require('konphyg')(__dirname + './../config'),
    settings = config('settings'),
    logger      = loggly.createClient(settings.config.corpLogglyOptions),
    App         = require('./../models/user'),
    UserApp     = require('./../models/userApp');
    
module.exports = function(app, validate){
  
  app.get('/admin',  function(req, res){
    res.render('admin/page/index', {layout: 'admin/page'});
  });
  
  app.get('/admin/people/:id', function(req, res){
    console.log("get user apps", req.params.id);
    UserApp.getPeople(req.params.id, function(err, apps){
      console.log("user coordel-apps", apps);
      res.render('admin/page/apps', {layout: 'admin/page', apps: apps});
    });
  });
  
  app.get('/admin/users',  function(req,res){
    admin.getCoordelUsers(function(err, users){
      console.log("coordel-users", users);
      res.render('admin/page/users', {layout: 'admin/page', users: users});
    });
  });
  
  app.get('/admin/apps',  function(req,res){
    admin.getCoordelApps(function(err, apps){
      console.log("coordel-apps", apps);
      res.render('admin/page/apps', {layout: 'admin/page', apps: apps});
    });
  });
  
  app.del('/admin/apps', function(req, res){
    var id = req.query.id;
    
    if (id){
      App.remove(id, function(err, reply){
        if (err){
          res.json({error: err});
        } else {
          res.json(reply);
        }
      });
    }
  });
  
  
  app.get('/admin/cleanUser/:id', function(req, res){
    var id = req.params.id;
    var toRemove = [];
    var removed = {};
    
    admin.getCoordelApps(function(err, apps){
      //remove the user as a contact from all other users
      apps.forEach(function(app){
     
        UserApp.getPeople(app.id, function(err, people){
          //console.log("people", people);
          people.forEach(function(p){
            //console.log("p", p);
            if (p && p.id === id){
              
              UserApp.remPerson({userAppId:app.id, personAppId:id}, function(err, reply){
                if (err) console.log("error", err);
                console.log("reply", reply);
              });
              
              console.log("remove: " + p.user + " " + p.firstName + " " + p.lastName + " from " + app.firstName + " " + app.lastName);
              //NOTE: NEED TO REMOVE THE USERS FROM COUCH USING FUTON
            }
          });
          
          res.end();
        });
        
      });
      
      //delete the userApp
      
      UserApp.remove(id, function(err, reply){
        console.log("removed the user app", err, reply);
      });
      
      //delete the user
      App.remove(id, function(err, reply){
        console.log("removed the user", err, reply);
      });

    });
    
   
  });
  
  app.get('/admin/remUser', function(req, res){
    var id = req.query.id;
    //delete the user
    App.remove(id, function(err, reply){
      console.log("removed the user");
    });
  });
  
  app.get('/admin/remUserApp', function(req, res){
    var id = req.query.id;
    //delete the map
    UserApp.remove(id, function(err, reply){
      console.log("removed the user app");
    });
  });
  
  
 
  
  app.put('/admin/log', function(req, res){
    var log = req.body;
    console.log("logging", log);
    logger.log(settings.config.corpLogId, log);
    res.json({success: "ok"});
  });
};