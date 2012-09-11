// In demo/myModule.js (which means this code defines
// the "demo/myModule" module):
 
define([
    // The dojo/dom module is required by this module, so it goes
    // in this list of dependencies.
    "dojo/dom",
    "dojo/on",
    "dojo/cookie",
    "dojo/_base/xhr",
    "dojo/_base/connect",
    "dojo/dom-class",
    "dojo/text!./templates/Sidelink.html",
    "corp/db",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/request",
    "dojo/json"
], function(dom, on, cookie, xhr, connect, dc, oppTemplate, db, build, lang, array, request, JSON){
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
      
      setSpotlightSidebar: function(){
        
        request("/support/source.json", {
            handleAs: "json"
          }).then(function(data){
            
            var features = data.features;
            
            
            // Do something with the handled data
            var count = features.length - 1;
            
            
            //randomize the features for updates

            var f1 = Math.floor((Math.random()*count)+1);
            var f2;
            var f3;
            do
              {
              f2 = Math.floor((Math.random()*count)+1);
              }
            while (f1 === f2);
            do
              {
              f3 = Math.floor((Math.random()*count)+1);
              }
            while (f1 === f3 || f2 === f3);
            
            setFeatures([f1,f2, f3]);
            
            function setFeatures(list){
              array.forEach(features, function(f){
                if (array.indexOf(list, f.order)>-1){
                  var node = lang.replace(oppTemplate, {url: "/?p=feature&f=" + f.code, name: f.title});
                  build.place(node, dom.byId("spotlight"), "last");
                }
              });
            }
          });
        
        

       
   
        
      },
      
      setOppSidebar: function(){
       
        db.load("/coordel/view/coordelOpportunities",{ query: {limit: 6, descending: true},
            handleAs: "json"
          }).then(function(data){
            if (data.rows && data.rows.length){
              array.forEach(data.rows, function(item){
                var node = lang.replace(oppTemplate, {url: "/?p=coordel#" + item._id, name: item.name});
                build.place(node, dom.byId("coordelOpps"), "last");
              });
            } else {
              //need to show empty;
            }
          });
      },
      
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
        
        function showNav2(){
          dc.remove(dom.byId("nav2"), "hidden");
        }
        
        function showSubNav(id){
          dc.add("sub-nav-opportunity", "hidden");
          dc.add("sub-nav-productivity", "hidden");
          dc.remove(dom.byId(id), "hidden");
        }
        
        
        function show(id){
          dc.add(dom.byId(id), "current_page_item");
        }
        
        function showParent(id){
          dc.add(dom.byId(id), "current_page_parent");
        }
        
        
        switch(page){
         	case "home":
      		show("nav-home");
      		break;
      		
      		case "about":
      		show("nav-about");
      		break;
      		
      		case "pricing":
      		show("nav-pricing");
      		break;
      		
      		case "business":
      		show("nav-business");
      		break;
      		
      		case "tour":
      		showParent("nav-productivity");
      		show("nav-tour");
      		showSubNav("sub-nav-productivity");
      		break;
      		
      	  case "feature":
      	  show("nav-productivity");
        	showSubNav("sub-nav-productivity");
      	  show("nav-tour");
      	  break;
      	  
      	  case "cases":
      	  show("nav-productivity");
        	showSubNav("sub-nav-productivity");
      	  show("nav-cases");
      	  break;
      		
      		case "productivity":
      		show("nav-productivity");
      		showSubNav("sub-nav-productivity");
      		break;
      		
      		case "opportunity":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		break;
      		
      		case "public":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		show("nav-public");
      		break;
      		
      		case "coordel":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		show("nav-coordel");
      		break;
      		
      		case "employed":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-employed");
      		break;
      		
      		case "consult":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-consult");
      		break;
      		
      		case "contract":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-contract");
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