typeof window!="undefined"&&(dojo.isBrowser=!0,dojo._name="browser",function(){var a=dojo;a.baseUrl=a.config.baseUrl;var b=navigator,c=b.userAgent,d=b.appVersion,e=parseFloat(d);a.isMozilla=a.isMoz=e,a.isMoz&&(a.isFF=parseFloat(c.split("Firefox/")[1])||undefined),a.isQuirks=document.compatMode=="BackCompat",a.locale=dojo.config.locale||b.language.toLowerCase(),a._xhrObj=function(){return new XMLHttpRequest};var f=a._loadUri;a._loadUri=function(b,c){var d=["file:","chrome:","resource:"].some(function(a){return String(b).indexOf(a)==0});if(d){var e=Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader),g=e.loadSubScript(b,a.global);c&&c(g);return!0}return f.apply(a,arguments)},a._isDocumentOk=function(a){var b=a.status||0;return b>=200&&b<300||b==304||b==1223||!b&&(location.protocol=="file:"||location.protocol=="chrome:")};var g=!1;a._getText=function(b,c){var d=a._xhrObj();!g&&dojo._Url&&(b=(new dojo._Url(b)).toString()),a.config.cacheBust&&(b+="",b+=(b.indexOf("?")==-1?"?":"&")+String(a.config.cacheBust).replace(/\W+/g,""));var e=["file:","chrome:","resource:"].some(function(a){return String(b).indexOf(a)==0});if(e){var f=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService),h=Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream),i=f.newChannel(b,null,null),j=i.open();h.init(j);var k=h.read(j.available());h.close(),j.close();return k}d.open("GET",b,!1);try{d.send(null);if(!a._isDocumentOk(d)){var l=Error("Unable to load "+b+" status:"+d.status);l.status=d.status,l.responseText=d.responseText;throw l}}catch(m){if(c)return null;throw m}return d.responseText},a._windowUnloaders=[],a.windowUnloaded=function(){var b=a._windowUnloaders;while(b.length)b.pop()()},a.addOnWindowUnload=function(b,c){a._onto(a._windowUnloaders,b,c)};var h=[],i=null;dojo._defaultContext=[window,document],dojo.pushContext=function(a,b){var c=[dojo.global,dojo.doc];h.push(c);var d;if(a||b){d=[a,b];if(!b&&dojo.isString(a)){var e=document.getElementById(a);e.contentDocument&&(d=[e.contentWindow,e.contentDocument])}}else d=dojo._defaultContext;i=d,dojo.setContext.apply(dojo,d);return c},dojo.popContext=function(){var a=i;if(!h.length)return a;dojo.setContext.apply(dojo,h.pop());return a},dojo._inContext=function(a,b,c){var d=dojo._toArray(arguments);c=d.pop(),d.length==1&&(b=null),dojo.pushContext(a,b);var e=c();dojo.popContext();return e}}(),dojo._initFired=!1,dojo._loadInit=function(a){dojo._initFired=!0;var b=a&&a.type?a.type.toLowerCase():"load";arguments.callee.initialized||b!="domcontentloaded"&&b!="load"||(arguments.callee.initialized=!0,dojo._inFlightCount==0&&dojo._modulesLoaded())},dojo.config.afterOnLoad||window.addEventListener("DOMContentLoaded",function(a){dojo._loadInit(a)},!1)),function(){var a=dojo.config.modulePaths;if(a)for(var b in a)dojo.registerModulePath(b,a[b])}(),dojo.config.isDebug&&(console.log=function(a){var b=Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);b.logStringMessage(a)},console.debug=function(){console.log(dojo._toArray(arguments).join(" "))})