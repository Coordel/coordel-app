module.exports = function(app){
  
  app.get('/icons', function(req, res){
    res.redirect('/icons/header');
  });
  
  app.get('/icons/header', function(req, res){
    res.render('icons/index', {layout: 'icons/layout'});
  });
  
  app.get('/icons/coord', function(req, res){
    res.render('icons/coord', {layout: 'icons/layout'});
  });
  
  app.get('/icons/left', function(req, res){
    res.render('icons/left', {layout: 'icons/layout'});
  });
  
  app.get('/icons/task', function(req, res){
    res.render('icons/task', {layout: 'icons/layout'});
  });
  
  app.get('/icons/footer', function(req, res){
    res.render('icons/footer', {layout: 'icons/layout'});
  });

};