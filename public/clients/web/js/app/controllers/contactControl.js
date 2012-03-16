define([
  "dojo", 
  "dijit", 
  "app/layouts/contactLayout",
  "app/views/TaskListGroup/TaskListGroup",
  "app/views/TaskList/TaskList",
  "i18n!app/nls/coordel",
  "app/models/CoordelStore"], function(dojo, dijit, layout, tlg, tl, coordel, db) {
  //return an object to define the "./newmodule" module.
  return {
      focus: "contact",
      contact: null,
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
          
          var cur = store.taskMemory.query({db: db, focus: "current"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              del = store.taskMemory.query({db: db, focus: "delegated"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              bl = store.taskMemory.query({db: db, focus: "blocked"}, {sort: [{attribute: "contextDeadline", descending: false}]}),
              def = store.taskMemory.query({db: db, focus: "deferred"}, {sort: [{attribute: "contextDeadline", descending: false}]});
              
              //TODO: show task invites
              //TODO: show project invites

            //console.debug("showing contact tasks", cur, def, del, bl);

            if (cur.length > 0){
              this._addGroup(coordel.current, cur);
            }
            
            if (def.length > 0){
              this._addGroup(coordel.deferred, def);
            }
            
            if (del.length > 0){
              this._addGroup(coordel.delegated, del);
            }

            if (bl.length > 0){
              this._addGroup(coordel.blocked, bl);
            }

        },

        _addGroup: function(header, tasks){
          var cont = dijit.byId("contactTasksMain");
          console.log("adding contact tasks group", header, tasks);
          //this function add
          cont.addChild(new tlg({
            header: header,
            tasks: tasks,
            focus: this.focus,
            db: db
          }));
        }
  };
});