define(
  ["dojo",
    "dijit/form/_FormWidget",
    "text!./templates/File.html",
    "app/models/CoordelStore",
    "app/models/FieldModel2",
    "app/form/UploaderFile",
    "app/util/dateFormat",
    "app/models/FileModel",
    "app/widgets/ContainerPane",
    "app/form/CurrentFile",
    "app/form/Version",
    "dojo/date/stamp",
    "i18n!app/nls/coordel",
    "app/form/Uploader"
    

    ], 
  function(dojo, _FormWidget, html, db, fModel, UploaderFile, date, FileModel, cp, CurrentFile, Version, stamp, coordel) {
  
  dojo.declare(
    "app.views.Deliverable.formFields.File", 
    [_FormWidget], 
    {
      
      type: "file",
      
      fileDb: null, 
      
      coordel: coordel,
      
      username: null,
      
      currentId: null,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      uploadingFile: null, 
      
      displayVersions: false, 
      
      focus: function(){
        
      },
    
      postCreate: function(){
        this.inherited(arguments);
    
        this.fileDb = new FileModel().init();
        this.username = db.username();
        
        fModel.field = this.field;
        
        this.currentId = db.uuid();
        this.uploader.set("url", db.db + "files/" + this.currentId);
        
        this.currentFile = new cp({style: "padding:0"}).placeAt(this.current);
        
        this.versionFiles = new cp({style: "padding:0"}).placeAt(this.versions);
        
        if (!fModel.hasValue()){
          this.showNone();
        } else {
          this.showFiles();
        }
        
        //create a uuid for the next file to upload
        //set the url of the uploader using the new uuid
        
        dojo.connect(this.uploader, "onChange", this, function(fileList){
          //console.debug("got files to upload", fileList);
        });
        
        dojo.connect(this.uploader, "onBeginFile", this, function(file){
          //console.debug("file upload started", file);
          
          //the loading file is always the current file
          //move the existing Upload file in the current container to the versions container
          //add a new UploadFile to the current container
          //manage its state
          
          this.showLoading();
    
        });
        
        //watch for changes to the value and update the field
        this.watch("field.value", function(prop, oldVal, newVal){
          //console.debug("File value changed", prop, oldVal, newVal);
          //self.set("deadline", newVal);
          self.field.value = newVal;
        });
        
        dojo.connect(this.uploader, "onComplete", this, function(args){
          //console.debug("file uploaded", args);

          //when the file (or files) is uploaded, a new doc is created to hold it (the) and we get it back.
          //we then need to add the docType and the deliverable id to the file so
          //we can find all the files for this deliverable later
          
          //then we refresh the displayed files
          //if there's one file, just show it as current
          //if there's more than one file, show the latest file as current and the rest as versions
          
          var self = this;
          
          //load the file
          var file = self.fileDb.getFile(self.currentId);
          
          //console.debug("file", file);
          
          file.then(function(resp){
            
            //set the field id
            resp.field = self.field.id;
            resp.docType = "file";

            //console.debug("here's the file with deliverable set", resp, self.fileDb);
            
            //now attach the file to this field
            var attach = self.fileDb.attachFile(resp, self.username);
            
            attach.then(function(files){
              //console.debug("attached field files", files, self);
              self.field.value = files[0]._id;
              
              if (!self.field.data){
                self.field.data = {};
                self.field.data.ready = false;
                self.field.data.variables = [];
              }
              
              //a file is created as a data field. need to set the data.ready variable true
              //since we have a file now
              self.field.data.ready = true;
              
              //refresh the files
              self.showFiles();
              
              //reset the uploader
              self.currentId = db.uuid();
              self.uploader.set("url", db.db +"files/"  + self.currentId);
              self.uploader.set("rev", null);
              
              self.hideLoading();
            });  
          });
        });
      },
      
      setDisabled: function(){
        //console.debug("setDisabled called on file");
        
        fModel.field = this.field;
        //show the files container
        dojo.removeClass(this.filesContainer, "hidden");
        
        //hide the upload button
        dojo.addClass(this.uploadButton, "hidden");
        //hide the current label
        dojo.addClass(this.currentLabel, "hidden");
        //hide the delete button
        dojo.addClass(this.deleteCurrent, "hidden");
        //hide the versions
        dojo.addClass(this.versionsContainer, "hidden");
        if (!fModel.hasValue()){
          dojo.addClass(this.currentContainer, "hidden");
          dojo.removeClass(this.notStarted, "hidden");
        }
      },
      
      showLoading: function(){
        dojo.removeClass(this.uploadingButton, "hidden");
        dojo.addClass(this.uploadButton, "hidden");
      },
      
      hideLoading: function(){
        dojo.addClass(this.uploadingButton, "hidden");
        dojo.removeClass(this.uploadButton, "hidden");
      },
      
      showNone: function(){
        dojo.addClass(this.filesContainer, "hidden");
        dojo.addClass(this.versionsContainer, "hidden");
      },
      
      showFiles: function(){
        this.showNone();
        dojo.removeClass(this.filesContainer, "hidden");
        var self = this;
        var f = self.fileDb.getAttachedFiles(this.field.id);
        
        f.then(function(files){
          //if there are no files, then data.ready is false
          if (files.length === 0){
            self.field.data.ready = false;
          }
          //console.debug("loaded files", files);
          if (files.length > 0){
            var current = files[0];
            self.showCurrent(current);
            if (files.length > 1 && self.displayVersions){
              files.shift();
              self.showVersions(files);
            }
          } else {
            self.field.value = "";
            self.showNone();
          }
        });
      },
      
      showVersions: function(files){
        dojo.removeClass(this.versionsContainer, "hidden");
        var self = this;
        if (self.versionFiles.hasChildren()){
          self.versionFiles.destroyDescendants();
        }
        var version = files.length;
        dojo.forEach(files, function(file, count){
          
          for (var key in file._attachments){
            
            //console.debug("version file", key, file, version);
            var f = new Version({
              fileUrl: db.db + file._id + "/" + key,
              prettyDate: date.ago(file.updated),
              fileDate: file.updated,
              fileName: key,
              fileVersion: version.toString(),
              fileId: file._id
        		});
        		
        		var a = dojo.connect(f, "onPromote", self, function(args){
        		  //console.debug("promoted", args);
        		  var f = new FileModel().init();
        		  
        		  var prom = f.promoteFile(args,self.username);
        		  prom.then(function(resp){
        		    //console.debug("showing files", resp);
        		    self.showFiles();
        		  });
    
        		  dojo.disconnect(a);
        		});
        		
        		var b = dojo.connect(f, "onDelete", self, function(args){
        		  //console.debug("deleted", args);
        		  var f = new FileModel().init();
              var rem = f.removeAttachment(args);
              rem.then(function(){
                self.showFiles();
              });
        		  dojo.disconnect(b);
        		});

            self.versionFiles.addChild(f);
            version -= 1;
          }
        });
      },
      
      showCurrent: function(file){
        var self = this;
        if (self.currentFile.hasChildren()){
          self.currentFile.destroyDescendants();
        }
        for (var key in file._attachments){
          
          //console.debug("current file", key, file);
          var f = new CurrentFile({
            fileUrl: db.db + file._id + "/" + key,
            prettyDate: date.ago(file.updated),
            fileDate: file.updated,
            fileName: key,
            file: file
      		});
      		
      
          dojo.connect(this.deleteCurrent, "onclick", this, function(){
            var self = this;
            //console.debug("got the click event on the delete button");
            var f = new FileModel().init();
            var rem = f.removeAttachment(file._id);
            rem.then(function(){
              self.showFiles();
            });
          });
      
          self.currentFile.addChild(f);
        }
       
      },
      
      baseClass: "file"
  });
  return app.views.Deliverable.formFields.File;     
});

