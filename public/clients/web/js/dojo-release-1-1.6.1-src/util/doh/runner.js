(function(scriptArgs){var d=function(doh){doh.selfTest=!1,doh.global=this,doh.hitch=function(a,b){var c=[];for(var d=2;d<arguments.length;d++)c.push(arguments[d]);var e=(typeof b=="string"?a[b]:b)||function(){};return function(){var b=c.concat([]);for(var d=0;d<arguments.length;d++)b.push(arguments[d]);return e.apply(a,b)}},doh._mixin=function(a,b){var c={};for(var d in b)if(c[d]===undefined||c[d]!=b[d])a[d]=b[d];this.document&&document.all&&typeof b.toString=="function"&&b.toString!=a.toString&&b.toString!=c.toString&&(a.toString=b.toString);return a},doh.mixin=function(a,b){for(var c=1,d=arguments.length;c<d;c++)doh._mixin(a,arguments[c]);return a},doh.extend=function(a,b){for(var c=1,d=arguments.length;c<d;c++)doh._mixin(a.prototype,arguments[c]);return a},doh._line="------------------------------------------------------------",doh.debug=function(){},doh.error=function(){},doh._AssertFailure=function(a,b){if(!(this instanceof doh._AssertFailure))return new doh._AssertFailure(a,b);b&&(a=new String(a||"")+" with hint: \n\t\t"+(new String(b)+"\n")),this.message=new String(a||"");return this},doh._AssertFailure.prototype=new Error,doh._AssertFailure.prototype.constructor=doh._AssertFailure,doh._AssertFailure.prototype.name="doh._AssertFailure",doh.Deferred=function(a){this.chain=[],this.id=this._nextId(),this.fired=-1,this.paused=0,this.results=[null,null],this.canceller=a,this.silentlyCancelled=!1},doh.extend(doh.Deferred,{getTestErrback:function(a,b){var c=this;return function(){try{a.apply(b||doh.global||c,arguments)}catch(d){c.errback(d)}}},getTestCallback:function(a,b){var c=this;return function(){try{a.apply(b||doh.global||c,arguments)}catch(d){c.errback(d);return}c.callback(!0)}},getFunctionFromArgs:function(){var a=arguments;if(a[0]&&!a[1]){if(typeof a[0]=="function")return a[0];if(typeof a[0]=="string")return doh.global[a[0]]}else if(a[0]&&a[1])return doh.hitch(a[0],a[1]);return null},makeCalled:function(){var a=new doh.Deferred;a.callback();return a},_nextId:function(){var a=1;return function(){return a++}}(),cancel:function(){this.fired==-1?(this.canceller?this.canceller(this):this.silentlyCancelled=!0,this.fired==-1&&this.errback(new Error("Deferred(unfired)"))):this.fired==0&&this.results[0]&&this.results[0].cancel&&this.results[0].cancel()},_pause:function(){this.paused++},_unpause:function(){this.paused--,this.paused==0&&this.fired>=0&&this._fire()},_continue:function(a){this._resback(a),this._unpause()},_resback:function(a){this.fired=a instanceof Error?1:0,this.results[this.fired]=a,this._fire()},_check:function(){if(this.fired!=-1){if(!this.silentlyCancelled)throw new Error("already called!");this.silentlyCancelled=!1}},callback:function(a){this._check(),this._resback(a)},errback:function(a){this._check(),a instanceof Error||(a=new Error(a)),this._resback(a)},addBoth:function(a,b){var c=this.getFunctionFromArgs(a,b);arguments.length>2&&(c=doh.hitch(null,c,arguments,2));return this.addCallbacks(c,c)},addCallback:function(a,b){var c=this.getFunctionFromArgs(a,b);arguments.length>2&&(c=doh.hitch(null,c,arguments,2));return this.addCallbacks(c,null)},addErrback:function(a,b){var c=this.getFunctionFromArgs(a,b);arguments.length>2&&(c=doh.hitch(null,c,arguments,2));return this.addCallbacks(null,c)},addCallbacks:function(a,b){this.chain.push([a,b]),this.fired>=0&&this._fire();return this},_fire:function(){var a=this.chain,b=this.fired,c=this.results[b],d=this,e=null;while(a.length>0&&this.paused==0){var f=a.shift(),g=f[b];if(g==null)continue;try{c=g(c),b=c instanceof Error?1:0,c&&c.addCallback&&(e=function(a){d._continue(a)},this._pause())}catch(h){b=1,c=h}}this.fired=b,this.results[b]=c,e&&this.paused&&c.addBoth(e)}}),doh._testCount=0,doh._groupCount=0,doh._errorCount=0,doh._failureCount=0,doh._currentGroup=null,doh._currentTest=null,doh._paused=!0,doh._init=function(){this._currentGroup=null,this._currentTest=null,this._errorCount=0,this._failureCount=0,this.debug(this._testCount,"tests to run in",this._groupCount,"groups")},doh._groups={},doh.registerTestNs=function(a,b){for(var c in b)c.charAt(0)!="_"&&typeof b[c]=="function"&&this.registerTest(a,b[c])},doh._testRegistered=function(a,b){},doh._groupStarted=function(a){},doh._groupFinished=function(a,b){},doh._testStarted=function(a,b){},doh._testFinished=function(a,b,c){},doh.registerGroup=function(a,b,c,d,e){b&&this.register(a,b,e),c&&(this._groups[a].setUp=c),d&&(this._groups[a].tearDown=d)},doh._getTestObj=function(a,b,c){var d=b;if(typeof b=="string"){if(b.substr(0,4)=="url:")return this.registerUrl(a,b);d={name:b.replace("/s/g","_")},d.runTest=new Function("t",b)}else if(typeof b=="function"){d={runTest:b};if(b.name)d.name=b.name;else try{var e="function ",f=d.runTest+"";0<=f.indexOf(e)&&(d.name=f.split(e)[1].split("(",1)[0])}catch(g){}}if(c==="perf"||d.testType==="perf")d.testType="perf",doh.perfTestResults||(doh.perfTestResults={},doh.perfTestResults[a]={}),doh.perfTestResults[a]||(doh.perfTestResults[a]={}),doh.perfTestResults[a][d.name]||(doh.perfTestResults[a][d.name]={}),d.results=doh.perfTestResults[a][d.name],"trialDuration"in d||(d.trialDuration=100),"trialDelay"in d||(d.trialDelay=100),"trialIterations"in d||(d.trialIterations=10);return d},doh.registerTest=function(a,b,c){this._groups[a]||(this._groupCount++,this._groups[a]=[],this._groups[a].inFlight=0);var d=this._getTestObj(a,b,c);if(!d)return null;this._groups[a].push(d),this._testCount++,this._testRegistered(a,d);return d},doh.registerTests=function(a,b,c){for(var d=0;d<b.length;d++)this.registerTest(a,b[d],c)},doh.registerUrl=function(a,b,c,d){this.debug("ERROR:"),this.debug("\tNO registerUrl() METHOD AVAILABLE.")},doh.registerString=function(a,b,c){},doh.register=doh.add=function(a,b,c){arguments.length==1&&typeof a=="string"&&(a.substr(0,4)=="url:"?this.registerUrl(a,null,null,c):this.registerTest("ungrouped",a,c));if(arguments.length==1)this.debug("invalid args passed to doh.register():",a,",",b);else{if(typeof b=="string"){b.substr(0,4)=="url:"?this.registerUrl(b,null,null,c):this.registerTest(a,b,c);return}if(doh._isArray(b)){this.registerTests(a,b,c);return}this.registerTest(a,b,c)}},doh.registerDocTests=function(a){this.debug("registerDocTests() requires dojo to be loaded into the environment. Skipping doctest set for module:",a)},function(){if(typeof dojo!="undefined"){try{dojo.require("dojox.testing.DocTest")}catch(a){console.debug(a),doh.registerDocTests=function(){};return}doh.registerDocTests=function(a){var b=new dojox.testing.DocTest,c=b.getTests(a),d=c.length,e=[];for(var f=0;f<d;f++){var g=c[f],h="";if(g.commands.length&&g.commands[0].indexOf("//")!=-1){var i=g.commands[0].split("//");h=", "+i[i.length-1]}e.push({runTest:function(a){return function(c){var d=b.runTest(a.commands,a.expectedResult);c.assertTrue(d.success)}}(g),name:"Line "+g.line+h})}this.register("DocTests: "+a,e)}}}(),doh.t=doh.assertTrue=function(condition,hint){if(arguments.length<1)throw new doh._AssertFailure("assertTrue failed because it was not passed at least 1 argument");if(!eval(condition))throw new doh._AssertFailure("assertTrue('"+condition+"') failed",hint)},doh.f=doh.assertFalse=function(condition,hint){if(arguments.length<1)throw new doh._AssertFailure("assertFalse failed because it was not passed at least 1 argument");if(eval(condition))throw new doh._AssertFailure("assertFalse('"+condition+"') failed",hint)},doh.e=doh.assertError=function(a,b,c,d,e){try{b[c].apply(b,d)}catch(f){if(f instanceof a)return!0;throw new doh._AssertFailure("assertError() failed:\n\texpected error\n\t\t"+a+"\n\tbut got\n\t\t"+f+"\n\n",e)}throw new doh._AssertFailure("assertError() failed:\n\texpected error\n\t\t"+a+"\n\tbut no error caught\n\n",e)},doh.is=doh.assertEqual=function(a,b,c){if(a===undefined&&b===undefined)return!0;if(arguments.length<2)throw doh._AssertFailure("assertEqual failed because it was not passed 2 arguments");if(a===b||a==b||typeof a=="number"&&typeof b=="number"&&isNaN(a)&&isNaN(b))return!0;if(this._isArray(a)&&this._isArray(b)&&this._arrayEq(a,b))return!0;if(typeof a=="object"&&typeof b=="object"&&this._objPropEq(a,b))return!0;throw new doh._AssertFailure("assertEqual() failed:\n\texpected\n\t\t"+a+"\n\tbut got\n\t\t"+b+"\n\n",c)},doh.isNot=doh.assertNotEqual=function(a,b,c){if(a===undefined&&b===undefined)throw new doh._AssertFailure("assertNotEqual() failed: not expected |"+a+"| but got |"+b+"|",c);if(arguments.length<2)throw doh._AssertFailure("assertEqual failed because it was not passed 2 arguments");if(a===b||a==b)throw new doh._AssertFailure("assertNotEqual() failed: not expected |"+a+"| but got |"+b+"|",c);if(this._isArray(a)&&this._isArray(b)&&this._arrayEq(a,b))throw new doh._AssertFailure("assertNotEqual() failed: not expected |"+a+"| but got |"+b+"|",c);if(typeof a=="object"&&typeof b=="object"){var d=!1;try{d=this._objPropEq(a,b)}catch(e){if(!(e instanceof doh._AssertFailure))throw e}if(d)throw new doh._AssertFailure("assertNotEqual() failed: not expected |"+a+"| but got |"+b+"|",c)}return!0},doh._arrayEq=function(a,b){if(a.length!=b.length)return!1;for(var c=0;c<a.length;c++)if(!doh.assertEqual(a[c],b[c]))return!1;return!0},doh._objPropEq=function(a,b){if(a===null&&b===null)return!0;if(a===null||b===null)return!1;if(a instanceof Date)return b instanceof Date&&a.getTime()==b.getTime();var c;for(c in b)if(a[c]===undefined)return!1;for(c in a)if(!doh.assertEqual(a[c],b[c]))return!1;return!0},doh._isArray=function(a){return a&&a instanceof Array||typeof a=="array"||!!doh.global.dojo&&doh.global.dojo.NodeList!==undefined&&a instanceof doh.global.dojo.NodeList},doh._setupGroupForRun=function(a,b){var c=this._groups[a];this.debug(this._line),this.debug("GROUP",'"'+a+'"',"has",c.length,"test"+(c.length>1?"s":"")+" to run")},doh._handleFailure=function(a,b,c){this._groups[a].failures++;var d="";c instanceof this._AssertFailure?(this._failureCount++,c.fileName&&(d+=c.fileName+":"),c.lineNumber&&(d+=c.lineNumber+" "),d+=c+": "+c.message,this.debug("\t_AssertFailure:",d)):this._errorCount++,this.error(c);if(b.runTest.toSource){var e=b.runTest.toSource();this.debug("\tERROR IN:\n\t\t",e)}else this.debug("\tERROR IN:\n\t\t",b.runTest);c.rhinoException?c.rhinoException.printStackTrace():c.javaException&&c.javaException.printStackTrace()};try{setTimeout(function(){},0)}catch(e){setTimeout=function(a){return a()}}doh._runPerfFixture=function(a,b){var c=this._groups[a];b.startTime=new Date;var d=new doh.Deferred;c.inFlight++,d.groupName=a,d.fixture=b,d.addErrback(function(c){doh._handleFailure(a,b,c)});var e=function(){b.tearDown&&b.tearDown(doh),c.inFlight--,!c.inFlight&&c.iterated&&doh._groupFinished(a,!c.failures),doh._testFinished(a,b,d.results[0]),doh._paused&&doh.run()},f,g=b.timeout;g>0&&(f=setTimeout(function(){d.errback(new Error("test timeout in "+b.name.toString()))},g)),d.addBoth(function(a){f&&clearTimeout(f),e()});var h=b.results;h.trials=[];var i=doh._calcTrialIterations(a,b);i.addErrback(function(a){b.endTime=new Date,d.errback(a)}),i.addCallback(function(c){if(c){var e=b.trialIterations;doh.debug("TIMING TEST: ["+b.name+"]\n\t\tITERATIONS PER TRIAL: "+c+"\n\tTRIALS: "+e);var f=function(){var g=new Date,i=new doh.Deferred,j=c,k={countdown:c},l=function(c){while(c)try{c.countdown--;if(c.countdown){var e=b.runTest(doh);if(e&&e.addCallback){var f={countdown:c.countdown};e.addCallback(function(){l(f)}),e.addErrback(function(c){doh._handleFailure(a,b,c),b.endTime=new Date,d.errback(c)}),c=null}}else i.callback(new Date),c=null}catch(g){b.endTime=new Date,i.errback(g)}};i.addCallback(function(a){var i={trial:b.trialIterations-e,testIterations:c,executionTime:a.getTime()-g.getTime(),average:(a.getTime()-g.getTime())/c};h.trials.push(i),doh.debug("\n\t\tTRIAL #: "+i.trial+"\n\tTIME: "+i.executionTime+"ms.\n\tAVG TEST TIME: "+i.executionTime/i.testIterations+"ms."),e--;if(e)setTimeout(f,b.trialDelay);else{var j=h.trials;b.endTime=new Date,d.callback(!0)}}),i.addErrback(function(a){b.endTime=new Date,d.errback(a)}),l(k)};f()}}),d.fired<0&&doh.pause();return d},doh._calcTrialIterations=function(a,b){var c=new doh.Deferred,d=function(){var a=doh.hitch(b,b.runTest),d={start:new Date,curIter:0,iterations:5},e=function(d){while(d)if(d.curIter<d.iterations)try{var f=a(doh);if(f&&f.addCallback){var g={start:d.start,curIter:d.curIter+1,iterations:d.iterations};f.addCallback(function(){e(g)}),f.addErrback(function(a){b.endTime=new Date,c.errback(a)}),d=null}else d.curIter++}catch(h){b.endTime=new Date,c.errback(h);return}else{var i=new Date,j=i.getTime()-d.start.getTime();if(j<b.trialDuration){var k={iterations:d.iterations*2,curIter:0};d=null,setTimeout(function(){k.start=new Date,e(k)},50)}else{var l=d.iterations;setTimeout(function(){c.callback(l)},50),d=null}}};e(d)};setTimeout(d,10);return c},doh._runRegFixture=function(a,b){var c=this._groups[a];b.startTime=new Date;var d=b.runTest(this);b.endTime=new Date;if(d&&d.addCallback){c.inFlight++,d.groupName=a,d.fixture=b,d.addErrback(function(c){doh._handleFailure(a,b,c)});var e=function(){b.tearDown&&b.tearDown(doh),c.inFlight--,!c.inFlight&&c.iterated&&doh._groupFinished(a,!c.failures),doh._testFinished(a,b,d.results[0]),doh._paused&&doh.run()},f=function(){b.endTime=new Date,d.errback(new Error("test timeout in "+b.name.toString()))},g=setTimeout(function(){f()},b.timeout||1e3);d.addBoth(function(a){f=function(){},clearTimeout(g),b.endTime=new Date,e()}),d.fired<0&&doh.pause();return d}},doh._runFixture=function(a,b){var c=this._groups[a];this._testStarted(a,b);var d=!1,e=null;try{b.group=c,b.setUp&&b.setUp(this);if(b.runTest){if(b.testType==="perf")return doh._runPerfFixture(a,b);var f=doh._runRegFixture(a,b);if(f)return f}b.tearDown&&b.tearDown(this)}catch(g){d=!0,e=g,b.endTime||(b.endTime=new Date)}var h=new doh.Deferred;setTimeout(this.hitch(this,function(){d&&this._handleFailure(a,b,e),this._testFinished(a,b,!d),!c.inFlight&&c.iterated?doh._groupFinished(a,!c.failures):c.inFlight>0&&(setTimeout(this.hitch(this,function(){doh.runGroup(a)}),100),this._paused=!0),doh._paused&&doh.run()}),30),doh.pause();return h},doh._testId=0,doh.runGroup=function(a,b){var c=this._groups[a];if(c.skip!==!0)if(this._isArray(c)){if(b<=c.length)if(!c.inFlight&&c.iterated==!0){c.tearDown&&c.tearDown(this),doh._groupFinished(a,!c.failures);return}b||(c.inFlight=0,c.iterated=!1,c.failures=0),doh._groupStarted(a),b||(this._setupGroupForRun(a,b),c.setUp&&c.setUp(this));for(var d=b||0;d<c.length;d++){if(this._paused){this._currentTest=d;return}doh._runFixture(a,c[d]);if(this._paused){this._currentTest=d+1,this._currentTest==c.length&&(c.iterated=!0);return}}c.iterated=!0,c.inFlight||(c.tearDown&&c.tearDown(this),doh._groupFinished(a,!c.failures))}},doh._onEnd=function(){},doh._report=function(){this.debug(this._line),this.debug("| TEST SUMMARY:"),this.debug(this._line),this.debug("\t",this._testCount,"tests in",this._groupCount,"groups"),this.debug("\t",this._errorCount,"errors"),this.debug("\t",this._failureCount,"failures")},doh.togglePaused=function(){this[this._paused?"run":"pause"]()},doh.pause=function(){this._paused=!0},doh.run=function(){this._paused=!1;var a=this._currentGroup,b=this._currentTest,c=!1;a||(this._init(),c=!0),this._currentGroup=null,this._currentTest=null;for(var d in this._groups)if(!c&&d==a||c){if(this._paused)return;this._currentGroup=d,c?this.runGroup(d):(c=!0,this.runGroup(d,b));if(this._paused)return}this._currentGroup=null,this._currentTest=null,this._paused=!1,this._onEnd(),this._report()},doh.standardDeviation=function(a){return Math.sqrt(this.variance(a))},doh.variance=function(a){var b=0,c=0;dojo.forEach(a,function(a){b+=a,c+=Math.pow(a,2)});return c/a.length-Math.pow(b/a.length,2)},doh.mean=function(a){var b=0;dojo.forEach(a,function(a){b+=a});return b/Math.max(a.length,1)},doh.min=function(a){return Math.min.apply(null,a)},doh.max=function(a){return Math.max.apply(null,a)},doh.median=function(a){return a.slice(0).sort()[Math.ceil(a.length/2)-1]},doh.mode=function(a){var b={},c=0,d=Number.MIN_VALUE;dojo.forEach(a,function(a){b[a]!==undefined?b[a]++:b[a]=1});for(var e in b)d<b[e]&&(d=b[e],c=e);return c},doh.average=function(a){var b,c=0;for(b=0;b<a.length;b++)c+=a[b];return c/a.length},tests=doh,function(){var a;try{if(typeof dojo!="undefined"){dojo.require(dojo.isBrowser?"doh._browserRunner":"doh._rhinoRunner");try{var b=dojo.isBrowser?dojo.global==dojo.global.parent||!Boolean(dojo.global.parent.doh):!0}catch(c){b=!0}b&&dojo.isBrowser&&dojo.addOnLoad(function(){dojo.global.registerModulePath&&dojo.forEach(dojo.global.registerModulePath,function(a){dojo.registerModulePath(a[0],a[1])})})}else{if(typeof load=="function")throw new Error;if(typeof define!="function"||define.vendor=="dojotoolkit.org")if(this.document){var d=document.getElementsByTagName("script"),e;for(a=0;a<d.length;a++){var f=d[a].src;if(f)if(e||f.substr(f.length-9)!="runner.js"){if(f.substr(f.length-17)=="_browserRunner.js"){e=null;break}}else e=f}e&&document.write("<script src='"+e.substr(0,e.length-9)+"_browserRunner.js' type='text/javascript'></script>")}}}catch(c){print("\n"+doh._line),print("The Dojo Unit Test Harness, $Rev: 24146 $"),print("Copyright (c) 2011, The Dojo Foundation, All Rights Reserved"),print(doh._line,"\n");try{var g="../../dojo/dojo.js",h="",i="dojo.tests.module",j="";for(a=0;a<scriptArgs.length;a++)if(scriptArgs[a].indexOf("=")>0){var k=scriptArgs[a].split("=");k[0]=="dohBase"&&(j=k[1],j=j.replace(/\\/g,"/"),j.charAt(j.length-1)!="/"&&(j+="/")),k[0]=="dojoUrl"&&(g=k[1]),k[0]=="testUrl"&&(h=k[1]),k[0]=="testModule"&&(i=k[1])}load(j+"_rhinoRunner.js"),g.length&&(this.djConfig||(djConfig={}),djConfig.baseUrl=g.split("dojo.js")[0],load(g)),h.length&&load(h),i.length&&dojo.forEach(i.split(","),dojo.require,dojo)}catch(c){print("An exception occurred: "+c)}doh.run()}}.apply(this,[]);return doh};typeof doh=="undefined"&&(doh={}),typeof define=="undefined"||define.vendor=="dojotoolkit.org"?(typeof dojo!=="undefined"&&dojo.provide("doh.runner"),d(doh)):doh.runnerFactory=d}).call(null,typeof arguments=="undefined"?[]:Array.prototype.slice.call(arguments))