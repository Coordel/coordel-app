(function(){var a=function(a,b){b.is("€123.45",a.currency.format(123.45,{currency:"EUR",locale:"en-us"})),b.is("$123.45",a.currency.format(123.45,{currency:"USD",locale:"en-us"})),b.is("$1,234.56",a.currency.format(1234.56,{currency:"USD",locale:"en-us"})),b.is("US$123.45",a.currency.format(123.45,{currency:"USD",locale:"en-ca"})),b.is("$123.45",a.currency.format(123.45,{currency:"CAD",locale:"en-ca"})),b.is("CA$123.45",a.currency.format(123.45,{currency:"CAD",locale:"en-us"})),b.is("123,45 €",a.currency.format(123.45,{currency:"EUR",locale:"de-de"})),b.is("1.234,56 €",a.currency.format(1234.56,{currency:"EUR",locale:"de-de"})),b.is("ADP123",a.currency.format(123,{currency:"ADP",locale:"en-us"})),b.is("$1,234",a.currency.format(1234,{currency:"USD",fractional:!1,locale:"en-us"})),b.is(123.45,a.currency.parse("$123.45",{currency:"USD",locale:"en-us"})),b.is(1234.56,a.currency.parse("$1,234.56",{currency:"USD",locale:"en-us"})),b.is(123.45,a.currency.parse("123,45 €",{currency:"EUR",locale:"de-de"})),b.is(123.45,a.currency.parse("123,45 €",{currency:"EUR",locale:"de-de"})),b.is(1234.56,a.currency.parse("1.234,56 €",{currency:"EUR",locale:"de-de"})),b.is(1234.56,a.currency.parse("1.234,56€",{currency:"EUR",locale:"de-de"})),b.is(1234,a.currency.parse("$1,234",{currency:"USD",locale:"en-us"})),b.is(1234,a.currency.parse("$1,234",{currency:"USD",fractional:!1,locale:"en-us"})),b.t(isNaN(a.currency.parse("$1,234",{currency:"USD",fractional:!0,locale:"en-us"})))};dojo.global.define&&define.vendor!="dojotoolkit.org"?define(["dojo","dojo/currency","plugin/i18n"],function(b){tests.register("tests.currency",[{name:"currency",timeout:2e3,runTest:function(c){var d=new doh.Deferred,e=["dojo"];b.forEach(["en-us","en-ca","de-de"],function(a){e.push(b.getL10nName("dojo/cldr","currency",a)),e.push(b.getL10nName("dojo/cldr","number",a))}),define(e,function(b){a(b,c),d.callback(!0)});return d}}])}):(dojo.provide("tests.currency"),dojo.require("dojo.currency"),tests.register("tests.currency",[{name:"currency",setUp:function(){var a=["en-us","en-ca","de-de"];for(var b=0;b<a.length;b++)dojo.requireLocalization("dojo.cldr","currency",a[b]),dojo.requireLocalization("dojo.cldr","number",a[b])},runTest:function(b){a(dojo,b)}}]))})()