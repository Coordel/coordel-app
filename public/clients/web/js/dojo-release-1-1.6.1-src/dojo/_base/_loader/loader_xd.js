dojo.provide("dojo._base._loader.loader_xd"),dojo._xdReset=function(){dojo._isXDomain=dojo.config.useXDomain||!1,dojo._xdClearInterval(),dojo._xdInFlight={},dojo._xdOrderedReqs=[],dojo._xdDepMap={},dojo._xdContents=[],dojo._xdDefList=[]},dojo._xdClearInterval=function(){dojo._xdTimer&&(clearInterval(dojo._xdTimer),dojo._xdTimer=0)},dojo._xdReset(),dojo._xdCreateResource=function(contents,resourceName,resourcePath){var depContents=contents.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,""),deps=[],depRegExp=/dojo.(require|requireIf|provide|requireAfterIf|platformRequire|requireLocalization)\s*\(([\w\W]*?)\)/mg,match;while((match=depRegExp.exec(depContents))!=null)match[1]=="requireLocalization"?eval(match[0]):deps.push('"'+match[1]+'", '+match[2]);var output=[];output.push(dojo._scopeName+"._xdResourceLoaded(function("+dojo._scopePrefixArgs+"){\n");var loadInitCalls=dojo._xdExtractLoadInits(contents);if(loadInitCalls){contents=loadInitCalls[0];for(var i=1;i<loadInitCalls.length;i++)output.push(loadInitCalls[i]+";\n")}output.push("return {");if(deps.length>0){output.push("depends: [");for(i=0;i<deps.length;i++)i>0&&output.push(",\n"),output.push("["+deps[i]+"]");output.push("],")}output.push("\ndefineResource: function("+dojo._scopePrefixArgs+"){"),(!dojo.config.debugAtAllCosts||resourceName=="dojo._base._loader.loader_debug")&&output.push(contents),output.push("\n}, resourceName: '"+resourceName+"', resourcePath: '"+resourcePath+"'};});");return output.join("")},dojo._xdExtractLoadInits=function(a){var b=/dojo.loadInit\s*\(/g;b.lastIndex=0;var c=/[\(\)]/g;c.lastIndex=0;var d=[],e;while(e=b.exec(a)){c.lastIndex=b.lastIndex;var f=1,g;while(g=c.exec(a)){g[0]==")"?f-=1:f+=1;if(f==0)break}if(f!=0)throw"unmatched paren around character "+c.lastIndex+" in: "+a;var h=b.lastIndex-e[0].length;d.push(a.substring(h,c.lastIndex));var i=c.lastIndex-h;a=a.substring(0,h)+a.substring(c.lastIndex,a.length),b.lastIndex=c.lastIndex-i,b.lastIndex=c.lastIndex}d.length>0&&d.unshift(a);return d.length?d:null},dojo._xdIsXDomainPath=function(a){var b=a.indexOf(":"),c=a.indexOf("/");if(b>0&&b<c||a.indexOf("//")===0)return!0;var d=dojo.baseUrl;b=d.indexOf(":"),c=d.indexOf("/");if(d.indexOf("//")===0||b>0&&b<c&&(!location.host||d.indexOf("http://"+location.host)!=0))return!0;return!1},dojo._loadPath=function(a,b,c){var d=dojo._xdIsXDomainPath(a);dojo._isXDomain|=d;var e=(a.charAt(0)=="/"||a.match(/^\w+:/)?"":dojo.baseUrl)+a;try{return!b||dojo._isXDomain?dojo._loadUri(e,c,d,b):dojo._loadUriAndCheck(e,b,c)}catch(f){console.error(f);return!1}},dojo._xdCharSet="utf-8",dojo._loadUri=function(a,b,c,d){if(dojo._loadedUrls[a])return 1;if(dojo._isXDomain&&d&&d!="dojo.i18n"){dojo._xdOrderedReqs.push(d);if(c||a.indexOf("/nls/")==-1)dojo._xdInFlight[d]=!0,dojo._inFlightCount++;dojo._xdTimer||(dojo.isAIR?dojo._xdTimer=setInterval(function(){dojo._xdWatchInFlight()},100):dojo._xdTimer=setInterval(dojo._scopeName+"._xdWatchInFlight();",100)),dojo._xdStartTime=(new Date).getTime()}if(c){var e=a.lastIndexOf(".");e<=0&&(e=a.length-1);var f=a.substring(0,e)+".xd";e!=a.length-1&&(f+=a.substring(e,a.length)),dojo.isAIR&&(f=f.replace("app:/","/"));var g=document.createElement("script");g.type="text/javascript",dojo._xdCharSet&&(g.charset=dojo._xdCharSet),g.src=f,dojo.headElement||(dojo._headElement=document.getElementsByTagName("head")[0],dojo._headElement||(dojo._headElement=document.getElementsByTagName("html")[0])),dojo._headElement.appendChild(g)}else{var h=dojo._getText(a,null,!0);if(h==null)return 0;if(dojo._isXDomain&&a.indexOf("/nls/")==-1&&d!="dojo.i18n"){var i=dojo._xdCreateResource(h,d,a);dojo.eval(i)}else{b?h="("+h+")":h=dojo._scopePrefix+h+dojo._scopeSuffix;var j=dojo.eval(h+"\r\n//@ sourceURL="+a);b&&b(j)}}dojo._loadedUrls[a]=!0,dojo._loadedUrls.push(a);return!0},dojo._xdResourceLoaded=function(a){a=a.apply(dojo.global,dojo._scopeArgs);var b=a.depends,c=null,d=null,e=[];if(b&&b.length>0){var f=null,g=0,h=!1;for(var i=0;i<b.length;i++){f=b[i];if(f[0]=="provide")e.push(f[1]);else{c||(c=[]),d||(d=[]);var j=dojo._xdUnpackDependency(f);j.requires&&(c=c.concat(j.requires)),j.requiresAfter&&(d=d.concat(j.requiresAfter))}var k=f[0],l=k.split(".");l.length==2?dojo[l[0]][l[1]].apply(dojo[l[0]],f.slice(1)):dojo[k].apply(dojo,f.slice(1))}if(e.length==1&&e[0]=="dojo._base._loader.loader_debug")a.defineResource(dojo);else{var m=dojo._xdContents.push({content:a.defineResource,resourceName:a.resourceName,resourcePath:a.resourcePath,isDefined:!1})-1;for(i=0;i<e.length;i++)dojo._xdDepMap[e[i]]={requires:c,requiresAfter:d,contentIndex:m}}for(i=0;i<e.length;i++)dojo._xdInFlight[e[i]]=!1}},dojo._xdLoadFlattenedBundle=function(a,b,c,d){c=c||"root";var e=dojo.i18n.normalizeLocale(c).replace("-","_"),f=[a,"nls",b].join("."),g=dojo.provide(f);g[e]=d;var h=[a,e,b].join("."),i=dojo._xdBundleMap[h];if(i)for(var j in i)g[j]=d},dojo._xdInitExtraLocales=function(){var a=dojo.config.extraLocale;a&&(!a instanceof Array&&(a=[a]),dojo._xdReqLoc=dojo.xdRequireLocalization,dojo.xdRequireLocalization=function(b,c,d,e){dojo._xdReqLoc(b,c,d,e);if(!d)for(var f=0;f<a.length;f++)dojo._xdReqLoc(b,c,a[f],e)})},dojo._xdBundleMap={},dojo.xdRequireLocalization=function(a,b,c,d){if(dojo._xdInitExtraLocales)dojo._xdInitExtraLocales(),dojo._xdInitExtraLocales=null,dojo.xdRequireLocalization.apply(dojo,arguments);else{var e=d.split(","),f=dojo.i18n.normalizeLocale(c),g="";for(var h=0;h<e.length;h++)f.indexOf(e[h])==0&&(e[h].length>g.length&&(g=e[h]));var i=g.replace("-","_"),j=dojo.getObject([a,"nls",b].join("."));if(!j||!j[i]){var k=[a,i||"root",b].join("."),l=dojo._xdBundleMap[k];l||(l=dojo._xdBundleMap[k]={}),l[f.replace("-","_")]=!0,dojo.require(a+".nls"+(g?"."+g:"")+"."+b)}}},dojo._xdRealRequireLocalization=dojo.requireLocalization,dojo.requireLocalization=function(a,b,c,d){var e=dojo.moduleUrl(a).toString();return dojo._xdIsXDomainPath(e)?dojo.xdRequireLocalization.apply(dojo,arguments):dojo._xdRealRequireLocalization.apply(dojo,arguments)},dojo._xdUnpackDependency=function(a){var b=null,c=null;switch(a[0]){case"requireIf":case"requireAfterIf":a[1]===!0&&(b=[{name:a[2],content:null}]);break;case"platformRequire":var d=a[1],e=d.common||[];b=d[dojo.hostenv.name_]?e.concat(d[dojo.hostenv.name_]||[]):e.concat(d["default"]||[]);if(b)for(var f=0;f<b.length;f++)b[f]instanceof Array?b[f]={name:b[f][0],content:null}:b[f]={name:b[f],content:null};break;case"require":b=[{name:a[1],content:null}];break;case"i18n._preloadLocalizations":dojo.i18n._preloadLocalizations.apply(dojo.i18n._preloadLocalizations,a.slice(1))}if(a[0]=="requireAfterIf"||a[0]=="requireIf")c=b,b=null;return{requires:b,requiresAfter:c}},dojo._xdWalkReqs=function(){var a=null,b;for(var c=0;c<dojo._xdOrderedReqs.length;c++)b=dojo._xdOrderedReqs[c],dojo._xdDepMap[b]&&(a=[b],a[b]=!0,dojo._xdEvalReqs(a))},dojo._xdEvalReqs=function(a){while(a.length>0){var b=a[a.length-1],c=dojo._xdDepMap[b],d,e,f;if(c){e=c.requires;if(e&&e.length>0)for(d=0;d<e.length;d++)f=e[d].name,f&&!a[f]&&(a.push(f),a[f]=!0,dojo._xdEvalReqs(a));var g=dojo._xdContents[c.contentIndex];if(!g.isDefined){var h=g.content;h.resourceName=g.resourceName,h.resourcePath=g.resourcePath,dojo._xdDefList.push(h),g.isDefined=!0}dojo._xdDepMap[b]=null,e=c.requiresAfter;if(e&&e.length>0)for(d=0;d<e.length;d++)f=e[d].name,f&&!a[f]&&(a.push(f),a[f]=!0,dojo._xdEvalReqs(a))}a.pop()}},dojo._xdWatchInFlight=function(){var a="",b=(dojo.config.xdWaitSeconds||15)*1e3,c=dojo._xdStartTime+b<(new Date).getTime();for(var d in dojo._xdInFlight)if(dojo._xdInFlight[d]===!0)if(c)a+=d+" ";else return;dojo._xdClearInterval();if(c)throw"Could not load cross-domain resources: "+a;dojo._xdWalkReqs();var e=dojo._xdDefList.length;for(var f=0;f<e;f++){var g=dojo._xdDefList[f];dojo.config.debugAtAllCosts&&g.resourceName?(dojo._xdDebugQueue||(dojo._xdDebugQueue=[]),dojo._xdDebugQueue.push({resourceName:g.resourceName,resourcePath:g.resourcePath})):g.apply(dojo.global,dojo._scopeArgs)}for(f=0;f<dojo._xdContents.length;f++){var h=dojo._xdContents[f];h.content&&!h.isDefined&&h.content.apply(dojo.global,dojo._scopeArgs)}dojo._xdReset(),dojo._xdDebugQueue&&dojo._xdDebugQueue.length>0?dojo._xdDebugFileLoaded():dojo._xdNotifyLoaded()},dojo._xdNotifyLoaded=function(){for(var a in dojo._xdInFlight)if(typeof dojo._xdInFlight[a]=="boolean")return;dojo._inFlightCount=0,dojo._initFired&&!dojo._loadNotifying&&dojo._callLoaded()}