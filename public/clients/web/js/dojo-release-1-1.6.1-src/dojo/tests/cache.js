dojo.provide("tests.cache"),dojo.require("dojo.cache"),tests.register("tests.cache",[{runTest:function(a){var b="<h1>Hello World</h1>";a.is(b,dojo.trim(dojo.cache("dojo.tests.cache","regular.html"))),a.is(b,dojo.trim(dojo.cache("dojo.tests.cache","sanitized.html",{sanitize:!0})));var c=dojo.moduleUrl("dojo.tests.cache","object.html").toString();a.is(b,dojo.trim(dojo.cache(new dojo._Url(c),{sanitize:!0}))),a.is(b,dojo.trim(dojo.cache("dojo.tests.cache","regular.html"))),a.is(b,dojo.trim(dojo.cache("dojo.tests.cache","sanitized.html",{sanitize:!0}))),a.is(b,dojo.trim(dojo.cache(new dojo._Url(c),{sanitize:!0}))),a.is(null,dojo.cache("dojo.tests.cache","regular.html",null)),a.is("",dojo.cache("dojo.tests.cache","regular.html","")),a.is("",dojo.cache("dojo.tests.cache","regular.html"))}}])