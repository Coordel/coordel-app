define(["some/obj", "some/obj2"], function(obj, obj2) {
  dojo.declare(
    "some.object", 
    [obj, obj2], 
    {
      
      prop1: "value",
      prop2: function(){
      }
  });
  return some.object;    
}
);

