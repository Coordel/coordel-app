define(["dojo", 
  "dojox/form/Uploader",
  "app/form/uploader/HTML5", 
  "app/form/uploader/IFrame"], function(dojo, Uploader, HTML5, IFrame) {
  dojo.declare(
    
//  NOTES: uploading to couchdb is a special process. Eliminated the plugin process and just assumed
//  IFrame used for IE and HTML5 otherwise and updated their upload processes for couch;

  "app.form.Uploader", 
  [Uploader, HTML5, IFrame], 
  {
    postCreate: function(){
      this.inherited(arguments);
      //console.debug("in the new uploader", this);
    },
    
    onProgress: function(customEvt){
      this.inherited(arguments);
      //console.log("onProgress", customEvt);
    }
    
    
  });
  return app.form.Uploader;    
});

