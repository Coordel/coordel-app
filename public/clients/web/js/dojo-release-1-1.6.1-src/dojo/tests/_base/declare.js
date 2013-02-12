dojo.provide("tests._base.declare"),tests.register("tests._base.declare",[function smokeTest(a){dojo.declare("tests._base.declare.tmp",null);var b=new tests._base.declare.tmp;dojo.declare("testsFoo",null);var b=new testsFoo},function smokeTest2(a){dojo.declare("tests._base.declare.foo",null,{foo:"thonk"});var b=new tests._base.declare.foo;a.is("thonk",b.foo),dojo.declare("testsFoo2",null,{foo:"thonk"});var c=new testsFoo2;a.is("thonk",c.foo)},function smokeTestWithCtor(a){dojo.declare("tests._base.declare.fooBar",null,{constructor:function(){this.foo="blah"},foo:"thonk"});var b=new tests._base.declare.fooBar;a.is("blah",b.foo)},function smokeTestCompactArgs(a){dojo.declare("tests._base.declare.fooBar2",null,{foo:"thonk"});var b=new tests._base.declare.fooBar2;a.is("thonk",b.foo)},function subclass(a){dojo.declare("tests._base.declare.tmp3",null,{foo:"thonk"}),dojo.declare("tests._base.declare.tmp4",tests._base.declare.tmp3);var b=new tests._base.declare.tmp4;a.is("thonk",b.foo)},function subclassWithCtor(a){dojo.declare("tests._base.declare.tmp5",null,{constructor:function(){this.foo="blah"},foo:"thonk"}),dojo.declare("tests._base.declare.tmp6",tests._base.declare.tmp5);var b=new tests._base.declare.tmp6;a.is("blah",b.foo)},function mixinSubclass(a){dojo.declare("tests._base.declare.tmp7",null,{foo:"thonk"}),dojo.declare("tests._base.declare.tmp8",null,{constructor:function(){this.foo="blah"}});var b=new tests._base.declare.tmp8;a.is("blah",b.foo),dojo.declare("tests._base.declare.tmp9",[tests._base.declare.tmp7,tests._base.declare.tmp8]);var c=new tests._base.declare.tmp9;a.is("blah",c.foo)},function superclassRef(a){dojo.declare("tests._base.declare.tmp10",null,{foo:"thonk"}),dojo.declare("tests._base.declare.tmp11",tests._base.declare.tmp10,{constructor:function(){this.foo="blah"}});var b=new tests._base.declare.tmp11;a.is("blah",b.foo),a.is("thonk",tests._base.declare.tmp11.superclass.foo)},function inheritedCall(a){var b="xyzzy";dojo.declare("tests._base.declare.tmp12",null,{foo:"thonk",bar:function(a,c){a&&(this.foo=a),c&&(b=c)}}),dojo.declare("tests._base.declare.tmp13",tests._base.declare.tmp12,{constructor:function(){this.foo="blah"}});var c=new tests._base.declare.tmp13;a.is("blah",c.foo),a.is("xyzzy",b),c.bar("zot"),a.is("zot",c.foo),a.is("xyzzy",b),c.bar("trousers","squiggle"),a.is("trousers",c.foo),a.is("squiggle",b)},function inheritedExplicitCall(a){var b="xyzzy";dojo.declare("tests._base.declare.tmp14",null,{foo:"thonk",bar:function(a,c){a&&(this.foo=a),c&&(b=c)}}),dojo.declare("tests._base.declare.tmp15",tests._base.declare.tmp14,{constructor:function(){this.foo="blah"},bar:function(a,b){this.inherited("bar",arguments,[b,a])},baz:function(a,b){tests._base.declare.tmp15.superclass.bar.apply(this,arguments)}});var c=new tests._base.declare.tmp15;a.is("blah",c.foo),a.is("xyzzy",b),c.baz("zot"),a.is("zot",c.foo),a.is("xyzzy",b),c.bar("trousers","squiggle"),a.is("squiggle",c.foo),a.is("trousers",b)},function inheritedMixinCalls(a){dojo.declare("tests._base.declare.tmp16",null,{foo:"",bar:function(){this.foo+="tmp16"}}),dojo.declare("tests._base.declare.mixin16",null,{bar:function(){this.inherited(arguments),this.foo+=".mixin16"}}),dojo.declare("tests._base.declare.mixin17",tests._base.declare.mixin16,{bar:function(){this.inherited(arguments),this.foo+=".mixin17"}}),dojo.declare("tests._base.declare.tmp17",[tests._base.declare.tmp16,tests._base.declare.mixin17],{bar:function(){this.inherited(arguments),this.foo+=".tmp17"}});var b=new tests._base.declare.tmp17;b.bar(),a.is("tmp16.mixin16.mixin17.tmp17",b.foo)},function mixinPreamble(a){var b=!1;dojo.declare("tests._base.declare.tmp16",null),new tests._base.declare.tmp16({preamble:function(){b=!0}}),a.t(b)},function basicMixin(a){var b=new doh.Deferred,c=function(a){dojo.mixin(this,a)};c.prototype.method=function(){a.t(!0),b.callback(!0)},dojo.declare("Thinger",c,{method:function(){this.inherited(arguments)}});var d=new Thinger;d.method();return b},function mutatedMethods(a){dojo.declare("tests._base.declare.tmp18",null,{constructor:function(){this.clear()},clear:function(){this.flag=0},foo:function(){++this.flag},bar:function(){++this.flag},baz:function(){++this.flag}}),dojo.declare("tests._base.declare.tmp19",tests._base.declare.tmp18,{foo:function(){++this.flag,this.inherited(arguments)},bar:function(){++this.flag,this.inherited(arguments)},baz:function(){++this.flag,this.inherited(arguments)}});var b=new tests._base.declare.tmp19;a.is(0,b.flag),b.foo(),a.is(2,b.flag),b.clear(),a.is(0,b.flag);var c=0;dojo.connect(tests._base.declare.tmp19.prototype,"foo",function(){c=1}),b.foo(),a.is(2,b.flag),a.is(1,c),b.clear(),c=0;var d=tests._base.declare.tmp19.prototype.bar;tests._base.declare.tmp19.prototype.bar=function(){c=1,++this.flag,d.call(this)},b.bar(),a.is(3,b.flag),a.is(1,c),b.clear(),c=0,tests._base.declare.tmp19.prototype.baz=function(){c=1,++this.flag,this.inherited("baz",arguments)},b.baz(),a.is(2,b.flag),a.is(1,c)},function modifiedInstance(a){var b;dojo.declare("tests._base.declare.tmp20",null,{foo:function(){b.push(20)}}),dojo.declare("tests._base.declare.tmp21",null,{foo:function(){this.inherited(arguments),b.push(21)}}),dojo.declare("tests._base.declare.tmp22",tests._base.declare.tmp20,{foo:function(){this.inherited(arguments),b.push(22)}}),dojo.declare("tests._base.declare.tmp23",[tests._base.declare.tmp20,tests._base.declare.tmp21],{foo:function(){this.inherited(arguments),b.push(22)}});var c=new tests._base.declare.tmp22,d=new tests._base.declare.tmp23,e={foo:function(){this.inherited("foo",arguments),b.push("INSIDE C")}};b=[],c.foo(),a.is([20,22],b),b=[],d.foo(),a.is([20,21,22],b),dojo.mixin(c,e),dojo.mixin(d,e),b=[],c.foo(),a.is([20,22,"INSIDE C"],b),b=[],d.foo(),a.is([20,21,22,"INSIDE C"],b)},function duplicatedBase(a){var b,c=dojo.declare(null,{constructor:function(){b.push(1)}}),d=dojo.declare([c,c,c],{constructor:function(){b.push(2)}});b=[],new c,a.is([1],b),b=[],new d,a.is([1,2],b)},function indirectlyDuplicatedBase(a){var b,c=dojo.declare(null,{constructor:function(){b.push(1)}}),d=dojo.declare(c,{constructor:function(){b.push(2)}}),e=dojo.declare([c,d],{constructor:function(){b.push(3)}}),f=dojo.declare([d,c],{constructor:function(){b.push(4)}});b=[],new e,a.is([1,2,3],b),b=[],new f,a.is([1,2,4],b)},function wrongMultipleInheritance(a){var b,c=dojo.declare([],{constructor:function(){b.push(1)}}),d=dojo.declare([c],{constructor:function(){b.push(2)}});b=[],new c,a.is([1],b),b=[],new d,a.is([1,2],b)},function impossibleBases(a){var b=dojo.declare(null),c=dojo.declare(null),d=dojo.declare([b,c]),e=dojo.declare([c,b]),f=!1;try{var g=dojo.declare([d,e])}catch(h){f=!0}a.t(f)},function noNew(a){function d(b){var d=b("instance value");a.is(d.noNew_Value,"instance value"),a.is(c.noNew_Value,"global value")}function b(){this.noNew_Value="instance value"}var c=dojo.global;c.noNew_Value="global value",d(dojo.declare(null,{constructor:b,"-chains-":{constructor:"manual"}}));var e=dojo.declare(null,{constructor:b});d(e),d(dojo.declare(e));var f=dojo.declare(e),g=dojo.declare(null,{ctest:function(){return!0}}),h=dojo.declare([e,f,g],{dtest:function(){return!0}});d(h);var i=h();a.t(i.ctest()),a.t(i.dtest());var j={D:h,noNew_Value:"unchanged"},k=j.D();a.is(k.noNew_Value,"instance value"),a.is(j.noNew_Value,"unchanged")}])