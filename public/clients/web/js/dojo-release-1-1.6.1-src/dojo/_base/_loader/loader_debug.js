dojo.provide("dojo._base._loader.loader_debug"),dojo.nonDebugProvide=dojo.provide,dojo.provide=function(a){var b=dojo._xdDebugQueue;b&&b.length>0&&a==b.currentResourceName&&(dojo.isAIR?window.setTimeout(function(){dojo._xdDebugFileLoaded(a)},1):window.setTimeout(dojo._scopeName+"._xdDebugFileLoaded('"+a+"')",1));return dojo.nonDebugProvide.apply(dojo,arguments)},dojo._xdDebugFileLoaded=function(a){dojo._xdDebugScopeChecked||(dojo._scopeName!="dojo"&&(window.dojo=window[dojo.config.scopeMap[0][1]],window.dijit=window[dojo.config.scopeMap[1][1]],window.dojox=window[dojo.config.scopeMap[2][1]]),dojo._xdDebugScopeChecked=!0);var b=dojo._xdDebugQueue;a&&a==b.currentResourceName&&b.shift(),b.length==0&&dojo._xdWatchInFlight();if(b.length==0){b.currentResourceName=null;for(var c in dojo._xdInFlight)if(dojo._xdInFlight[c]===!0)return;dojo._xdNotifyLoaded()}else if(a==b.currentResourceName){b.currentResourceName=b[0].resourceName;var d=document.createElement("script");d.type="text/javascript",d.src=b[0].resourcePath,document.getElementsByTagName("head")[0].appendChild(d)}}