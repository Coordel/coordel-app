define(["dojo", 
  "dijit/_Widget",
  "dijit/_Templated",
  "text!./templates/uploaderFile.html"], function(dojo, w, t, html) {
  dojo.declare(
  "app.form.UploaderFile", 
  [w, t], 
  {
    templateString: html,
    
    widgetsInTemplate: true,
    
    file: null, 
    
    postCreate: function(){
      this.inherited(arguments);
      //console.debug("creating an uploading file", this.file);
      var f = this.file;
      dojo.connect(f, "onLoading", this, "showLoading");
      dojo.connect(f, "onError", this, "showError");
      dojo.connect(f, "onComplete", this, "showComplete");
      
      //showLoading by default
      this.showLoading();
      
      //connect the mouseover of the done button
      dojo.connect(this.completedFile,"onmouseover", this, "showDelete");
      
      //connect the mouseout of the delete button
      dojo.connect(this.deleteFile, "onmouseout", this, "showComplete");
      
    },
    
    _hideButtons: function(){
      dojo.addClass(this.completedFile, "hidden");
      dojo.addClass(this.loadingFile, "hidden");
      dojo.addClass(this.errorFile, "hidden");
      dojo.addClass(this.deleteFile, "hidden");
    },
    
    showLoading: function(){
      //console.debug("LOADING", this.file);
      this._hideButtons();
      dojo.removeClass(this.loadingFile, "hidden");
    },
    
    showComplete: function(){
      //console.debug("COMPLETE");
      this._hideButtons();
      dojo.removeClass(this.completedFile, "hidden");
    },
    
    showError: function(){
      //console.debug("ERROR");
      this._hideButtons();
      dojo.removeClass(this.errorFile, "hidden");
    },
    
    showDelete: function(){
      //console.debug("DELETE");
      this._hideButtons();
      dojo.removeClass(this.deleteFile, "hidden");
    }
  });
  return app.form.UploaderFile;    
});

