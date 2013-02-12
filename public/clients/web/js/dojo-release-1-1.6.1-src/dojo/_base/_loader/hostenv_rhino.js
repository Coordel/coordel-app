function dj_readInputStream(a,b){var c=new java.io.BufferedReader(new java.io.InputStreamReader(a,b));try{var d=new java.lang.StringBuffer,e="";while((e=c.readLine())!==null)d.append(e),d.append(java.lang.System.getProperty("line.separator"));return d.toString()}finally{c.close()}}function readUri(a,b){var c=(new java.net.URL(a)).openConnection();b=b||c.getContentEncoding()||"utf-8";var d=c.getInputStream();return dj_readInputStream(d,b)}function readText(a,b){b=b||"utf-8";var c=new java.io.File(a),d=new java.io.FileInputStream(c);return dj_readInputStream(d,b)}dojo.config.baseUrl?dojo.baseUrl=dojo.config.baseUrl:dojo.baseUrl="./",dojo.locale=dojo.locale||String(java.util.Locale.getDefault().toString().replace("_","-").toLowerCase()),dojo._name="rhino",dojo.isRhino=!0,typeof print=="function"&&(console.debug=print),"byId"in dojo||(dojo.byId=function(a,b){if(a&&(typeof a=="string"||a instanceof String)){b||(b=document);return b.getElementById(a)}return a}),dojo._isLocalUrl=function(a){var b=(new java.io.File(a)).exists();if(!b){var c;try{c=(new java.net.URL(a)).openStream(),c.close()}finally{c&&c.close&&c.close()}}return b},dojo._loadUri=function(uri,cb){if(dojo._loadedUrls[uri])return!0;try{var local;try{local=dojo._isLocalUrl(uri)}catch(e){return!1}dojo._loadedUrls[uri]=!0;if(cb){var contents=(local?readText:readUri)(uri,"UTF-8");eval("'‏'").length||(contents=String(contents).replace(/[\u200E\u200F\u202A-\u202E]/g,function(a){return"\\u"+a.charCodeAt(0).toString(16)})),contents=/^define\(/.test(contents)?contents:"("+contents+")",cb(eval(contents))}else load(uri);dojo._loadedUrls.push(uri);return!0}catch(e){dojo._loadedUrls[uri]=!1,console.debug("rhino load('"+uri+"') failed. Exception: "+e);return!1}},dojo.exit=function(a){quit(a)},dojo._getText=function(a,b){try{var c=dojo._isLocalUrl(a),d=(c?readText:readUri)(a,"UTF-8");d!==null&&(d+="");return d}catch(e){if(b)return null;throw e}},dojo.doc=typeof document!="undefined"?document:null,dojo.body=function(){return document.body};if(typeof setTimeout=="undefined"||typeof clearTimeout=="undefined")dojo._timeouts=[],clearTimeout=function(a){dojo._timeouts[a]&&dojo._timeouts[a].stop()},setTimeout=function(a,b){var c={sleepTime:b,hasSlept:!1,run:function(){this.hasSlept||(this.hasSlept=!0,java.lang.Thread.currentThread().sleep(this.sleepTime));try{a()}catch(b){console.debug("Error running setTimeout thread:"+b)}}},d=new java.lang.Runnable(c),e=new java.lang.Thread(d);e.start();return dojo._timeouts.push(e)-1};if(dojo.config.modulePaths)for(var param in dojo.config.modulePaths)dojo.registerModulePath(param,dojo.config.modulePaths[param])