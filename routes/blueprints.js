/**
 * Routes to use to reuse objects
 */
 
var Blueprint = require('./../models/blueprint');

module.exports = function(app, validate){
  
  app.get('/blueprint/attachments', function(req, res){
    //when a blueprint has attachments, apps should call this function to get a doc back with
    //the attachments
    var id = req.query.id;
    console.log("/blueprint/attachments route", id);
    Blueprint.getAttachments(id, function(err, doc){
      if (err){
        console.log("ERROR in /blueprint/attachments route", err);
        res.json({error: err});
      } else {
        //console.log("SENDING ATTACHMENTS", doc);
        res.json(doc);
      }
    });
  });
  
  app.post('/blueprint', function(req, res){
    //ADD Blueprint - this will be an object type doc that comes in
    //when an object (project, task, role, deliverable) is blueprinted, a copy is made and saved as a
    //template for the user who made the blueprint
   
    var b = new Blueprint(),
        args = req.body,
        stamp = (new Date()).toISOString();
        
    console.log("BLUEPRINT", args );
    if (!args.created){
      args.created = stamp;
      args.creator = args.username;
    }

    args.isPublic = false;
    args.updated = stamp;
    args.updater = args.username;
 
    b.add(args, function(err, bp){
      if (err) {
        console.log("ERROR blueprinting", err);
        //res.json({error: err});
      } else {
        //the template is returned
        res.json(bp);
      }
    });
  });
  
  
  /**
   * Take action on a Blueprint (share, demo)
   *
   * @id {uuid} template id for this action
   * @action {string} share, demo in querystring
   * @args {obj} usernames, market details(price) 
   * @return {obj}
   */
  app.put('/blueprint', function(req, res){
  
    //when an object (project, task, role, deliverable) is shared, a copy is made and saved for the user
    //with whom is was shared
    
    //if the share is public, then the template is marked to be shared in the market
    
    //the share can have a for sale price as well.
    
  });
    
};