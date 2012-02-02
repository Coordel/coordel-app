exports.module = function(app){
  
  app.get('/user/add', function(req, res){
    res.render('user/register');
  });
  
};