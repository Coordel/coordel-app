/**
 * Routes to use to reuse objects
 */
 
var Blueprint = require('./../models/blueprint');

module.exports = function(app, validate){
  
  app.post('/blueprint', validate, function(req, res){
    //ADD Blueprint - this will be an object type doc that comes in
    //when an object (project, task, role, deliverable) is blueprinted, a copy is made and saved as a
    //template for the user who made the blueprint
    var b = new Blueprint(),
        args = req.body;
    
    args.isPublic = false;
    
    console.log("ASSIGNMENTS", args.assignments.length);
      
        
    b.add(args, function(err, bp){
      if (err) {
        //res.json({error: err});
      } else {
        res.json(bp);
      }
    });
    
    //the template is returned
    
  });
  
  
  /**
   * Take action on a Blueprint (share, demo)
   *
   * @id {uuid} template id for this action
   * @action {string} share, demo in querystring
   * @args {obj} usernames, market details(price) 
   * @return {obj}
   */
  app.put('/blueprint', validate, function(req, res){
  
    //when an object (project, task, role, deliverable) is shared, a copy is made and saved for the user
    //with whom is was shared
    
    //if the share is public, then the template is marked to be shared in the market
    
    //the share can have a for sale price as well.
    
  });
    
};