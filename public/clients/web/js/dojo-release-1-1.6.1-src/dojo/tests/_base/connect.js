dojo.provide("tests._base.connect"),hub=function(){},failures=0,bad=function(){failures++},good=function(){},markAndSweepTest=function(a){var b=[];for(var c=0;c<a;c++)Math.random()<.5?b.push(dojo.connect("hub",bad)):dojo.connect("hub",good);if(c<Math.pow(10,4)){var d=[];while(b.length){var e=Math.floor(Math.random()*b.length);d.push(b[e]),b.splice(e,1)}b=d}for(var e=0;e<b.length;e++)dojo.disconnect(b[e]);failures=0,hub();return failures},markAndSweepSubscribersTest=function(a){var b="hubbins",c=[];for(var d=0;d<a;d++)Math.random()<.5?c.push(dojo.subscribe(b,bad)):dojo.subscribe(b,good);if(d<Math.pow(10,4)){var e=[];while(c.length){var f=Math.floor(Math.random()*c.length);e.push(c[f]),c.splice(f,1)}c=e}for(var f=0;f<c.length;f++)dojo.unsubscribe(c[f]);failures=0,dojo.publish(b);return failures},tests.register("tests._base.connect",[function smokeTest(a){var b=!1,c={foo:function(){b=!1}};dojo.connect(c,"foo",null,function(){b=!0}),c.foo(),a.is(!0,b)},function basicTest(a){var b="",c={foo:function(){b+="foo"},bar:function(){b+="bar"},baz:function(){b+="baz"}},d=dojo.connect(c,"foo",c,"bar");dojo.connect(c,"bar",c,"baz"),b="",c.foo(),a.is("foobarbaz",b),b="",c.bar(),a.is("barbaz",b),b="",c.baz(),a.is("baz",b),dojo.connect(c,"foo",c,"baz"),dojo.disconnect(d),b="",c.foo(),a.is("foobaz",b),b="",c.bar(),a.is("barbaz",b),b="",c.baz(),a.is("baz",b)},function hubConnectDisconnect1000(a){a.is(0,markAndSweepTest(1e3))},function args4Test(a){var b,c={foo:function(){b=!1},bar:function(){b=!0}};dojo.connect(c,"foo",c,"bar"),c.foo(),a.is(!0,b)},function args3Test(a){var b;dojo.global.gFoo=function(){b=!1},dojo.global.gOk=function(){b=!0};var c=dojo.connect("gFoo",null,"gOk");gFoo(),dojo.disconnect(c),a.is(!0,b),c=dojo.connect(null,"gFoo","gOk"),gFoo(),dojo.disconnect(c),a.is(!0,b),gFoo(),a.is(!1,b)},function args2Test(a){var b;dojo.global.gFoo=function(){b=!1},dojo.global.gOk=function(){b=!0};var c=dojo.connect("gFoo","gOk");gFoo(),dojo.disconnect(c),a.is(!0,b),c=dojo.connect("gFoo",gOk),gFoo(),dojo.disconnect(c),a.is(!0,b)},function scopeTest1(a){var b={ok:!0,foo:function(){this.ok=!1}},c={ok:!1,bar:function(){this.ok=!0}},d=dojo.connect(b,"foo",c,"bar");b.foo(),a.is(!1,b.ok),a.is(!0,c.ok)},function scopeTest2(a){var b={ok:!0,foo:function(){this.ok=!1}},c={ok:!1,bar:function(){this.ok=!0}},d=dojo.connect(b,"foo",c.bar);b.foo(),a.is(!0,b.ok),a.is(!1,c.ok)},function connectPublisher(a){var b={inc:0,foo:function(){this.inc++}},c={inc:0,bar:function(){this.inc++}},d=dojo.connectPublisher("/blah",b,"foo"),e=dojo.connectPublisher("/blah",b,"foo");dojo.subscribe("/blah",c,"bar"),b.foo(),a.is(1,b.inc),a.is(2,c.inc),dojo.disconnect(d),b.foo(),a.is(2,b.inc),a.is(3,c.inc),dojo.disconnect(e),b.foo(),a.is(3,b.inc),a.is(3,c.inc)},function publishSubscribe1000(a){a.is(markAndSweepSubscribersTest(1e3),0)}])