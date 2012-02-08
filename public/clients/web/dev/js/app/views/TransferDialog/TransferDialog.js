define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "text!./templates/transferDialog.html",
  "app/views/Dialog/Dialog"], function(dojo, dijit, coordel, html, Dialog) {
  dojo.declare(
    "app.views.TransferDialog", 
    [Dialog], 
    {
      
      templateString: html,
      
      executeText: coordel.save,

      executeCss: "highlight-button",

      confirmText: "",
      
      destinationInstructions: "",
      
      fileInstructions: "",
      
      coordel: coordel,
      
      task: null,
     
      postCreate: function(){
        this.inherited(arguments);
        
        dojo.connect(this.dialogConfirm, "onclick", this, "onConfirm");
        
        dojo.addClass(this.confirmText, "hidden");
      },
      
      onConfirm: function(){
        //console.debug("transfer confirmed");
        this.hide();
      }
  });
  return app.views.TransferDialog;    
}
);

