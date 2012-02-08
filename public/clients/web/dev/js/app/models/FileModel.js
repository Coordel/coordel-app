define(
  "app/models/FileModel",["dojo", "app/store/CouchDbStore", "app/models/CoordelStore"],
   function(dojo,couch, db) {
  dojo.declare("app.models.FileModel", [couch], {
    
    db: null,
    
    username: null,
    
    init: function(){
      this.db = new couch({
        target: "/" + djConfig.couchdb + "/", 
        idProperty: "_id"
      });
      return this;
    },
    
    getTask: function(id){
      return this.db.get(id);
    },
    
    getProject: function(id){
      return this.db.get(id);
    },
    
    getFile: function(id){
      return this.db.get(id);
    },
    
    removeAll: function(obj){
      
        var def = new dojo.Deferred();
        
        if (obj._attachments){
          delete obj._attachments;
        }
        
        var args = {
          url: this.db.target + obj._id,
          handleAs: "json",
          putData: dojo.toJson(obj),
          headers:{
  					"Content-Type": "application/json; charset=UTF-8",
  					"Accept": "application/json"
  				},
          load: function(resp){
            //console.debug("got response in removeAll", resp);
            obj._rev = resp.rev;
            def.callback(obj);
          }
        };
        
        dojo.xhrPut(args);
    
        return def;

    },
    
    getAttachedFiles: function(field){
      
      var db = this.db;
      
      var def = new dojo.Deferred();
      
      var queryArgs = {
        view: "coordel/fieldFiles",
    		startkey: [field,{}],
    		endkey: [field],
    		include_docs: true,
    		descending: true
    	};

      var load = db.query(queryArgs);
      load.then(function(resp){
        def.callback(resp);
      });
      
      return def;
    },
    
    removeAttachment: function(fileId){
      return this.db.remove(fileId);
    },
    
    attachFile: function(file, username){
      //this file saves a file to a deliverable and returns all the files of the field
      //console.debug("attachFile", file, username);
      var db = this.db;
      
      db.put(file, {username: username});
      
      return this.getAttachedFiles(file.field);
    },
    
    removeFile: function(task, file){
      
      var def = new dojo.Deferred();
      
      var args = {
         url: this.db.target + task._id + "/" + file + "?rev=" + task._rev,
         handleAs: "json",
         load: function(resp){
           delete task._attachments[file];
           task._rev = resp.rev;
           def.callback(task);
         }
      };
      dojo.xhrDelete(args);
      return def;
    },
    
    promoteFile: function(fileId, username){
      var db = this.db;
      var def = new dojo.Deferred();
      var file = db.get(fileId);
      file.then(function(resp){
        //console.debug("file to promote", resp);
        var x = db.put(resp, {username: username});
        def.callback(x);
      });
      return def;
    }
  });
  
  return app.models.FileModel;
      
});

