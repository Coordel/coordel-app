var console;(function(a,b){var c,d,e,f,g,h,i="",j=/\.js$/,k=!0,l=k?0:1,m=typeof b!=="undefined"?b:null;typeof Packages!=="undefined"?(d="rhino",k&&(i=a[0]),c=a[1-l],h=Packages.org.mozilla.javascript.ContextFactory.getGlobal().enterContext(),g=function(a,b){return h.evaluateString(this,a,b,0,null)},typeof console==="undefined"&&(console={log:function(){print.apply(undefined,arguments)}})):typeof process!=="undefined"&&(d="node",e=require("fs"),f=require("vm"),this.nodeRequire=require,require=null,m=function(a){return e.readFileSync(a,"utf8")},g=function(a,b){return f.runInThisContext(a,b)},k&&(i=process.argv[2]),c=process.argv[3-l]),i=i.replace(/\\/g,"/"),i.charAt(i.length-1)!=="/"&&(i+="/"),i+="../",g(m(i+"require.js"),"require.js"),d==="rhino"?g(m(i+"adapt/rhino.js"),"rhino.js"):d==="node"&&g(m(i+"adapt/node.js"),"node.js"),k&&g("require({baseUrl: '"+i+"build/jslib/'})","bootstrap");if(!c||!j.test(c))c="main.js";k||(dir=c.replace(/\\/g,"/"),dir.indexOf("/")!==-1&&(dir=dir.split("/"),dir.pop(),dir.join("/"),g("require({baseUrl: '"+dir+"'});"))),g(m(c),c)})(typeof Packages!=="undefined"?arguments:[],typeof readFile!=="undefined"?readFile:undefined)