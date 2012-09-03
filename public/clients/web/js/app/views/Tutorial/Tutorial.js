define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Tutorial.html",
    "text!./templates/menu-item.html",
    "dijit/layout/ContentPane"
    ], 
  function(dojo, w, t, html, menu) {
  
  dojo.declare(
    "app.views.Tutorial", 
    [w, t], 
    {
      
      templateString: html,
      
      widgetsInTemplate: true, 
      
      postCreate: function(){
        this.inherited(arguments);
        var self = this;
        
        dojo.xhrGet({
            url: "/support/source.json",
            handleAs: "json",
            load: function(stepSource) {
              //console.log("source", stepSource);
              self.steps = stepSource.features;

              dojo.forEach(self.steps, function(step){
                if (!step.isIntro){
                  var node = dojo.replace(menu, step);

                  dojo.place(node, self.featuresList);

                  dojo.connect(dojo.byId("tutorial-feature-"+step.code),"onclick", function(){
                    //console.log("step", step.title);
                    self.setStep(step.order);
                  });
                }
                
              });
                
              self.setStep(2);
            },
            error: function(err) {
                /* this will execute if the response couldn't be converted to a JS object,
                   or if the request was unsuccessful altogether. */
            }
        });
     
      },
      
      setStep: function(order){
        var self = this;
    
        var thisStep;
        dojo.forEach(self.steps, function(step){
          if (!step.isIntro){
            //console.log("step.code", step.code);
            dojo.removeClass("tutorial-feature-"+step.code, "active");
            if (step.order === order){
              thisStep = step;
              dojo.addClass("tutorial-feature-"+step.code, "active");
            }
          }
          
        });
    
        self.setFeature(thisStep);
      },
      
      setFeature: function(source){

        var self = this;
        dojo.xhrGet({
            url: "/support/features/" + source.code + ".html",
            handleAs: "text",
            load: function(html) {
  
              self.contentContainer.innerHTML = html;
              
              if (source){
                dojo.byId("feature-title").innerHTML = source.title;
                dojo.byId("feature-headline").innerHTML = source.headline;
              }

              if (source.movie){
                dojo.byId("feature-movie").src = source.movie;
              } else {
                dojo.addClass("feature-movie-container", "hidden");
                dojo.removeClass("feature-image", "hidden");
                dojo.byId("feature-image").src = source.image;
              }
                
            },
            error: function(err) {
                /* this will execute if the response couldn't be converted to a JS object,
                   or if the request was unsuccessful altogether. */
            }
        });
      },
      
      
      baseClass: "tutorial"
  });
  return app.views.Tutorial;     
});