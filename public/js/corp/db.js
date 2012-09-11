define([
  "dojo/request/xhr",
  "dojo/Deferred"], function(xhr, Deferred){
  
  var db = {
    load: function(url, options){
      var def = new Deferred();
      xhr(url, options).then(function(data){
        // Do something with the handled data
        def.resolve(data);
      }, function(err){
        // Handle the error condition
        def.resolve(err);
      }, function(evt){
        // Handle a progress event from the request if the
        // browser supports XHR2
        def.progress(evt);
      });
      return def;
    }
  };

  return db;
});