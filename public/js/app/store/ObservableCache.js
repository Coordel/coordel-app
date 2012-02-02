define("app/store/ObservableCache", [
  "dojo",
  "dojo/store/Cache",
  "dojo/store/Observable"], 
  function(dojo, Cache, Observable) {
    
  dojo.getObject("app.store", true);

  app.store.ObservableCache = function(masterStore, cachingStore) {

      var cachedStore = new Cache(masterStore, cachingStore);

      var observableStore = Observable(cachedStore);

      return dojo.delegate(observableStore, {

          notify: function(object, existingId) {

              if (existingId) { cachingStore.remove(existingId); }

              if (object) { cachingStore.add(object); }

              return observableStore.notify(object, existingId);

          }

      });

  };

return app.store.ObservableCache;
});


