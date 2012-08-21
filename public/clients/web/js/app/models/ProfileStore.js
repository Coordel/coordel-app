define(["dojo", 
        "app/store/CouchDbStore",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        "app/store/ObservableCache"], function(dojo, couch, mem, cache, obs, obsCache) {
        //return an object to define the "./newmodule" module.
        var profileStore = {
            db: "/" + djConfig.couchdb + "/",
            username: null,
            memory: null,
            observable: null,
            remote: null,
            store: null,
            isLoaded: false,
            init: function(username){
              //console.debug("initializing contacts");
              this.username = username;
              this._loadStore();
              return this;
            },
            _loadStore: function(){
              this.memory = new mem({idProperty: "_id"});
              this.memory = new obs(this.memory);
              this.remote = new couch({target: this.db, idProperty: "_id", queryEngine: dojo.store.util.QueryResults});
              this.store = new obsCache(this.remote, this.memory);
            },
            get: function(contact){
              var toReturn = {};
              
              var qProfile = {
                view: "coordel/userProfiles",
            		startkey: [contact],
            		endkey: [contact,{}],
            		include_docs: true
            	};
            	var def = new dojo.Deferred();
            	var funcs = [];
            	
            	funcs.push(this.store.query(qProfile).then(function(res){
            	  if (res.length){
            	    toReturn.profile = res[0];
            	  } else {
            	    toReturn.profile = false;
            	  }
            	}));
            	
            	var qFeedback = {
                view: "coordel/userFeedbackComments",
            		startkey: [contact],
            		endkey: [contact,{}]
            	};
            	funcs.push(this.store.query(qFeedback).then(function(res){
            	  if (res.length){
            	    toReturn.feedback = res;
            	  } else {
            	    toReturn.feedback = false;
            	  }
            	}));
            	
            	var qAvg = {
                view: "coordel/userFeedbackAvg",
            		key: contact,
            		group: true,
            		group_level: "1",
            		reduce: true
            	};
            	funcs.push(this.store.query(qAvg).then(function(res){
            	  console.log("avg", res);
            	  if (res.length){
            	    toReturn.feedbackStats = res[0];
            	  } else {
            	    toReturn.feedbackStats = false;
            	  }
            	}));
            	
            	var defList = new dojo.DeferredList(funcs);
            	dojo.when(defList, function(){
            	  def.callback(toReturn);
            	});
            	return def;
            }
        };
        
        return profileStore;
    }
);