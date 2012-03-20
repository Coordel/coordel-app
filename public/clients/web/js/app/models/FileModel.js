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
      //return this.db.get(id);
      
      return dojo.xhrGet({
        url: "/coordel/" + id,
        handleAs: "json"
      });
      
    },
    
    getProject: function(id){
      //return this.db.get(id);
      return dojo.xhrGet({
        url: "/coordel/" + id,
        handleAs: "json"
      });
    },
    
    getFile: function(id){
      //console.log("get file", id);
      //return this.db.get(id);
      return dojo.xhrGet({
        url: "/coordel/" + id,
        handleAs: "json"
      });
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
      //console.log("get attached files", field);
      
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
      //console.log("remove attachment", fileId);
      return this.db.remove(fileId);
    },
    
    attachFile: function(file, username){
      //console.log("attachFile", file, username);
      //this file saves a file to a deliverable and returns all the files of the field
      //console.debug("attachFile", file, username);
      var db = this.db,
          def = new dojo.Deferred(),
          self = this;
          
      var put = db.put(file, {username: username});
      dojo.when(put, function(resFile){
        //console.log("put complete", resFile);
        var load = self.getAttachedFiles(file.field);
        dojo.when(load, function(files){
          //console.log("load complete", files);
          def.callback(files);
        });
      });
      
      return def;
    },
    
    removeFile: function(task, file){

      var def = new dojo.Deferred();
      
      if (task._attachments){
        for (var name in task._attachments){
          if (name === file){
            delete task._attachments[name];
          }
        }
      }
      
      var args = {
        url: this.db.target + task._id,
        handleAs: "json",
        putData: dojo.toJson(task),
        headers:{
					"Content-Type": "application/json; charset=UTF-8",
					"Accept": "application/json"
				},
        load: function(resp){
          //console.debug("got response in removeAll", resp);
          task._rev = resp.rev;
          def.callback(task);
        }
      };
      
      dojo.xhrPut(args);
  
      return def;
    
    },
    
    promoteFile: function(fileId, username){
      var db = this.db;
      var def = new dojo.Deferred();
      var file = db.get(fileId);
      file.then(function(resp){
        //console.debug("file to promote", resp);
        var x = db.put(resp, {username: username});
        dojo.when(x, function(xResp){
          //console.log("xResp", xResp);
          def.callback(xResp);
        });
      });
      return def;
    }
  });
  
  return app.models.FileModel;
      
});

