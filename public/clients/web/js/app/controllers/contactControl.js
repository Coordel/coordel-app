define([
  "dojo", 
  "dijit", 
  "app/layouts/contactLayout",
  "app/views/TaskListGroup/TaskListGroup",
  "app/views/TaskList/TaskList",
  "i18n!app/nls/coordel",
  "app/models/CoordelStore",
  "app/views/EmptyProject/EmptyProject",
  "app/views/Task/Task"], function(dojo, dijit, layout, tlg, tl, coordel, db, Empty, Task) {
  //return an object to define the "./newmodule" module.
  return {
      focus: "contact",
      observeHandlers: [],
      contact: null,
      emptyGroup: null,
      init: function(contact){
        
        console.log("db", db);
        db.focus = "contact";
    
        this.contact = contact;
        var self = this;
        //console.debug("contactControl init called", db);
        
        //the contact layout will show any tasks this person has in any of the current user's
        //projects
        layout.showLayout();
        
        //load any tasks that this contact has
       
          dojo.when(db.contactStore._loadTasks(contact), function(){
            self.showTasks();
          });
        
        //add profile to container
        document.title = "Coordel > " + coordel.contacts + " > " + db.contactFullName(this.contact);
      },
      
      showTasks: function(){
        //console.debug("showTasks contactControl");
        var store = db.contactStore,
        cont = dijit.byId("contactTasksMain"),
        sort = [{attribute: "contextDeadline", descending: false},{attribute: "created", descending: false}];
        
        //console.debug("showTasks contactControl", store);
        
        var self = this;
 
        if (cont.hasChildren()){
          cont.destroyDescendants();
        }
    
        this.emptyGroup = null;

        //need to cancel any previously existing connections and reset the connections handler
        if (this.observeHandlers.length > 0){
          dojo.forEach(this.observeHandlers, function(handle){
            handle.cancel();
          });
          this.observeHandlers = [];
        }

        var cur = store.taskMemory.query({db: db, focus: "contactCurrent"}, {sort: sort}),
            bl = store.taskMemory.query({db: db, focus: "blocked"}, {sort: sort}),
            def = store.taskMemory.query({db: db, focus: "contactDeferred"}, {sort: sort}),
            inv = store.taskMemory.query({db: db, focus: "projectTaskInvited"}, {sort:sort});
        
        //console.log("all", store.taskMemory.query({db: db, focus: "current"}, {sort: sort}));

        //console.debug("showing contact tasks", cur, def, del, bl);

        self._addGroup(coordel.current, cur);

        self._addGroup(coordel.deferred, def);

        self._addGroup(coordel.blocked, bl);
        
        self._addGroup(coordel.taskInvited, inv);

        self._checkEmpty();

      },
        
    _checkEmpty: function(){
      var cont = dijit.byId("contactTasksMain");

      //make sure at least one group has a task
      var groups = cont.getChildren(),
          isEmpty = true;

      dojo.forEach(groups, function(g){
        if (g.tasks && g.tasks.length > 0){
          //console.debug("tasks found", g.tasks);
          isEmpty = false;
        }
      });

      if (isEmpty){
        this.showEmptyTasks();
      }
    },
    
    showEmptyTasks: function(){
      var cont = dijit.byId("contactTasksMain");
      //console.debug("showing empty tasks", this.emptyGroup);
      if (!this.emptyGroup){
        //console.debug("empty group didin't exist yet");
        this.emptyGroup = new Empty({
          emptyTitle: coordel.empty.contactTitle,
          emptyDescription: coordel.empty.contactText
        });
        cont.addChild(this.emptyGroup);
      } 
    },

    _addGroup: function(header, tasks){
      var cont = dijit.byId("contactTasksMain"),
          self = this;
          
      //console.log("adding contact tasks group", header, tasks);
      //this function add
      
      var group = new tlg({
        header: header,
        tasks: tasks,
        focus: this.focus,
        db: db
      });
      cont.addChild(group);
      
      //need to watch and see if there is a change to this list
      var handler = group.tasks.observe(function(task, removedFrom, insertedInto){
        //console.debug("tasks observed", task, removedFrom, insertedInto, group.focus);

        //was this a delete
        if (removedFrom > -1){
          group.removeChild(removedFrom);

        }

        if (insertedInto > -1){
          //not empty now, hide it
          self.hideEmptyTasks();

          //if the group was hidden before, need to show it now
          if (group.isHidden){
            group.show();
          }

          console.debug("adding to list", task, group.focus);

          group.addChild(new Task({
            focus: group.focus,
            task: task
          }));
        }

        if (group.tasks.length === 0){
          group.hide();
          //if this groups tasks is zero, make sure all aren't
          self._checkEmpty();
        }
      });

      this.observeHandlers.push(handler);
    }
  };
});