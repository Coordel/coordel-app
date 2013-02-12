i18nUtil={},i18nUtil.setup=function(a){if(typeof djConfig=="undefined"||(typeof dojo=="undefined"||!dojo.i18n))djConfig={locale:"xx",extraLocale:a.localeList,baseUrl:buildScriptsPath+"../../dojo/"},load(buildScriptsPath+"../../dojo/dojo.js"),dojo.baseUrl="./",buildUtil.configPrefixes(a.profileProperties.dependencies.prefixes),dojo.require("dojo.i18n")},i18nUtil.flattenLayerFileBundles=function(fileName,fileContents,kwArgs){var destDirName=fileName.replace(/\/[^\/]+$/,"/")+"nls",nlsNamePrefix=fileName.replace(/\.js$/,"");nlsNamePrefix=nlsNamePrefix.substring(nlsNamePrefix.lastIndexOf("/")+1,nlsNamePrefix.length),i18nUtil.setup(kwArgs);var djLoadedBundles=[],drl=dojo.requireLocalization,dupes={};dojo.requireLocalization=function(modulename,bundlename,locale){var dupName=[modulename,bundlename,locale].join(":");dupes[dupName]||(drl(modulename,bundlename,locale),djLoadedBundles.push({modulename:modulename,module:eval(modulename),bundlename:bundlename}),dupes[dupName]=1)};var requireStatements=fileContents.match(/dojo\.requireLocalization\(.*\)\;/g);if(requireStatements){eval(requireStatements.join(";"));var djBundlesByLocale={},jsLocale,entry,bundle;for(var i=0;i<djLoadedBundles.length;i++){entry=djLoadedBundles[i],bundle=entry.module.nls[entry.bundlename];for(jsLocale in bundle)djBundlesByLocale[jsLocale]||(djBundlesByLocale[jsLocale]=[]),djBundlesByLocale[jsLocale].push(entry)}localeList=[];var mkdir=!1,dir=new java.io.File(destDirName),modulePrefix=buildUtil.mapPathToResourceName(fileName,kwArgs.profileProperties.dependencies.prefixes),lastDot=modulePrefix.lastIndexOf(".");if(lastDot!=-1)modulePrefix=modulePrefix.substring(0,lastDot+1)+"nls."+modulePrefix.substring(lastDot+1,modulePrefix.length);else throw"Invalid module prefix for flattened bundle: "+modulePrefix;for(jsLocale in djBundlesByLocale){var locale=jsLocale.replace(/\_/g,"-");mkdir||(dir.mkdir(),mkdir=!0);var outFile=new java.io.File(dir,nlsNamePrefix+"_"+locale+".js"),parentDir=outFile.getParentFile();if(!parentDir.exists())if(!parentDir.mkdirs())throw"Could not create directory: "+parentDir.getAbsolutePath();var os=new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile),"utf-8"));try{os.write('dojo.provide("'+modulePrefix+"_"+locale+'");');for(var j=0;j<djLoadedBundles.length;j++){entry=djLoadedBundles[j];var bundlePkg=[entry.modulename,"nls",entry.bundlename].join("."),translationPkg=[bundlePkg,jsLocale].join(".");bundle=entry.module.nls[entry.bundlename],bundle[jsLocale]&&(os.write('dojo.provide("'+bundlePkg+'");'),os.write(bundlePkg+"._built=true;"),os.write('dojo.provide("'+translationPkg+'");'),os.write(translationPkg+"="+dojo.toJson(bundle[jsLocale])+";"))}}finally{os.close()}localeList.push(locale)}fileContents=fileContents.replace(/dojo\.requireLocalization\(.*\)\;/g,"");var preloadCall='\ndojo.i18n._preloadLocalizations("'+modulePrefix+'", '+dojo.toJson(localeList.sort())+");\n";i18nUtil.preloadInsertionRegExp.lastIndex=0,fileContents.match(i18nUtil.preloadInsertionRegExp)?(i18nUtil.preloadInsertionRegExp.lastIndex=0,fileContents=fileContents.replace(i18nUtil.preloadInsertionRegExp,preloadCall)):fileContents+=preloadCall}return fileContents},i18nUtil.preloadInsertionRegExp=/\/\/INSERT dojo.i18n._preloadLocalizations HERE/,i18nUtil.flattenDirBundles=function(a,b,c,d){i18nUtil.setup(c);var e=fileUtil.getFilteredFileList(b,/\.js$/,!0),f=c.profileProperties.dependencies.prefixes;for(var g=0;g<e.length;g++){var h=String(e[g]),i=null;h.match(/\/nls\//)&&!h.match(d)?i="("+i18nUtil.makeFlatBundleContents(a,b,h)+")":i=i18nUtil.modifyRequireLocalization(readText(h),f),i&&fileUtil.saveUtf8File(h,i)}},i18nUtil.modifyRequireLocalization=function(a,b){var c=[];a=String(a);var d=a;a.match(buildUtil.globalRequireLocalizationRegExp)&&(d=a.replace(buildUtil.globalRequireLocalizationRegExp,function(a){var c=a,d=a.match(buildUtil.requireLocalizationRegExp),e=d[1],f=d[2];if(e=="requireLocalization"){var g=i18nUtil.getRequireLocalizationArgsFromString(f);if(g.moduleName){var h=i18nUtil.getLocalesForBundle(g.moduleName,g.bundleName,b);g.localeName||(f+=", null"),f+=', "'+h.join(",")+'"',c="dojo."+e+"("+f+")"}}return c}));return d},i18nUtil.makeFlatBundleContents=function(a,b,c){var d=i18nUtil.getBundlePartsFromFileName(a,b,c);if(!d)return null;var e=d.moduleName,f=d.bundleName,g=d.localeName;dojo.requireLocalization(e,f,g);var h=dojo.getObject(e),i=g?g.replace(/-/g,"_"):"ROOT",j=h.nls[f][i];if(!j)throw"Cannot create flattened bundle for src file: "+c;return dojo.toJson(j)},i18nUtil.getLocalesForBundle=function(a,b,c){var d=buildUtil.mapResourceToPath(a,c),e=new RegExp("nls[/]?([\\w\\-]*)/"+b+".js$"),f=fileUtil.getFilteredFileList(d+"nls/",e,!0),g=[];for(var h=0;h<f.length;h++){var i=f[h].match(e);i&&i[1]?g.push(i[1]):g.push("ROOT")}return g.sort()},i18nUtil.getRequireLocalizationArgsFromString=function(a){var b={moduleName:null,bundleName:null,localeName:null},c=a.split(/\,\s*/);c&&c.length>1&&(b.moduleName=c[0]?c[0].replace(/\"/g,""):null,b.bundleName=c[1]?c[1].replace(/\"/g,""):null,b.localeName=c[2]);return b},i18nUtil.getBundlePartsFromFileName=function(a,b,c){var b=b.replace(/\.\.\//g,""),d=c.lastIndexOf(b);if(d!=-1){var e=d+b.length;b.charAt(b.length)!="/"&&(e+=1),c=c.substring(e,c.length)}var f=c.split("/"),g=[a];for(var h=0;f[h]!="nls";h++)g.push(f[h]);var i=g.join(".");if(f[h+1].match(/\.js$/))var j="",k=f[h+1];else var j=f[h+1],k=f[h+2];if(k&&k.indexOf(".js")!=-1)k=k.replace(/\.js/,"");else return null;return{moduleName:i,bundleName:k,localeName:j}}