define(["dojo", 
  "dijit/_Widget",
  "dijit/_Templated",
  "text!./templates/CurrentFile.html",
  "app/models/CoordelStore",
  "i18n!app/nls/coordel",
  "app/models/FileModel",
  "app/util/dateFormat"], function(dojo, w, t, html, db, coordel, FileModel, date) {
  dojo.declare(
  "app.form.CurrentFile", 
  [w, t], 
  {
    templateString: html,
    
    fileName: "",
    
    fileDate: "",
    
    fileUrl: "",
    
    file: null, 
    
    coordel: coordel,
    
    interval: null,
    
    postCreate: function(){
      this.inherited(arguments);
      this.interval = dojo.subscribe("coordel/timeUpdate", this, "_refresh");
    },
    
    _refresh: function(){
      this.timeago.innerHTML = date.ago(this.fileDate);
    },
    
    destroy: function(){
      this.inherited(arguments);
      dojo.unsubscribe(this.interval);
    }
    
  });
  return app.form.CurrentFile;    
});