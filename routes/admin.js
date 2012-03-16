module.exports = function(app, validate){
  
  app.get('/admin', validate, function(req, res){
    res.render('admin/page/index', {layout: 'admin/page'});
  });  
};