var hasToString=function(){var a="hello world"}.toString().indexOf("hello world")!==-1;doh.registerUrl("simple","../simple.html"),doh.registerUrl("baseUrl","../baseUrl.html"),doh.registerUrl("config","../config.html"),doh.registerUrl("dataMain","../dataMain.html"),hasToString&&(doh.registerUrl("anonSimple","../anon/anonSimple.html"),doh.registerUrl("packages","../packages/packages.html")),doh.registerUrl("simple-nohead","../simple-nohead.html"),location.href.indexOf("http://127.0.0.1/requirejs/")===0&&doh.registerUrl("simple-badbase","../simple-badbase.html"),doh.registerUrl("circular","../circular.html"),doh.registerUrl("depoverlap","../depoverlap.html"),doh.registerUrl("urlfetch","../urlfetch/urlfetch.html"),doh.registerUrl("uniques","../uniques/uniques.html"),doh.registerUrl("multiversion","../multiversion.html",1e4),doh.registerUrl("jquery","../jquery/jquery.html"),doh.registerUrl("jqueryPriority","../jquery/jqueryPriority.html"),doh.registerUrl("jqueryDynamic","../jquery/jqueryDynamic.html"),doh.registerUrl("jqueryDynamic2","../jquery/jqueryDynamic2.html"),doh.registerUrl("i18nlocaleunknown","../i18n/i18n.html?bundle=i18n!nls/fr-fr/colors"),doh.registerUrl("i18n","../i18n/i18n.html"),doh.registerUrl("i18nlocale","../i18n/i18n.html?locale=en-us-surfer"),doh.registerUrl("i18nbundle","../i18n/i18n.html?bundle=i18n!nls/en-us-surfer/colors"),doh.registerUrl("i18ncommon","../i18n/common.html"),doh.registerUrl("i18ncommonlocale","../i18n/common.html?locale=en-us-surfer"),doh.registerUrl("paths","../paths/paths.html"),doh.registerUrl("layers","../layers/layers.html",1e4),doh.registerUrl("allplugins-text","../layers/allplugins-text.html"),doh.registerUrl("afterload","../afterload.html",1e4),doh.registerUrl("pluginsSync","../plugins/sync.html"),doh.registerUrl("doublePluginCall","../plugins/double.html"),doh.registerUrl("pluginsFromText","../plugins/fromText/fromText.html"),doh.registerUrl("text","../text/text.html"),doh.registerUrl("textOnly","../text/textOnly.html"),doh.registerUrl("jsonp","../jsonp/jsonp.html"),doh.registerUrl("order","../order/order.html"),doh.registerUrl("relative","../relative/relative.html"),doh.registerUrl("exports","../exports/exports.html"),doh.registerUrl("priority","../priority/priority.html"),doh.registerUrl("priorityOptimized","../priority/priorityOptimized.html"),doh.registerUrl("priorityWithDeps","../priority/priorityWithDeps/priorityWithDeps.html"),doh.registerUrl("prioritySingleCall","../priority/prioritySingleCall.html"),typeof Worker!=="undefined"&&doh.registerUrl("workers","../workers.html")