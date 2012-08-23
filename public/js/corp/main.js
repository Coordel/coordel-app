// In demo/myModule.js (which means this code defines
// the "demo/myModule" module):
 
define([
    // The dojo/dom module is required by this module, so it goes
    // in this list of dependencies.
    "dojo",
    "dojo/dom",
    "dojo/on",
    "dojo/cookie",
    "dojo/_base/xhr",
    "dojo/_base/connect"
], function(dojo, dom, on, cookie, xhr, connect){
    // Once all modules in the dependency list have loaded, this
    // function is called to define the demo/myModule module.
    //
    // The dojo/dom module is passed as the first argument to this
    // function; additional modules in the dependency list would be
    // passed in as subsequent arguments.
    
    var self = this;
    
    on(dom.byId("site_title"), "click", function(){
  	  window.location.href = "/";
  	});
  	
  	connect.subscribe("/corp/log", function(data){
      corp.log(data);
    });
    
    // This returned object becomes the defined value of this module
    var corp = {
      log: function(doc){
        var xhrArgs = {
           url: "/admin/log",
           postData: doc,
           handleAs: "json",
           headers:{
   					 "Content-Type": "application/json"
   				 },
   				 load: function(res){
   				   console.log("ok", res);
   				 },
   				 error: function(err){
   				   console.log("err", err);
   				 }
        };
          
        console.log("xhrArgs", xhrArgs);
        xhr.post(xhrArgs);
      },
   
      setCurrentPage: function(page){

        switch(page){
         	case "home":
      		dojo.addClass(dom.byId("nav-home"), "current_page_item");
      		break;
      		case "about":
      		dojo.addClass(dom.byId("nav-about"), "current_page_item");
      		break;
      		case "pricing":
      		dojo.addClass(dom.byId("nav-pricing"), "current_page_item");
      		break;
      		case "business":
      		dojo.addClass(dom.byId("nav-business"), "current_page_item");
      		break;
      		case "tour":
      		dojo.addClass(dom.byId("nav-tour"), "current_page_item");
      		break;
      		case "productivity":
      		dojo.addClass(dom.byId("nav-productivity"), "current");
      		break;
      		case "opportunity":
      		dojo.addClass(dom.byId("nav-opportunity"), "current");
      		break;
      	}
      },
      setBackground: function(){
        var bg = cookie("bg");

      	if (!bg){
      		bg = 0;
      	}

      	if (bg <= 0){
      		bg = 1;
      	}

      	bg = parseInt(bg,10) + 1;


      	if (bg > 10){
      		bg = 1;
      	}
      	cookie("bg", bg);
      }
    };
  return corp;
});