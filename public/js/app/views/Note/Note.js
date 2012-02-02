define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/note.html",
    "app/util/dateFormat",
    "app/models/CoordelStore"
    ], 
  function(dojo, coordel, w, t, html, dt, db) {
  
  dojo.declare(
    "app.widgets.Note", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      id: null,
      
      templateString: html,
      
      prettyEntry: "",
      
      prettyDate: "",
      
      userName: "",
      
      postMixInProperties: function(){
        var toReturn = "",
            date = this.note.date;
            
          
        /*
    		if (date !== "" && date != undefined){
    			toReturn = new Date(date).toString("MMM dd, yyyy hh:mm");
    			if (new Date(date).getYear() == new Date().getYear()){
    				toReturn = new Date(date).toString("MMM dd hh:mm");
    			}
    		}
    		*/
    		
    		//keep line breaks
    		if (this.note.entry){
    		  this.prettyEntry = this.note.entry.replace(/\n/g, "<br>");
    		}
    		
    		if (this.note.created){
    		  this.prettyDate = dt.prettyISODateTime(this.note.created);
    		}
    		
    		if (this.note.username !== db.username()){
    		  this.userName = db.contactFullName(this.note.username);
    		}
    		
    		
      },
      
      postCreate: function(){
        this.inherited(arguments);
     
      },
      
      baseClass: "note"
  });
  return app.widgets.Note;     
});