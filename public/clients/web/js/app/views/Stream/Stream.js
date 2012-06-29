/*
  use this control to add a stream to any level of the application. it reacts to the currently loaded
  stream store
*/
define(
  ["dojo",
    "dojo/parser",
    "i18n!app/nls/coordel",
    "text!./templates/Stream.html",
    "app/views/StreamEntry/StreamEntry",
    "app/views/StreamMessage/StreamMessage",
    "app/views/StreamActivity/StreamActivity",
    "app/models/StreamModel",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container",
    "app/models/CoordelStore"], 
  function(dojo, parser, coordel, html, Entry, Message, Activity, sModel, w, t, c, db) {
  
  dojo.declare(
    "app.views.Stream", 
    [w, t, c], 
    {
      
      name: null,
      
      widgetsInTemplate: true, 
      
      templateString : html,
      
      showProject: false,
      
      isAlerts: false,
      
      stream: [],
      
    
      postCreate: function(){
        
        this.inherited(arguments);
        
        if (this.stream.length > 0){
          this.showStream();
          dojo.addClass(this.emptyContainer, "hidden");
        } else {
          dojo.removeClass(this.emptyContainer, "hidden");
        }
        
      },
    
      
      showStream: function(){
        var self = this,
            stream = this.stream,
            entry,
            project,
            username,
            last = false,
            hasEntries = false;
            
        
            
        //console.debug("showStream stream.length:",  stream.length);
              
        self.showProject = (db.streamStore.currentContext === "userStream" || db.streamStore.currentContext === "userMessages");
        
        if (self.isAlerts){
          self.showProject = true;
        }
        
        stream.forEach(function(item, key){
          //console.debug("iterating stream", item, key);
          if (key === 0){
            username = item.actor.id;
            project = self._getProject(item);
            //this is the first item, need to create a new entry
            entry = new Entry({showProject: self.showProject, username: username, contact: db.contactFullName(username), project: project.id, projectName: project.name});
            entry.addChild(self._getChild(item));
            hasEntries = true;
            //most entries are about something that happened in a project, so need to track the project
            //if there was only one entry, then make sure it get's added
            if (stream.length === 1){
              self.addChild(entry);
              hasEntries = false;
            }
   
          } else if (key > 0){
            //if the username and project are the same, then we need to add a child to the entry
            if (item.actor.id === username && project.id === self._getProject(item).id){
              entry.addChild(self._getChild(item));
              hasEntries = true;
            } else {
              //otherwise add the existing entry to the stream
              self.addChild(entry);
              
     
              username = item.actor.id;
              project = self._getProject(item);
     
              //and then start a new entry and add a child to it
              entry = new Entry({showProject: self.showProject, username:username, contact: db.contactFullName(username), project: project.id, projectName: project.name});
              entry.addChild(self._getChild(item));
              last = true;
            }
          }
 
        });
        
        //make sure the last one gets added
        if (last){
          self.addChild(entry);
          hasEntries = false;
        }
      
        //it might be that there is only one entry created but there are more than one stream items
        //in that case, it won't get added (usually when it's a task stream) so check here
        /*
        if (self.getChildren().length === 0 && self.stream.length > 0){
          self.addChild(entry);
        }
        */
        //console.debug("hasEntries", hasEntries);
        if (hasEntries){
          self.addChild(entry);
        }
  		},
  		
  		_getProject: function(item){
  		    //most entries are about something that happened in a project, so need to track the project
  		    try {
  		      var project;
  		      if (!item.target){
  		        project = item.object;
  		      } else {
  		        project = item.target;
  		      }
  		  
            if (item.target && item.target.type !== "PROJECT"){
              //but of the target isn't a project, it migth be that this is something that 
              //happend to the project (project is object), so track that
              project = item.object;
              if (item.object.type !== "PROJECT"){
                 //just in case something strange happens, just reset the project
                 project = {project: "", type: "", name: ""};
              }
            }
            return project;
  		    } catch (err){
  		      console.debug("ERROR getting project in stream", item);
  		      return {project: "", type: "", name: ""};
  		    }
  		    
  		},
  		
  		_getChild: function(item){
  		  var child;
  		  
  		  if (item.object.type !== "NOTE" && item.object.type !== "COMMENT"){
  		    
  		    item.allowOptions = this.showProject;
  		    item.project = this._getProject(item);
  		    child = new Activity(item);
          
        } else {
          var message = item.body,
              created = item.created;
              
          child = new Message({message: message, created: created, project: this._getProject(item), allowOptions: this.showProject});
        }
  		  
  		  return child;
  		},
  		
  		destroy: function(){
  		  this.destroyDescendants();
  		  this.inherited(arguments);
  		  this.stream = [];
  		  //console.debug("stream destroyed");
  		},
      
      baseClass: "stream"
  });
  return app.views.Stream;     
});

