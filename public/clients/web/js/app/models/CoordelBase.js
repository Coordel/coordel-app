/*
This is the base for all coordel objects (i.e. task, task, project, role, etc)
It enables single object

*/

define("app/models/CoordelBase",["dojo", "dojo/Stateful", "dojo/date/stamp"], function(dojo, state, stamp) {
  dojo.declare(
    "app.models.CoordelBase", 
    null, 
    {
      constructor: function(mixin){
        //console.debug("CoordelBase constructor called");
        /*
          This just mixes in the base functions for any coordel object
          and makes it stateful
          
          If it's new and no mixin, then an empty stateful object is returned
        */
        if(mixin){
          mixin = state(mixin);
    		}	else {
    		  mixin = state({});
    		}
    		
    		dojo.mixin(this, mixin);
    	
      },

			setVersion: function(doc){
				console.log("setting version", doc.name, doc.docType);
				//this tracks the versions of this doc.
				//if the doc doesn't have versions create them
        if (!doc.versions){
          doc.versions = {};
        }
        
        if (!doc.versions.latest){
					//if there isn't a latest member of versions then set it to a clone of this doc
          doc.versions.latest = dojo.clone(doc);
        } else {
					//create a versions history array
          if (!doc.versions.history){
            doc.versions.history = [];
          }
					//there was a latest member, so push the existing one to history
          doc.versions.history.push(doc.versions.latest);
					//then create a clone of this doc as the new latest
          doc.versions.latest = dojo.clone(doc);
        }
  			
				//don't replicate versions or history in the versions
        delete doc.versions.latest.history;
        delete doc.versions.latest.versions;
				return doc;
			},
			
    	icon: {
      	save: "ui-icon-disk",
      	trash: "ui-icon-trash",
      	archive: "ui-icon-folder-collapsed",
      	someday: "ui-icon-help",
      	defer: "ui-icon-calendar",
      	delegateItem: "ui-icon-arrowthick-1-e",
      	assign: "ui-icon-arrowthick-1-e",
      	dismiss: "ui-icon-close",
      	decline: "ui-icon-close",
      	accept: "ui-icon-transferthick-e-w",
      	submitItem: "ui-icon-arrowthickstop-1-e",
      	returnItem: "ui-icon-arrowthickstop-1-w",
      	approve: "ui-icon-check",
      	finish: "ui-icon-check",
      	done: "ui-icon-check",
      	cancel: "ui-icon-cancel",
      	pause: "ui-icon-pause",
      	raiseIssue: "ui-icon-alert",
      	clearIssue: "ui-icon-circle-arrow-e",
      	resume: "ui-icon-play",
      	transfer: "ui-icon-extlink",
      	newItem: "c-icon-new",
      	alert: "ui-icon-notice",
      	makeResponsible: "ui-icon-star",
      	own: "ui-icon-star",
      	invite: "ui-icon-arrowreturnthick-1-e",
      	join: "ui-icon-arrowthick-2-e-w",
      	follow: "ui-icon-arrowthick-2-e-w",
      	unfollow: "ui-icon-close",
      	leave: "ui-icon-close",
      	note: "ui-icon-note",
      	comment: "ui-icon-comment",
      	update: "ui-icon-info",
      	post: "ui-icon-plus",
      	reply: "ui-icon-comment",
      	newProject: "c-icon c-icon-new-project",
      	project: "ui-icon-suitcase",
      	action: "c-icon c-icon-action",
      	reuse: "c-icon c-icon-reuse",
      	edit: "ui-icon-pencil",
      	todo: "c-icon c-icon-task",
      	preferences: "ui-icon-gear",
      	connection: "ui-icon-extlink",
      	feedback: "ui-icon-heart",
      	addBlocking: "",
      	removeBlocking: "",
      	reassign: ""
      }
  });
  return app.models.CoordelBase;    
}
);

