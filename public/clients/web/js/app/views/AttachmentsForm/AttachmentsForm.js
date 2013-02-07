define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/AttachmentsForm.html",
    "app/form/Uploader",
    "app/form/UploaderFile",
    "app/models/FileModel"
    ],
  function(dojo,coordel, w, t, html, Uploader, UploaderFile, FileModel) {

  dojo.declare(
    "app.views.AttachmentsForm",
    [w, t],
    {
      widgetsInTemplate: true,

      id: null,

      //need the projectId to set the url of the uploader this will be set by the projectFormAttachments
      //if it's null when required, then a new uuid will be created.
      projectId: null,

      rev: null,

      db: null,

      username: null,

      //url to be passed through to the uploader
      url: "",

      coordel: coordel,

      project: null,

      templateString: html,

      postCreate: function(){
        this.inherited(arguments);

        dojo.connect(this.uploader, "onChange", this, function(fileList){
          //console.debug("got files to upload", fileList);
        });

        dojo.connect(this.uploader, "onBeginFile", this, function(file){
          //console.debug("file upload started", file);
          this.showLoading();

          var f = new UploaderFile({file:file}).placeAt(this.loadingFiles);
        });

        dojo.connect(this.uploader, "onComplete", this, function(evt){
          //console.debug("all files uploaded", evt);
          var self = this;
          //clear the loading files (if there are any)
          dojo.empty(this.loadingFiles);

          var getProject = this._getProject();

          getProject.then(function(resp){
            //console.debug("in the _getTask deferred", resp, self.task);
            self.project._attachments = resp._attachments;
            self.project._rev = resp._rev;
            self.rev = resp._rev;
            self.setData();
            self.onChange(self.project);
          });
        });

        this.db = new FileModel().init({username: this.username});

        if (this.rev){
          this.uploader.rev = this.rev;
        }

      },

      onChange: function(project){

      },

      onShowPill: function(count){
        //console.debug("onShowPill called in AttachmentsForm", count);
      },

      showLoading: function(){
        dojo.removeClass(this.loadingFiles, "hidden");
        dojo.addClass(this.noFiles, "hidden");
      },

      showData: function(){
        dojo.addClass(this.loadingFiles, "hidden");
        dojo.addClass(this.noFiles, "hidden");
        dojo.removeClass(this.attachedFiles, "hidden");
        //dojo.removeClass(this.attachmentsPill.domNode, "hidden");
        //dojo.addClass(this.attachLabel, "hidden");
      },

      showNone: function(){
        dojo.addClass(this.loadingFiles, "hidden");
        dojo.removeClass(this.noFiles, "hidden");
        dojo.addClass(this.attachedFiles, "hidden");
        //dojo.addClass(this.attachmentsPill.domNode, "hidden");
        //dojo.removeClass(this.attachLabel, "hidden");
      },

      setUrl: function(url){
        this.uploader.url = url;
      },

      _attachmentsCount: function(){
        var files = this.project._attachments,
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

        if (self.project._attachments && this._attachmentsCount() > 0){
          //console.debug("there are attachments");
          self.showData();
          dojo.empty(self.attachedFiles);
          var files = [];
          var count = 0;
          for (var name in self.project._attachments){
            count = count + 1;
            var f = {};
            f.info = {};
            f.info.name = name;
            files.push(f);
          }
          //set the pill with the attachment count
          self.onShowPill(files.length);
          self.setFiles(files);
        } else {
          self.showNone();
        }
      },

      setFiles: function(files){
        //console.debug("files", files);
        var self = this;

        dojo.forEach(files, function(file){
          var uf = new UploaderFile({file:file}).placeAt(self.attachedFiles);
          uf.showComplete();
          dojo.connect(uf.deleteFile, "onclick", this, function(){

            var def = self.db.removeFile(self.project, uf.file.info.name);
            def.then(function(project){
              //console.debug("setFiles", project);
              self.project = project;
              var rev = project._rev;
              self.rev = rev ;
              self.uploader.set("rev", rev);
              self.setData();
            });

          });
        });
      },

      _getProject: function(){
        return this.db.getProject(this.project._id);
      },

      baseClass: "task-form-attachments"
  });
  return app.views.AttachmentsForm;
});