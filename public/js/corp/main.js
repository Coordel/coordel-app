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
    "dojo/json",
		"dijit/Tooltip",
		"dojo/text!./templates/nav-productivity.html",
    "dojo/text!./templates/nav-opportunity.html",
		"dojo/text!./templates/nav-about.html"
], function(dom, on, cookie, xhr, connect, dc, oppTemplate, db, build, lang, array, request, JSON, Tooltip, prodHtml, oppHtml, aboutHtml){
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

	
		
		/*
		
		on(navopp, 'mouseover', function(){
			self.openMenu("m2");
		});
		
		on(navopp, 'mouseout', function(){
			self.closeMenus();
		});
		
		on(navabout, 'mouseover', function(){
			self.openMenu("m3");
		});
		
		on(navabout, 'mouseout', function(){
			self.closeMenus();
		});
  	
  	connect.subscribe("/corp/log", function(data){
      corp.log(data);
    });
*/
    
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


			openMenu: function(id){
				//if (this.currentMenu !== id){
					this.closeMenus();
					//this.currentMenu = id;
					dc.remove(id, "invisible");
					
					var node = dom.byId(id).parentNode;
					dc.add(node, "open");
				//}
			},
			
			closeMenus: function(){
				dc.add("m1", "invisible");
				dc.add("m2","invisible");
				dc.add("m3","invisible");
				dc.remove("nav-productivity", "open");
				dc.remove("nav-opportunity", "open");
				dc.remove("nav-about", "open");
			},
			
			currentMenu: "nav-home",

			setTransparency: function(){
				db.load("/coordel/reduce/networkStats",{ query: {group: true, reduce: true},
            handleAs: "json"
          }).then(function(data){
						console.log("transparency data", data, data.keys, data.values);
						var paying = 0;
						var non = 0;
						var total = 0;
						var allocated = 0;
						var pledged = 0;
						if (data.rows.length){
							
								array.forEach(data.rows, function(row){
									if (row.key === "members"){
										paying = row.value;
									} else if (row.key === "non-members"){
										non = row.value;
									} else if (row.key === "coordel-pledged"){
										pledged = row.value;
									}
								});
						
								total = parseInt(paying, 10) + parseInt(non, 10);
							
						}
            
						
						dom.byId("payingMembers").innerHTML = paying.toString();
						dom.byId("nonPayingMembers").innerHTML = non.toString();
						dom.byId("totalMembers").innerHTML = total.toString();
						
						dom.byId("pledged").innerHTML = pledged.toString();
						dom.byId("available").innerHTML = paying.toString();
						dom.byId("allocated").innerHTML = allocated.toString();
						
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
		
				var self = this;
	
				self.closeMenus();
				
				
				var navprod = dom.byId("nav-productivity");
				var navopp = dom.byId("nav-opportunity");
				var navabout = dom.byId("nav-about");

				on(navprod, 'mouseover', function(){
					self.openMenu("m1");
				});

				on(navprod, 'mouseout', function(){
					self.closeMenus();
				});
				
				on(navopp, 'mouseover', function(){
					self.openMenu("m2");
				});

				on(navopp, 'mouseout', function(){
					self.closeMenus();
				});

				on(navabout, 'mouseover', function(){
					self.openMenu("m3");
				});

				on(navabout, 'mouseout', function(){
					self.closeMenus();
				});

		  	connect.subscribe("/corp/log", function(data){
		      corp.log(data);
		    });
				
        
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
					showSubNav("sub-nav-about");
      		break;

					case "pricing":
      		showParent("nav-about");
      		show("nav-pricing");
      		showSubNav("sub-nav-about");
      		break;

					case "transparency":
      		showParent("nav-about");
      		show("nav-transparency");
      		showSubNav("sub-nav-about");
      		break;

					case "allocations":
      		showParent("nav-about");
      		show("nav-allocations");
      		showSubNav("sub-nav-about");
      		break;
      		
      		case "membership":
      		show("nav-membership");
      		showSubNav("sub-nav-membership");
      		break;
      		
      		case "advocate":
      		showParent("nav-membership");
      		show("nav-advocate");
      		showSubNav("sub-nav-membership");
      		break;
      		
      		case "business":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		show("nav-business");
					document.title = "Your Own Business";
      		break;
      		
      		case "tour":
      		showParent("nav-productivity");
      		show("nav-tour");
      		showSubNav("sub-nav-productivity");
					document.title = "Productivity Features";
      		break;
      		
      	  case "feature":
      	  show("nav-productivity");
        	showSubNav("sub-nav-productivity");
      	  show("nav-tour");
					document.title = "Productivity";
      	  break;
      	  
      	  case "cases":
      	  show("nav-productivity");
        	showSubNav("sub-nav-productivity");
      	  show("nav-cases");
					document.title = "Productivity and Opportunity Use Cases";
      	  break;
      		
      		case "productivity":
      		show("nav-productivity");
      		showSubNav("sub-nav-productivity");
					document.title = "Productivity";
      		break;
      		
      		case "opportunity":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
					document.title = "Opportunity";
      		break;
      		
      		case "public":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		show("nav-public");
					document.title = "Public Opportunity";
      		break;
      		
      		case "coordel":
      		showParent("nav-opportunity");
      		showSubNav("sub-nav-opportunity");
      		show("nav-coordel");
					document.title = "Coordel Opportunity";
      		break;
      		
      		case "employed":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-employed");
					document.title = "Employed Productivity";
      		break;
      		
      		case "consult":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-consult");
					document.title = "Consultant Productivity";
      		break;
      		
      		case "contract":
      		show("nav-productivity");
        	showSubNav("sub-nav-productivity");
        	show("nav-cases");
      		show("nav-contract");
					document.title = "Contractor Productivity";
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

/*
 * Title Caps
 * 
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */

(function(){
	var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
	var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
  
	this.titleCaps = function(title){
		var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;
		
		while (true) {
			var m = split.exec(title);

			parts.push( title.substring(index, m ? m.index : title.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
					return (/[A-Za-z]\.[A-Za-z]/.test(all)) ? all : upper(all);
				})
				.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
				.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
					return punct + upper(word);
				})
				.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));
			
			index = split.lastIndex;
			
			if ( m ) parts.push( m[0] );
			else break;
		}
		
		return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});
	};
    
	function lower(word){
		return word.toLowerCase();
	}
    
	function upper(word){
	  return word.substr(0,1).toUpperCase() + word.substr(1);
	}
})();