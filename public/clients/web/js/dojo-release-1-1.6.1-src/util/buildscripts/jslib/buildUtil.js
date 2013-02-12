var buildUtil={};buildUtil.DojoBuildOptions={profile:{defaultValue:"base",helpText:"The name of the profile to use for the build. It must be the first part of the profile file name in the profiles/ directory. For instance, to use base.profile.js, specify profile=base."},profileFile:{defaultValue:"",helpText:'A file path to the the profile file. Use this if your profile is outside of the profiles directory. Do not specify the "profile" build option if you use "profileFile".'},htmlFiles:{defaultValue:"",helpText:"A list of HTML files to generate the profile from. The HTML files will be scanned for script tags and dojo.require calls to create a set of layers. If a profile or profileFile is specified, the profile will be written to that destination and the build will continue."},htmlDir:{defaultValue:"",helpText:"A directory to use to get a list of HTML files for generating the profile"},action:{defaultValue:"help",helpText:"The build action(s) to run. Can be a comma-separated list, like action=clean,release. The possible build actions are: clean, release."},version:{defaultValue:"0.0.0.dev",helpText:"The build will be stamped with this version string."},localeList:{defaultValue:"ar,ca,cs,da,de-de,el,en-gb,en-us,es-es,fi-fi,fr-fr,he-il,hu,it-it,ja-jp,ko-kr,nl-nl,nb,pl,pt-br,pt-pt,ru,sk,sl,sv,th,tr,zh-tw,zh-cn",helpText:"The set of locales to use when flattening i18n bundles."},releaseName:{defaultValue:"dojo",helpText:"The name of the release. A directory inside 'releaseDir' will be created with this name."},releaseDir:{defaultValue:"../../release/",helpText:"The top level release directory where builds end up. The 'releaseName' directories will  be placed inside this directory."},loader:{defaultValue:"default",helpText:'The type of dojo loader to use. "default" or "xdomain" are acceptable values.'},internStrings:{defaultValue:!0,helpText:"Turn on or off widget template file interning."},optimize:{defaultValue:"",helpText:'Specifies how to optimize module files. If "comments" is specified, then code comments are stripped. If "shrinksafe" is specified, then Dojo Shrinksafe will be used on the files, and line returns will be removed. If "shrinksafe.keepLines" is specified, then Dojo Shrinksafe will be used on the files, and line returns will be preserved.  See also "stripConsole". Google Closure\'s compiler can be used by specifying "closure" as the value. It does not use the stripConsole build option, and it REQUIRES Java 6 to run, and it may make some complaints about the code and print out \'error\'s, but if the build completes, then the code should work. Do not taunt happy Closure compiler. To use Closure compiler, download it from here:\nhttp://code.google.com/p/closure-compiler/downloads/list\nAnd place the compiler.jar file somewhere you can easily reference. Then use the following to execute the build (remember Java 6):\njava -classpath ../shrinksafe/js.jar:../closurecompiler/compiler.jar org.mozilla.javascript.tools.shell.Main build.js\nand place your build arguments on the same line after that text. Change the ../closurecompiler path to the path where you keep Closure\'s compiler.jar.'},layerOptimize:{defaultValue:"shrinksafe",helpText:'Specifies how to optimize the layer files. If "comments" is specified, then code comments are stripped. If "shrinksafe" is specified, then Dojo Shrinksafe will be used on the files, and line returns will be removed. If "shrinksafe.keepLines" is specified, then Dojo Shrinksafe will be used on the layer files, and line returns will be preserved. Google Closure\'s compiler can be used by specifying "closure" as the value. It does not use the stripConsole build option, and it REQUIRES Java 6 to run, and it may make some complaints about the code and print out \'error\'s, but if the build completes, then the code should work. Do not taunt happy Closure compiler. To use Closure compiler, download it from here:\nhttp://code.google.com/p/closure-compiler/downloads/list\nAnd place the compiler.jar file somewhere you can easily reference. Then use the following to execute the build (remember Java 6):\njava -classpath ../shrinksafe/js.jar:../closurecompiler/compiler.jar org.mozilla.javascript.tools.shell.Main build.js\nand place your build arguments on the same line after that text. Change the ../closurecompiler path to the path where you keep Closure\'s compiler.jar.'},cssOptimize:{defaultValue:"",helpText:'Specifies how to optimize CSS files. If "comments" is specified, then code comments and line returns are stripped, and files referenced via @import are inlined. If "comments.keepLines" is specified, then code comments are stripped and @import calls are inlined, but line returns are preserved.'},cssImportIgnore:{defaultValue:"",helpText:'If using cssOptimize="comments", then you can force the @import inlining step to ignore a set of files by using this option. The value of this option should be a comma separated list of CSS files names to ignore. The file names should match whatever strings are used for the @import calls.'},stripConsole:{defaultValue:undefined,helpText:'Strips console method calls from JS source. Applied to layers and individual modules resource files. Valid values are "none" (leaves all console calls alone, same as default ""), "normal" (strips all but console.warn and console.error calls), "warn" (strips all but console.error calls), "all" (strips all console calls).  NOTE: only has effect if optimize includes use of shrinksafe.'},copyTests:{defaultValue:!1,helpText:"Turn on or off copying of test files."},mini:{defaultValue:!0,helpText:"Removes files like tests, demos dijit/bench, unfinished themes, and interned Dijit templates from the build. Overrides the value set for copyTests."},log:{defaultValue:logger.TRACE,helpText:"Sets the logging verbosity. See jslib/logger.js for possible integer values."},xdDojoPath:{defaultValue:"",helpText:"If the loader=xdomain build option is used, then the value of this option will be used to call dojo.registerModulePath() for dojo, dijit and dojox. The xdDojoPath should be the directory that contains the dojo, dijit and dojox directories, and it should NOT end in a slash. For instance: 'http://some.domain.com/path/to/dojo090'."},symbol:{defaultValue:"",helpText:'Inserts function symbols as global references so that anonymous functions will show up in all debuggers (esp. IE which does not attempt to infer function names from the context of their definition). Valid values are "long" and "short". If "short" is used, then a symboltables.txt file will be generated in each module prefix\'s release directory which maps the short symbol names to more descriptive names.'},scopeDjConfig:{defaultValue:"",helpText:'Burn in a djConfig object into the built dojo.js file. Useful if you are making your own scoped dojo and you want a djConfig object local to your version that will not be affected by any globally declared djConfig object in the page. Value must be a string that will look like a javascript object literal once it is placed in the built source. use Dojo as part of a JS library, but want to make a self-contained library with no external dojo/dijit/dojox. Example (note that the backslashes below are required to avoid shell escaping if you type this on the command line):\nscopeDjConfig={isDebug:true,scopeMap:[[\\"dojo\\",\\"mydojo\\"],[\\"dijit\\",\\"mydijit\\"],[\\"dojox\\",\\"mydojox\\"]]}'},scopeMap:{defaultValue:"",helpText:'Change the default dojo, dijit and dojox scope names to something else. Useful if you want to use Dojo as part of a JS library, but want to make a self-contained library with no external dojo/dijit/dojox references. Format is a string that contains no spaces, and is similar to the djConfig.scopeMap value (note that the backslashes below are required to avoid shell escaping):\nscopeMap=[[\\"dojo\\",\\"mydojo\\"],[\\"dijit\\",\\"mydijit\\"],[\\"dojox\\",\\"mydojox\\"]]'},xdScopeArgs:{defaultValue:"",helpText:"If the loader=xdomain build option is used, then the value of this option will be used as the arguments to the function that defines the modules in the .xd.js files. This allows for more than one version of the same module to be in a page. See documentation on djConfig.scopeMap for more information."},xdDojoScopeName:{defaultValue:"dojo",helpText:"If the loader=xdomain build option is used, then the value of this option will be used instead of 'dojo' for the 'dojo._xdResourceLoaded()' calls that are done in the .xd.js files. This allows for dojo to be under a different scope name but still allow xdomain loading with that scope name."},expandProvide:{defaultValue:!1,helpText:'Expands dojo.provide calls with faster calls at the expense of a larger file size. Only use the option if your profiling reveals that dojo.provide calls are taking a noticeable amount of time. Even then, it could cause errors in the built files. If you find an error after building, turn this option off. It replaces dojo.provide("foo.bar") statements with the shortest valid programmatic equivalent:\nif(typeof foo=="undefined"){foo={};};foo.bar=foo.bar||{};\nIgnored for xdomain builds.'},buildLayers:{defaultValue:"",helpText:"A comma-separated list of layer names to build. Using this option means that only those layers will be built. This helps if you are doing quick development and test cycles with layers. If you have problems using this option, try removing it and doing a full build with action=clean,release. This build option assumes you have done at least one full build first."},query:{defaultValue:"default",helpText:"Select a DOM query engine. Default value is the normal dojo.query engine. Using query=sizzle will use the Sizzle engine.Normal Dojo tests are not run routinely with the Sizzle engine. See dojo/_base/sizzle.js for the version of Sizzle."},removeDefaultNameSpaces:{defaultValue:!1,helpText:"Removes the default 'com', 'org' and 'net' namespaces that are present in Rhino. This is hazardous to use if the build system is used as part of a Rhino-based server-side solution, so use with caution. Weird build errors might occur. Only use if your own code includes things in a com, org or net namespace."},addGuards:{defaultValue:!0,helpText:"Set to false to remove the code guards that protect modules from re-definition. In general you SHOULD NOT set this value to false. Only do it if you want an even smaller Dojo Base build and you know the implications of re-defining modules. It is bad. Do not do it."}},buildUtil.makeBuildOptions=function(a){function e(a){function d(a){g[a]?g[a]=g[a].filter(function(a){return b.indexOf(a)>-1}):g[a]=b.concat(),a.indexOf(".")>-1&&(i[a.substring(a,a.indexOf("."))]=!0),b.push(a)}var b=[],c=fileUtil.readFile(a);c.replace(/<script [^>]*src=["']([^'"]+)["']/gi,function(a,b){b.indexOf("dojo/dojo.js")>-1?h=b.substring(0,b.indexOf("dojo/dojo.js")):d(b=b.substring(h.length,b.length-3).replace(/\//g,"."))}),c.replace(/dojo\.require\(["']([^'"]+)["']\)/g,function(a,b){d(b)});return g}var b={},c,d;b=buildUtil.convertArrayToObject(a),!b.profileFile&&b.profile&&(b.profileFile="profiles/"+b.profile+".profile.js");var f={};b.htmlDir&&(b.htmlFiles=fileUtil.getFilteredFileList(b.htmlDir,/\.html/,!1,!1,!0));if(b.htmlFiles){var g={},h="",i={dijit:!0,dojox:!0};print("kwArgs.htmlFiles "+b.htmlFiles),(b.htmlFiles instanceof Array?b.htmlFiles:b.htmlFiles.split(",")).forEach(function(a){e(a)});var j=[];for(h in i)j.push([h,"../"+h]);var k=[];for(var l in g)k.push({name:"../"+l.replace(/\./g,"/")+".js",dependencies:[l.replace(/\//g,".")],layerDependencies:g[l].map(function(a){return"../"+a.replace(/\./g,"/")+".js"})});d={layers:k,prefixes:j},b.profileFile&&fileUtil.saveFile(b.profileFile,"dependencies = "+d.toSource()),d=b.profileProperties=buildUtil.processProfile(d),f=d.dependencies}else if(b.profileFile){d=buildUtil.evalProfile(b.profileFile);if(d){b.profileProperties=d,f=b.profileProperties.dependencies;for(c in f)!(c in b)&&c!="layers"&&c!="prefixes"&&(b[c]=f[c])}}for(c in buildUtil.DojoBuildOptions)typeof b[c]=="undefined"?b[c]=buildUtil.DojoBuildOptions[c].defaultValue:b[c]==="false"&&(b[c]=!1);b.releaseDir=b.releaseDir.replace(/\\/g,"/"),b.releaseName?(b.releaseDir.match(/\/$/)||(b.releaseDir+="/"),b.releaseDir+=b.releaseName):b.releaseDir=b.releaseDir.replace(/\/$/,""),b.action=b.action.split(","),b.localeList=b.localeList.split(","),f.loader=b.loader,b.expandProvide&&b.loader=="xdomain"&&(logger.info("NOTE: expandProvide not compatible with xdomain builds. Ignoring expandProvide option."),b.expandProvide=!1),b.optimize&&b.optimize!="shrinksafe"&&b.stripConsole&&logger.info("NOTE: stripConsole is only supported for an optimize=shrinksafe value."),b.layerOptimize&&b.layerOptimize!="shrinksafe"&&b.stripConsole&&(logger.info("layerOPtimize: ["+b.layerOptimize+"]"),logger.info("NOTE: stripConsole is only supported for an layerOptimize=shrinksafe value."));if(typeof b.scopeDjConfig!="string")throw"Due to deficiencies in the build system, scopeDjConfig needs to be a string.";if(b.optimize.indexOf("closure")==0||b.layerOptimize.indexOf("closure")==0){var m=java.lang.Class.forName("com.google.javascript.jscomp.JSSourceFile").getMethod("fromCode",[java.lang.String,java.lang.String]);buildUtil.closurefromCode=function(a,b){return m.invoke(null,[a,b])}}return b},buildUtil.masterRequireLocalizationRegExpString="dojo.(requireLocalization)\\(([\\w\\W]*?)\\)",buildUtil.globalRequireLocalizationRegExp=new RegExp(buildUtil.masterRequireLocalizationRegExpString,"mg"),buildUtil.requireLocalizationRegExp=new RegExp(buildUtil.masterRequireLocalizationRegExpString),buildUtil.getDojoLoader=function(a){return a&&a.loader?a.loader:java.lang.System.getProperty("DOJO_LOADER")},buildUtil.includeLoaderFiles=function(a,b,c){dojo._loadedUrls.push(c+"jslib/dojoGuardStart.jsfrag"),dojo._loadedUrls.push(c+"../../dojo/_base/_loader/bootstrap.js"),a=="default"?dojo._loadedUrls.push(c+"../../dojo/_base/_loader/loader.js"):a=="xdomain"&&(dojo._loadedUrls.push(c+"../../dojo/_base/_loader/loader.js"),dojo._loadedUrls.push(c+"../../dojo/_base/_loader/loader_xd.js"));if(b.constructor==Array){for(var d=0;d<b.length;d++)dojo._loadedUrls.push(c+"../../dojo/_base/_loader/hostenv_"+b[d]+".js");b=b.pop()}else dojo._loadedUrls.push(c+"../../dojo/_base/_loader/hostenv_"+b+".js")},buildUtil.getDependencyList=function(dependencies,hostenvType,kwArgs,buildscriptsPath){dependencies||(dependencies={}),buildscriptsPath=buildscriptsPath||"./";var dojoLoader=buildUtil.getDojoLoader(dependencies);if(!dojoLoader||dojoLoader=="null"||dojoLoader=="")dojoLoader="default";dependencies.layers||(dependencies.layers=[]),dependencies.layers[0]&&dependencies.layers[0].name=="dojo.js"?dependencies.layers[0].customBase||dependencies.layers[0].dependencies.unshift("dojo._base"):dependencies.layers.unshift({name:"dojo.js",dependencies:["dojo._base"]}),currentProvideList=[];var result=[],layers=dependencies.layers,layerCount=layers.length;if(layerCount){var namedLayerUris={},endCount=layerCount;dojoLoader=="xdomain"&&(endCount=endCount*2);for(var i=0;i<endCount;i++){var j=i,isXd=!1;i>=layerCount&&(i==layerCount&&(namedLayerUris={}),j=i-layerCount,isXd=!0);var layer=layers[j],layerName=layers[j].name;isXd&&(layerName=layerName.replace(/\.js$/,".xd.js")),isXd&&layerName=="dojo.xd.js"&&layer.dependencies.splice(1,0,"dojo.i18n"),djConfig={baseRelativePath:"../../dojo/"},load(buildscriptsPath+"../../dojo/_base/_loader/bootstrap.js"),load(buildscriptsPath+"../../dojo/_base/_loader/loader.js"),load(buildscriptsPath+"../../dojo/_base/_loader/hostenv_rhino.js"),dojo.global={},hostenvType||(hostenvType="browser");if(dependencies.prefixes){var tmp=dependencies.prefixes;for(var x=0;x<tmp.length;x++)dojo.registerModulePath(tmp[x][0],tmp[x][1])}dojo._name=hostenvType;if(hostenvType=="browser"||hostenvType=="ff_ext")dojo.isBrowser=!0;var currentProvideList=[];dojo._provide=dojo.provide,dojo.provide=function(a){currentProvideList.push(a),dojo._provide(a)},dojo._oldEval=dojo.eval,dojo.eval=function(){return!0};var old_load=load;load=function(uri){try{var text=fileUtil.readFile(uri);text=kwArgs?buildUtil.processConditionals(layerName,text,kwArgs):text,text=buildUtil.removeComments(text);var requires=dojo._getRequiresAndProvides(text);eval(requires.join(";")),dojo._loadedUrls.push(uri),dojo._loadedUrls[uri]=!0;var delayRequires=dojo._getDelayRequiresAndProvides(text);for(var i=0;i<delayRequires.length;i++)try{eval(delayRequires[i])}catch(e){}}catch(e){java.lang.System.err.println("error loading uri: "+uri+", exception: "+e),quit(-1)}return!0},dojo._getRequiresAndProvides=function(a){if(!a)return[];var b=[],c;RegExp.lastIndex=0;var d=/dojo.(require|platformRequire|provide)\s*\([\w\W]*?\)/mg;while((c=d.exec(a))!=null)b.push(c[0]);a.match(/dojo\.requireLocalization\(.*?\)/)&&b.push('dojo.require("dojo.i18n")');return b},dojo._getDelayRequiresAndProvides=function(a){if(!a)return[];var b=[],c;RegExp.lastIndex=0;var d=/dojo.(requireAfterIf|requireIf)\([\w\W]*?\)/mg;while((c=d.exec(a))!=null)b.push(c[0]);return b},dependencies.dojoLoaded&&dependencies.dojoLoaded(),layerName=="dojo.js"?buildUtil.includeLoaderFiles("default",hostenvType,buildscriptsPath):layerName=="dojo.xd.js"&&buildUtil.includeLoaderFiles("xdomain",hostenvType,buildscriptsPath);var layerUris=[];layer.name!="dojo.js"&&(layerUris=layerUris.concat(namedLayerUris["dojo.js"]));if(layer.layerDependencies)for(j=0;j<layer.layerDependencies.length;j++)namedLayerUris[layer.layerDependencies[j]]&&(layerUris=layerUris.concat(namedLayerUris[layer.layerDependencies[j]]));var depList=buildUtil.determineUriList(layer.dependencies,layerUris,dependencies.filters);if(layerName=="dojo.xd.js"){var i18nXdEntry=null;for(var i18nIndex=depList.length-1;i18nIndex>=0;i18nIndex--)if(depList[i18nIndex].match(/\/dojo\/i18n\.js$/)){i18nXdEntry=depList.splice(i18nIndex,1)[0];break}if(i18nXdEntry){var foundBrowserJs=!1;for(i18nIndex=depList.length-1;i18nIndex>=0;i18nIndex--)if(depList[i18nIndex].match(/dojo\/_base\/browser\.js$/)){depList.splice(i18nIndex,0,i18nXdEntry),foundBrowserJs=!0;break}foundBrowserJs||depList.push(i18nXdEntry)}}(layerName=="dojo.js"||layerName=="dojo.xd.js")&&depList.push(buildscriptsPath+"jslib/dojoGuardEnd.jsfrag"),namedLayerUris[layer.name]=layerUris.concat(depList),layer.discard||result.push({layerName:layerName,resourceName:layer.resourceName,copyrightFile:layer.copyrightFile,depList:depList,provideList:currentProvideList}),currentProvideList=[],load=old_load,dojo.eval=dojo._oldEval;var djGlobal=dojo.global;djGlobal.djConfig=undefined,delete dojo,delete define}}return result},buildUtil.removeComments=function(a){a=a?new String(a):"";return a.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,"")},buildUtil.determineUriList=function(a,b,c){for(var d=0;d<a.length;d++)try{var e=a[d];e.indexOf("loader_xd.js")==-1&&dojo._loadModule(e,!0)}catch(f){java.lang.System.err.println("Error loading module!"+f),quit(-1)}var g=[],h={};uris:for(d=0;d<dojo._loadedUrls.length;d++){var i=dojo._loadedUrls[d];if(!h[i]){h[i]=!0;if(c)for(var j in c)if(i.match(c[j]))continue uris;if(b)for(j=0;j<b.length;j++)if(i==b[j])continue uris;g.push(i)}}dojo._loadedUrls=[];return g},buildUtil.evalProfile=function(profileFile,fileIsProfileText){var dependencies={},profileText=fileIsProfileText?profileFile:fileUtil.readFile(profileFile);profileText=profileText.replace(/load\(("|')getDependencyList.js("|')\)/,""),eval(profileText);return buildUtil.processProfile(dependencies)},buildUtil.processProfile=function(a){var b=null;a.prefixes||(a.prefixes=[]);var c=["dojo"];c._entries={dojo:!0},buildUtil.addPrefixesFromDependencies(c,a);var d=a.layers;if(d)for(var e=0;e<d.length;e++)buildUtil.addPrefixesFromDependencies(c,d[e].dependencies);for(e=0;e<c.length;e++){var f=!1;for(var g=0;g<a.prefixes.length;g++)if(a.prefixes[g][0]==c[e]){f=!0;break}if(!f){var h="../";c[e]=="dojo"&&(h="../../"),a.prefixes.push([c[e],h+c[e]])}}return{dependencies:a,hostenvType:b}},buildUtil.getDojoPrefixPath=function(a){var b=null;for(var c=0;c<a.length;c++)if(a[c][0]=="dojo"){b=a[c][1];break}return b},buildUtil.addPrefixesFromDependencies=function(a,b){for(var c=0;c<b.length;c++){var d=b[c].split(".")[0];a._entries[d]||(a.push(d),a._entries[d]=!0)}},buildUtil.loadDependencyList=function(a,b,c){var d=buildUtil.getDependencyList(a.dependencies,a.hostenvType,b,c);d.dependencies=a.dependencies;return d},buildUtil.createLayerContents=function(a,b,c,d,e,f){var g=b?'dojo.provide("'+b+'");\r\n':"";for(var h=0;h<c.length;h++){var i=fileUtil.readFile(c[h]);g+=(f?buildUtil.processConditionals(a,i,f):i)+"\r\n"}var j=null,k=f.profileProperties.dependencies.layers;for(h=0;h<k.length;h++)if(a==k[h].name){var l=k[h].keepRequires;if(l){j={};for(var m=0;m<l.length;m++)j[l[m]]=!0}break}d=d.sort();var n="";for(h=0;h<d.length;h++){if(j&&j[d[h]])continue;n&&(n+="|"),n+="(['\"]"+d[h]+"['\"])"}if(n){n=buildUtil.regExpEscape(n);var o=new RegExp("dojo\\.(require|requireIf)\\(.*?("+n+")\\)(;?)","g");g=g.replace(o,"")}if(f.expandProvide){var p={},q=/dojo.provide\(([\w\W]*?)\)/mg;g=g.replace(q,function(a,b){if(b){var c="";b=b.slice(1,-1);var d=b.split(".");d.forEach(function(a,b,d){var e=d.slice(0,b+1).join("."),f=d[0];for(var g=1;g<b+1;g++)d[g].indexOf("-")<0?f+="."+d[g]:f+='["'+d[g]+'"]';p[e]||(p[e]=!0,b==0?c+="if(typeof "+f+'=="undefined"){'+f+"={};};":c+=f+"="+f+"||{};"),b==d.length-1&&(c+='dojo._loadedModules["'+e+'"] = '+f+";")});return c}return a})}g=buildUtil.changeVersion(e,g);return g},buildUtil.changeVersion=function(a,b){var c=a.match(/^(\d*)\.?(\d*)\.?(\d*)\.?(.*)$/),d=c[1]||0,e=c[2]||0,f=c[3]||0,g=c[4]||"";b=b.replace(/major:\s*\d*,\s*minor:\s*\d*,\s*patch:\s*\d*,\s*flag:\s*".*?"\s*,/g,"major: "+d+", minor: "+e+", patch: "+f+', flag: "'+g+'",');return b},buildUtil.makeDojoJs=function(a,b,c){var d=fileUtil.getLineSeparator();for(var e=0;e<a.length;e++){var f=a[e];f.contents=buildUtil.createLayerContents(f.layerName,f.resourceName,f.depList,f.provideList,b,c)}return a},buildUtil.getDependencyPropertyFromProfile=function(profileFile,propName){var profileText=fileUtil.readFile(profileFile);profileText=profileText.replace(/\r/g,""),profileText=profileText.replace(/\n/g,"");var result=[],matchRegExp=new RegExp("(dependencies\\."+propName+"\\s*=\\s*\\[[^;]*\\s*\\])","m"),matches=profileText.match(matchRegExp),dependencies={};matches&&matches.length>0&&(eval(matches[0]),dependencies&&dependencies[propName]&&dependencies[propName].length>0&&(result=dependencies[propName]));return result},buildUtil.configPrefixes=function(a){if(a&&a.length>0)for(i=0;i<a.length;i++)dojo.registerModulePath(a[i][0],a[i][1])},buildUtil.masterDependencyRegExpString="dojo.(requireLocalization|require|requireIf|provide|requireAfterIf|platformRequire|i18n._preloadLocalizations)\\s*\\(([\\w\\W]*?)\\)",buildUtil.globalDependencyRegExp=new RegExp(buildUtil.masterDependencyRegExpString,"mg"),buildUtil.dependencyPartsRegExp=new RegExp(buildUtil.masterDependencyRegExpString),buildUtil.mapPathToResourceName=function(a,b){var c="",d="",e=0,f=0;for(var g=0;g<b.length;g++)f=a.lastIndexOf("/"+b[g][0].replace(/\./g,"/")+"/"),f!=-1&&f>e&&(c=b[g][0],d=b[g][1],e=f);e+=2;if(!c)throw"Could not find a matching prefix for pathName: "+a;var h=e+c.length,i=a.substring(h,a.length);i=i.replace(/^\//,"").replace(/\..*?$/,"");return c+"."+i.replace(/\//g,".")},buildUtil.mapResourceToPath=function(a,b){var c="",d="";if(b)for(var e=0;e<b.length;e++)a.indexOf(b[e][0])==0&&(b[e][0].length>c.length&&(c=b[e][0],d=b[e][1]));a=a.replace(c,""),a.charAt(0)=="."&&(a=a.substring(1,a.length)),a=a.replace(/\./g,"/");var f=d;f.charAt(f.length-1)!="/"&&(f+="/"),a&&(f+=a+"/");return f},buildUtil.makeResourceUri=function(a,b,c,d){var e="",f="";if(d){for(var g=0;g<d.length;g++){var h=d[g];a.indexOf(h[0])==0&&(h[0].length>e.length&&(e=h[0],f=h[1]))}if(f!=""){a=a.replace(e,""),a.indexOf(".")==0&&(a=a.substring(1,a.length)),a=a.replace(/\./g,"/");var i=f+"/";a&&(i+=a+"/"),i+=b;return i}}return c+b},buildUtil.internTemplateStrings=function(a,b,c){var d=a.prefixes||[],e=a.internSkipList||[],f=fileUtil.getFilteredFileList(b,/\.js$/,!0);if(f)for(var g=0;g<f.length;g++){var h=f[g];!h.match(/\/nls\//)&&!h.match(c)&&buildUtil.internTemplateStringsInFile(f[g],b,d,e)}},buildUtil.internTemplateStringsInFile=function(a,b,c,d){var e=fileUtil.readFile(a);e=buildUtil.interningRegexpMagic(a,e,b,c,d),fileUtil.saveUtf8File(a,e)},buildUtil.interningDojoUriRegExpString="(((templatePath|templateCssPath)\\s*(=|:)\\s*)dojo\\.(module)?Url\\(|dojo\\.cache\\s*\\(\\s*)\\s*?[\\\"\\']([\\w\\.\\/]+)[\\\"\\'](([\\,\\s]*)[\\\"\\']([\\w\\.\\/-]*)[\\\"\\'])?(\\s*,\\s*)?([^\\)]*)?\\s*\\)",buildUtil.interningGlobalDojoUriRegExp=new RegExp(buildUtil.interningDojoUriRegExpString,"g"),buildUtil.interningLocalDojoUriRegExp=new RegExp(buildUtil.interningDojoUriRegExpString),buildUtil.interningRegexpMagic=function(a,b,c,d,e){var f=!1;return b.replace(buildUtil.interningGlobalDojoUriRegExp,function(b){var g=b.match(buildUtil.interningLocalDojoUriRegExp),h="",i="";f||(logger.trace("Interning strings for : "+a),f=!0),h=buildUtil.makeResourceUri(g[6],g[9],c,d),i=g[6]+":"+g[9];if(!h||buildUtil.isValueInArray(i,e))logger.trace("    skipping "+h);else{logger.trace("    "+h);var j=buildUtil.jsEscape(fileUtil.readFile(h));if(j)if(b.indexOf("dojo.cache")!=-1){var k=g[11];if(k){var l=k.indexOf("{");l!=-1&&(k=k.substring(0,l+1)+"value: "+j+","+k.substring(l+1,k.length))}else k=j;b='dojo.cache("'+g[6]+'", "'+g[9]+'", '+k+")"}else if(g[3]=="templatePath")b="templateString"+g[4]+j;else{var m=g[4],n=",",o="";m=="="&&(n=";",o="this."),b="templateCssString"+m+j+n+o+g[0]}}return b})},buildUtil.regExpEscape=function(a){return a.replace(/([\.\*\/])/g,"\\$1")},buildUtil.jsEscape=function(a){return('"'+a.replace(/(["\\])/g,"\\$1")+'"').replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")},buildUtil.isValueInArray=function(a,b){for(var c=0;c<b.length;c++)if(b[c]==a)return!0;return!1},buildUtil.convertArrayToObject=function(a){var b={};for(var c=0;c<a.length;c++){var d=a[c].indexOf("=");if(d==-1)throw"Malformed name/value pair: ["+a[c]+"]. Format should be name=value";b[a[c].substring(0,d)]=a[c].substring(d+1,a[c].length)}return b},buildUtil.optimizeJs=function(a,b,c,d,e){c=c||"",e=="none"?e=undefined:e=="normal,warn"?(logger.warn('stripConsole value "normal,warn" replaced with "warn".  Please update your build scripts.'),e="warn"):e=="normal,error"&&(logger.warn('stripConsole value "normal,error" replaced with "all".  Please update your build scripts.'),e="all");if(e!=undefined&&!e.match(/normal|warn|all/))throw"Invalid stripConsole provided ("+e+")";e==undefined&&(e=null);var f=Packages.org.mozilla.javascript.Context.enter();try{f.setOptimizationLevel(-1);if(d.indexOf("shrinksafe")==0||d=="packer")b=new String(Packages.org.dojotoolkit.shrinksafe.Compressor.compressScript(b,0,1,e)),d.indexOf(".keepLines")==-1&&(b=b.replace(/[\r\n]/g,""));else if(d.indexOf("closure")==0){var g=com.google.javascript.jscomp,h=com.google.common.flags,i=buildUtil.closurefromCode("fakeextern.js"," "),j=buildUtil.closurefromCode(String(a),String(b)),k=new g.CompilerOptions;k.prettyPrint=d.indexOf(".keepLines")!==-1;var l=g.CompilationLevel.SIMPLE_OPTIMIZATIONS;l.setOptionsForCompilationLevel(k);var m=g.WarningLevel.DEFAULT;m.setOptionsForWarningLevel(k);var n=new Packages.com.google.javascript.jscomp.Compiler(Packages.java.lang.System.err);result=n.compile(i,j,k),b=n.toSource()}else if(d=="comments"){var o=f.compileString(b,a,1,null);b=new String(f.decompileScript(o,0)),b=b.replace(/    /g,"\t"),a.match(/\/nls\//)&&(b=b.replace(/;\s*$/,""))}}finally{Packages.org.mozilla.javascript.Context.exit()}return c+b},buildUtil.setupPacker=function(){},buildUtil.optimizeJsDir=function(a,b,c,d,e){var f=(c||fileUtil.readFile("copyright.txt"))+fileUtil.getLineSeparator(),g=fileUtil.getFilteredFileList(a,/\.js$/,!0),h=d;e&&(h+=(d?", ":"")+"stripConsole="+e);if(g)for(var i=0;i<g.length;i++)if(!g[i].match(b)&&!g[i].match(/buildscripts/)&&!g[i].match(/nls/)&&!g[i].match(/tests\//)){h&&logger.trace("Optimizing ("+h+") file: "+g[i]);var j=fileUtil.readFile(g[i]);if(d)try{j=buildUtil.optimizeJs(g[i],j,f,d,e)}catch(k){logger.error("Could not strip comments for file: "+g[i]+", error: "+k)}else j=f+j;fileUtil.saveUtf8File(g[i],j)}},buildUtil.optimizeCss=function(a,b,c){if(b.indexOf("comments")!=-1){c&&(c=c+",");var d=fileUtil.getFilteredFileList(a,/\.css$/,!0);if(d)for(var e=0;e<d.length;e++){var f=d[e];logger.trace("Optimizing ("+b+") CSS file: "+f);var g=fileUtil.readFile(f),h=buildUtil.flattenCss(f,g,c);try{var i=-1;while((i=h.indexOf("/*"))!=-1){var j=h.indexOf("*/",i+2);if(j==-1)throw"Improper comment in CSS file: "+f;h=h.substring(0,i)+h.substring(j+2,h.length)}b.indexOf(".keepLines")==-1?(h=h.replace(/[\r\n]/g,""),h=h.replace(/\s+/g," "),h=h.replace(/\{\s/g,"{"),h=h.replace(/\s\}/g,"}")):(h=h.replace(/(\r\n)+/g,"\r\n"),h=h.replace(/(\n)+/g,"\n"))}catch(k){h=g,logger.error("Could not optimized CSS file: "+f+", error: "+k)}fileUtil.saveUtf8File(f,h)}}},buildUtil.backSlashRegExp=/\\/g,buildUtil.cssImportRegExp=/\@import\s+(url\()?\s*([^);]+)\s*(\))?([\w, ]*)(;)?/g,buildUtil.cssUrlRegExp=/\url\(\s*([^\)]+)\s*\)?/g,buildUtil.cleanCssUrlQuotes=function(a){a=a.replace(/\s+$/,"");if(a.charAt(0)=="'"||a.charAt(0)=='"')a=a.substring(1,a.length-1);return a},buildUtil.flattenCss=function(a,b,c){a=a.replace(buildUtil.backSlashRegExp,"/");var d=a.lastIndexOf("/"),e=d!=-1?a.substring(0,d+1):"";return b.replace(buildUtil.cssImportRegExp,function(b,d,f,g,h){if(h&&h.replace(/^\s\s*/,"").replace(/\s\s*$/,"")!="all")return b;f=buildUtil.cleanCssUrlQuotes(f);if(c&&c.indexOf(f+",")!=-1)return b;f=f.replace(buildUtil.backSlashRegExp,"/");try{var i=f.charAt(0)=="/"?f:e+f,j=fileUtil.readFile(i);j=buildUtil.flattenCss(i,j);var k=f.lastIndexOf("/"),l=k!=-1?f.substring(0,k+1):"";j=j.replace(buildUtil.cssUrlRegExp,function(a,b){var c=buildUtil.cleanCssUrlQuotes(b);c=c.replace(buildUtil.backSlashRegExp,"/");var d=c.indexOf(":");c.charAt(0)=="/"||d!=-1&&d<=c.indexOf("/")?logger.trace(f+"\n  URL not a relative URL, skipping: "+b):b=l+c;var e=b.split("/");for(var g=e.length-1;g>0;g--)e[g]=="."?e.splice(g,1):e[g]==".."&&(g!=0&&e[g-1]!=".."&&(e.splice(g-1,2),g-=1));return"url("+e.join("/")+")"});return j}catch(m){logger.trace(a+"\n  Cannot inline css import, skipping: "+f);return b}})},buildUtil.guardProvideRegExpString="dojo\\s*\\.\\s*provide\\s*\\(\\s*([\\'\\\"][^\\'\\\"]*[\\'\\\"])\\s*\\)",buildUtil.guardProvideRegExp=new RegExp(buildUtil.guardProvideRegExpString),buildUtil.guardProvideRegExpGlobal=new RegExp(buildUtil.guardProvideRegExpString,"g"),buildUtil.addGuardsAndBaseRequires=function(a,b){var c=fileUtil.getLineSeparator(),d=a;if(d instanceof String)d=fileUtil.getFilteredFileList(d,/\.js$/,!0);else for(var e=d.length-1;e>=0;e--)d[e].match(/\.js$/)||d.splice(e,1);if(d)for(e=0;e<d.length;e++){var f=fileUtil.readFile(d[e]);if(b&&d[e].indexOf("/tests/")==-1&&d[e].indexOf("/demos/")==-1&&d[e].indexOf("/themes/")==-1&&d[e].indexOf("dojo/_base.js")==-1){buildUtil.baseMappingRegExp.lastIndex=0;var g=null,h=buildUtil.removeComments(f);buildUtil.guardProvideRegExpGlobal.lastIndex=0;var i=-1;while(g=buildUtil.guardProvideRegExpGlobal.exec(f))i=buildUtil.guardProvideRegExpGlobal.lastIndex;if(i!=-1){var j=[f.substring(0,i+1)+"\n",f.substring(i+1,f.length)],k={};while(g=buildUtil.baseMappingRegExp.exec(h)){var l=buildUtil.baseMappings[g[1]];!k[l]&&d[e].indexOf("_base/"+l)==-1&&(logger.trace("Adding dojo._base."+l+" because of match: "+g[1]+" to file: "+d[e]),j[0]+='dojo.require("dojo._base.'+l+'");\n',k[l]=!0)}f=j.join("")}}buildUtil.guardProvideRegExp.lastIndex=0;var m=buildUtil.guardProvideRegExp.exec(f);if(m){var n=new RegExp("if\\(\\!dojo\\._hasResource\\["+m[1]+"\\]\\)");f.match(n)||(f="if(!dojo._hasResource["+m[1]+"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code."+c+"dojo._hasResource["+m[1]+"] = true;"+c+f+c+"}"+c,fileUtil.saveUtf8File(d[e],f))}}},buildUtil.baseMappings={trim:"lang",clone:"lang",_toArray:"lang",partial:"lang",delegate:"lang",_delegate:"lang",hitch:"lang",_hitchArgs:"lang",extend:"lang",isAlien:"lang",isArrayLike:"lang",isObject:"lang",isFunction:"lang",isArray:"lang",isString:"lang",declare:"declare",subscribe:"connect",unsubscribe:"connect",publish:"connect",connectPublisher:"connect",Deferred:"Deferred",fromJson:"json",_escapeString:"json",toJson:"json",indexOf:"array",lastIndexOf:"array",forEach:"array",every:"array",some:"array",map:"array",filter:"array",Color:"Color",blendColors:"Color",colorFromRgb:"Color",colorFromHex:"Color",colorFromArray:"Color",colorFromString:"Color",doc:"window",body:"window",setContext:"window",_fireCallback:"window",withGlobal:"window",withDoc:"window",connect:"event",disconnect:"event",fixEvent:"event",stopEvent:"event",_connect:"event",_disconnect:"event",_ieDispatcher:"event",_getIeDispatcher:"event",byId:"html",destroy:"html",_destroyElement:"html",isDescendant:"html",setSelectable:"html",place:"html",getComputedStyle:"html",_toPixelValue:"html",_getOpacity:"html",_setOpacity:"html",style:"html",_getPadExtents:"html",_getBorderExtents:"html",_getPadBorderExtents:"html",_getMarginExtents:"html",_getMarginBox:"html",_getContentBox:"html",_getBorderBox:"html",_setBox:"html",_usesBorderBox:"html",_setContentSize:"html",_setMarginBox:"html",marginBox:"html",contentBox:"html",_docScroll:"html",_isBodyLtr:"html",_getIeDocumentElementOffset:"html",_fixIeBiDiScrollLeft:"html",_abs:"html",coords:"html",hasAttr:"html",attr:"html",removeAttr:"html",create:"html",empty:"html",_toDom:"html",hasClass:"html",addClass:"html",removeClass:"html",toggleClass:"html",NodeList:"NodeList",_filterQueryResult:"query",query:"query",formToObject:"xhr",objectToQuery:"xhr",formToQuery:"xhr",formToJson:"xhr",queryToObject:"xhr",_ioSetArgs:"xhr",_ioCancelAll:"xhr",_ioAddQueryToUrl:"xhr",xhr:"xhr",xhrGet:"xhr",rawXhrPost:"xhr",rawXhrPut:"xhr",xhrDelete:"xhr",wrapForm:"xhr",_Line:"fx",_Animation:"fx",Animation:"fx",_fade:"fx",fadeIn:"fx",fadeOut:"fx",_defaultEasing:"fx",animateProperty:"fx",anim:"fx"},function(){var a="(";for(var b in buildUtil.baseMappings)a!="("&&(a+="|"),a+=b;a+=")",buildUtil.baseMappingRegExp=new RegExp("\\."+a+"\\W","g")}(),buildUtil.processConditionalsForDir=function(a,b,c){var d=fileUtil.getFilteredFileList(a,/\.js$/,!0);if(d)for(var e=0;e<d.length;e++){var f=d[e];if(!f.match(b)){var g=fileUtil.readFile(f);g.indexOf("//>>")!=-1&&fileUtil.saveFile(f,buildUtil.processConditionals(f,g,c))}}},buildUtil.conditionalRegExp=/(exclude|include)Start\s*\(\s*["'](\w+)["']\s*,(.*)\)/,buildUtil.processConditionals=function(fileName,fileContents,kwArgs){var foundIndex=-1,startIndex=0;while((foundIndex=fileContents.indexOf("//>>",startIndex))!=-1){var lineEndIndex=fileContents.indexOf("\n",foundIndex);lineEndIndex==-1&&(lineEndIndex=fileContents.length-1),startIndex=lineEndIndex+1;var conditionLine=fileContents.substring(foundIndex,lineEndIndex+1),matches=conditionLine.match(buildUtil.conditionalRegExp);if(matches){var type=matches[1],marker=matches[2],condition=matches[3],isTrue=!1;try{isTrue=!!eval("("+condition+")")}catch(e){throw"Error in file: "+fileName+". Conditional comment: "+conditionLine+" failed with this error: "+e}var endRegExp=new RegExp("\\/\\/\\>\\>\\s*"+type+"End\\(\\s*['\"]"+marker+"['\"]\\s*\\)","g"),endMatches=endRegExp.exec(fileContents.substring(startIndex,fileContents.length));if(!endMatches)throw"Error in file: "+fileName+". Cannot find end marker for conditional comment: "+conditionLine;var endMarkerIndex=startIndex+endRegExp.lastIndex-endMatches[0].length;lineEndIndex=fileContents.indexOf("\n",endMarkerIndex),lineEndIndex==-1&&(lineEndIndex=fileContents.length-1);var shouldInclude=type=="exclude"&&!isTrue||type=="include"&&isTrue,startLength=startIndex-foundIndex;fileContents=fileContents.substring(0,foundIndex)+(shouldInclude?fileContents.substring(startIndex,endMarkerIndex):"")+fileContents.substring(lineEndIndex+1,fileContents.length),startIndex=foundIndex}}return fileContents},buildUtil.setScopeDjConfig=function(a,b){return a.replace(/\/\*\*Build will replace this comment with a scoped djConfig \*\*\//,'eval("var djConfig = '+b.replace(/(['"])/g,"\\$1")+';");')},buildUtil.setScopeNames=function(a,b){return a.replace(/var\s+sMap\s+=\s+null/,"var sMap = "+b)},buildUtil.symctr=0,buildUtil.symtbl=null,buildUtil.generateSym=function(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",c=b.length,d;buildUtil.symctr<c*c?d=b.charAt(Math.floor(buildUtil.symctr/c))+b.charAt(buildUtil.symctr%c):d=b.charAt(Math.floor(buildUtil.symctr/(c*c))-1)+b.charAt(Math.floor(buildUtil.symctr/c)%c)+b.charAt(buildUtil.symctr%c),d="$D"+d,buildUtil.symctr++;var e;a=a.replace(/-/g,"__"),kwArgs.symbol=="long"?e=a:kwArgs.symbol=="short"&&(buildUtil.symtbl[d+"_"]=a,e=d+"_");return e},buildUtil.insertSymbols=function(a,b){buildUtil.symtbl={};var c=fileUtil.getFilteredFileList(a,/\.js$/,!0);if(c){logger.trace("Inserting global function symbols in: "+a);for(var d=0;d<c.length;d++)if(!c[d].match(/loader_debug\.js/)&&!c[d].match(/\.uncompressed\.js/)&&!c[d].match(/buildscripts/)&&!c[d].match(/nls/)&&!c[d].match(/tests\//)){var e=fileUtil.readFile(c[d]),f;e.match(/dojo\.provide\("(.*)"\);/)&&(f=RegExp.$1.replace(/\./g,"_")+"_"),f&&(e=e.replace(/^(\s*)(\w+)(\s*:\s*function)\s*(\(.*)$/mg,function(a,b,c,d,e){return b+c+d+" "+buildUtil.generateSym(f+c)+e}),e=e.replace(/^(\s*this\.)(\w+)(\s*=\s*function)\s*(\(.*)$/mg,function(a,b,c,d,e){return b+c+d+" "+buildUtil.generateSym(f+c)+e})),e=e.replace(/^(\s*)([\w\.]+)(\s*=\s*function)\s*(\(.*)/mg,function(a,b,c,d,e){return b+c+d+" "+buildUtil.generateSym(c.replace(/\./g,"_"))+e}),fileUtil.saveUtf8File(c[d],e)}if(b.symbol=="short"){var g="",h=fileUtil.getLineSeparator();for(var i in buildUtil.symtbl)g+=i+': "'+buildUtil.symtbl[i]+'"'+h;fileUtil.saveFile(a+"/symboltable.txt",g)}}},buildUtil.extractMatchedParens=function(a,b,c){a.lastIndex=0;var d=/[\(\)]/g;d.lastIndex=0;var e=[],f,g=[],h=0;while(f=a.exec(b)){d.lastIndex=a.lastIndex;var i=1,j;while(j=d.exec(b)){j[0]==")"?i-=1:i+=1;if(i==0)break}if(i!=0)throw"unmatched paren around character "+d.lastIndex+" in: "+b;var k=a.lastIndex-f[0].length;e.push(b.substring(k,d.lastIndex)),g.push(b.substring(h,k));var l=d.lastIndex;c&&b.charAt(l)==";"&&(l+=1),h=a.lastIndex=l}g.push(b.substring(h,b.length)),e.length>0&&e.unshift(g.join(""));return e.length?e:null}