define(
  ["dojo","i18n!app/nls/coordel",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/taskInfo.html",
    "text!./templates/taskInfoVert.html",
    "app/util/dateFormat",
    "dijit/TitlePane",
    "app/models/CoordelStore",
    "app/views/Label/Label",
    "app/models/TaskModel"
    ], 
  function(dojo, coordel, w, t, html, vertHtml, dt, tp, db, tModel) {
  
  dojo.declare(
    "app.views.TaskInfo", 
    [w, t], 
    {
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      id: null,
      
      task: null,
      
      isTurbo: false,
      
      model: null,
      
      showName: true,
      
      notifyHandler: null,
      
      align: "horizontal", //horizontal sets the project on the right of the task, vertical sets it under
      
      templateString: html,
      
      postMixInProperties: function(){
        this.inherited(arguments);
        if (this.align === "vertical"){
          this.templateString = vertHtml;
        }
      },
    
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        //console.log("TaskInfo isTurbo", this.isTurbo);
        if (this.isTurbo){
          dojo.removeClass(this.turboTimer, "hidden");
          self.interval = setInterval(dojo.hitch(self, self.doCountdown), 1000);
        }
            
        this.setTask(this.task);
        
        //handle task notifications
    		this.notifyHandler = dojo.subscribe("coordel/taskNotify", this, "handleTaskNotify");
        
      },
      
      doCountdown: function(){
        // parseInt() doesn't work here...
    		var m = this.min.innerHTML,
    			s0 = this.sec0.innerHTML,
    			s1 = this.sec1.innerHTML,
    			minute = parseInt(m, 10),
    			second = parseInt(s0+s1, 10);

    		second = second-1;

    		if(second < 0) {
    			second = 59;
    			minute = minute - 1;
    		}

    		if (second < 10){
    			this.sec0.innerHTML = "0";
    		} else {
    			this.sec0.innerHTML = second.toString()[0];
    		}

    		if (second < 10){
    			this.sec1.innerHTML = second.toString()[0];
    		} else {
    			this.sec1.innerHTML = second.toString()[1];
    		}

    		this.min.innerHTML = minute.toString();

    		if (minute <= 0 && second <= 0){
    			clearInterval(this.interval);
    			dojo.publish("coordel/playSound", ["expired"]);
    			dojo.addClass(this.turboTimer, "expired");
    		}
      },
      
      handleTaskNotify: function(args){
  		  //console.debug("handling task Notify", args.task);
  		  var task = args.task;
  		  if (task._id === this.task._id){
  		    this.setTask(task);
  		  }
  		},
      
      setTask: function(task){
        //console.debug("in setTask", task);
        
        var t = db.getTaskModel(task, true),
            self = this;

        this.task = t.task;
        task = t.task;
        
        
        //if this task is done, then show the checkmark in the background
        if (t.isDone()){
          dojo.addClass(this.domNode, "done");
        }
        
        //if this task is cancelled, then show the cancelled icon in the background
        if (t.isCancelled()){
          dojo.addClass(this.domNode, "cancelled");
        }
        
        //task name
        if (this.showName){
          dojo.removeClass(this.name, "hidden");
        }
        
        //purpose
        if (task.purpose && task.purpose !== ""){
          self.purpose.set("value", task.purpose);
          dojo.removeClass(self.infoPurpose, "hidden");
        } else {
          dojo.addClass(self.infoPurpose, "hidden");
        }
        
        //username
        self.username.set("value", db.contactFullName(task.username));
        
        //project
        var hideProject = false;
        //console.debug("dealing with project", t.projName(), t.projResponsible());
        if (!t.isPrivate() && !t.isDelegated()){
          self.projectName.set("value", t.projName());
          self.projectResponsible.set("value", db.contactFullName(t.projResponsible()));
          //so long as the project isn't private or delegated it will have a deadline
          //so show it
          self.projectDeadline.set("value", dt.prettyISODate(t.projDeadline()));
        } else {
          //give the project name the private or delegated names if required
          if (t.isPrivate()){
            dojo.removeClass(this.projectIcon, "field-icon dark-project");
            dojo.addClass(this.projectIcon, "primary-nav-icon icon-private c-float-l");
            self.projectName.set("value", this.coordel.myPrivate);
            hideProject = true;
          } else if (t.isDelegated()){
            self.projectName.set("value", this.coordel.delegated);
            hideProject = true;
            dojo.removeClass(this.projectIcon, "field-icon dark-project");
            dojo.addClass(this.projectIcon, "primary-nav-icon icon-delegated c-float-l");
          }
        }
        
        if (!t.p.project.purpose){
          dojo.addClass(self.infoProjectPurpose, "hidden");
        } else if (t.p.project.purpose && t.p.project.purpose.trim().length === 0){
          dojo.addClass(self.infoProjectPurpose, "hidden");
        } else {
          self.projectPurpose.set("value", t.p.project.purpose);
        }
        
        if (hideProject){
          dojo.addClass(self.infoProjectDeadline, "hidden");
          dojo.addClass(self.infoProjectPurpose, "hidden");
          dojo.addClass(self.infoProjectResponsible, "hidden");
        }
        
        //deadline
        //if the task is done or cancelled, hide the deadline, otherwise show it
        if (t.isDone() || t.isCancelled()){
          dojo.addClass(self.infoDeadline, "hidden");
        } else {
        
          t.getContextDeadline().then(function(dead){
           
            if (dead === "" || dead === "2200-01-01"){
              //this was a private project so set it to none
              dojo.addClass(self.infoDeadline, "hidden");
            } else {
              
              var showTime = false,
                  test = dead.split("T");
              if(test.length > 1){
                showTime = true;
                //console.log("showTime is true");
              }
              self.deadline.set("value" , dt.deadline(dead, showTime));
              t.isOverdue().then(function(overdue){
                if (overdue){
                  //console.log("it's overdue");
                  dojo.addClass(self.infoDeadline, "c-color-error");
                }
              });
            }
          });
          

         
        }
        
        //duration
        //if the task has blockers, then show any duration the user has set
        
        
        
        //delegator
        if (t.hasDelegator()){
          //console.debug("it has a delegator", task);
          self.fullName.set("value", db.contactFullName(task.username));
          self.delegator.set("value", db.contactFullName(task.delegator));
          dojo.removeClass(self.infoDelegator, "hidden");
        } else {
          dojo.addClass(self.infoDelegator, "hidden");
        }
        
        //deferred
        if (t.isDeferred()){
          self.deferred.set("value", dt.deferred(task.calendar.start));
          dojo.removeClass(self.infoDeferDate, "hidden");
        } else {
          dojo.addClass(self.infoDeferDate, "hidden");
        }
        
        //attachments
        if (t.hasAttachments()){
          self.showAttachments(task);
          dojo.removeClass(self.infoAttachments, "hidden");
        } else {
          dojo.addClass(self.infoAttachments, "hidden");
        }
        
        //set the status and dates
        self.status.set("value", t.getStatus());
        self.updated.set("value", dt.prettyISODate(task.updated, true));
        self.updater.set("value", db.contactFullName(task.updater));
        self.created.set("value", dt.prettyISODate(task.created, true));
        self.creator.set("value", db.contactFullName(task.creator));
        
        
        //console.debug("finished setting the task");
      },
      
      showAttachments: function(task){
        var files = task._attachments;
        dojo.empty(this.attachments);
        //console.debug("showing attachments", files);
    		for (var key in files){
    		  var file = dojo.create("a", {
      		  title: key,
      		  href: db.db + "files/" + task._id + "/" + key,
      		  style: "font-size: 10px;display:block",
      		  "class": "attachment c-ellipsis",
      		  target: "_blank",
      		  innerHTML: key
      		}, this.attachments);
      		
      		//console.debug("file in showAttachments", file);
    		}
    		
      },
      
      destroy: function(){
        this.inherited(arguments);
        if (this.interval){
          clearInterval(this.interval);
        }
        if (this.notifyHandler){
          dojo.unsubscribe(this.notifyHandler);
        }
      },
      
      baseClass: "task-info"
  });
  return app.views.TaskInfo;     
});