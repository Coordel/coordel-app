var admin = require('./../models/admin');

module.exports = function(app, validate){
  
  app.get('/admin', validate, function(req, res){
    res.render('admin/page/index', {layout: 'admin/page'});
  });
  
  app.get('/admin/users', validate, function(req,res){
    admin.getCoordelUsers(function(err, users){
      console.log("coordel-users", users);
      res.render('admin/page/users', {layout: 'admin/page', users: users});
    });
  }); 
};