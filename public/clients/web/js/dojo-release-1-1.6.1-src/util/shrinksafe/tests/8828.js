var result=[],string_tests;(function(){var a="c";result.push("ab","a"+a);var b="+";result.push(b);var c="red",d="TheQuick"+c+"Fox";result.push(d);var e=4,f="thisisatestspanning"+e+"lines";result.push(f);var g="bar",h="bar",i=g,j="testingmultiplelines",k=["testing","test"+g+"simple","testingcombined"+h+"variables",'test "+weird syntax',"testbasic",'test "mixed"',j,'test "mixed" andmunge',"test","tes"+i+"t",'"slightly"+"off"',!"a"+"b",!"a"+"b",!"a"+"b"];string_tests=function(){return k}})()