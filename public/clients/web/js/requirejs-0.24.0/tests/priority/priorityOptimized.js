function verifyFunc(){var a=/alpha|beta|gamma|theta|three|alphaPrime|betaPrime/,b,c=document.getElementsByTagName("script");for(b=c.length-1;b>-1;b--)doh.f(a.test(c[b].src));master.callback(!0)}var master=new doh.Deferred,count=0;doh.register("priorityOptimized",[{name:"priorityOptimized",timeout:5e3,runTest:function(){return master}}]),doh.run(),require.def("alphaPrime",function(){return{name:"alphaPrime"}}),require.def("betaPrime",["alphaPrime"],function(a){return{name:"betaPrime",alphaPrimeName:a.name}}),define("three",function(){}),require({baseUrl:"./",priority:["one","two","three"]},["alpha","beta","gamma","epsilon","alphaPrime","betaPrime"],function(a,b,c,d,e,f){count+=1,doh.is(1,count),doh.is("alpha",a.name),doh.is("beta",a.betaName),doh.is("beta",b.name),doh.is("gamma",b.gammaName),doh.is("gamma",c.name),doh.is("theta",c.thetaName),doh.is("epsilon",c.epsilonName),doh.is("epsilon",d.name),doh.is("alphaPrime",e.name),doh.is("alphaPrime",f.alphaPrimeName),doh.is("betaPrime",f.name)}),require.ready?require.ready(verifyFunc):setTimeout(verifyFunc,3e3)