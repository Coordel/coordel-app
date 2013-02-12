dojo.provide("tests.date.locale"),dojo.require("dojo.date.locale"),tests.register("tests.date.locale",[{name:"date.locale",runTest:function(a){var b=["en-us","fr-fr","es","de-at","ja-jp","zh-cn"];if(dojo.global.define&&define.vendor!="dojotoolkit.org"){var c=new doh.Deferred,d=[];dojo.forEach(b,function(a){d.push(dojo.getL10nName("dojo/cldr","gregorian",a))}),define(d,function(){c.callback(!0)});return c}dojo.forEach(b,function(a){dojo.requireLocalization("dojo.cldr","gregorian",a)})},tearDown:function(){}},{name:"isWeekend",runTest:function(a){var b=new Date(2006,8,21),c=new Date(2006,8,22),d=new Date(2006,8,23),e=new Date(2006,8,24),f=new Date(2006,8,25);a.f(dojo.date.locale.isWeekend(b,"en-us")),a.t(dojo.date.locale.isWeekend(d,"en-us")),a.t(dojo.date.locale.isWeekend(e,"en-us")),a.f(dojo.date.locale.isWeekend(f,"en-us"))}},{name:"format",runTest:function(a){var b=new Date(2006,7,11,0,55,12,345);a.is("Friday, August 11, 2006",dojo.date.locale.format(b,{formatLength:"full",selector:"date",locale:"en-us"})),a.is("vendredi 11 août 2006",dojo.date.locale.format(b,{formatLength:"full",selector:"date",locale:"fr-fr"})),a.is("Freitag, 11. August 2006",dojo.date.locale.format(b,{formatLength:"full",selector:"date",locale:"de-at"})),a.is("2006年8月11日金曜日",dojo.date.locale.format(b,{formatLength:"full",selector:"date",locale:"ja-jp"})),a.is("8/11/06",dojo.date.locale.format(b,{formatLength:"short",selector:"date",locale:"en-us"})),a.is("11/08/06",dojo.date.locale.format(b,{formatLength:"short",selector:"date",locale:"fr-fr"})),a.is("11.08.06",dojo.date.locale.format(b,{formatLength:"short",selector:"date",locale:"de-at"})),a.is("06/08/11",dojo.date.locale.format(b,{formatLength:"short",selector:"date",locale:"ja-jp"})),a.is("6",dojo.date.locale.format(b,{datePattern:"E",selector:"date"})),a.is("12:55 AM",dojo.date.locale.format(b,{formatLength:"short",selector:"time",locale:"en-us"})),a.is("12:55:12",dojo.date.locale.format(b,{timePattern:"h:m:s",selector:"time"})),a.is("12:55:12.35",dojo.date.locale.format(b,{timePattern:"h:m:s.SS",selector:"time"})),a.is("24:55:12.35",dojo.date.locale.format(b,{timePattern:"k:m:s.SS",selector:"time"})),a.is("0:55:12.35",dojo.date.locale.format(b,{timePattern:"H:m:s.SS",selector:"time"})),a.is("0:55:12.35",dojo.date.locale.format(b,{timePattern:"K:m:s.SS",selector:"time"})),a.is("11082006",dojo.date.locale.format(b,{datePattern:"ddMMyyyy",selector:"date"})),a.is("12 o'clock AM",dojo.date.locale.format(b,{datePattern:"hh 'o''clock' a",selector:"date",locale:"en"})),a.is("11/08/2006 12:55am",dojo.date.locale.format(b,{datePattern:"dd/MM/yyyy",timePattern:"hh:mma",locale:"en",am:"am",pm:"pm"})),a.is("上午12时55分12秒",dojo.date.locale.format(b,{formatLength:"full",selector:"time",locale:"zh-cn"}).replace(/^.*(\u4e0a\u5348.*)/,"$1"))}},{name:"parse_dates",runTest:function(a){var b=new Date(2006,7,11,0);a.is(b,dojo.date.locale.parse("08/11/06",{formatLength:"short",selector:"date",locale:"en"})),a.is(b,dojo.date.locale.parse("8/11/06",{formatLength:"short",selector:"date",locale:"en"})),a.is(b,dojo.date.locale.parse("8/11/2006",{formatLength:"short",selector:"date",locale:"en"})),a.f(Boolean(dojo.date.locale.parse("8/11/2006",{formatLength:"short",selector:"date",locale:"en",strict:!0}))),a.is(b,dojo.date.locale.parse("11Aug2006",{selector:"date",datePattern:"ddMMMyyyy",locale:"en"})),a.is(new Date(2006,7,1),dojo.date.locale.parse("Aug2006",{selector:"date",datePattern:"MMMyyyy",locale:"en"})),a.is(new Date(2010,10,19),dojo.date.locale.parse("111910",{fullyear:!1,datePattern:"MMddyy",selector:"date"})),a.is(b,dojo.date.locale.parse("Aug 11, 2006",{formatLength:"medium",selector:"date",locale:"en"})),a.is(b,dojo.date.locale.parse("Aug 11, 2006",{formatLength:"medium",selector:"date",locale:"en"})),a.is(b,dojo.date.locale.parse("Aug. 11, 2006",{formatLength:"medium",selector:"date",locale:"en"})),a.f(Boolean(dojo.date.locale.parse("Aug. 11, 2006",{formatLength:"medium",selector:"date",locale:"en",strict:!0})));var c=new Date(2006,7,11,0);c.setFullYear(6),a.is(c,dojo.date.locale.parse("Aug 11, 06",{selector:"date",datePattern:"MMM dd, yyyy",locale:"en",strict:!0})),a.is(b,dojo.date.locale.parse("August 11, 2006",{formatLength:"long",selector:"date",locale:"en"})),a.is(b,dojo.date.locale.parse("Friday, August 11, 2006",{formatLength:"full",selector:"date",locale:"en"})),a.f(Boolean(dojo.date.locale.parse("15/1/2005",{formatLength:"short",selector:"date",locale:"en"}))),a.f(Boolean(dojo.date.locale.parse("Aug 32, 2006",{formatLength:"medium",selector:"date",locale:"en"}))),a.is(b,dojo.date.locale.parse("11.08.06",{formatLength:"short",selector:"date",locale:"de"})),a.f(Boolean(dojo.date.locale.parse("11.8/06",{formatLength:"short",selector:"date",locale:"de"}))),a.f(Boolean(dojo.date.locale.parse("11.8x06",{formatLength:"short",selector:"date",locale:"de"}))),a.f(Boolean(dojo.date.locale.parse("11.13.06",{formatLength:"short",selector:"date",locale:"de"}))),a.f(Boolean(dojo.date.locale.parse("11.0.06",{formatLength:"short",selector:"date",locale:"de"}))),a.f(Boolean(dojo.date.locale.parse("32.08.06",{formatLength:"short",selector:"date",locale:"de"}))),a.is(b,dojo.date.locale.parse("11/08/06",{formatLength:"short",selector:"date",locale:"es"})),a.is(b,dojo.date.locale.parse("11/8/06",{formatLength:"short",selector:"date",locale:"es"})),a.is(b,dojo.date.locale.parse("11/8/2006",{formatLength:"short",selector:"date",locale:"es"})),a.f(Boolean(dojo.date.locale.parse("11/8/2006",{formatLength:"short",selector:"date",locale:"es",strict:!0}))),a.is(b,dojo.date.locale.parse("11 de agosto de 2006",{formatLength:"long",selector:"date",locale:"es"})),a.is(b,dojo.date.locale.parse("11 de Agosto de 2006",{formatLength:"long",selector:"date",locale:"es"})),a.f(Boolean(dojo.date.locale.parse("11 de Agosto de 2006",{formatLength:"long",selector:"date",locale:"es",strict:!0}))),a.is(b,dojo.date.locale.parse("viernes 11 de agosto de 2006",{formatLength:"full",selector:"date",locale:"es"})),a.is(b,dojo.date.locale.parse("Viernes 11 de agosto de 2006",{formatLength:"full",selector:"date",locale:"es"})),a.f(Boolean(dojo.date.locale.parse("Viernes 11 de agosto de 2006",{formatLength:"full",selector:"date",locale:"es",strict:!0}))),a.is(b,dojo.date.locale.parse("06/08/11",{formatLength:"short",selector:"date",locale:"ja"})),a.is(b,dojo.date.locale.parse("06/8/11",{formatLength:"short",selector:"date",locale:"ja"})),a.is(b,dojo.date.locale.parse("2006/8/11",{formatLength:"short",selector:"date",locale:"ja"})),a.f(Boolean(dojo.date.locale.parse("2006/8/11",{formatLength:"short",selector:"date",locale:"ja",strict:!0}))),a.is(b,dojo.date.locale.parse("2006/08/11",{formatLength:"medium",selector:"date",locale:"ja"})),a.is(b,dojo.date.locale.parse("2006/8/11",{formatLength:"medium",selector:"date",locale:"ja"})),a.is(b,dojo.date.locale.parse("2006年8月11日",{formatLength:"long",selector:"date",locale:"ja"})),a.is(b,dojo.date.locale.parse("2006年8月11日金曜日",{formatLength:"full",selector:"date",locale:"ja"}));var d=new Date(2006,3,11,0),e={formatLength:"medium",selector:"date",locale:"fr-fr"};a.is(0,dojo.date.compare(d,dojo.date.locale.parse(dojo.date.locale.format(d,e),e))),a.is(0,dojo.date.compare(d,dojo.date.locale.parse("11 avr 06",e)))}},{name:"parse_dates_neg",runTest:function(a){a.f(Boolean(dojo.date.locale.parse("2/29/2007",{formatLength:"short",selector:"date",locale:"en"}))),a.f(Boolean(dojo.date.locale.parse("4/31/2007",{formatLength:"short",selector:"date",locale:"en"}))),a.f(Boolean(dojo.date.locale.parse("Decemb 30, 2007",{formatLength:"long",selector:"date",locale:"en"})))}},{name:"parse_datetimes",runTest:function(a){var b=new Date(2006,7,11,0,30),c=new Date(2006,7,11,12,30);a.is(c,dojo.date.locale.parse("08/11/06 12:30 PM",{formatLength:"short",locale:"en"})),a.is(c,dojo.date.locale.parse("08/11/06 12:30 pm",{formatLength:"short",locale:"en"})),a.f(Boolean(dojo.date.locale.parse("08/11/06 12:30 pm",{formatLength:"short",locale:"en",strict:!0}))),a.is(b,dojo.date.locale.parse("08/11/06 12:30 AM",{formatLength:"short",locale:"en"})),a.is(new Date(2006,7,11),dojo.date.locale.parse("11082006",{datePattern:"ddMMyyyy",selector:"date"})),a.is(new Date(2006,7,31),dojo.date.locale.parse("31Aug2006",{datePattern:"ddMMMyyyy",selector:"date"}))}},{name:"parse_times",runTest:function(a){var b=new Date(2006,7,11,12,30),c={selector:"time",strict:!0,timePattern:"h:mm a",locale:"en"};a.is(b.getHours(),dojo.date.locale.parse("12:30 PM",c).getHours()),a.is(b.getMinutes(),dojo.date.locale.parse("12:30 PM",c).getMinutes())}},{name:"format_patterns",runTest:function(a){var b=new Date(2006,7,11,12,30),c={selector:"time",strict:!0,timePattern:"h 'o''clock'",locale:"en"};a.is(b.getHours(),dojo.date.locale.parse("12 o'clock",c).getHours()),c={selector:"time",strict:!0,timePattern:" 'Hour is' h",locale:"en"},a.is(b.getHours(),dojo.date.locale.parse(" Hour is 12",c).getHours()),c={selector:"time",strict:!0,timePattern:"'Hour is' h",locale:"en"},a.is(b.getHours(),dojo.date.locale.parse("Hour is 12",c).getHours())}},{name:"parse_patterns",runTest:function(a){var b=new Date(2006,7,11,12,30),c={selector:"time",strict:!0,timePattern:"h 'o''clock'",locale:"en"};a.is(b.getHours(),dojo.date.locale.parse("12 o'clock",c).getHours()),c={selector:"time",strict:!0,timePattern:" 'Hour is' h",locale:"en"},a.is(b.getHours(),dojo.date.locale.parse(" Hour is 12",c).getHours()),c={selector:"time",strict:!0,timePattern:"'Hour is' h",locale:"en"},a.is(b.getHours(),dojo.date.locale.parse("Hour is 12",c).getHours())}},{name:"day_of_year",runTest:function(a){a.is(1,dojo.date.locale._getDayOfYear(new Date(2006,0,1))),a.is(32,dojo.date.locale._getDayOfYear(new Date(2006,1,1))),a.is(72,dojo.date.locale._getDayOfYear(new Date(2007,2,13,0,13))),a.is(72,dojo.date.locale._getDayOfYear(new Date(2007,2,13,1,13)))}},{name:"week_of_year",runTest:function(a){a.is(0,dojo.date.locale._getWeekOfYear(new Date(2e3,0,1))),a.is(1,dojo.date.locale._getWeekOfYear(new Date(2e3,0,2))),a.is(0,dojo.date.locale._getWeekOfYear(new Date(2e3,0,2),1)),a.is(0,dojo.date.locale._getWeekOfYear(new Date(2007,0,1))),a.is(1,dojo.date.locale._getWeekOfYear(new Date(2007,0,1),1)),a.is(27,dojo.date.locale._getWeekOfYear(new Date(2007,6,14))),a.is(28,dojo.date.locale._getWeekOfYear(new Date(2007,6,14),1))}}])