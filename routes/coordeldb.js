/**
 * Coordel routes to CouchDb
 */

var config = require('konphyg')(__dirname + './../config'),
    settings = config('settings'),
    couchOpts   = settings.config.couchOptions,
    couchName   = settings.config.couchName,
    App         = require('./../models/userApp'),
    fs          = require('fs'),
    request     = require('request'),
    loggly      = require('loggly'),
    logger      = loggly.createClient(settings.config.logglyOptions),
    logId       = settings.config.logId,
    async       = require('async'),
    _           = require('underscore');
    

//console.log("settings", redisOpts, couchName, couchOpts);
var cradle = require('cradle').setup(couchOpts);
var cn  = new cradle.Connection();
var couch = cn.database(couchName);
var nano = require('nano')('http://'+couchOpts.host + ':' + couchOpts.port);
var nanoCouch = nano.use(settings.config.couchName);


module.exports = function(app, validate){
  
  app.post('/search', function(req, res){
    
    var view = "taskSearch";

    if (req.body.type){
      switch (req.body.type){
        case "task":
        view = "taskSearch";
        break;
        case "project":
        view = "projectSearch";
        break;
      }
    }

    var username = req.body.username;

    var words = []; //holds the words after filtering (matches function in search view in couchdb)
    var parse = ((req.body.search).toLowerCase().match(/\w+/g));
    var stopwords_en = {"a":true, "an":true, "the":true};
    parse.forEach(function(word){
      word = word.replace(/^[_]+/,"");
      if (!stopwords_en[word]){
        if (word.length >= 3){
          if (!word.match(/^\d+$/)){
            words.push(word);
          }
        }
      }
    });
    
    if (!words.length){
      res.json({results:[]});
      return;
    }
    
    var funcs = []; //holds the loading of each of the words by key
    var map = []; //holds the arrays of found ids for words by key
    
    //push the load word function for each of the words in the query  
    words.forEach(function(word){
      //console.log("word", word);
      funcs.push(loadWord(word));
    });
    
    //this function gets passed to the async.parallel function
    function loadWord(word){
      return function (callback){
        couch.view('coordel/' + view, {key: word, include_docs:true}, function(err, list){
          if (err) return err;
          return list;
        }, callback);
      };
    }
    
    async.parallel(funcs, function(err, results){
      //if there's an error, just send back an empty array
      if (err) res.json({results: []});
      //when the results of the word queries are iterated, the collected docs are held in this map
      var docs = {};
      results.forEach(function(list){
        //array to hold the ids of the docs for this word 
        var ids = [];
        list.forEach(function(word,doc){
        
          //we don't send back trash
          console.log("doc status", doc.status, doc.substatus);
          if (doc.status !== "TRASH" && doc.substatus !== "TRASH"){
            //make sure this doc belongs to this user 
            if (doc.responsible === username || doc.delegator === username || doc.username === username){
              if (!docs[doc._id]){
                docs[doc._id] = doc;
              }
              ids.push(doc._id);
            } else {
              console.log("not a task that belongs to this username", doc.name);
            }
          } else {
            console.log("trash", doc.name);
          }
        });
        map.push(ids);
      });
      
      //now, intersect all of the word-ids arrays (finds the common ids across all arrays)
      var matches = _.intersect.apply(_,map);
      
      //now iterate the matches and fill the toReturn array with the docs that match
      var toReturn = [];
      _.each(matches, function(id){
        toReturn.push(docs[id]);
      });
      
      //send back the docs
      res.json({results: toReturn});
    });
    
  });
  
  /**
   * coordel put doc
   *
   * @param {uuid} id = id of the document
   * @return {obj}
   * @api validated
   */
  app.put('/coordel/:id', function(req, res){
    //console.log("PUT coordel/:id", req.body);
    couch.save(req.body, function(err, putRes){
      //console.log("PUT RESPONSE", putRes, err);
      if (err){
        console.log(logId, "Error putting to couch: " + JSON.stringify(err) + " Doc: " + JSON.stringify(req.body));
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
  app.get('/coordel/files/:id', function(req, res){
    
    couch.get(req.params.id, function(err, doc){
      if (err){
        console.log(logId, "Error getting files: " + JSON.stringify(err));
        res.json({error: "ERROR getting files: " + err});
      } else {
        res.json(doc);
      }
    });
  });
  
  app.get('/coordel/files/:id/:name', function(req, res){
    var url = 'http://'+ couchOpts.host + ':'+couchOpts.port+'/' + couchName + '/'+req.params.id+'/'+req.params.name;
    request(url).pipe(res);
  });
  
  
  app.put('/coordel/files/:id/:name', function(req, res){
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
            console.log(logId, "Error saving file" + JSON.stringify(err));
            res.json({error: err});
          } else {
            //console.log("RESPONSE", attachRes);
            res.json(attachRes);
          }
        });
            
        req.pipe(stream);
  });
  
  app.del('/coordel/:id', function(req, res){
     var id = req.params.id,
         rev = req.query.rev;

     //console.log("delete called", id, rev);
     
     couch.remove(id, rev, function(err, docRes){
       if (err){
         console.log(logId, "Error removing doc: " + JSON.stringify(err));
         res.json({error: err});
       } else {
         res.json(docRes);
       }
     });

   });
  
  app.del('/coordel/files/:id/:name', function(req, res){
    var id = req.params.id,
        name = req.params.name,
        rev = req.query.rev;
        
    //console.log("delete called", id, name, rev);
    
    var url = '/' + id + '/'+name;
    url = url + '?rev=' + rev;
    
    nanoCouch.attachment.destroy(id, name, rev, function(e,b,h){
      if (e){
        console.log(logId, "ERROR deleting file: " + JSON.stringify(e));
      } else {
        //console.log("RESPONSE", b);
        res.json(b);
      }
    });

  });
  
  app.get('/coordel/all', function(req, res){
    
  });
  
  app.get('/coordel/contactTasks', function(req, res){
    
    var user = req.query.username;
    var contact = req.query.contact;
    
    //we need to get the user/contact projects
    //console.log('queryString params', req.query, opts);
    couch.view('coordel/userContactProjects', {startkey: [user, contact], endkey:[user,contact,{}]}, function(err, resView){
      var projects = [],
          tasks = [],
          toReturn;
   
      if (err){
        toReturn = {rows: [], error: err};
      } else if (!resView){
        toReturn = {rows: [], error: "unexpected error"};
      } else {
        if (resView.rows & resView.rows.length > 0){
          resView.rows.forEach(function(row){
            //console.log("IN FOR EACH ROWS", row);
            projects.push(row);
          });
        } else if (resView && resView.length > 0){
          resView.forEach(function(row){
            //console.log("IN FOR EACH", row);
            projects.push(row);
          });
        }
      }
      
      //load the contact tasks and filter them
      couch.view('coordel/contactTasks', {startkey: [contact], endkey:[contact,{}], include_docs: true}, function(err, resTasks){
        
        if (err){
          toReturn = {rows: [], error: err};
        } else if (!resView){
          toReturn = {rows: [], error: "unexpected error"};
        } else {
          if (resTasks.rows & resTasks.rows.length){
            resTasks.rows.forEach(function(row){
              //console.log("IN FOR EACH ROWS", row);
              if (projects.indexOf(row.project) > -1){
                tasks.push(row);
              }
              
            });
          } else if (resTasks && resTasks.length){
            resTasks.forEach(function(row){
              //console.log("IN FOR EACH", row);
              if (projects.indexOf(row.project) > -1){
                tasks.push(row);
              }
            });
         }
       }
        toReturn = {rows: tasks};
        res.json(tasks);
      });
      
    });
    
    
    
    
    
    //filter the contact tasks for only those with projects in common
    
  });
   
  app.get('/coordel/uuids', function(req, res){
    //console.log("UUIDS", req.query.count);
    cn.uuids(req.query.count, function(err, uuids){
      //console.log("UUID response", uuids);
      res.json({uuids:uuids});
    });
  });
  
  app.get('/coordel/people', function(req, res){
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

  app.get('/coordel/:id', function(req, res){
    //console.log('GET ID', req.params.id);
    couch.get(req.params.id, function(err, obj){
      if (err){
        
        console.log(logId, "ERROR getting " + req.params.id + ": " + err.error);
        console.log(err);
        if (err.error === "not_found"){
          err.code = 404;
          //res.send("ERROR getting " + req.params.id + ": " + err.error, 404);
          res.json(err);
        } else {
          //res.send("Unexpected error " + req.params.id + ": " + err.error, 500);
          err.code = 500;
          res.json(err);
        }
        
      } else {
        res.json(obj);
      }
      
    });
  });

  app.get('/coordel/view/:name', function(req, res){
  
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