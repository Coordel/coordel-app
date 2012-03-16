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
    
        this.contact = contact;
        var self = this;
        console.debug("contactControl init called", db);
        
        //the contact layout will show any tasks this person has in any of the current user's
        //projects
        layout.showLayout();
        
        //load any tasks that this contact has
        if (db.contactStore.currentContact !== contact){
          //this project isn't in the cache, so load it and then show it
          //console.debug("project not in cache, loading...");
          dojo.when(db.contactStore.loadContactTasks(contact, db.getUserProjects()), function(){
            self.showTasks();
          });
        } else {
          //console.debug("project in cache");
          //this project is currently in cache, so show it
          self.showTasks();
        }
        
        //add profile to container
        document.title = "Coordel > " + db.contactFullName(this.contact);
      },
      
       showTasks: function(){
         console.debug("showTasks contactControl");
          var store = db.contactStore,
              cont = dijit.byId("contactTasksMain"),
              sort = [{attribute: "name", descending: true}];
          
              
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
          
          var cur = store.taskMemory.query({db: db, focus: "current"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              del = store.taskMemory.query({db: db, focus: "delegated"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              bl = store.taskMemory.query({db: db, focus: "blocked"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              def = store.taskMemory.query({db: db, focus: "deferred"}, {sort: [{attribute: "contextDeadline", descending: false}]});
              
              //TODO: show task invites
              //TODO: show project invites

            //console.debug("showing contact tasks", cur, def, del, bl);

        
              this._addGroup(coordel.current, cur);
         
            
          
              this._addGroup(coordel.deferred, def);
         
            
        
              this._addGroup(coordel.delegated, del);
     
          
              this._addGroup(coordel.blocked, bl);
      
              this._checkEmpty(); 
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
              
          console.log("adding contact tasks group", header, tasks);
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

              //console.debug("adding to list", task, group.focus);

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