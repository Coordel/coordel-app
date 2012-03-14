/**
 * handles the work required to create and share blueprints of existing objects
 *
 * The assumption there will be no updates of blueprints. Rather, a new blueprint will be created from
 * an existing object. 
 */
 
require('date-utils');

var config = require('konphyg')(__dirname + './../config'),
    settings = config('settings'),
    couchOpts   = settings.config.couchOptions,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName),
    async       = require('async');
    

var Blueprint = exports = module.exports = function Blueprint(args){
 
};

function loadBlueprintAttachments(bpAtts, fn){
  //this loads the starter docs for a project that was blueprinted
  //they are in an object that has the original doc is with the atts to use

  var docs = [];
  //get all the docs that have the attachments to get
  for (var key in bpAtts){

    docs.push(bpAtts[key]);
  }
  loadProjectAttachments(docs, function(err, list){
    //the return will have the new list with the original id 
    //need to reassemble with doc back together with the original doc id
    for (var key in bpAtts){

      bpAtts[key]=list[bpAtts[key]._id];
    }
    //return the docs
    fn(false, bpAtts);
  });
}

function loadProjectAttachments(docs, fn){
  //this creates attachment holders for any docs in the project that have attachments
  console.log("loading project attachments...", docs.length);
  var attached = {};
  
  async.forEach(docs, 
    
    function(doc, callback){
      //load the attachments for this doc
      var load = {};
      load.id = doc._id;
      load.attachments = doc._attachments;
      loadAttachments(load, function(err, result){
        attached[load.id]=result;
        callback();
      });
    }, 

    function(err){
      if (err){
        console.log("ERROR loading project attachments", err);
        fn(err, null);
      } else {
        fn(false, attached);
      }
  });
}

function loadAttachments(args, fn){
  /**
   * This function duplicates the attachments of the into a doc and returns it 
   * 
   *
   * @param {array} args.attachments - the list of attachments to load
   * @param {uuid} args.id - id of the doc that has the existing attachments
   * @return {Type}
   * @api public
   */
  var atts = [],
      doc = {};
  
  for (var key in args.attachments){
    atts.push(key);
  }
  
  db.save(doc, function(err, res){
    if (err){
      console.log("ERROR saving initial blueprint doc", err);
    } else {
      doc._id = res.id;
      doc._rev = res.rev;
      
      async.forEachSeries(atts, function(name, callback){

        var fileStream = db.getAttachment(args.id, name);

        var stream = db.saveAttachment(doc, {
            name: name, 
            contentType: args.attachments[key].content_type
        }, function(err, attachRes){
          if (err) {
            console.log("ERROR adding attachment to blueprinted object", err);
            //res.json({error: err});
          } else {
            doc._rev = attachRes.rev;
            callback();
          }
        });

        fileStream.pipe(stream);

        }, function(err){

          db.get(doc._id, function(err, result){
            if (err){
              console.log("ERROR getting blueprinted attachments", err);
              fn(err, null);
            } else {
              fn(false, result);
            }
          });
      });
    }
  });
}

function getProject(args, fn){
  console.log("GETTING PROJECT", args.project._id);
  
  
  
  
  var bp = args,
      attached = {},
      viewArgs = {
        startkey: [args.project._id], 
        endkey:[args.project._id, {}], 
        include_docs: true};
        
  args.sourceId = args.project._id;
  args.name = args.project.name;
  
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
      
      var toAttach = [];
      docs.forEach(function(doc){
        if (doc._attachments){
          toAttach.push(doc);
        }
      });
      
      if (toAttach.length > 0){
        loadProjectAttachments(toAttach, function(err, result){
          console.log("project docs with attachments", result);
          bp.blueprintAttachments = result;
          doBlueprint();
        });
      } else {
        doBlueprint();
      }
      
      function doBlueprint(){
        
        console.log("doBlueprint", docs);
        
        docs.rows.map(function(r){
          switch (r.key[1]){
            case PROJ:
              bp.roles = [];
              bp.tasks = [];//tasks will be any tasks that dont block
              bp.blockers = [];//blockers will contain any of the tasks that block others in the project
              console.log('Creating blueprint: ' , r.doc.name);
            break;
            case ROLE:
              //roles will arrive next, expand the bp assignment role with the role doc
              bp.roles.push(r.doc);
            break;
            case BLOCK:
              if (r.doc.project !== bp.sourceId){
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
            break;
          }
        });

        fn(null, bp);
      }
    }
  });
}

function getTask(args, fn){
  
  console.log("Getting Task: '" + args.task.name + "'" );

  var bp,
      id = args.task._id,
      //rev = args._rev,
      //responsible = args.responsible,
      username = args.username,
      attachments = null;
  
     
  if (args.task._attachments){
    attachments = args.task._attachments;
  }
  
  args.sourceId = id;
  args.name = args.task.name;
  args.username = ""; //need to clear out the username so we can attach without notifying the user
  
  bp = args;
  
  //db.view('coordel/tasks', viewArgs, function(err, docs){
  db.save(bp, function(err, result){
    if (err){
      fn(err, false);
    } else {
      
      bp._id = result.id;
      bp._rev = result.rev;
      
      //console.log('new blueprint created...');
      
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
              //console.log("attached file to blueprint...");
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
        
        //console.log("saving blueprint...");
        
        db.save(pending, function(err, finalResp){
          if (err){
            console.log("ERROR saving final blueprint", err);
          } else {
            pending._rev = finalResp.rev;
            //console.log("Final Blueprint: '" + pending + "'");
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
  
  var type = args.templateType;
  
  //console.log("Add Blueprint type: '" + type + "'");
    
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
          //console.log("final blueprint", bp);
          db.save(bp, function(err, bpResp){
            //console.log("saved template", bpResp);
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
      //console.log("blueprinting task");
      getTask(args, function(err, bp){
        if (err){
          console.log("ERROR blueprinting task + '" + err + "'");
          fn(err, false);
        } else {
          //console.log("got task to blueprint", bp.name);
          fn(null, bp);
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

exports.getAttachments = function(templateid, fn){

  /**
   * This function takes the _id of a template, loads it, and then creates starter docs
   * with attachments created to be used by taskforms and project forms
   *
   * @param {Type} name
   * @return {Type}
   * @api public
   */
  //get the template based on the id in the args
  console.log("getAttachments", templateid);
  db.get(templateid, function(err, bp){
    if (err){
      console.log("ERR creating template attachments", err);
      fn(err, null);
    } else {
      //create a doc the the attachments and return it
      //console.log("BLUEPRINT ATTACHMENTS", bp);
      if (!bp._attachments && !bp.blueprintAttachments){
        fn(false, {});
      } else {
        switch (bp.templateType){
          case "project":
            if (bp.blueprintAttachments){
              console.log("get project starter docs...");
              
              loadBlueprintAttachments(bp.blueprintAttachments, function(err, list){
                fn(false, list);
              });
              
            }
          break;
          case "task":
            loadAttachments({id:bp._id, attachments: bp._attachments}, function(err, atts){
              if (err){
                console.log("ERROR loading attachements for template", err);
                fn(err, null);
              } else {
                //console.log("Loaded attachments", atts);
                fn(false, atts);
              }
            });
          break;
          case "deliverable":
          break;
        }
      }
    }
  });
  
  
  
  
};