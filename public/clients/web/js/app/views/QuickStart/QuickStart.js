define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/QuickStart.html",
    "dojo/cookie",
    "i18n!app/nls/coordel",
    "dijit/form/Button"
    ], 
  function(dojo, w, t, html, cookie, coordel) {
  
  dojo.declare(
    "app.views.QuickStart", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      widgetsInTemplate: true,
      
      steps: {},
      
      currentStep: 1,
      
      totalSteps: 13,
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        dojo.xhrGet({
            url: "/support/source.json",
            handleAs: "json",
            load: function(stepSource) {
              console.log("source", stepSource);
              self.steps = stepSource.features;
              
              /* here, obj will already be a JS object deserialized from the JSON response */
              self.steps = dojo.filter(self.steps, function(step){
                return step.isSpotlight;
              });

              self.totalSteps = self.steps.length;

              dojo.addClass(self.header, "bg" + cookie("bg"));

              self.setStep();
                
                
            },
            error: function(err) {
                /* this will execute if the response couldn't be converted to a JS object,
                   or if the request was unsuccessful altogether. */
            }
        });

        dojo.connect(self.prevButton, "onClick",this, function(e){
          e.preventDefault();
          e.stopPropagation();
          this.previous();
        });
        
        dojo.connect(self.nextButton, "onClick",this, function(e){
          e.preventDefault();
          e.stopPropagation();
          this.next();
        });
        
     
      },
      
      setStep: function(){
        var self = this;
    
        var thisStep;
        dojo.forEach(self.steps, function(step){
          if (step.order === self.currentStep){
            thisStep = step;
          }
        });
        
        if (thisStep.image){
          self.mainImage.src = thisStep.image;
        } else {
          self.mainImage.src = "support/quickStart/welcome.png";
        }
        
        self.title.innerHTML = thisStep.title;
        self.headline.innerHTML = thisStep.headline;
        self.content.innerHTML = thisStep.content;

      },
      
      previous: function(){
        if (!this.currentStep || this.currentStep === 1){
          this.currentStep = this.totalSteps;
          dojo.addClass(this.nextButton.domNode, "hidden");
        } else {
          dojo.removeClass(this.nextButton.domNode, "hidden");
          this.currentStep -= 1;
        }
        
        if (this.currentStep === 1){
          dojo.addClass(this.prevButton.domNode, "hidden");
        }
        
        this.setStep();
      },
      
      next: function(){
    
        if (!this.currentStep || this.currentStep === this.totalSteps){
          this.currentStep = 1;
          dojo.addClass(this.prevButton.domNode, "hidden");
        } else {
          this.currentStep += 1;
          dojo.removeClass(this.prevButton.domNode, "hidden");
        }
        
        if (this.currentStep === this.totalSteps){
          dojo.addClass(this.nextButton.domNode, "hidden");
        }
        
        
        
        this.setStep();
      },
      
      baseClass: "support quick-start"
  });
  return app.views.QuickStart;     
});