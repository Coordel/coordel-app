define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/TaskNotes.html",
    'i18n!app/nls/coordel',
    "app/views/QuickEntry/QuickEntry",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "app/views/Note/Note",
    "app/models/CoordelStore",
    "app/widgets/ContainerPane"
    ], 
  function(dojo, w, t, html, coordel, QuickEntry, Memory, Obs, Note, db) {
  
  dojo.declare(
    "app.views.TaskNotes", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      task: null, 
      
      isAddEnabled: true, 
      
      quickEntry: null, 
           
      postCreate: function(){
        this.inherited(arguments);
        
        this._createStore();

  		  //add the QuickEntry control is this is addEnabled
  		  if (this.isAddEnabled){
  		    this.quickEntry = new QuickEntry({
    		    addTitle: coordel.taskDetails.newNote,
    		    entryType: "note"
    		  }).placeAt(this.addContainer);
  		  } else {
  		    //need to put a border on the bottom of the last note
  		    dojo.addClass(this.domNode, "no-add");
  		  }

  		  dojo.connect(this.quickEntry, "onSave", this, function(args){
  		    //console.debug("quickentry onSave notes", args.entry, args.entry.entry);
  		    this.add(args.entry);
  		  });
  		  
  		  this.showNotes();
       
      },
      
      onRemove: function(note){
        //console.debug("note removed", note);
        this._checkBorder();
      },
      
      onInsert: function(note){
        //console.debug("note inserted", note);
        this._checkBorder();
      },
      
      add: function(note){
        
        this.store.add(note);
        this.save();
        
      },
      
      update: function(note){
        this.store.put(note);
        this.save();

      },
      
      _createStore: function(){ 
        var self = this;
        
        var cont = this.listItems;
        
        this.store = new Memory({data: this.task.notes, idProperty: "_id"});
        this.store = new Obs(this.store);
        
        this.notes = this.store.query(null, {sort:[{attribute: "created", descending: true}]});
	      
	      //observe the two lists
  		  //need to watch and see if there is a change to this list
        this.observeHandler = this.notes.observe(function(note, removedFrom, insertedInto){
          
          //was this a delete
          if (removedFrom > -1){
            cont.removeChild(removedFrom);
            self.onRemove(note);
          }

          if (insertedInto > -1){
            cont.addChild(new Note({note:note}), insertedInto);
            self.onInsert(note);
          }

        });
      },
      
      showNotes: function(){
        //console.debug("showNotes called");
  		  var cont = this.listItems;
 
  		  if (cont.hasChildren()){
  		    cont.destroyDescendants();
  		  }
  		  
  		  if (this.isAddEnabled){
  		    //if no notes need to hide the top border of the quickentry control
          this._checkBorder();
  		  } else {
    		    //this means there is nothing to show, need to hide the bottom border
    		    if (this.notes.length === 0){
              dojo.removeClass(this.domNode, "no-add");
    		    }
    		  }
  		  
  	    dojo.forEach(this.notes, function(item){
  	      child = new Note({note:item});
  		    cont.addChild(child);
  		    //list.addChild(new todo({todo:item}));
  		  });
        
      },
      
      _checkBorder: function(){
        //if no notes need to hide the top border of the quickentry control
        dojo.removeClass(this.quickEntry.quickEntry, "c-border-top-none");
        if (this.notes.length === 0){
          dojo.addClass(this.quickEntry.quickEntry, "c-border-top-none");
        }
      },
      
      save: function(){
        //this function saves the task with the changes to the checklist
        var t = db.getTaskModel(this.task, true);
  		  t.update(this.task);
      },
      
      baseClass: "task-notes"
  });
  return app.views.TaskNotes;     
});