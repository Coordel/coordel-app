/**
 * Routes for getting the users alerts and adding new alerts
 */
 
var Alert = require('./../models/alert');

module.exports = function(app, validate){
  
  /**
   * Gets all the alerts for a particular user appId
   *
   * @param{integer} username (appId) should be provided in the querystring 
   */
  app.get('/alerts/', function(req, res){
    
    var username = req.query.username;
    
    console.log("getting alerts for", username);
    
    Alert.getUserAlerts(username, function(err, alerts){
      if (err){
        console.log("ERROR getting alerts for "+username, err);
        res.json({error: "ERROR getting alerts for "+username + ": " + err});
      } else {
        res.json(alerts);
      } 
    });

  }); 
  
  /**
   * Removes the list of Alerts. this happens when the user looks at the list of alerts
   *
   * @param {integer} username
   */
  app.del('/alerts/', function(req, res){
    var username = req.query.username;
    
    console.log("removing alerts for", username);
    
    Alert.deleteUserAlerts(username, function(err, alerts){
      if (err){
        console.log("ERROR removing alerts for "+username, err);
        res.json({error: "ERROR removing alerts for "+username + ": " + err});
      } else {
        res.json({success: "ok"});
      } 
    });
  });
};