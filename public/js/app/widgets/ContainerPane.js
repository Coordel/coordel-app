define(["dijit/layout/ContentPane", "dijit/_Container"], function(cpane, c) {
  //return an object to define the "./newmodule" module.
  dojo.declare(
    "app.widgets.ContainerPane", 
    [cpane, c], 
    {
       
  });
  return app.widgets.ContainerPane;    
});