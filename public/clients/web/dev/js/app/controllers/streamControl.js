define([
  "dojo",
  "dojo/DeferredList",
  "dijit",
  "dijit/form/Button",
  "dijit/form/DropDownButton",
  "app/views/StreamHeader/StreamHeader",
  "app/views/StreamActivity/StreamActivity",
  "app/views/StreamMessage/StreamMessage",
  "app/views/TaskDetailsHeader/TaskDetailsHeader",
  "app/layouts/streamLayout",
  "i18n!app/nls/coordel",
  "app/models/CoordelStore"], function(dojo, dl, dijit, bn, ddbn, sh, sa, sm, tlh, layout, coordel, db) {
	return {
		contextFilter: "", //this will be  full, project, contact or task
		pendingFilter: null, //this holds the filter while in do not disturb mode so when coming out can get to right context
		contextId: null, //this is the id of the current context
		pendingId: null, //same as pendingFilter but for the id
		activeTab: "messages", //the user can see messages or all activity in the stream
		isCalendarFilter: false, //by default, the stream will show the latest items, if true, it will filter by date
		calendarFilterBy: null, //string - this will be day, week, month
		calendarFilterDate: null, //date - date to enable filtering
		isDoNotDisturb: false, //toggles to indicate if do not disturb is on
		messagesOnly: true, //toggles to indicate only to show the messageStream or the fullStream
		username: null,
		navSelectHandler: null, //updates the stream according to primaryNav events
		showTaskStreamHandler: null, //handles requests to show the task stream from task lists
		updateStreamHandler: null, //updates the stream
		doNotDisturbHandler: false,
		init: function(username, db) {
		  this.username = username;
		  var sc = this;
		  
		  //console.debug("db in streamControl", sc.db);
		  
		  layout.showLayout();
		  
		  //get the header and container for the stream;
		  var head = dijit.byId("mainLayoutHeaderRight"),
		      cont = dijit.byId("streamContainer");
		  
		  if (head.hasChildren()){
	      head.destroyDescendants();
	    }
		      
		  var contact = db.contact(username);
		  
      head.addChild(new sh({userFullName: contact.first + " " + contact.last}));
      
      this.showStream(); 
      
      
      dojo.connect(dojo.byId("messagesTab"), "onclick", this, function(evt){
        //console.debug("message tab clicked", evt);
        this.showMessagesTab();
      });
      
      dojo.connect(dojo.byId("allActivityTab"), "onclick", this, function(evt){
        //console.debug("all activity tab clicked", evt);
        this.showActivityTab();
      });
      
      //listen for navSelection in case task stream was set
      this.navSelectHandler = dojo.subscribe("coordel/primaryNavSelect", this, "showPrimaryNavStream");
      
      //listen for streamChanges
      //this will update the header to show a back to stream button
      //and navigate to the the task stream
      this.showTaskStreamHandler = dojo.subscribe("coordel/showTaskStream", this, "showTaskStream");
      
      //update stream is the generic way to set the stream
      this.updateStreamHandler = dojo.subscribe("coordel/updateStream", this, "updateStream");
      
      //watch for doNotDisturb
      this.doNotDisturbHandler = dojo.subscribe("coordel/doNotDisturb", this, "setDisturbStatus");
      
		},
		
		setDisturbStatus: function(status){
		  //status = false, means do not disturb deactivated
		  //status = true means do not disturb activated
		  //console.debug("setting disturb status", status);
		  
		  //set the dnd status
	    this.isDoNotDisturb = status;
		  
		  //if we turn off do not disturb, need to update the stream to where we are right now
		  //since it hasn't been loading
		  if (!status){
		    //console.debug("disturb deactivated, updating stream", this.contextId, this.contextFilter);
		    
		    //need to create an object with the currently saved context since it was updating all along
		    this.updateStream({
		      id: this.pendingId,
		      name: this.pendingFilter
		    });
		  }
		  
		},
		
		showActivityTab: function(){
		  if (dojo.hasClass("allActivityTab", "inactive")){
        dojo.addClass("messagesTab","inactive");
        dojo.removeClass("allActivityTab", "inactive");
        this.activeTab = "allActivity";
        this.showStream();
      }
		},
		
		showPrimaryNavStream: function(args){
		  /*
		  //make sure that if user had used the stream button in a task list that
		  //the stream header goes back to normal when navigated
		  dojo.addClass(dijit.byId("backToStreamButton").domNode, "hidden");
      dojo.removeClass(dijit.byId("filterStreamButton").domNode, "hidden");
      */
		  
		},
		
		showTaskStream: function(args){
		  //this allows for showing the stream on a task from any task list
		  //it works just like primaryNav but changes the header
		  
		  //update the header by hiding the filter button and showing the back button
		  dojo.removeClass(dijit.byId("backToStreamButton").domNode, "hidden");
		  dojo.addClass(dijit.byId("filterStreamButton").domNode, "hidden");
		  
		  //show the stream
		  this.updateStream(args);
		},
		
		showMessagesTab: function(){
		  if (dojo.hasClass("messagesTab", "inactive")){
        dojo.removeClass("messagesTab","inactive");
        dojo.addClass("allActivityTab", "inactive");
        this.activeTab = "messages";
        this.showStream();
      }
		},
		
		setTitle: function(title){
		  dojo.byId("streamHeaderTitle").innerHTML = title;
		},
		
		updateStream: function(args){
		  
		  // dont bother if do not disturb
		  if (this.isDoNotDisturb){
		    //console.debug("don't disturb, didn't bother updating stream but set pending variables");
		    this.pendingFilter = args.name;
		    this.pendingId = args.id;
		    return;
		  }

		  var context = this.contextFilter,
		      id = this.contextId,
		      store = db.streamStore;
		      
		  //call this function when the stream context changes
		  //console.debug("args in updateStream", args, context, id);
		  if (args.name !== context || args.id !== id){
		    this.contextFilter = args.name;
	      this.contextId = args.id;
	      
	      //console.debug ("context updated", args);
  		  
		    //otherwise load the stream according to context 
  		  switch(args.name){
  		    case "project":
  		      this.showMessagesTab();
  		      store.loadProjectStream(args.id);
  		      this.setTitle(coordel.stream.projectStream);
  		      break;
  		    case "task":
  		      this.showActivityTab();
  		      store.loadTaskStream(args.id);
  		      this.setTitle(coordel.stream.taskStream);
  		      break;
  		    case "contact":
  		      this.showMessagesTab();
  		      store.loadContactStream(args.id);
  		      this.setTitle(coordel.stream.contactStream);
  		      break;
  		    default:
  		      this.showMessagesTab();
  		      store.loadUserStream();
  		      this.setTitle(coordel.stream.fullStream);
  		  }
  		  this.showStream();
		  }
		  
		},
		
		showStream: function(){
		  //console.debug("showing the stream");
		  //dont bother if do not disturb
		  if (this.isDoNotDisturb){
		    //console.debug("don't disturb, didn't bother showing stream");
		    return;
		  }
		  
		  var cont = dijit.byId("streamContainer"),
		      context = this.contextFilter,
		      store = db.streamStore,
		      tab = this.activeTab;
		  
		  if (cont.hasChildren()){
		    cont.destroyDescendants();
		  }
		  
		  //when a user makes a comment
      store.stream.forEach(function(item){
        
        if (tab === "messages"){
          //console.debug("enumerating stream items", item, item.verb);
          //show the Messages
          if (item.object.type === "NOTE" || item.object.type === "COMMENT"){
            cont.addChild(new sm(item));
          }
        } else {
          //console.debug("enumerating stream items", item, item.verb);
          //show the Activity
          if (item.object.type !== "NOTE" && item.object.type !== "COMMENT"){
            cont.addChild(new sa(item));
          } else {
            cont.addChild(new sm(item));
          }
        }
      });
      
		}
	};
});