define("dojo/uacss",["dojo"],function(a){(function(){var b=a,c=b.doc.documentElement,d=b.isIE,e=b.isOpera,f=Math.floor,g=b.isFF,h=b.boxModel.replace(/-/,""),i={dj_ie:d,dj_ie6:f(d)==6,dj_ie7:f(d)==7,dj_ie8:f(d)==8,dj_ie9:f(d)==9,dj_quirks:b.isQuirks,dj_iequirks:d&&b.isQuirks,dj_opera:e,dj_khtml:b.isKhtml,dj_webkit:b.isWebKit,dj_safari:b.isSafari,dj_chrome:b.isChrome,dj_gecko:b.isMozilla,dj_ff3:f(g)==3};i["dj_"+h]=!0;var j="";for(var k in i)i[k]&&(j+=k+" ");c.className=b.trim(c.className+" "+j),a._loaders.unshift(function(){if(!a._isBodyLtr()){var d="dj_rtl dijitRtl "+j.replace(/ /g,"-rtl ");c.className=b.trim(c.className+" "+d)}})})();return a})