define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Demo.html",
		"app/models/CoordelStore"
    ], 
  function(dojo, w, t, html, db) {
  
  dojo.declare(
    "app.views.Demo", 
    [w, t], 
    {
			
			demo: {},
      
      templateString: html,

			widgetsInTemplate: true,
      
      postCreate: function(){
        this.inherited(arguments);
			
        var self = this;
				//console.log("demo", self.demo);
				self.demoName.innerHTML = self.demo.name;
				
				if (self.demo.templateType==="project"){
					self.demoPurpose.innerHTML = self.demo.project.purpose;
				}
       
        dojo.connect(self.domNode, "onmouseover", function(){
					dojo.removeClass(self.buttonContainer, "hidden");
				});
				
				dojo.connect(self.domNode, "onmouseout", function(){
					dojo.addClass(self.buttonContainer, "hidden");
				});
				
				dojo.connect(self.button, "onClick", function(){
					var doc = {
						_id: db.uuid(),
						docType: "demo",
		        demoUsername: db.username(),
		        template: self.demo._id,
		        isDemo: true,
		        playUsername: self.demo.playUsername,
						demoAction: "add"
					};
					
					//console.log("do demo", doc);
					db.appStore.addDoc(doc);
				});

      },
      
      baseClass: "demo"
  });
  return app.views.Demo;     
});