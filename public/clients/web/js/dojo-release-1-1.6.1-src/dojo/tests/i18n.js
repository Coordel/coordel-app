this.define&&define.vendor!="dojotoolkit.org"?define(["dojo","plugin/i18n"],function(a){var b=function(b,c){return function(){var d=new doh.Deferred;define([a.getL10nName("dojo/tests","salutations",c)],function(e){doh.assertEqual(b,a.getL10n("dojo/tests","salutations",c).hello),d.callback(!0)});return d}},c=function(a,c){return{name:"salutations-"+a,timeout:2e3,runTest:b(c,a)}},d=[c("de","Hallo"),c("en","Hello"),c("en-au","G'day"),c("en-us","Hello"),c("en-us-texas","Howdy"),c("en-us-new_york","Hello"),c("en-us-new_york-brooklyn","Yo"),c("xx","Hello"),c("zh-cn","你好")];tests.register("tests.i18n",d)}):(dojo.provide("tests.i18n"),dojo.require("dojo.i18n"),function(){var a=function(a){return function(){dojo.requireLocalization("tests","salutations",a)}},b=function(a,b){return function(){doh.assertEqual(a,dojo.i18n.getLocalization("tests","salutations",b).hello)}},c=function(c,d){return{name:"salutations-"+c,setUp:a(c),runTest:b(d,c)}},d=[c("de","Hallo"),c("en","Hello"),c("en-au","G'day"),c("en-us","Hello"),c("en-us-texas","Howdy"),c("en-us-new_york","Hello"),c("en-us-new_york-brooklyn","Yo"),c("xx","Hello"),c("zh-cn","你好")];d[d.length-1].tearDown=function(){delete tests.nls.salutations},tests.register("tests.i18n",d)}())