function optimizeJs(a,b,c,d,e){c=c||"";var f=Packages.org.mozilla.javascript.Context.enter();try{f.setOptimizationLevel(-1);if(d.indexOf("shrinksafe")==0||d=="packer")b=new String(Packages.org.dojotoolkit.shrinksafe.Compressor.compressScript(b,0,1,e)),d.indexOf(".keepLines")==-1&&(b=b.replace(/[\r\n]/g,""));else if(d=="comments"){var g=f.compileString(b,a,1,null);b=new String(f.decompileScript(g,0)),b=b.replace(/    /g,"\t"),a.match(/\/nls\//)&&(b=b.replace(/;\s*$/,""))}}finally{Packages.org.mozilla.javascript.Context.exit()}return c+b}function readFile(a,b){b=b||"utf-8";var c=new java.io.File(a),d="\n",e=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(c),b));try{var f=new java.lang.StringBuffer,g="";while((g=e.readLine())!==null)f.append(g),f.append(d);return new String(f.toString())}finally{e.close()}}function load(a){var b=readFile(a),c=Packages.org.mozilla.javascript.Context,d=c.enter();try{return d.evaluateString(this,b,a,1,null)}finally{c.exit()}}build={make:function(a,b,c,d,e){if(b!="1.3.2")return"invalid version";if(c!="google"&&c!="aol")return"invalide CDN type";if(e!="comments"&&e!="shrinksafe"&&e!="none"&&e!="shrinksafe.keepLines")return"invalid optimize type";if(!d.match(/^[\w\-\,\s\.]+$/))return"invalid dependency list";var f="http://ajax.googleapis.com/ajax/libs/dojo/";c=="aol"&&(f="http://o.aolcdn.com/dojo/"),f+=b;var g=a+b+"/",h=d||"";h&&(h='"'+h.split(",").join('","')+'"');var i=g+"util/buildscripts/";load(g+"util/buildscripts/jslib/logger.js"),load(g+"util/buildscripts/jslib/fileUtil.js"),load(g+"util/buildscripts/jslib/buildUtil.js"),load(g+"util/buildscripts/jslib/buildUtilXd.js"),load(g+"util/buildscripts/jslib/i18nUtil.js");var j=buildUtil.makeBuildOptions(["loader=xdomain","version="+b,"xdDojoPath="+f,"layerOptimize="+e]),k='dependencies = {layers: [\t{\t\tname: "dojo.js",\t\tdependencies: ['+h+'\t\t]\t}],prefixes: [\t[ "dojo", "'+g+'dojo" ],\t[ "dijit", "'+g+'dijit" ],\t[ "dojox", "'+g+'dojox" ]]}',l=buildUtil.evalProfile(k,!0);j.profileProperties=l,d=j.profileProperties.dependencies;var m=d.prefixes,n=fileUtil.getLineSeparator(),o=fileUtil.readFile(i+"copyright.txt")+n+fileUtil.readFile(i+"build_notice.txt");d.loader=j.loader;var p=buildUtil.makeDojoJs(buildUtil.loadDependencyList(j.profileProperties,null,i),j.version,j),q=p[1].layerName,r=p[1].contents;q.match(/dojo\.xd\.js/)&&j.xdDojoPath&&(r=buildUtilXd.setXdDojoConfig(r,j.xdDojoPath));if(j.internStrings){m=d.prefixes||[];var s=d.internSkipList||[];r=buildUtil.interningRegexpMagic(q,r,g,m,s)}return optimizeJs(q,r,o,j.layerOptimize,"")}}