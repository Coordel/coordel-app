var settings    = require('./../settings'),
    couchOpts   = settings.config.couchOptions,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch       = cn.database(settings.config.couchName),
    App        = require('./../models/app');

module.exports = function(app, validate){
  app.post('/coordel', validate, function(req, res){
    console.log("POST", req.body);
  });
  
  app.put('/coordel/:id', validate, function(req, res){
    console.log("PUT", req.body);
    couch.save(req.body, function(err, putRes){
      console.log("PUT RESPONSE", putRes, err);
      if (err){
        res.json({error: err + ' '+req.body.id+ ' '+req.docType});
      } else {
        res.json(putRes);
      }
    });
  });
   
  app.get('/coordel/uuids', validate, function(req, res){
    //console.log("UUIDS", req.query.count);
    cn.uuids(req.query.count, function(err, uuids){
      //console.log("UUID response", uuids);
      res.json({uuids:uuids});
    });
  });
  
  app.get('/coordel/people', validate, function(req, res){
    //loads the current user's session
    var appId;
    if (req.session.auth && req.session.auth.appId){
      appId = req.session.auth.appId;
    }
    App.get(appId, function(err, app){
      if (err) res.redirect('/logout');
      res.json(app);
    });
  });

  app.get('/coordel/:id', validate, function(req, res){
    //console.log('GET ID', req.params.id);
    couch.get(req.params.id, function(err, obj){
      if (err) console.log("ERROR getting " + req.params.id);
      res.json(obj);
    });
  });

  app.get('/coordel/view/:id', validate, function(req, res){
    var view = req.params.id;
    view = 'coordel/' + view;
    //console.log('GET VIEW', view);
    var opts = {};
    //console.log('queryString params', req.query);
    for (var key in req.query){
      opts[key] = req.query[key];
    }
    couch.view(view, req.query, function(err, resView){
      var ret = [],
          toReturn;
   
      if (err){
        toReturn = {rows: [], error: err};
      } else if (!resView){
        toReturn = {rows: [], error: "unexpected error"};
      } else {
        //console.log("VIEW ROWS", resView);
        if (resView.rows & resView.rows.length > 0){
          resView.rows.forEach(function(row){
            //console.log("IN FOR EACH ROWS", row);
            ret.push(row);
          });
        } else if (resView && resView.length > 0){
          resView.forEach(function(row){
            //console.log("IN FOR EACH", row);
            ret.push(row);
          });
          
        }
        toReturn = {rows: ret};
      }
      //console.log("returning", toReturn);
      res.json(toReturn);
    });
  });
  
  
};