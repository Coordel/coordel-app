define(["logger"],function(a){function e(a,c){return b.invoke(null,[a,c])}Array.prototype.reduce||(Array.prototype.reduce=function(a){var b=0,c=this.length,d;if(arguments.length<2){do if(b in this){d=this[b++];break}while(!0)}else d=arguments[1];for(;b<c;b++)b in this&&(d=a.call(undefined,d,this[b],b,this));return d});var b,c;try{b=java.lang.Class.forName("com.google.javascript.jscomp.JSSourceFile").getMethod("fromCode",[java.lang.String,java.lang.String])}catch(d){}c={closure:function(b,c,d,f){f=f||{};var g=Packages.com.google.javascript.jscomp,h=Packages.com.google.common.flags,i=e("fakeextern.js"," "),j=e(String(b),String(c)),k,l,m,n,o=Packages.com.google.javascript.jscomp.Compiler;a.trace("Minifying file: "+b),k=new g.CompilerOptions;for(l in f.CompilerOptions)f.CompilerOptions[l]&&(k[l]=f.CompilerOptions[l]);k.prettyPrint=d||k.prettyPrint,m=h.Flag.value(g.CompilationLevel[f.CompilationLevel||"SIMPLE_OPTIMIZATIONS"]),m.get().setOptionsForCompilationLevel(k),o.setLoggingLevel(Packages.java.util.logging.Level[f.loggingLevel||"WARNING"]),n=new o,n.compile(i,j,k);return n.toSource()}};return c})