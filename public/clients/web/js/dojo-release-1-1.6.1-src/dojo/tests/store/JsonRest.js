dojo.provide("dojo.tests.store.JsonRest"),dojo.require("dojo.store.JsonRest"),function(){var a=new dojo.store.JsonRest({target:dojo.moduleUrl("dojo.tests.store","")});tests.register("tests.store.JsonRest",[function b(b){var c=new doh.Deferred;a.get("node1.1").then(function(a){b.is(a.name,"node1.1"),b.is(a.someProperty,"somePropertyA1"),c.callback(!0)});return c},function c(b){var c=new doh.Deferred;a.query("treeTestRoot").then(function(a){var d=a[0];b.is(d.name,"node1"),b.is(d.someProperty,"somePropertyA"),c.callback(!0)});return c},function d(b){var c=new doh.Deferred,d=0;a.query("treeTestRoot").forEach(function(a){d++,console.log(d),b.is(a.name,"node"+d)}).then(function(){c.callback(!0)});return c}])}()