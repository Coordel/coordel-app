define(
  ["dojo", 
  "app/views/Dialog/Dialog", 
  "text!./templates/confirmDialog.html",
  "i18n!app/nls/coordel",
  "dijit/form/Button",
  "dijit/_Widget",
  "dijit/_Templated"], function(dojo, Dialog, html, coordel) {
  dojo.declare(
  "app.views.ConfirmDialog", 
  [Dialog], 
  {
    templateString: html,
    
    executeText: coordel.save,
    
    executeCss: "highlight-button",
    
    confirmText: "",
    
    postCreate: function(){
      this.inherited(arguments);
      
      //console.debug("confirmText", this.confirmText, this.confirmText === "");
      if (this.confirmText === ""){
        dojo.addClass(this.confirmTextContainer, "hidden");
      }
      
      //console.debug("in confirmdialog", this);
      dojo.connect(this.dialogConfirm, "onclick", this, "onConfirm");
    },
    
    onConfirm: function(){
      //console.debug("we're confirmed");
      this.hide();
    },
    
    validate: function(isValid){
      if (isValid){
        dojo.removeClass(this.dialogConfirm, "hidden");
        dojo.addClass(this.dialogConfirmDisabled, "hidden");
      } else {
        dojo.addClass(this.dialogConfirm, "hidden");
        dojo.removeClass(this.dialogConfirmDisabled, "hidden");
      }
    }
    
  });
  return app.views.ConfirmDialog;    
});

