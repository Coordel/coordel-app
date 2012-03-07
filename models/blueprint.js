/**
 * handles the work required to create and share blueprints of existing objects
 *
 * The assumption there will be no updates of blueprints. Rather, a new blueprint will be created from
 * an existing object. 
 */
 
require('date-utils');

var settings    = require('./../settings'),
    couchOpts   = settings.config.couchOptions,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    async       = require('async');
    

var Blueprint = exports = module.exports = function Blueprint(args){
 
};

function getProject(args, fn){
  console.log("GETTING PROJECT", args._id);
  var bp = args,
      viewArgs = {
        startkey: [args._id], 
        endkey:[args._id, {}], 
        include_docs: true};
  
  db.view('coordel/projects', viewArgs, function(err, docs){
    if (err){
      fn(err, false);
    } else {
      
      var PROJ = 0,
          ROLE = 1,
          BLOCK = 2,
          TASK = 3,
          taskMap = {},
          extBlock = []; 
          //need to track what tasks are added to this map. then, when testing blockers, can 
          //add them first. this solves the problem of tasks exist outside the project
      
      
      console.log("DOCS", docs.length);
      docs.rows.map(function(r){
        
        switch (r.key[1]){
          case PROJ:
            //indicate that this is a template
            bp.templateType = 'project';
            bp.username = bp.responsible;
            bp.id = bp._id; //save the id for use instantiating the blueprint
            delete bp._id;
            delete bp._rev;
            bp.roles = [];
            bp.tasks = [];//tasks will be any tasks that dont block
            bp.blockers = [];//blockers will contain any of the tasks that block others in the project
            console.log('Creating blueprint: ' , r.doc.name);
          break;
          case ROLE:
            //roles will arrive next, expand the bp assignment role with the role doc
            bp.roles.push(r.doc);
            /*
            bp.assignments.forEach(function(assign){
              if (assign.role === r.doc._id){
                console.log('Expanding role: ', r.doc._id);
                assign.role = r.doc;
              }
            });
            */
          break;
          case BLOCK:
            if (r.doc.project !== bp.id){
              console.log("Blocker from another Coord, discarding...", r.doc.name);
            } else {
              console.log("Attach blocker to Coord: ", r.doc.name);
              bp.blockers.push(r.doc);
              taskMap[r.doc._id] = true;
            }
          break;
          case TASK: 
            //last will be the tasks. iterate the assigments for role.responsibilities and expand
            if (!taskMap[r.doc._id]){
              console.log("Attach task to Coord: ", r.doc.name);
              bp.tasks.push(r.doc);
            } else {
              console.log("Task already in taskMap, discarding...", r.doc.name);
            }
            /*
            bp.assignments.forEach(function(assign){
              assign.role.responsibilities.forEach(function(resp){
                if (resp.task === r.doc._id){
                  console.log('Expanding task: ', r.doc.name);
                  resp.task = r.doc;
                  //track the task to make sure we don't add it twice 
                  taskMap[r.doc._id] = true;
                }
              });
            });
            */
          break;
        }
      });

      fn(null, bp);
    }
  });
}

function getTask(args, fn){
  console.log("GETTING TASK", args._id, args);
  var bp,
      id = args._id,
      rev = args._rev,
      responsible = args.responsible,
      username = args.username,
      delegator = null,
      attachments = null;
      
  if (args._attachments){
    attachments = args._attachments;
  }
  
  args.id = id;
      
  //clear out the specific info from the task
  delete args._id;
  delete args._rev;
  delete args._attachments;
  delete args.username;
  delete args.responsible;
  
  //clear any blockers because we don't save them
  args.coordinates = [];

  if (args.delegator){
    delegator = args.delegator;
    delete args.delegator;
  }
  
  bp = args;    
  bp.templateType = 'task';

  console.log('Creating blueprint: ' , bp);
  
  //db.view('coordel/tasks', viewArgs, function(err, docs){
  db.save(bp, function(err, result){
    if (err){
      fn(err, false);
    } else {
      
      bp._id = result.id;
      bp._rev = result.rev;
      
      console.log('new blueprint', bp);
      
      if (attachments){
        var atts = [];
        for (var key in attachments){
          atts.push(key);
        }
        
        async.forEachSeries(atts, function(name, callback){
          
          var fileStream = db.getAttachment(id, name);
          
          var stream = db.saveAttachment({
              id: bp._id, 
              rev: bp._rev
          }, {
              name: name, 
              contentType: attachments[key].content_type
          }, function(err, attachRes){
            if (err) {
              console.log("ERROR saving file", err);
              //res.json({error: err});
            } else {
              console.log("SAVED FILE", attachRes);
              bp._rev = attachRes.rev;
              callback();
            }
          });

          fileStream.pipe(stream);
         
          }, function(err){
            
            db.get(bp._id, function(err, fbp){
              if (err){
                console.log("ERROR getting final blueprint", err);
              } else {
                saveBlueprint(fbp);
              }
            });
            
                   
        });
      } else {
        saveBlueprint(bp);
      }

      function saveBlueprint(pending){
        pending.username = username;
        pending.responsible = responsible;
        if (delegator){
          pending.delegator = delegator;
        }
        console.log("saveBlueprint", pending);
        db.save(pending, function(err, finalResp){
          if (err){
            console.log("ERROR saving final blueprint", err);
          } else {
            console.log("FINAL BLUEPRINT", finalResp);
            pending._rev = finalResp.rev;
            fn(null, pending); 
          }
        });
      }
    }
  });
};

Blueprint.prototype.add = function(args, fn){
  /**
    * This creates a blueprint from an object
    *
    * @param {obj} args (id=uuid, type=project, role, task, deliverable), username
    * @return {blueprint} will be a the full json of the requested object
    * 
    */
  
  var type = args.docType;
  
  console.log("BLUEPRINT-ADD", type);
    
  args.isTemplate = true;
  args.docType = 'template';
  args.isDefault = false;
  args.isActive = true;
  args.isUserTemplate = true;
  
  switch (type){
    case 'project':
      getProject(args, function(err, bp){
        if (err){
          console.log("ERROR", err);
          fn(err, false);
        } else {
          db.save(bp, function(err, bpResp){
            console.log("saved template", bpResp);
            bp._id = bpResp.id;
            bp._rev = bpResp.rev;
            fn(null, bp);
          });
        }
      });
    break;
    case 'role':
    break;
    case 'task':
      console.log("blueprinting task");
      getTask(args, function(err, bp){
        if (err){
          console.log("ERROR", err);
          fn(err, false);
        } else {
          console.log("got task to blueprint", bp);
          
          db.save(bp, function(err, bpResp){
            if (err){
              console.log("ERROR blueprinting", err);
              fn(err, false);
            } else {
              console.log("saved template", bpResp);
              bp._id = bpResp.id;
              bp._rev = bpResp.rev;
              fn(null, bp);
            }
          });
          
        }
      });
    break;
    case 'deliverable':
    /*
      console.log("got deliverable to blueprint", bp);
      bp.templateType = 'deliverable';
      bp.id = bp._id; //save the id for use instantiating the blueprint
      delete bp._id;
      delete bp._rev;
      bp.blockers = [];//blockers will contain any of the tasks that block this task
      console.log('Creating blueprint: ' , r.doc.name);
      */
    break;
  }
  
};

Blueprint.prototype.remove = function(args, fn){
  
};

Blueprint.prototype.share = function(args, fn){
  
};

exports.get = function(args, fn){
  
};