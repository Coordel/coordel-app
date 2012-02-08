define(
  ["dojo", 
  "app/views/ConfirmDialog/ConfirmDialog", 
  "text!./templates/DNDDialog.html",
  "i18n!app/nls/coordel",
  "dijit/_Widget",
  "dijit/_Templated",
  "app/models/CoordelStore",
  "app/views/Contact/Contact",
  "app/widgets/ContainerPane"], function(dojo, Dialog, html, coordel, w, t, db, c, cp) {
  dojo.declare(
  "app.views.DNDDialog", 
  [w,t], 
  {
    templateString: html,
    
    widgetsInTemplate: true,
    
    coordel: coordel,
    
    saveApp: false,
    
    app: null,
    
    postCreate: function(){
      this.inherited(arguments);
      //console.debug("in dndDialog");
      
      this.app = dojo.clone(db.appStore.app());
      
      var app = this.app;
      
      //if vips doesn't exist, create it;
      if (!app.vips){
        app.vips = [];
      }
      
      var cons = db.contacts();
      
      //create a pane to hold the contacts
      var pane = this.contactList;
      
      var count = 0;
      var leftOver = false;
      var row = new cp({
        style: "padding:0;",
        "class": "vip-contact-row"
      });
      
      //add the contacts two to a row
	    cons.forEach(function(con){
	      if (con._id !== db.username()){
	        con = this._prepareContact(con);
  	      row.addChild(con);
  	      count += 1;
          leftOver = true;
  	      if (count === 2){
  	        pane.addChild(row);
  	        row = new cp({
              style: "padding:0",
              "class": "vip-contact-row"
            });
            count = 0;
            leftOver = false;
  	      }
	      }
	    }, this);
	    
	    //it might be that there weren't and even number of contacts so there could be a left over one in a row
	    //if there is a leftover, add the final row
	    if (leftOver){
	      pane.addChild(row);
	    }
	      
	    dojo.connect(this.dndDialog, "onConfirm", this, "onConfirm");
    },
    
    show: function(){
      this.dndDialog.show();
    },
    
    onConfirm: function(){
      //console.debug("confirming in dndDialog", this.saveApp, this.app);
      if (this.saveApp){
        var app = this.app;
        db.appStore.store.put(app, {id: app._id, username: db.username()});
      }
    },
    
    _prepareContact: function(con){
      
      var app = this.app,
          cssString = "vip-contact";
      
      if (dojo.some(app.vips, function(id){
        return(id === con._id);
      })){
        //console.debug("contact was already selected");
        cssString = "vip-contact selected";
      }
      
      var val = new c({
        contact: con,
        "class": cssString
      });
      
      //console.debug("contact container", val);
      
      //handle clicking of contact
      dojo.connect(val, "onClick", this, function(){
        console.debug("contact clicked");
        
        if (!dojo.hasClass(val.domNode, "selected")){
          //it wasn't selected so we need to see if this contact is in the vip list
          //and if not add it
          
          if (app.vips.length === 0){
            //console.debug("no vips, push it");
            app.vips.push(con._id);
            this.saveApp = true;
          } else if (!dojo.some(app.vips, function(id){
            return (id === con._id);
          })){
            //console.debug("contact not in vips yet, push it");
            app.vips.push(con._id);
            this.saveApp = true;
          }
          
          dojo.addClass(val.domNode, "selected");
        } else {
          //it was selected so we need to remove this contact from the vip list
          var delKey = -1;
          dojo.forEach(app.vips, function(id, key){
            if (id === con._id){
              delKey = key;
            }
          });
          
          if (delKey > -1){
            //console.debug("remove from vips");
            app.vips.splice(delKey, 1);
            this.saveApp = true;
          }
          
          dojo.removeClass(val.domNode, "selected");
        }
      }, this);
      
      return val; 
    }
    
  });
  return app.views.DNDDialog;    
});

