define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/TaskChecklist.html",
    'i18n!app/nls/coordel',
    "app/views/QuickEntry/QuickEntry",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "app/views/ToDo/ToDo",
    "app/models/CoordelStore",
    "app/views/TaskChecklistSort/TaskChecklistSort",
    "app/widgets/ContainerPane"
    ], 
  function(dojo, w, t, html, coordel, QuickEntry, Memory, Obs, ToDo, db, Sort) {
  
  dojo.declare(
    "app.views.TaskChecklist", 
    [w, t], 
    {
      coordel: coordel,
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      task: null,
      
      store: null,
      
      isEnabled: true, 
      
      observeHandlers: [],
      
      sortChangeHandler: null,
      
      sortOptions: {
        showDone: false,
        sortKeys:[{attribute: "deadline", descending: false}]
      },  //sort order defaults to sorting by name, checklist off
      
      isShowDetails: true, //set to false if the purpose and deadline of the todo should be hidden
      
      isAddEnabled: true, //set to false to hide the quick entry (i.e. in tasklist, not user or responsible)
      
      notifyHandler: null,
      
      quickEntry: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        var username = db.username();
        
        this.isEnabled = (username === this.task.username || username === this.task.responsible || username === this.task.delegator);
        
        this._createStore();
        
        this.sortChangeHandler = dojo.subscribe("coordel/checklistSortChange", this, "handleSortChange");
        
        /*
        this.sortMenu = dijit.byId("taskListDetailsSortMenu");
        
        var sort = new Sort();
        
        this.sortMenu.set("content", sort);
      
        
        dojo.connect(sort, "onSortChange", this, "handleSortChange");
        
        */
  		  
  		  //add the QuickEntry control is this is addEnabled
  		  if (this.isAddEnabled){
  		    this.quickEntry = new QuickEntry({
    		    addTitle: coordel.taskDetails.newTodo,
    		    entryType: "todo"
    		  }).placeAt(this.addContainer);
  		  } else {
  		    //need to put a border on the bottom of the last todo
  		    dojo.addClass(this.domNode, "no-add");
  		  }
  		  
  		  dojo.connect(this.quickEntry, "onSave", this, function(args){
  		    //console.debug("quickentry onSave todo", args);
  		    this.add(args.entry);
  		  });
  		  
  		  this.showChecklist();
        
      },
      
      _createStore: function(){
        
        var self = this,
            cont = this.listItems;
        
        this.store = new Memory({data: this.task.todos, idProperty: "_id"});
        this.store = new Obs(this.store);
        
        this.todos = this.store.query({done: false}, {sort:this.sortOptions.sortKeys});
	      this.doneTodos = this.store.query({done:true},{sort:this.sortOptions.sortKeys});
	      
	      //observe the two lists
  		  //need to watch and see if there is a change to this list
        var handler = this.todos.observe(function(todo, removedFrom, insertedInto){
          //console.debug("todos observed", todo, removedFrom, insertedInto);
          
          //was this a delete
          /*
          if (removedFrom > -1){
            cont.removeChild(removedFrom);
            self.onRemove(todo);
          }

          if (insertedInto > -1){
            cont.addChild(new ToDo({
    		      todo:todo
    		    }));
            self.onInsert(todo);
          }
          */
          self.showChecklist();
          self._checkBorder();
        });
        
        this.observeHandlers.push(handler);
        
        
        var doneHandler = this.doneTodos.observe(function(todo, removedFrom, insertedInto){
          //console.debug("tasks observed", task, removedFrom, insertedInto, group.focus);
          
          //was this a delete
          
          if (removedFrom > -1){
            self.onRemove(todo);
          }

          if (insertedInto > -1){
            self.onInsert(todo);
          }
      
          self.showChecklist();
          self._checkBorder();

        });
        
        this.observeHandlers.push(doneHandler);
        
      },
      
      onRemove: function(todo){
        //console.debug("todo removed", todo);
      },
      
      onInsert: function(todo){
        //console.debug("todo inserted", todo);
      },
      
      add: function(todo){
        console.debug("add called");
        this.store.add(todo);
        this.save();
        
      },
      
      update: function(todo){
        this.store.put(todo);
        this.save();
      },
      
      remove: function(todo){
        this.store.remove(todo._id);
        this.save();
      },
      
      handleSearch: function(args){
        
      },
      
      handleSortChange: function(args){
        if (!args){
          args = this.sortOptions;
        }
        //console.debug("handleSortChange", args);
        var sortOptions = this.sortOptions;
        
        //if it's an attribute, then select it
        if (args.type === "attribute"){
          sortOptions.sortKeys[0].attribute = args.value;
        }
        
        //it's an option, so toggle it on or off
        if (args.type === "option"){
          if (args.id === "optDescending"){
            sortOptions.sortKeys[0].descending = args.value;
          }
          
          if (args.id === "optShowDone"){
            sortOptions.showDone = args.value;
          }
        }
        
        this.sortOptions = sortOptions;
        
        this.showChecklist();
      },
      
      showDetailedView: function(){
        if (!this.isShowDetails){
          this.isShowDetails = true;
          this.showChecklist();
        }
        
      },
      
      hideDetailedView: function(){
        if (this.isShowDetails){
          this.isShowDetails = false;
          this.showChecklist();
        }
      },
      
      _checkBorder: function(){
        var todos = this.todos,
	          doneTodos = this.doneTodos;
	        
        if (this.isAddEnabled){
  		    //if no todos need to hide the top border of the quickentry control
          dojo.removeClass(this.quickEntry.quickEntry, "c-border-top-none");
          if (todos.length === 0 && (doneTodos.length === 0 || !this.sortOptions.showDone)){
            dojo.addClass(this.quickEntry.quickEntry, "c-border-top-none");
          }
  		  } else {
  		    //this means there is nothing to show, need to remove bottom border
  		    if (todos.length === 0 && (doneTodos.length === 0 || !this.sortOptions.showDone)){
  		      dojo.removeClass(this.domNode, "no-add");
  		    }
  		  }
      },
      
      showChecklist: function(){
        
        this.todos = this.store.query({done: false}, {sort:this.sortOptions.sortKeys});
	      this.doneTodos = this.store.query({done:true},{sort:this.sortOptions.sortKeys});
        
  		  var todos = this.todos,
  		      doneTodos = this.doneTodos,
  		      self = this;

  		  
        //console.debug("showChecklist called", this.todos, this.listItems.getChildren(), this.listItems.hasChildren());
        
  		  if (this.listItems.hasChildren()){
  		    this.listItems.destroyDescendants();
  		  }
  		  
  		  if (this.doneItems.hasChildren()){
  		    this.doneItems.destroyDescendants();
  		  }
  		  
  		  this._checkBorder();

  	    //show the todos that aren't done
  	    dojo.forEach(todos, function(item){
  	      
  	      var x = new ToDo({
  		      todo:item,
  		      isShowDetails: this.isShowDetails,
  		      isEnabled: this.isEnabled
  		    });
  		    this.listItems.addChild(x);

  		    dojo.connect(x, "onChange", this, function(todo){
  		      //console.debug("todo changed value", todo);
  		      this.update(todo);
  		    });
  		    
  		  }, this);
  		  
  		  //if sortOptions.showDone , then show the done todos
  		  if (this.sortOptions.showDone){
  		    dojo.forEach(doneTodos, function(item){
      		  this.doneItems.addChild(new ToDo({
      		    todo:item,
      		    isShowDetails: false,
      		    isEnabled: false
      		  }));
      		}, this);
  		  }
  		  
  		  this.onShowChecklist();
      },
      
      onShowChecklist: function(){
        
      },
      
      save: function(){
        //this function saves the task with the changes to the checklist
        var t = db.getTaskModel(this.task, true);
  		  t.update(this.task);
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.forEach(this.observeHandlers, function(handle){
          handle.cancel();
        });
        this.observeHandlers = [];
        
        if (this.sortChangeHandler){
          dojo.unsubscribe(this.sortChangeHandler);
          this.sortChangeHandler = null;
        }
      },
      
      baseClass: "checklist"
  });
  return app.views.TaskChecklist;     
});