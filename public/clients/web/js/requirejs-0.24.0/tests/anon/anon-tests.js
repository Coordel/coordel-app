require({baseUrl:require.isBrowser?"./":"./anon/",paths:{text:"../../text",i18n:"../../i18n"}},["require","magenta","red","blue","green","yellow","a","c"],function(a,b,c,d,e,f,g,h){doh.register("anonSimple",[function i(i){i.is("redblue",b.name),i.is(a.isBrowser?"foo.html":"anon/foo.html",b.path),i.is("red",c.name),i.is("blue",d.name),i.is("green",e.name),i.is("yellow",f.name),i.is("a",g.name),i.is("sub/b",g.bName),i.is("c",h.name),i.is("a",h.aName)}]),doh.run();var j=function(){a(["blue","red","magenta"],function(a,c){doh.register("anonSimpleCached",[function d(d){d.is("red",c.name),d.is("blue",a.name),d.is("redblue",b.name),d.is("hello world",b.message)}]),doh.run()})};a.isBrowser?a.ready(function(){setTimeout(j,100)}):j()})