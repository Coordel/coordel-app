define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/taskFormAttachments.html",
    "dijit/_HasDropDown",
    "app/form/Uploader",
    "app/form/UploaderFile",
    "app/models/FileModel"
    ], 
  function(dojo,coordel, w, t, html, h, Uploader, UploaderFile, FileModel) {
  
  dojo.declare(
    "app.views.TaskFormAttachments", 
    [w, t, h], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      //need the taskId to set the url of the uploader this will be set by the task form
      //if it's null when required, then a new uuid will be created.
      taskId: null,
      
      rev: null,
      
      db: null,
      
      username: null,
      
      //url to be passed through to the uploader
      url: "", 
      
      coordel: coordel,
      
      task: null,
      
      placeHolder: "",
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);
        
        
        
        this.dropDown = this.attachDropDown;
        
        this.attachLabel.innerHTML = this.placeHolder;
        
        dojo.connect(this.uploader, "onChange", this, function(fileList){
          //console.debug("got files to upload", fileList);
        });
        
        dojo.connect(this.uploader, "onBeginFile", this, function(file){
          //console.debug("file upload started", file);
          this.showLoading();
          
          this.loadingFiles.addChild(new UploaderFile({file:file}));
        });
        
        dojo.connect(this.uploader, "onComplete", this, function(){
          //console.debug("all files uploaded");
          var self = this;
          //clear the loading files (if there are any)
          if (this.loadingFiles.hasChildren()){
            this.loadingFiles.destroyDescendants();
          }
          
          var getTask = this._getTask();

          getTask.then(function(resp){
            //console.debug("in the _getTask deferred", resp, self.task);
            self.task._attachments = resp._attachments;
            self.task._rev = resp._rev;
            self.rev = resp._rev;
            self.setData();
            self.onChange(self.task);
          }); 
        });
        
        this.db = new FileModel().init({username: this.username});
        
        
       
      },
      
      onChange: function(task){
        
      },
      
      showLoading: function(){
        dojo.removeClass(this.loadingFiles.domNode, "hidden");
        dojo.addClass(this.noFiles, "hidden");
      },
      
      showData: function(){
        dojo.addClass(this.loadingFiles.domNode, "hidden");
        dojo.addClass(this.noFiles, "hidden");
        dojo.removeClass(this.attachedFiles.domNode, "hidden");
        dojo.removeClass(this.attachmentsPill.domNode, "hidden");
        dojo.addClass(this.attachLabel, "hidden");
      },
      
      showNone: function(){
        dojo.addClass(this.loadingFiles.domNode, "hidden");
        dojo.removeClass(this.noFiles, "hidden");
        dojo.addClass(this.attachedFiles.domNode, "hidden");
        dojo.addClass(this.attachmentsPill.domNode, "hidden");
        dojo.removeClass(this.attachLabel, "hidden");
      },
      
      setUrl: function(url){
        this.uploader.url = url;
      },
      
      _attachmentsCount: function(){
        var files = this.task._attachments,
          count = 0;
        if (files){
          for (var key in files){
            count= count + 1;
          }
        }
        return count;
      },
      
      setData: function(){
        var self = this;
        
        if (this.rev){
          //console.debug("rev set", this.rev);
          this.uploader.rev = this.rev;
        }
        
        if (self.task._attachments && this._attachmentsCount() > 0){
          //console.debug("there are attachments");
          self.showData();
          if (self.attachedFiles.hasChildren()){
            self.attachedFiles.destroyDescendants();
          }
          var files = [];
          var count = 0;
          for (var name in self.task._attachments){
            count = count + 1;
            var f = {};
            f.info = {};
            f.info.name = name;
            files.push(f);
          }
          //set the pill with the attachment count
          self.setPill(files.length);
          self.setFiles(files);
        } else {
          self.showNone();
        }
      },
      
      setPill: function(count){
        //console.debug("show the pill");
        dojo.removeClass(this.attachmentsPill.domNode, "hidden");
        
        var label = "";
        if (count === 1){
          label = coordel.attachment;
        } else if (count > 1){
          label = coordel.attachments;
        }
       
        this.attachmentsPill.showPill(count + " " + label.toLowerCase(), this.db);
        
        //delete all attachments when the remove x is clicked on the pill
        dojo.connect(this.attachmentsPill.removeValue, "onclick", this, function(evt){
          evt.stopPropagation();
          //console.debug("got click in on remove in pill");
          
          var self = this;
          
          var def = self.db.removeAll(self.task);
          
          def.then(function(task){
            //console.debug("when task", task);
            self.task = task;
            var rev = task._rev;
            self.rev = rev ;
            self.uploader.set("rev", rev);
            self.setData();
          });
          
        });
      },
      
      setFiles: function(files){
        //console.debug("files", files);
        var self = this;
        
        dojo.forEach(files, function(file){
          var uf = new UploaderFile({file:file});
          uf.showComplete();
          dojo.connect(uf.deleteFile, "onclick", this, function(){
          
            var def = self.db.removeFile(self.task, uf.file.info.name);
            def.then(function(task){
              //console.debug("setFiles", task);
              self.task = task;
              var rev = task._rev;
              self.rev = rev ;
              self.uploader.set("rev", rev);
              self.setData();
            });
            
          });
          self.attachedFiles.addChild(uf);
        });
      },
      
      _getTask: function(){
        return this.db.getTask(this.task._id);
      },
      
      _getPositionStyle: function(parent){

  		  var query = ".task-attachments";

  		  //get the position of the li containing this control
  		  var nodePos = dojo.position(dojo.query(query)[0]);

  		  var aroundNode = parent._aroundNode || parent.domNode;

  	    //get this parent's position
  	    var parentPos = dojo.position(aroundNode.parentNode);
  	    
  	    //console.debug("parent", parentPos);

  	    //get this position
  	    var thisPos = dojo.position(aroundNode);
  	    
  	    //console.debug("this", thisPos);

  		  var style = {
  	      position: "absolute",
          left: (nodePos.x - parentPos.x + 2) + "px", // need to move left (negative number) and will result in getting 5, +3 gets it to 8px from the edge of the dropdown
          top: ((nodePos.y + nodePos.h) - (thisPos.y + thisPos.h) + 1) + "px",
          width: (nodePos.w - 16) + "px" //leaves 8px on each side
  	    };

  		  //console.debug("attachments position style", style);
  		  return style;
  		},

  	  openDropDown: function(){
  	    this.inherited(arguments);

  	    var boxStyle = this._getPositionStyle(this);

  	    

  	    //console.debug("node", this.dropDown);

  	    dojo.addClass(this.dropDown.domNode, "task-form-dropdown ui-corner-bottom dijitMenu");
  	    
  	    dojo.style(this.dropDown.domNode, boxStyle);

  	  },
      
      baseClass: "task-form-attachments"
  });
  return app.views.TaskFormAttachments;     
});