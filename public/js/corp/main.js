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
		"dojo/text!./templates/nav-about.html",
		"dojo/text!./templates/slide.html"
], function(dom, on, cookie, xhr, connect, dc, oppTemplate, db, build, lang, array, request, JSON, Tooltip, prodHtml, oppHtml, aboutHtml, slideHtml){
    // Once all modules in the dependency list have loaded, this
    // function is called to define the demo/myModule module.
    //
    // The dojo/dom module is passed as the first argument to this
    // function; additional modules in the dependency list would be
    // passed in as subsequent arguments.

    
    var self = this;
    
    
    // This returned object becomes the defined value of this module
    var corp = {
      
      setSpotlightSidebar: function(){
       
      },
      
      setOppSidebar: function(){
      
      },


			openMenu: function(id){
				
			},
			
			closeMenus: function(){
				
			},
			
			currentMenu: "nav-home",

			setTransparency: function(){
				db.load("/coordel/reduce/networkStats",{ query: {group: true, reduce: true},
            handleAs: "json"
          }).then(function(data){
						//console.log("transparency data", data, data.keys, data.values);
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
          
        //console.log("xhrArgs", xhrArgs);
        xhr.post(xhrArgs);
      },

			setSpotlight: function(){
				console.log("setting spotlight");
				request("/support/source.json").then(
		      function(text){
						console.log("steps", text);
		        var steps = JSON.parse(text).features;
		        

						var slideList = "";
		        array.forEach(steps, function(step){
		          if (!step.isIntro){
		            slideList = slideList + lang.replace(slideHtml, step);
		          }
		        });

		        dom.byId("slides").innerHTML = slideList;

		      },
		      function(error){
		        console.log("Features not found");
		      }
		    );
			},
   
      setCurrentPage: function(page){
				
				var self = this;
				
				//self.setSpotlight();
				
				function show(id){
					console.log("showing ", id);
          dc.add(dom.byId(id), "current-menu-item");
        }

				function setTitles(title){
					/*
					dom.byId("page-title").innerHTML = title;
					var node = dom.byId("breadcrumbs_box");
					var html = node.innerHTML;
					html = html + title;
					node.innerHTML = html;
					*/
				}
        
        var title;
        switch(page){

					case "pricing":
      		show("nav-pricing");
					title = "Pricing";
					setTitles(title);
					document.title = title;
      		break;

					case "transparency":
					document.title = "Transparency is Accountability";
					title = "Transparency";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "business":
					title = "Partner with Coordel";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "tour":
					title = "Features";
					setTitles(title);
					document.title = title;

      		break;
      		
      	  case "feature":
					title = "Feature";
					setTitles(title);
					document.title = title;
      	  break;
      	  
      	  case "cases":
					title = "Case Studies";
					setTitles(title);
					document.title = title;
      	  break;
      		
      		case "productivity":
      		show("nav-productivity");
					title = "Productivity";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "opportunity":
      		show("nav-opportunity");
					title = "Opportunity";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "public":
					title = "Network Opportunities";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "coordel":
					title = "Coordel Opportunities";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "employed":
					title = "Employed Productivity";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "consult":
					title = "Consultant Productivity";
					setTitles(title);
					document.title = title;
      		break;
      		
      		case "contract":
					title = "Contractor Productivity";
					setTitles(title);
					document.title = title;
      		break;
      	}
      },
      
      setBackground: function(){
			
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