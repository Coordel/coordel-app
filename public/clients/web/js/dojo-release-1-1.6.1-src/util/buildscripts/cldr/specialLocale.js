function validateDir(a){var b=new java.io.File(a);b.exists()||b.mkdir()}djConfig={baseUrl:"../../../dojo/"},load("../../../dojo/dojo.js"),load("../jslib/logger.js"),load("../jslib/fileUtil.js"),load("cldrUtil.js"),dojo.require("dojo.i18n");var dir=arguments[0],allLocalesStr=arguments[1],logDir=arguments[2],BUNDLE_MAP=["number","currency","gregorian"],NLS_JSON_HEAD=["// generated from ldml/main/*.xml, xpath: ldml/numbers\n","// generated from ldml/main/*.xml, xpath: ldml/numbers/currencies\n","// generated from ldml/main/*.xml, xpath: ldml/calendars/calendar-gregorian\n"],SPECIAL_LOCALES_MAP={"zh-hk":"zh-hant-hk","zh-mo":"zh-hant-mo",sh:"sr-latn",mo:"ro-md","pa-pk":"pa-arab-pk","zh-tw":"zh-hant-tw","uz-af":"uz-arab-af","ha-sd":"ha-arab-sd","ku-tr":"ku-latn-tr"};print("specialLocale.js...");var srcLocaleList=[];for(x in SPECIAL_LOCALES_MAP)(allLocalesStr=="${locales}"||allLocalesStr&&0<=allLocalesStr.indexOf(x))&&srcLocaleList.push(dir+"/"+x);var logStr="";for(var i=0;i<srcLocaleList.length;i++){var srcLocalePath=srcLocaleList[i],srcPathSegments=srcLocalePath.split("/"),srcLocale=srcPathSegments[srcPathSegments.length-1],aliasLocale=SPECIAL_LOCALES_MAP[srcLocale];for(var len=0;len<BUNDLE_MAP.length;len++){try{dojo.i18n._requireLocalization("dojo.cldr",BUNDLE_MAP[len],srcLocale),dojo.i18n._requireLocalization("dojo.cldr",BUNDLE_MAP[len],aliasLocale);var srcBundle=dojo.i18n.getLocalization("dojo.cldr",BUNDLE_MAP[len],srcLocale),aliasBundle=dojo.i18n.getLocalization("dojo.cldr",BUNDLE_MAP[len],aliasLocale)}catch(e){print(e)}if(!aliasBundle&&!srcBundle)break;if(!aliasBundle&&srcBundle)break;if(aliasBundle&&!srcBundle)validateDir(srcLocalePath),fileUtil.saveUtf8File(srcLocalePath+"/"+BUNDLE_MAP[len]+".js",NLS_JSON_HEAD[len]+"("+dojo.toJson(aliasBundle,!0)+")");else if(aliasBundle&&srcBundle){var isUpdated=!1;try{var nativeSrcBundle=getNativeBundle(srcLocalePath+"/"+BUNDLE_MAP[len]+".js")}catch(e){nativeSrcBundle={}}for(p in aliasBundle)!isLocaleAliasSrc(p,aliasBundle)&&(!srcBundle[p]||!compare(srcBundle[p],aliasBundle[p]))&&(nativeSrcBundle[p]=aliasBundle[p],isUpdated=!0);isUpdated&&(validateDir(srcLocalePath),fileUtil.saveUtf8File(srcLocalePath+"/"+BUNDLE_MAP[len]+".js",NLS_JSON_HEAD[len]+"("+dojo.toJson(nativeSrcBundle,!0)+")"))}}}