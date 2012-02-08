module.exports = function(app, validate){
  
  app.get('/admin', function(req, res){
    res.render('admin/page/index', {layout: 'admin/page'});
  });
    
};