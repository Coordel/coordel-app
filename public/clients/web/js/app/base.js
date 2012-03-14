define(['dojo', 'app/controllers/appControl'], function (dojo, app) {
	dojo.ready(function(){
	  app.init();
	  
	  //listen for refresh
  	dojo.subscribe("coordel/refresh", function(){
  	  app.init();
  	});
	});		
});