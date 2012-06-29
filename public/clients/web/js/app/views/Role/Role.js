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
        
        var self = this;
        /*
        this.watch("role", function(prop, oldVal, newVal){
          console.debug("role changed", prop, oldVal, newVal);
        });
        */
        
        console.debug("in Role: ", this.role);
        
        this.setResps();
        
        this.roleNotifyHandler = dojo.subscribe("coordel/roleNotify", this, "handleRoleNotify");
        
      },
      
      handleRoleNotify: function(args){
        if (this.role._id === args.role._id){
          this.role = args.role;
          this.setResps();
        }
      },
     
      setResps: function(){
        this._clear(this.roleResps);
        
        //it doesn't make sense to show a cancelled or deleted task as 
        //a responsibility
        var resps = dojo.filter(this.role.responsibilities, function(r){
          return r.substatus !== "CANCELLED" && r.substatus !== "TRASH";
        });
        
        //console.debug("responsibilities", resps);
        
        if (resps && resps.length > 0){
          dojo.forEach(resps, function(r){

            var t = db.projectStore.taskStore.get(r.task);

            var resp = new R({
              task: t
            }).placeAt(this.roleResps);
     
          }, this);
        } else {
          
          this.onEmpty();
          
        }
        
      },
      
      onEmpty: function(){
        
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