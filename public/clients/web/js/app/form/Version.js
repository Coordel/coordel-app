define(["dojo", 
  "dijit/_Widget",
  "dijit/_Templated",
  "text!./templates/Version.html",
  "app/models/CoordelStore",
  "app/util/dateFormat",
  "i18n!app/nls/coordel"], function(dojo, w, t, html, db, date, coordel) {
  dojo.declare(
  "app.form.Version", 
  [w, t], 
  {
    templateString: html,
    
    coordel: coordel,
    
    fileName: "",
    
    fileDate: "",
    
    fileUrl: "",
    
    fileVersion: "",
    
    interval: null,
    
    postCreate: function(){
      this.inherited(arguments);
      
      dojo.connect(this.domNode, "onmouseover", this, function(){
        dojo.removeClass(this.buttons, "hidden");
      });
      
      dojo.connect(this.domNode, "onmouseout", this, function(){
        dojo.addClass(this.buttons, "hidden");
      });
      
      dojo.connect(this.promoteVersion, "onclick", this, function(){
        this.onPromote(this.fileId);
      });
      
      dojo.connect(this.deleteVersion, "onclick", this, function(){
        this.onDelete(this.fileId);
      });
      
      //refresh the timeago
      this.interval = setInterval(dojo.hitch(this, this._refresh), 60000);
    },
    
    onPromote: function(){
      
    },
    
    onDelete: function(){
      
    },
    
    _refresh: function(){
      this.timeago.innerHTML = date.ago(this.fileDate);
    },
    
    destroy: function(){
      this.inherited(arguments);
      clearInterval(this.interval);
    },
    
    baseClass: "file-version"
    
  });
  return app.form.Version;    
});

