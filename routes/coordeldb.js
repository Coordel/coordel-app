/**
 * Coordel routes to CouchDb
 */

var config = require('konphyg')(__dirname + './../config'),
    settings = config('settings'),
    couchOpts   = settings.config.couchOptions,
    couchName   = settings.config.couchName,
    App         = require('./../models/userApp'),
    fs          = require('fs');
    

//console.log("settings", redisOpts, couchName, couchOpts);
var cradle = require('cradle').setup(couchOpts);
var cn  = new cradle.Connection();
var couch = cn.database(couchName);
var nano = require('nano')('http://'+couchOpts.host + ':' + couchOpts.port);
var nanoCouch = nano.use(settings.config.couchName);


module.exports = function(app, validate){
  
  app.post('/coordel', validate, function(req, res){
    //console.log("POST", req.body);
  });
  
  /**
   * coordel put doc
   *
   * @param {uuid} id = id of the document
   * @return {obj}
   * @api validated
   */
  app.put('/coordel/:id', validate, function(req, res){
    //console.log("PUT coordel/:id");
    couch.save(req.body, function(err, putRes){
      //console.log("PUT RESPONSE", putRes, err);
      if (err){
        console.log("ERROR PUTTING TO COUCH", err, req.body);
        res.json({error: err});
      } else {
        res.json(putRes);
      }
    });
  });
  
  /**
   * Get the object that contains _attachments and return it
   *
   * @param {uuid} id
   * @return {obj} project/task
   * @api validated
   */
  app.get('/coordel/files/:id', validate, function(req, res){
    
    couch.get(req.params.id, function(err, doc){
      if (err){
        res.json({error: "ERROR getting files: " + err});
      } else {
        res.json(doc);
      }
    });
  });
  
  
  app.put('/coordel/files/:id/:name', validate, function(req, res){
    var id = req.params.id,
        name = req.params.name,
        rev = req.query.rev,
        type = req.headers['content-type'];
        
    
        var stream = couch.saveAttachment({
            id: id, 
            rev: rev
        }, {
            name: name, 
            contentType: type
        }, function(err, attachRes){
          if (err) {
            console.log("ERROR saving file", err);
            res.json({error: err});
          } else {
            //console.log("RESPONSE", attachRes);
            res.json(attachRes);
          }
        });
            
        req.pipe(stream);
  });
  
  app.del('/coordel/files/:id/:name', validate, function(req, res){
    var id = req.params.id,
        name = req.params.name,
        rev = req.query.rev;
        
    //console.log("delete called", id, name, rev);
    
    var url = '/' + id + '/'+name;
    url = url + '?rev=' + rev;
    
    nanoCouch.attachment.destroy(id, name, rev, function(e,b,h){
      if (e){
        console.log("ERROR deleting file", e);
      } else {
        //console.log("RESPONSE", b);
        res.json(b);
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
      if (err){
        console.log("ERROR getting " + req.params.id + ": " + err.error);
      } else {
        res.json(obj);
      }
      
    });
  });

  app.get('/coordel/view/:name', validate, function(req, res){
  
    var view = req.params.name;
    view = 'coordel/' + view;
    //console.log('GET VIEW', view);
    var opts = {};
    
    for (var key in req.query){
      if (key === "key" || key === "startkey" || key === "endkey"){
        opts[key] = JSON.parse(req.query[key]);
      } else {
        opts[key] = req.query[key];
      }
    }
    
    //console.log('queryString params', req.query, opts);
    couch.view(view, opts, function(err, resView){
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