define("dojo/_base/window",["dojo/lib/kernel"],function(a){a.doc=window.document||null,a.body=function(){return a.doc.body||a.doc.getElementsByTagName("body")[0]},a.setContext=function(b,c){a.global=b,a.doc=c},a.withGlobal=function(b,c,d,e){var f=a.global;try{a.global=b;return a.withDoc.call(null,b.document,c,d,e)}finally{a.global=f}},a.withDoc=function(b,c,d,e){var f=a.doc,g=a._bodyLtr,h=a.isQuirks;try{a.doc=b,delete a._bodyLtr,a.isQuirks=a.doc.compatMode=="BackCompat",d&&typeof c=="string"&&(c=d[c]);return c.apply(d,e||[])}finally{a.doc=f,delete a._bodyLtr,g!==undefined&&(a._bodyLtr=g),a.isQuirks=h}};return a})