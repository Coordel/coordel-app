define(
  ["dojo",
    "i18n!app/nls/coordel",
    "dijit/_Widget", 
    "dijit/_Templated", 
    "dijit/_Container",
    "app/models/CoordelStore",
		"text!./templates/DemoList.html",
		"app/views/Demo/Demo"], 
  function(dojo, coordel, w, t, c, db, html, Demo) {
  
  dojo.declare(
    "app.views.DemoList", 
    [w, t, c], 
    {
      
      name: null,
			
			widgetsInTemplate: true, 
      
      templateString : html,

      postCreate: function(){
        this.inherited(arguments);
        var self = this;
				db.appStore.getDemos().then(function(list){
					//console.log("list", list);
					self.showDemos(list);
				});
				
				dojo.connect(self.cleanButton, "onClick", function(){
					var doc = {
						_id: db.uuid(),
						demoUsername: db.username(),
						docType: "demo",
						demoAction: "cleanup"
					};
					db.appStore.addDoc(doc);
					dojo.publish("coordel/primaryNavSelect", [{focus:"current", name: "", id:"", setSelection: true}]);
				});
      },

			showDemos: function(list){
				var self = this;
				//console.log("showing demos", list);
				dojo.forEach(dijit.byId(self.demoContainer), function(item){
					item.destroy();
				});
				
				if (list.length){
					dojo.forEach(list,function(demo){
						var d = new Demo({demo: demo}).placeAt(self.demoContainer);
					});
				}
			},

      baseClass: "demolist"
  });
  return app.views.DemoList;     
});