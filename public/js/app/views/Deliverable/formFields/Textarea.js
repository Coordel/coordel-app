/**********************


*/

define([
  "dojo", 
  "dijit",
  "dijit/_Widget",
  "dijit/_Templated",
  "app/views/Deliverable/formFields/_textarea",
  "text!./templates/Textarea.html",
  "i18n!app/nls/coordel",
  "app/util/dateFormat",
  "app/models/FieldModel2",
  "app/widgets/ContainerPane",
  "app/form/TextVersion",
  "dijit/form/FilteringSelect"], function(dojo, dijit, w, t, _textarea, html, coordel, date, fModel, cp, TextVersion) {
  dojo.declare(
    "app.views.Deliverable.formFields.Textarea", 
    [w,t],
    {
      hasVersions: true,
      
      templateString: html,
      
      textarea: null,
      
      coordel: coordel,
      
      showAll: false,
      
      interval: null,
      
      displayVersions: true,
      
      postCreate: function(){
        this.inherited(arguments);
        
        var self = this;
        
        fModel.field = self.field;
        
        self.textarea = new _textarea({
          size: self.field.size,
          field: self.field
        }).placeAt(self.textareaContainer);
        
        if (self.displayVersions){
          self.showVersions();
          //refresh the timeago
          self.interval = setInterval(dojo.hitch(self, self._refresh), 60000);
          
        }
        
        dojo.connect(this.showAllVersions, "onclick", this, function(){
          this.showAll = true;
          this.showVersions();
        });
        
        dojo.connect(this.showRecentVersions, "onclick", this, function(){
          this.showAll = false;
          this.showVersions();
        });   
      
      },
      
      setDisabled: function(){
        this.inherited(arguments);
        
        dojo.removeClass(this.textarea.focusNode, "display-version");
        dojo.addClass(this.versionsContainer, "hidden");
        
        this.textarea.set("disabled", true);
        //use this function for dispay type views. It will disable the field if there is a value
        //or is will add a not started node
        fModel.field = this.field;
        if (!fModel.hasValue()){
          this.domNode.innerHTML = '<div class="c-border not-started">' + coordel.notStarted + '</div>';
        }
      },
      
      showVersions: function(){
        fModel.field = this.field;
        if (fModel.hasVersions()){
          //add the class to shrink the size of the text box to 75% and show the versions
          dojo.addClass(this.textarea.focusNode, "display-version");
          dojo.removeClass(this.versionsContainer, "hidden");

          if (!this.showAll){
            dojo.addClass(this.allTitle, "hidden");
            dojo.removeClass(this.recentTitle, "hidden");
            this._createVersions(fModel.recentVersions());
          } else {
            dojo.removeClass(this.allTitle, "hidden");
            dojo.addClass(this.recentTitle, "hidden");
            this._createVersions(fModel.allVersions());
          }
          
        } else {
          //remove shrinking the text box and hide the versions
          dojo.removeClass(this.textarea.focusNode, "display-version");
          dojo.addClass(this.versionsContainer, "hidden");
        }
      },
      
      _refresh: function(){
        this.showVersions();
      },
      
      _createVersions: function(versions){
      
        fModel.field = this.field;
        
        dojo.forEach(dijit.findWidgets(dojo.byId(this.versions)), function(w) {
          w.destroyRecursive();
        });
        
        var count = fModel.allVersions().length;
        
        dojo.forEach(versions, function(version){
          var ver = new TextVersion({
            textVersion: count,
            text: version.value,
            textDate: version.date,
            prettyDate: date.ago(version.date)
          }).placeAt(this.versions);
          
          dojo.connect(ver.promoteVersion, "onclick", this, function(){
            //console.debug("promoted", ver.text);
            this.textarea.set("value", ver.text);
          });
          
          count -= 1;
        }, this);
        
      },
      
      destroy: function(){
        this.inherited(arguments);
        clearInterval(this.interval);
      }
      
    });
  return app.views.Deliverable.formFields.Textarea;    
});