define("dojo/gears",["dojo"],function(a){a.getObject("gears",!0,a),a.gears._gearsObject=function(){var b,c,d=a.getObject("google.gears");if(d)return d;if(typeof GearsFactory!="undefined")b=new GearsFactory;else if(a.isIE)try{b=new ActiveXObject("Gears.Factory")}catch(e){}else navigator.mimeTypes["application/x-googlegears"]&&(b=document.createElement("object"),b.setAttribute("type","application/x-googlegears"),b.setAttribute("width",0),b.setAttribute("height",0),b.style.display="none",document.documentElement.appendChild(b));if(!b)return null;a.setObject("google.gears.factory",b);return a.getObject("google.gears")},a.gears.available=!!a.gears._gearsObject()||0;return a.gears})