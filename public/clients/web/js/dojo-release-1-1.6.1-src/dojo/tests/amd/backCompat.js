var addOnLoadResults=[],writeToAddOnLoadResults=function(a,b){return function(){addOnLoadResults.push(a),this===b&&addOnLoadResults.push("OK")}};djConfig={addOnLoad:writeToAddOnLoadResults("A",this),someRandomProperty:"someRandomValue"},define(["dojo","doh","i18n!dojo/nls/colors","text!./text.html","text!./text.html!strip"],function(a,b,c,d,e){b.register("test.amd.backCompat",[function f(b){b.assertEqual(a.config.someRandomProperty,"someRandomValue")},function g(c){var d=new b.Deferred;a.addOnLoad(function(){a.addOnLoad(writeToAddOnLoadResults("B",this)),a.addOnLoad(window,writeToAddOnLoadResults("C",window));var b={};b.someMethod=writeToAddOnLoadResults("D",b),a.addOnLoad(b,"someMethod"),b.someOtherMethod=writeToAddOnLoadResults("E",b),a.addOnLoad(b,b.someOtherMethod),a._loaders.unshift(writeToAddOnLoadResults("F",this)),a._loaders.unshift(writeToAddOnLoadResults("G",this)),a._loaders.splice(1,0,writeToAddOnLoadResults("H",this))}),a.addOnLoad(function(){var a;require.vendor=="altoviso.com"?a=["A","OK","B","OK","C","OK","D","OK","E","OK","G","OK","H","OK","F","OK"]:a=["A","OK","B","OK","C","OK","D","OK","E","OK","F","OK","G","OK","H","OK"],c.assertEqual(a,addOnLoadResults),d.callback(!0)});return d},function h(b){addOnLoadResults=[],a.addOnUnload(writeToAddOnLoadResults("A",a.global)),a.addOnUnload(window,writeToAddOnLoadResults("B",window));var c={};c.someMethod=writeToAddOnLoadResults("C",c),a.addOnUnload(c,"someMethod"),c.someOtherMethod=writeToAddOnLoadResults("D",c),a.addOnUnload(c,c.someOtherMethod),a.unloaded(),b.assertEqual(["D","OK","C","OK","B","OK","A","OK"],addOnLoadResults)},function i(b){b.assertEqual("i18n!dojo/cldr/nls/en-us/gregorian",a.getL10nName("dojo.cldr","gregorian")),b.assertEqual("i18n!dojo/cldr/nls/en-us/gregorian",a.getL10nName("dojo.cldr","gregorian","en-us")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo.cldr","gregorian","root")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo.cldr","gregorian","ROOT")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo.cldr","gregorian","Root")),b.assertEqual("i18n!dojo/cldr/nls/en-us/gregorian",a.getL10nName("dojo/cldr","gregorian")),b.assertEqual("i18n!dojo/cldr/nls/en-us/gregorian",a.getL10nName("dojo/cldr","gregorian","en-us")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo/cldr","gregorian","root")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo/cldr","gregorian","ROOT")),b.assertEqual("i18n!dojo/cldr/nls/gregorian",a.getL10nName("dojo/cldr","gregorian","Root"))},function j(b){b.assertEqual(c,a.requireLocalization("dojo","colors"))},function k(b){var c=function(a){var b=a.split("/"),c=[],d;while(b.length)d=b.shift(),d==".."?c.length&&c[c.length-1].charAt(0)!="."?c.pop():c.push(".."):d!="."&&c.push(d);return c.join("/")},d=c(location.pathname+"/../"+a.moduleUrl("dojo.my","module.js")),e=c(location.pathname+"/../"+a.moduleUrl("dojo","resources/blank.gif"));b.assertTrue(/dojo\/my\/module\.js$/.test(d)),b.assertTrue(/dojo\/resources\/blank\.gif$/.test(e))},function l(a){a.assertTrue(d.indexOf("<html><head><title>some text</title></head><body><h1>some text</h1></body></html>")==0),a.assertEqual("<h1>some text</h1>",e)}])})