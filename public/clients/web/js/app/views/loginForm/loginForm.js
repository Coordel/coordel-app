define([
  "dojo",
  "i18n!app/nls/coordel",
  "text!app/views/loginForm/templates/loginForm.html",
  "dijit/layout/ContentPane"], 
function(dojo, coordel, html, pane) {
        //return an object to define the "./newmodule" module.
        return {
            showLogin: function() {
              dojo.removeClass(document.body, "loading");
              dojo.addClass(document.body, "login");
               var p = new pane({
                 id: "loginForm",
                 content: html
               }).placeAt(dojo.body());
            }
        };
    }
);