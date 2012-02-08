define(
  ["dojo",
    "dijit/_Widget",
    "dijit/_Templated",
    "text!./templates/Role.html",
    "i18n!app/nls/coordel",
    "app/views/RoleResponsibility/RoleResponsibility",
    "app/models/CoordelStore"
    ], 
  function(dojo, w, t, html, coordel, R, db) {
  
  dojo.declare(
    "app.views.Role", 
    [w, t], 
    {
      
      templateString: html,
      
      coordel: coordel,
      
      role: null,
      
      postCreate: function(){
        this.inherited(arguments);
        
        this.watch("role", function(prop, oldVal, newVal){
          //console.debug("role changed", prop, oldVal, newVal);
        });
        
        //console.debug("in Role: ", this.role);
        
        this.setResps();
        
      },
      
      setResps: function(){
        this._clear(this.roleResps);
        var resps = this.role.responsibilities;
        //console.debug("responsibilities", resps);
        
        if (resps && resps.length > 0){
       
          dojo.forEach(resps, function(r){

            //it doesn't make sense to show a cancelled or deleted task as 
            //a responsibility
            if (r.status !== "CANCELLED" && r.status !== "TRASH" ){
              var t = db.projectStore.taskStore.get(r.task);

              var resp = new R({
                task: t
              }).placeAt(this.roleResps);
            }
            
            
          }, this);
        }
        
      },
      
      _clear: function(nodeid){
        dojo.forEach(dijit.findWidgets(nodeid), function(child){
          child.destroyRecursive();
        });
      },
      
      baseClass: "role"
  });
  return app.views.Role;     
});