define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Calendar.html",
    "app/models/CoordelStore",
    "i18n!app/nls/coordel",
    "dojo/date",
    "dojo/date/stamp",
    "dojo/date/locale",
    "dijit/TitlePane",
    "app/views/CalendarDay/CalendarDay",
    "app/util/dateFormat",
    "app/models/ProjectStatus"
    ], 
  function(dojo, w, t, html, db, coordel, dt, stamp, locale, Pane, Calendar, dtFormat, pStatus) {
  
  dojo.declare(
    "app.views.Calendar", 
    [w, t], 
    {
      
      templateString: html,
      
      observeHandlers: [],
    
      postCreate: function(){
        this.inherited(arguments);
        
        this.showCalendar();
   
        
        //for overdue (if exists) and each month in the map, add a titlepane
        
        //create a node to hold the calendar day entries
            //for each day in the month that has deadlines, add calendar day (header=day, list=tasks) to node
              //color task invites in green, color project invites in purple
        
        //set node as tp content
       
    
      },
      
      showCalendar: function(){
        var entries = this._getEntries(),
            map = {},
            overdue = coordel.timeline.overdue,
            self = this;
            
    
          
        dojo.forEach(dijit.findWidgets(dojo.byId(this.containerNode)), function(w) {
          //console.debug("destroyinging calendar", w);
          w.destroyRecursive();
        });
        
        
        dojo.forEach(entries, function(item){
          var now = new Date(),
              dead = stamp.fromISOString(item.deadline);
              
          var day = locale.format(dead,{datePattern: "EEEE d", selector: "date"}); //get the day of the entry
          var mon = locale.format(dead,{datePattern: "MMMM", selector: "date"}); //get the month of the entry 
          //if the item's deadline is before now, then it's overdue
          if (dt.compare(dead, now) < 0){
            mon = overdue; 
            day = dtFormat.prettyISODate(item.deadline); //get the day of the entry
          }
          
          if (!map[mon]){
            map[mon]= {};
          }
          
          if (!map[mon][day]){
            map[mon][day] = [];
          }

          map[mon][day].push(item);
          
          
        });
        
        for (var mon in map){
            var css = "tasklist-titlepane calendar";
            if (mon === overdue){
              css = "overdue tasklist-titlepane calendar";
            }
          
            var pane = new Pane({"class":css, duration: "0"}).placeAt(this.containerNode);
            pane.set("title", mon);
            
            var node = dojo.create("div");
            //console.debug("head", mon);
            for (var day in map[mon]){
              
              var calDay = new Calendar({
                header: day,
                entries: map[mon][day]
              }).placeAt(node);
              //console.debug("date", day, "items", map[mon][day]);
            }
            pane.set("content", node);
            
          }
     
        
        //console.debug("map", map);
      },
      
      _getEntries: function(){
        
        this._cancelObserveHandlers();
        
        var entries = [],
            self = this;
        
        //get the tasks sorted by deadline and add them to the map
        var tasks = db.taskStore.memory.query({focus: "calendar", db: db}, {sort: [{attribute:"contextDeadline", descending:false}]});
        //console.debug("tasks", tasks, tasks.length);
        this.observeHandlers.push(tasks.observe(function(){
          //console.debug("observed tasks");
          self.showCalendar();
        }));
        
        
        dojo.forEach(tasks, function(task){
          var t = db.getTaskModel(task, true);
          entries.push({
            id: task._id,
            type: "task",
            name: task.name,
            deadline: t.getDeadline(),
            isTaskInvite: t.isTaskInvite(),
            isProjectInvite: false
          });
        });

        var projects = db.projectStore.memory.query("calendar", {sort: [{attribute:"deadline", descending:false}]});
        //console.debug("projects", projects, projects.length);
        this.observeHandlers.push(projects.observe(function(){
          //console.debug("observed projects");
          self.showCalendar();
        }));
        
        dojo.forEach(projects, function(proj){
          
          var p = db.getProjectModel(proj, true),
              username = db.username(),
              isInvite = (
                pStatus.isInvitedNew(proj, username) ||
                pStatus.isInvitedAgreed(proj, username)
              );
          
          //console.debug("projectInvite", p.isInvite(db.username()), db.username());
          entries.push({
            id: proj._id,
            type: "project",
            name: proj.name,
            deadline: p.getDeadline(),
            isProjectInvite: isInvite,
            isTaskInvite: false
          });
        });

        //console.debug("entries", entries, entries.length);

        entries.sort(function(a, b){


  					var aValue = a["deadline"];
  					var bValue = b["deadline"];
  					//console.debug("comparing a and b", aValue, bValue);
  					if (aValue != bValue) {
  						return aValue < bValue ? -1 : 1;
  					}

  				return 0;
  			});
        
        /*
  	    dojo.forEach(entries, function(entry){
  	      console.debug("entry", entry.deadline, entry.type, entry.name);
  	    });
  	    */

        return entries;
      },
      
      _cancelObserveHandlers: function(){
        dojo.forEach(this.observeHandlers, function(h){
          h.cancel();
        });
        this.observeHandlers = [];
      },
      
      destroy: function(){
        this.inherited(arguments);
        dojo.forEach(this.observeHandlers, function(h){
          h.cancel();
        });
        this._cancelObserveHandlers();
      },
    
      baseClass: "calendar"
  });
  return app.views.Calendar;     
});