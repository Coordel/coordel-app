var settings      = require('./../config'),
    couchOpts   = settings.config.couchOptions,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch       = cn.database(settings.config.couchName);

module.exports = function(app){
  
  function validate(req, res, next){
    if (req.session.auth && req.session.auth.loggedIn){
      next();
    } else {
      res.redirect('/login');
    }
  }
  
  app.get('/coordel/uuids', validate, function(req, res){
    console.log("UUIDS", req.query.count);
    cn.uuids(req.query.count, function(err, uuids){
      console.log("UUID response", uuids);
      res.json({uuids:uuids});
    });
  });

  app.get('/coordel/:id', validate, function(req, res){
    console.log('GET ID', req.params.id);
    couch.get(req.params.id, function(err, obj){
      if (err) console.log("ERROR getting " + req.params.id);
      res.json(obj);
    });
  });

  app.get('/coordel/view/:id', validate, function(req, res){

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
  
};