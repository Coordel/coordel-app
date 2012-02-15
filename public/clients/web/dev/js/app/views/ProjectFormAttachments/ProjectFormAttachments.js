define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/ProjectFormAttachments.html",
    "dijit/_HasDropDown",
    "app/form/Uploader",
    "app/form/UploaderFile",
    "app/models/FileModel",
    "app/views/AttachmentsForm/AttachmentsForm",
    "app/models/CoordelStore"
    ], 
  function(dojo,coordel, w, t, html, h, Uploader, UploaderFile, FileModel, Attachments, db) {
  
  dojo.declare(
    "app.views.ProjectFormAttachments", 
    [w, t, h], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      db: null,
      
      coordel: coordel,
      
      pillConnections: [],
      
      project: null,
      
      placeHolder: "",
      
      templateString: html,
      
      postCreate: function(){
        this.inherited(arguments);

        this.attachLabel.innerHTML = this.placeHolder;
        
        this.db = new FileModel().init({username: db.username()});
       
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
        
        if (this.pillConnections.length > 0){
          dojo.forEach(this.pillConnections, function(c){
            dojo.disconnect(c);
          });
        }
        
        //delete all attachments when the remove x is clicked on the pill
        var rem = dojo.connect(this.attachmentsPill.removeValue, "onclick", this, function(evt){
          evt.stopPropagation();
          //console.debug("got click in on remove in pill");
          
          var self = this;
          
          var def = self.db.removeAll(self.project);
          
          def.then(function(project){
            //console.debug("when project", project);
            self.project = project;
            self.dropDown.project = project;
            var rev = project._rev;
            self.dropDown.rev = rev;
            self.dropDown.uploader.set("rev", rev);
            self.dropDown.setData();
          });
          
          dojo.disconnect(rem);
          
        });
        this.pillConnections.push(rem);
      },
      
      setDropDown: function(project){
        this.project = project;
        this.dropDown = new Attachments({
          project: project,
          rev: project._rev
        }).placeAt(this.attachDropDown);
        
        this.dropDown.setUrl(db.db + "files/" + this.project._id);
        
        dojo.connect(this.dropDown, "onShowPill", this, function(count){
          //console.debug("got onShowPill", count);
          this.setPill(count);
        });
        
        dojo.connect(this.dropDown, "showData", this, function(){
          dojo.removeClass(this.attachmentsPill.domNode, "hidden");
          dojo.addClass(this.attachLabel, "hidden");
        });
        
        dojo.connect(this.dropDown, "showNone", this, function(){
          dojo.addClass(this.attachmentsPill.domNode, "hidden");
          dojo.removeClass(this.attachLabel, "hidden");
        });
        
      },
      
      _getPositionStyle: function(parent){

  		  var query = ".project-attachments";

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
  		
  		closeDropDown: function(/*Boolean*/ focus){

  			// summary:
  			//		Closes the drop down on this widget
  			// focus:
  			//		If true, refocuses the button widget
  			// tags:
  			//		protected

  			if(this._opened){
  				dijit.popup.close(this.dropDown);
  				this._opened = false;
  			}
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
  return app.views.ProjectFormAttachments;     
});