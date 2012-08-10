define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "text!./templates/turboWizard.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/TaskForm/TaskForm",
  "app/models/CoordelStore",
  "dijit/form/Button",
  "dijit/form/DropDownButton",
  "dijit/TooltipDialog"], function(dojo, dijit, coordel, html, w, t, TaskForm, db) {
  dojo.declare(
    "app.views.TurboWizard", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      nls: coordel.turbo,
      
      coordel: coordel,
      
      isChecklist: false,
      
      task: null,
     
      postCreate: function(){
        this.inherited(arguments);
        
        //if this is a checklist then we need to hide the not-relevant options
        //do, leave, and defer aren't showing
        if (this.isChecklist){
          dojo.addClass(this.doContain, "hidden");
          dojo.addClass(this.deferContain, "hidden");
          dojo.addClass(this.somedayContain, "hidden");
          dojo.addClass(this.archiveContain, "hidden");
        }
        
        //if this isn't a private task, then need to hide someday and archive because a user shouldn't 
        //be able to delete or change a Coord's task to archive or someday.
        if (this.task.project !== db.myPrivate()){
          dojo.addClass(this.noContain, "hidden");
        }
        
        
        dojo.connect(this.deferDropDown, "onClick", this, function(){
          //NOTE: when you don't do this, after you've clicked defer once, then you get the error
          //(that you still get so you can see it in the console) that makes the user have to click
          //the dropdown button twice every time after the first time. Couldn't figure out why? So
          //just forcing the dropdown to open again solves it in a brutal way
          //console.debug("dropdown clicked", this.deferDropDown);
          this.deferDropDown.openDropDown();
        });
        
        dojo.connect(this.deferOther, "onclick", this, function(){
          this.onDefer("deferOther");
        });
        
        dojo.connect(this.deferOneDay, "onclick", this, function(){
          this.onDefer("deferOneDay");
        });
        
        dojo.connect(this.deferOneWeek, "onclick", this, function(){
          this.onDefer("deferOneWeek");
        });
        
        dojo.connect(this.deferTwoWeeks, "onclick", this, function(){
          this.onDefer("deferTwoWeeks");
        });

      },
      
      onDefer: function(args){
        
      }
  });
  return app.views.TurboWizard;    
}
);

