define(["dojo", 
  "dijit/_Widget",
  "dijit/_Templated",
  "text!./templates/TextVersion.html",
  "app/util/dateFormat",
  "i18n!app/nls/coordel",
  "dijit/Tooltip",
  "dijit/form/Textarea"], function(dojo, w, t, html, date, coordel, Tooltip) {
  dojo.declare(
  "app.form.TextVersion", 
  [w, t], 
  {
    templateString: html,
    
    coordel: coordel,
    
    textDate: "",
    
    text: "",
    
    textVersion: "",
    
    prettyDate: "",
    
    interval: null,
    
    postCreate: function(){
      this.inherited(arguments);
      
      dojo.connect(this.promoteVersion, "onclick", this, function(){
        this.onPromote(this.textDate);
      });
      
      var tip = new Tooltip({
        connectId: this.promoteVersion,
        label: '<span style="font-size: 10px">' + this.text.replace(/\n/g, "<br>") + '</span>',
        position: ["below", "after"]
      }).placeAt(this.domNode);
      
      //refresh the timeago
      this.interval = setInterval(dojo.hitch(this, this._refresh), 60000);
    },
    
    onPromote: function(){
      
    },
  
    _refresh: function(){
      this.timeago.innerHTML = date.ago(this.textDate);
    },
    
    destroy: function(){
      this.inherited(arguments);
      clearInterval(this.interval);
    },
    
    baseClass: "text-version"
    
  });
  return app.form.TextVersion;    
});

