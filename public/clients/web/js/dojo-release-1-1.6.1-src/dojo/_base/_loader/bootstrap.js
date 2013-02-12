(function(){function bootstrapDojo(dojo,dijit,dojox){(function(){if(typeof this.loadFirebugConsole=="function")this.loadFirebugConsole();else{this.console=this.console||{};var cn=["assert","count","debug","dir","dirxml","error","group","groupEnd","info","profile","profileEnd","time","timeEnd","trace","warn","log"],i=0,tn;while(tn=cn[i++])console[tn]||function(){var a=tn+"";console[a]="log"in console?function(){var b=Array.apply({},arguments);b.unshift(a+":"),console.log(b.join(" "))}:function(){},console[a]._fake=!0}()}typeof dojo=="undefined"&&(dojo={_scopeName:"dojo",_scopePrefix:"",_scopePrefixArgs:"",_scopeSuffix:"",_scopeMap:{},_scopeMapRev:{}});var d=dojo;typeof dijit=="undefined"&&(dijit={_scopeName:"dijit"}),typeof dojox=="undefined"&&(dojox={_scopeName:"dojox"}),d._scopeArgs||(d._scopeArgs=[dojo,dijit,dojox]),d.global=this,d.config={isDebug:!1,debugAtAllCosts:!1};var cfg=typeof djConfig!="undefined"?djConfig:typeof dojoConfig!="undefined"?dojoConfig:null;if(cfg)for(var c in cfg)d.config[c]=cfg[c];dojo.locale=d.config.locale;var rev="$Rev: 24595 $".match(/\d+/);dojo.version={major:1,minor:6,patch:1,flag:"",revision:rev?+rev[0]:NaN,toString:function(){with(d.version)return major+"."+minor+"."+patch+flag+" ("+revision+")"}},typeof OpenAjax!="undefined"&&OpenAjax.hub.registerLibrary(dojo._scopeName,"http://dojotoolkit.org",d.version.toString());var extraNames,extraLen,empty={};for(var i in {toString:1}){extraNames=[];break}dojo._extraNames=extraNames=extraNames||["hasOwnProperty","valueOf","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","constructor"],extraLen=extraNames.length,dojo._mixin=function(a,b){var c,d,e;for(c in b){d=b[c];if(!(c in a)||a[c]!==d&&(!(c in empty)||empty[c]!==d))a[c]=d}if(extraLen&&b)for(e=0;e<extraLen;++e){c=extraNames[e],d=b[c];if(!(c in a)||a[c]!==d&&(!(c in empty)||empty[c]!==d))a[c]=d}return a},dojo.mixin=function(a,b){a||(a={});for(var c=1,e=arguments.length;c<e;c++)d._mixin(a,arguments[c]);return a},dojo._getProp=function(a,b,c){var e=c||d.global;for(var f=0,g;e&&(g=a[f]);f++)f==0&&d._scopeMap[g]&&(g=d._scopeMap[g]),e=g in e?e[g]:b?e[g]={}:undefined;return e},dojo.setObject=function(a,b,c){var e=a.split("."),f=e.pop(),g=d._getProp(e,!0,c);return g&&f?g[f]=b:undefined},dojo.getObject=function(a,b,c){return d._getProp(a.split("."),b,c)},dojo.exists=function(a,b){return d.getObject(a,!1,b)!==undefined},dojo.eval=function(scriptFragment){return d.global.eval?d.global.eval(scriptFragment):eval(scriptFragment)},d.deprecated=d.experimental=function(){}})();return{dojo:dojo,dijit:dijit,dojox:dojox}}if(this.define)define([],function(){var a=bootstrapDojo();a.dojo._dijit=a.dijit,a.dojo._dojox=a.dojox;return a.dojo});else{var result=bootstrapDojo();dojo=result.dojo,dijit=result.dijit,dojox=result.dojox}})()