define([
  "dojo", 
  "dijit",
  "dijit/form/Button",
  "i18n!app/nls/coordel",
  "text!./templates/taskFormDialog.html",
  "dijit/_Widget", 
  "dijit/_Templated",
  "app/views/TaskForm/TaskForm",
  "app/views/Dialog/Dialog",
  "dijit/TooltipDialog"], function(dojo, dijit, bn, coordel, html, w, t, TaskForm, Confirm, TipDialog) {
  dojo.declare(
    "app.views.TaskFormDialog", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true,
      
      coordel: coordel,
      
      dialog: null, 
      
      
      //if isTooltip is set to false, then the form will show in a regular dialog
      isTooltip: true,
     
      postCreate: function(){
        this.inherited(arguments);
        
        this.show();
      },
      
      show: function(){
        if (!this.isTooltip){
          this._showTooltip();
        }else {
          this._showDialog();
        }
      },
      
      _showTooltip: function(){
        
        this.dialog = new TaskForm().placeAt(this.contentNode);
        
      },
      
      _showDialog: function(){
        this.dialog = new Confirm({
          title: "New Task",
          content: new TaskForm()
           
        }).placeAt(this.contentNode);
        
        this.dialog.show();
        
      }
  });
  return app.views.TaskFormDialog;    
}
);

