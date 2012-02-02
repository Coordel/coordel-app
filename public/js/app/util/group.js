define(['dojo', 'dojo/date/locale','i18n!app/nls/coordel', 'dojo/date/stamp'], function (dojo, dt, coordel, stamp) {
    //Provides functions that return sorted lists grouped according to sort criteria
    // list - a collection of objects sorted by the grouping attribute
    // options - the criteria
    //       example: {attribute: "deadline"}

    return {
      
      timelineMap: function(when){
        if (!when){
          when = "future";
        }
        
        //when can be either "past" or "future"
        //the future function sends back the map to enable sorting by a timeline that is in the future
        //i.e. deadline or defer date it works in tandem with the task query engine to get
        //those records that match the current focus and meet the date criteria
        var map = {},
            h = coordel.timeline;

        //overdue
        if (when === "future"){
          map.overdue = {
            header: h.overdue,
            test: function(date){
              if (date === ""){
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date();
              //console.debug("in overdue", date);
              return (dojo.date.compare(now, date, "date") > 0);
            }
          };
        }
        
        //today
        map.today = {
          header: h.today,
          test: function(date){
            if (date === "" || date === undefined){
              //console.debug ("today date was nothing", date);
              return false;
            }
            //console.debug("today", date);
            date = stamp.fromISOString(date);
            var now = new Date(),
                today = parseInt(dojo.date.locale.format(now, {datePattern: "D"}),10),
                dToday = parseInt(dojo.date.locale.format(date, {datePattern: "D"}),10),
        		    dYr = date.getYear();
        		    
            return (dToday === today && dYr === now.getYear());
          }
        };
        
        //this week
        map.thisWeek = {
          
          header: h.thisWeek,
          test: function(date){
            if (date === "" || date === undefined){
              //console.debug ("this week date was nothing", date);
              return false;
            }
            date = stamp.fromISOString(date);
            var now = new Date(),
      		      thisWeek = parseInt(dt.format(now, {datePattern: "w"}),10),
      		      dThisWeek = parseInt(dt.format(date, {datePattern: "w"}),10),
      		      dYr = date.getYear();
      		      
            return (dThisWeek === thisWeek && dYr === now.getYear());
          }
        };
        
        //next/last week
        if (when === "future"){
          map.nextWeek = {
            header: h.nextWeek,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("next week date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
        		      thisWeek = parseInt(dt.format(now, {datePattern: "w"}),10),
        		      nextWeek = parseInt(thisWeek,10) + 1,
                  dThisWeek = parseInt(dt.format(date, {datePattern: "w"}),10),
        		      dYr = date.getYear();
        		  //console.debug("testing nextWeek",now, date, thisWeek, dThisWeek, nextWeek, dYr, now.getYear());   
              return (dThisWeek === nextWeek && dYr === now.getYear() ||  (dThisWeek === 1 && nextWeek === 53 && (parseInt(dYr - now.getYear(), 10) === 1)));
            }
          }; 
        } else if (when === "past"){
          map.lastWeek = {
            header: h.lastWeek,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("last week date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
        		      thisWeek = parseInt(dt.format(now, {datePattern: "w"}),10),
        		      lastWeek = parseInt(thisWeek,10) - 1,
        		      dThisWeek = parseInt(dt.format(date, {datePattern: "w"}),10),
        		      dYr = date.getYear();
              return (dThisWeek === lastWeek && dYr === now.getYear());
            }
          };
        }
        
        //this month
        map.thisMonth = {
          header: h.thisMonth,
          test: function(date){
            if (date === "" || date === undefined){
              //console.debug ("this month date was nothing", date);
              return false;
            }
            date = stamp.fromISOString(date);
            var now = new Date(),
                thisMonth = now.getMonth(),
                dThisMonth = date.getMonth(),
      		      dYr = date.getYear();
            return (dThisMonth === thisMonth && dYr === now.getYear());
          }
        };
        
        //next/last month
        if (when === "future"){
          map.nextMonth = {
            header: h.nextMonth,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("next month date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
                  thisMonth = now.getMonth(),
                  nextMonth = parseInt(thisMonth, 10)+ 1,
                  dThisMonth = date.getMonth(),
        		      dYr = date.getYear();
        		  //need to be careful of the turn of the year
              return ((dThisMonth === nextMonth && dYr === now.getYear()) || (dThisMonth === 0 && nextMonth === 12 && (parseInt(dYr - now.getYear(), 10) === 1)));
            }
          };
        } else if (when === "past"){
          map.lastMonth = {
            header: h.lastMonth,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("last month date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
                  thisMonth = now.getMonth(),
                  lastMonth = thisMonth - 1,
                  dThisMonth = date.getMonth(),
        		      dYr = date.getYear();
              return (dThisMonth === lastMonth && dYr === now.getYear());
            }
          };
        }
        
        //future/past
        if (when === "future"){
          map.future = {
            header: h.future,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("future date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
                  thisMonth = now.getMonth(),
                  future = thisMonth + 2,
                  dThisMonth = date.getMonth(),
        		      dYr = date.getYear();
              return (dThisMonth >= future && dYr >= thisYear);
            }
          };
        } else if (when === "past"){
          map.past = {
            header: h.past,
            test: function(date){
              if (date === "" || date === undefined){
                //console.debug ("past date was nothing", date);
                return false;
              }
              date = stamp.fromISOString(date);
              var now = new Date(),
                  thisMonth = now.getMonth(),
                  past = thisMonth - 2,
                  dThisMonth = date.getMonth(),
        		      dYr = date.getYear();
              return (dThisMonth <= past && dYr <= now.getYear());
            }
          };
        }
        
        //no date
        map.noDate = {
          header: h.noDate,
          test: function(date){
            //console.debug("testing noDate", date);
            return (!date || date === "" || date === undefined);
          }
        };   
        
        return map;
      },
      
      byDeadline: function(list){
        //list must be sorted
        //byDeadline will create the following groups as required by the object
        //overdue , today, this week, next week, next month, future 
        
        var map = {},
    		v = [],
    		noDeadline = [],
    		now = new Date();
        
        dojo.forEach(list, function(task) {
          
          //get the header
    			var head = coordel.deadlineHeader.noDeadline,
    			    dead = task.deadline;
    			    
    			if (dead === ""){
    			  dead = task.projDeadline();
    			  //console.debug("project Deadline required", dead);
    			}
    			
    			//console.debug("deadline to test, current header", dead, head);

    			if (dead !== ""){
    				head = getHeader(new Date(dead), now);
    			}
    			
    			//console.debug("header after test", head);

    			if (map[head] == undefined){
    				map[head] = {};
    				map[head]["tasks"] = [];
    			}
    			map[head]["tasks"].push(task);
    		});
    		
    		
    		//console.debug("map", map);

        //put the mapped groups into the right deadline order
        if (map[coordel.deadlineHeader.overdue]){
          v.push({header: coordel.deadlineHeader.overdue, tasks: map[coordel.deadlineHeader.overdue].tasks});
        }
        if (map[coordel.deadlineHeader.today]){
          v.push({header: coordel.deadlineHeader.today, tasks: map[coordel.deadlineHeader.today].tasks});
        }
        if (map[coordel.deadlineHeader.thisWeek]){
          v.push({header: coordel.deadlineHeader.thisWeek, tasks: map[coordel.deadlineHeader.thisWeek].tasks});
        }
        if (map[coordel.deadlineHeader.nextWeek]){
          v.push({header: coordel.deadlineHeader.nextWeek, tasks: map[coordel.deadlineHeader.nextWeek].tasks});
        }
        if (map[coordel.deadlineHeader.thisMonth]){
          v.push({header: coordel.deadlineHeader.thisMonth, tasks: map[coordel.deadlineHeader.thisMonth].tasks});
        }
        if (map[coordel.deadlineHeader.nextMonth]){
          v.push({header: coordel.deadlineHeader.nextMonth, tasks: map[coordel.deadlineHeader.nextMonth].tasks});
        }
        if (map[coordel.deadlineHeader.future]){
          v.push({header: coordel.deadlineHeader.future, tasks: map[coordel.deadlineHeader.future].tasks});
        }
        if (map[coordel.deadlineHeader.noDeadline]){
          v.push({header: coordel.deadlineHeader.noDeadline, tasks: map[coordel.deadlineHeader.noDeadline].tasks});
        }
   		 
    		function getHeader(deadline, now){
    		  
    		  //console.debug("getHeader deadline now", deadline, now);
    		  
    		  if (dojo.date.compare(now, deadline,"date")>0){
    		    //it's overdue, don't bother
    		    return coordel.deadlineHeader.overdue;
    		  }
    		  
    		  //now and deadline will be date objects
    		  var today = parseInt(getDatePattern(now, "D"),10),
    		      thisWeek = parseInt(getDatePattern(now, "w"),10),
    		      nextWeek = parseInt(thisWeek,10) + 1,
    		      thisMonth = now.getMonth(),
    		      nextMonth = thisMonth + 1,
    		      future = thisMonth + 2,
    		      thisYear = now.getYear();
    		      
    		  //console.debug("getHeader now: ", today, thisWeek, nextWeek, thisMonth, nextMonth, future);
    		      
    		  var dToday = parseInt(getDatePattern(deadline, "D"),10),
    		      dThisWeek = parseInt(getDatePattern(deadline, "w"),10),
    		      dThisMonth = deadline.getMonth(),
    		      dThisYear = deadline.getYear();
    		      
    		  //console.debug("getHeader deadline: ", dToday, dThisWeek, dThisMonth);
    		  
    		  //console.debug("today now/date", today, dToday);
    		      
    		  if (dToday === today && thisYear === dThisYear){
    		    return coordel.deadlineHeader.today;
    		  } else if (dThisWeek === thisWeek && thisYear === dThisYear){
    		    return coordel.deadlineHeader.thisWeek;
    		  } else if ((dThisWeek) === nextWeek && thisYear === dThisYear){
     		    return coordel.deadlineHeader.nextWeek;
     		  } else if (dThisMonth === thisMonth && thisYear === dThisYear){
     		    return coordel.deadlineHeader.thisMonth;
     		  } else if ((dThisMonth) === nextMonth && thisYear === dThisYear){
     		    return coordel.deadlineHeader.nextMonth;
     		  } else {
     		    return coordel.deadlineHeader.future;
     		  }
    		}
    		
    		function getDatePattern(date, pattern){
    		  return dojo.date.locale.format(date, {datePattern: pattern});
    		}
    		
    		return v;
        
      },
      
      byProject: function(list){
      	
      	var map = {},
      		  v = [],
      		  invites = [];

   
    		//create placholders for new project
    		//this is a group, so need to create a grouped list
    		dojo.forEach(list, function(task, key) {
    			var proj = task.projName();
    			//console.debug("task from sort byProject", task, proj);
    			if (map[proj] == undefined && task.docType === "task"){
    				map[proj] = {};
    				map[proj]["tasks"] = [];
    			} else if (map[coordel.sortHeader.invites] == undefined && task.docType === "project-invite"){
    				map[coordel.sortHeader.invites] = {};
    				map[coordel.sortHeader.invites]["tasks"] = [];
    			}
    	
    			//if the status is invite, need to rename it 
    			if (task.docType === "task"){
    				map[proj]["tasks"].push(task);
    			} else if (task.docType === "project-invite"){
    				map[coordel.sortHeader.invites]["tasks"].push(task);
    			}

    		});
    		
    		for (var i in map){
    		  //console.debug("here's a group", map[i], i);
    		  v.push({header: i, tasks: map[i].tasks});
    		}
    		
    		//console.debug("heres the project map", v);
    		
    		return v;  
        
      },
      byUsername: function(list){
        var map = {},
      		  v = [],
      		  invites = [];

   
    		//create placholders for new project
    		//this is a group, so need to create a grouped list
    		dojo.forEach(list, function(task, key) {
    			var user = task.username;
    			//console.debug("task from sort byProject", task, proj);
    			if (map[user] == undefined && task.docType === "task"){
    				map[user] = {};
    				map[user]["tasks"] = [];
    			} 
    			
    			map[user]["tasks"].push(task);

    		});
    		
    		for (var i in map){
    		  //console.debug("here's a group", map[i], i);
    		  v.push({header: i, tasks: map[i].tasks});
    		}
    		
    		//console.debug("heres the user map", v);
    		
    		return v;
      }  
      
      
        
    };
});