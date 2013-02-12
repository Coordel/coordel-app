window.dojo&&dojo.provide("doh._browserRunner"),function(){doh.setTimeout=function(a,b){return setTimeout(a,b)};try{var topdog=window.parent==window||!Boolean(window.parent.doh)}catch(e){topdog=!0}if(topdog){var byId=function(a){return document.getElementById(a)},_addOnEvt=function(a,b,c){c||(c=window);var d=b;typeof b=="string"&&(d=c[b]);var e=function(){return d.apply(c,arguments)};window.dojo&&a=="load"?dojo.addOnLoad(e):window.attachEvent?window.attachEvent("on"+a,e):window.addEventListener?window.addEventListener(a,e,!1):document.addEventListener&&document.addEventListener(a,e,!1)},escapeXml=function(a){return a.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;")},_logBacklog=[],_loggedMsgLen=0,sendToLogPane=function(a,b){var c="";for(var d=0;d<a.length;d++)c+=" "+a[d];c=escapeXml(c),c=c.replace("\t","&nbsp;&nbsp;&nbsp;&nbsp;").replace(" ","&nbsp;").replace("\n","<br>&nbsp;");if(byId("logBody")){if(_logBacklog.length&&!b){var e;while(e=_logBacklog.shift())sendToLogPane(e,!0)}var f=byId("logBody"),g=document.createElement("div");g.innerHTML=c,f.appendChild(g),_loggedMsgLen++}else _logBacklog.push(c)},findTarget=function(a){while(a&&!a.getAttribute("_target"))a=a.parentNode,a.getAttribute||(a=null);return a};doh._jumpToLog=function(a){var b=findTarget(a?a.target:window.event.srcElement);if(b){var c=Number(b.getAttribute("_target")),d=byId("logBody");if(c>=d.childNodes.length)return;var e=d.childNodes[c];e.scrollIntoView();if(window.dojo){var f=dojo.style(e.parentNode.parentNode,"backgroundColor"),g=dojo.style(b.parentNode,"backgroundColor"),h=dojo.animateProperty({node:e,duration:500,properties:{backgroundColor:{start:g,end:f}},onEnd:function(){e.style.backgroundColor=""}}),i=dojo.animateProperty({node:e,duration:500,properties:{backgroundColor:{start:f,end:g}},onEnd:function(){h.play()}});i.play()}}},doh._jumpToSuite=function(a){var b=findTarget(a?a.target:window.event.srcElement);if(b){var c=b.getAttribute("_target"),d=getGroupNode(c);if(!d)return;d.scrollIntoView()}},doh._init=function(a){return function(){var b=byId("logBody");if(b){while(b.firstChild)b.removeChild(b.firstChild);_loggedMsgLen=0}this._totalTime=0,this._suiteCount=0,a.apply(doh,arguments)}}(doh._init),doh._setupGroupForRun=function(a){return function(b){var c=doh._groups[b];doh._curTestCount=c.length,doh._curGroupCount=1;var d=getGroupNode(b);d&&d.getElementsByTagName("td")[2].setAttribute("_target",_loggedMsgLen+1),a.apply(doh,arguments)}}(doh._setupGroupForRun),doh._report=function(a){return function(){var b=byId("testList");if(b){var c=b.getElementsByTagName("tfoot");c.length&&b.removeChild(c[0]);var d=b.createTFoot(),e=d.insertRow(-1);e.className="inProgress";var f=e.insertCell(-1);f.colSpan=2,f.innerHTML="Result",f=e.insertCell(-1),f.innerHTML=this._testCount+" tests in "+this._groupCount+" groups /<span class='failure'>"+this._errorCount+"</span> errors, <span class='failure'>"+this._failureCount+"</span> failures",f.setAttribute("_target",_loggedMsgLen+1),e.insertCell(-1).innerHTML=doh._totalTime+"ms"}var g=null,h;if(doh.perfTestResults){window.dojo?(dojo.require("dojox.charting.Chart2D"),dojo.require("dojox.charting.DataChart"),dojo.require("dojox.charting.plot2d.Scatter"),dojo.require("dojox.charting.plot2d.Lines"),dojo.require("dojo.data.ItemFileReadStore"),g=doh._dojoPlotPerfResults):g=doh._asciiPlotPerfResults;try{var i,j=byId("perfTestsBody"),k=[];doh.perfTestResults&&doh.showPerfTestsPage();for(i in doh.perfTestResults){var l=doh.perfTestResults[i],m=document.createElement("h1");m.appendChild(document.createTextNode("Group: "+i)),j.appendChild(m);var n=document.createElement("blockquote");j.appendChild(n);var o;for(o in l){var p=l[o];if(!p)continue;var q=document.createElement("h3");q.appendChild(document.createTextNode("TEST: "+o)),q.style.textDecoration="underline",n.appendChild(q);var r=document.createElement("div");n.appendChild(r);var s="<b>TRIAL SIZE: </b>"+p.trials[0].testIterations+" iterations<br><b>NUMBER OF TRIALS: </b>"+p.trials.length+"<br>",t,u=[],v=[];for(t=0;t<p.trials.length;t++)u.push(p.trials[t].average),v.push(p.trials[t].executionTime);s+="<b>AVERAGE TRIAL EXECUTION TIME: </b>"+doh.average(v).toFixed(10)+"ms.<br>",s+="<b>MAXIMUM TEST ITERATION TIME: </b>"+doh.max(u).toFixed(10)+"ms.<br>",s+="<b>MINIMUM TEST ITERATION TIME: </b>"+doh.min(u).toFixed(10)+"ms.<br>",s+="<b>AVERAGE TEST ITERATION TIME: </b>"+doh.average(u).toFixed(10)+"ms.<br>",s+="<b>MEDIAN TEST ITERATION TIME: </b>"+doh.median(u).toFixed(10)+"ms.<br>",s+="<b>VARIANCE TEST ITERATION TIME: </b>"+doh.variance(u).toFixed(10)+"ms.<br>",s+="<b>STANDARD DEVIATION ON TEST ITERATION TIME: </b>"+doh.standardDeviation(u).toFixed(10)+"ms.<br>",r.innerHTML=s,r=document.createElement("div"),r.innerHTML="<h3>Average Test Execution Time (in milliseconds, with median line)</h3>",n.appendChild(r),r=document.createElement("div"),dojo.style(r,"width","600px"),dojo.style(r,"height","250px"),n.appendChild(r),k.push({div:r,title:"Average Test Execution Time",data:u}),r=document.createElement("div"),r.innerHTML="<h3>Average Trial Execution Time (in milliseconds, with median line)</h3>",n.appendChild(r),r=document.createElement("div"),dojo.style(r,"width","600px"),dojo.style(r,"height","250px"),n.appendChild(r),k.push({div:r,title:"Average Trial Execution Time",data:v})}}var w=function(){if(k.length){var a=k.shift();g(a.div,a.title,a.data)}doh.setTimeout(w,50)};doh.setTimeout(w,150)}catch(x){doh.debug(x)}}a.apply(doh,arguments)}}(doh._report),this.opera&&opera.postError?doh.debug=function(){var a="";for(var b=0;b<arguments.length;b++)a+=" "+arguments[b];sendToLogPane([a]),opera.postError("DEBUG:"+a)}:window.console?doh.debug=function(){var a="";for(var b=0;b<arguments.length;b++)a+=" "+arguments[b];sendToLogPane([a]),console.log("DEBUG:"+a)}:doh.debug=function(){sendToLogPane.call(window,arguments)};var loaded=!1,groupTemplate=null,testTemplate=null,groupNodes={},_groupTogglers={},_getGroupToggler=function(a,b){if(_groupTogglers[a])return _groupTogglers[a];var c=!0;return _groupTogglers[a]=function(d,e){var f=groupNodes[a].__items,g;if(c||e){c=!1;for(g=0;g<f.length;g++)f[g].style.display="";b.innerHTML="&#9660;"}else{c=!0;for(g=0;g<f.length;g++)f[g].style.display="none";b.innerHTML="&#9658;"}}},addGroupToList=function(a){if(byId("testList")){var b=byId("testList").tBodies[0],c=groupTemplate.cloneNode(!0),d=c.getElementsByTagName("td"),e=d[0];e.onclick=_getGroupToggler(a,e);var f=d[1].getElementsByTagName("input")[0];f.group=a,f.onclick=function(b){doh._groups[a].skip=!this.checked},d[2].innerHTML="<div class='testGroupName'>"+a+"</div><div style='width:0;'>&nbsp;</div>",d[3].innerHTML="",b.appendChild(c);return c}},addFixtureToList=function(a,b){if(testTemplate){var c=groupNodes[a];c.__items||(c.__items=[]);var d=testTemplate.cloneNode(!0),e=d.getElementsByTagName("td");e[2].innerHTML=b.name,e[3].innerHTML="";var f=(c.__lastFixture||c.__groupNode).nextSibling;f?f.parentNode.insertBefore(d,f):c.__groupNode.parentNode.appendChild(d),d.style.display="none",c.__items.push(d);return c.__lastFixture=d}},getFixtureNode=function(a,b){if(groupNodes[a])return groupNodes[a][b.name];return null},getGroupNode=function(a){if(groupNodes[a])return groupNodes[a].__groupNode;return null},updateBacklog=[];doh._updateTestList=function(a,b,c){if(loaded){if(updateBacklog.length&&!c){var d;while(d=updateBacklog.shift())doh._updateTestList(d[0],d[1],!0)}a&&b&&(groupNodes[a]||(groupNodes[a]={__groupNode:addGroupToList(a)}),groupNodes[a][b.name]||(groupNodes[a][b.name]=addFixtureToList(a,b)))}else a&&b&&updateBacklog.push([a,b])},doh._testRegistered=doh._updateTestList,doh._groupStarted=function(a){this._suiteCount==0&&(this._runedSuite=0,this._currentGlobalProgressBarWidth=0,this._suiteCount=this._testCount),doh._inGroup!=a&&(doh._groupTotalTime=0,doh._runed=0,doh._inGroup=a,this._runedSuite++);var b=getGroupNode(a);b&&(b.className="inProgress")},doh._groupFinished=function(a,b){var c=getGroupNode(a);if(c&&doh._inGroup==a){doh._totalTime+=doh._groupTotalTime,c.getElementsByTagName("td")[3].innerHTML=doh._groupTotalTime+"ms",c.getElementsByTagName("td")[2].lastChild.className="",doh._inGroup=null;var d=doh._updateGlobalProgressBar(this._runedSuite/this._groupCount,b,a);c.className=d?"failure":"success",doh._currentGlobalProgressBarWidth=parseInt(this._runedSuite/this._groupCount*1e4)/100}doh._inGroup==a&&this.debug('Total time for GROUP "',a,'" is ',doh._groupTotalTime,"ms")},doh._testStarted=function(a,b){var c=getFixtureNode(a,b);c&&(c.className="inProgress")};var _nameTimes={},_playSound=function(a){if(byId("hiddenAudio")&&byId("audio")&&byId("audio").checked){var b=_nameTimes[a];if(!b||new Date-b>700){_nameTimes[a]=new Date;var c=document.createElement("span");byId("hiddenAudio").appendChild(c),c.innerHTML='<embed src="_sounds/'+a+'.wav" autostart="true" loop="false" hidden="true" width="1" height="1"></embed>'}}};doh._updateGlobalProgressBar=function(a,b,c){var d=byId("progressOuter"),e=d.childNodes[doh._runedSuite-1];e||(e=document.createElement("div"),d.appendChild(e),e.className="success",e.setAttribute("_target",c)),!b&&!e._failure&&(e._failure=!0,e.className="failure",c&&e.setAttribute("title","failed group "+c));var f=parseInt(a*1e4)/100;e.style.width=f-doh._currentGlobalProgressBarWidth+"%";return e._failure},doh._testFinished=function(a,b,c){var d=getFixtureNode(a,b),e=b.endTime-b.startTime;if(d){d.getElementsByTagName("td")[3].innerHTML=e+"ms",d.className=c?"success":"failure",d.getElementsByTagName("td")[2].setAttribute("_target",_loggedMsgLen);if(!c){_playSound("doh");var f=getGroupNode(a);f&&(f.className="failure",_getGroupToggler(a)(null,!0))}}if(doh._inGroup==a){var f=getGroupNode(a);doh._runed++;if(f&&doh._curTestCount){var g=doh._runed/doh._curTestCount,h=this._updateGlobalProgressBar((doh._runedSuite+g-1)/doh._groupCount,c,a),i=f.getElementsByTagName("td")[2].lastChild;i.className=h?"failure":"success",i.style.width=parseInt(g*100)+"%",f.getElementsByTagName("td")[3].innerHTML=parseInt(g*1e4)/100+"%"}}this._groupTotalTime+=e,this.debug(c?"PASSED":"FAILED","test:",b.name,e,"ms")},doh.registerUrl=function(a,b,c){var d=new String(a);this.register(a,{name:b,setUp:function(){doh.currentGroupName=d,doh.currentGroup=this,doh.currentUrl=b,this.d=new doh.Deferred,doh.currentTestDeferred=this.d,doh.showTestPage(),byId("testBody").src=b},timeout:c||1e4,runTest:function(){return this.d},tearDown:function(){doh.currentGroupName=null,doh.currentGroup=null,doh.currentTestDeferred=null,doh.currentUrl=null,doh.showLogPage()}})};var tabzidx=1,_showTab=function(toShow,toHide){var i;for(i=0;i<toHide.length;i++){var node=byId(toHide[i]);node&&(node.style.display="none")}toShow=byId(toShow);if(toShow)with(toShow.style)display="",zIndex=++tabzidx};doh.showTestPage=function(){_showTab("testBody",["logBody","perfTestsBody"])},doh.showLogPage=function(){_showTab("logBody",["testBody","perfTestsBody"])},doh.showPerfTestsPage=function(){_showTab("perfTestsBody",["testBody","logBody"])};var runAll=!0;doh.toggleRunAll=function(){runAll=!runAll;if(byId("testList")){var a=byId("testList").tBodies[0],b=a.getElementsByTagName("input"),c=0,d;while(d=b[c++])d.checked=runAll,doh._groups[d.group].skip=!runAll}};var listHeightTimer=null,setListHeight=function(){listHeightTimer&&clearTimeout(listHeightTimer);var a=byId("testList");a&&(listHeightTimer=doh.setTimeout(function(){a.style.display="none",a.style.display=""},10))};_addOnEvt("resize",setListHeight),_addOnEvt("load",setListHeight),_addOnEvt("load",function(){if(!loaded){loaded=!0,groupTemplate=byId("groupTemplate");if(!groupTemplate)return;groupTemplate.parentNode.removeChild(groupTemplate),groupTemplate.style.display="",testTemplate=byId("testTemplate"),testTemplate.parentNode.removeChild(testTemplate),testTemplate.style.display="",doh._updateTestList()}}),_addOnEvt("load",function(){var a=doh._onEnd;doh._onEnd=function(){a.apply(doh,arguments),doh._failureCount==0?(doh.debug("WOOHOO!!"),_playSound("woohoo")):console.debug("doh._failureCount:",doh._failureCount),byId("play")&&c()};if(byId("play")){var b=!1,c=function(){b?(byId("play").style.display=byId("pausedMsg").style.display="",byId("playingMsg").style.display=byId("pause").style.display="none",b=!1):(byId("play").style.display=byId("pausedMsg").style.display="none",byId("playingMsg").style.display=byId("pause").style.display="",b=!0)};doh.run=function(a){return function(){doh._currentGroup||c();return a.apply(doh,arguments)}}(doh.run);var d=byId("toggleButtons").getElementsByTagName("span"),e,f=0;while(e=d[f++])e.onclick=c;doh._dojoPlotPerfResults=function(a,b,c){var d=doh.median(c),e=[],f;for(f=0;f<c.length;f++)e.push(d);var g={label:"name",items:[{name:b,trials:c},{name:"Median",trials:e}]},h=new dojo.data.ItemFileReadStore({data:g}),i=Math.floor(doh.min(c)),j=Math.ceil(doh.max(c)),k=(j-i)/10;i>0&&(i=i-k,i<0&&(i=0),i=Math.floor(i)),j>0&&(j=j+k,j=Math.ceil(j)),k=(j-i)/10;var l=new dojox.charting.DataChart(a,{type:dojox.charting.plot2d.Lines,displayRange:c.length,xaxis:{min:1,max:c.length,majorTickStep:Math.ceil((c.length-1)/10),htmlLabels:!1},yaxis:{min:i,max:j,majorTickStep:k,vertical:!0,htmlLabels:!1}});l.setStore(h,{name:"*"},"trials")},doh._asciiPlotPerfResults=function(){}}})}else{_doh=window.parent.doh;var _thisGroup=_doh.currentGroupName,_thisUrl=_doh.currentUrl;if(_thisGroup){doh._testRegistered=function(a,b){_doh._updateTestList(_thisGroup,b)},doh._onEnd=function(){_doh._errorCount+=doh._errorCount,_doh._failureCount+=doh._failureCount,_doh._testCount+=doh._testCount,_doh.currentTestDeferred.callback(!0)};var otr=doh._getTestObj;doh._getTestObj=function(){var a=otr.apply(doh,arguments);a.name=_thisUrl+"::"+arguments[0]+"::"+a.name;return a},doh.debug=doh.hitch(_doh,"debug"),doh.registerUrl=doh.hitch(_doh,"registerUrl"),doh._testStarted=function(a,b){_doh._testStarted(_thisGroup,b)},doh._testFinished=function(a,b,c){_doh._testFinished(_thisGroup,b,c);if(doh.perfTestResults)try{gName=a.toString();var d=b.name;while(d.indexOf("::")>=0)d=d.substring(d.indexOf("::")+2,d.length);_doh.perfTestResults||(_doh.perfTestResults={}),_doh.perfTestResults[gName]||(_doh.perfTestResults[gName]={}),_doh.perfTestResults[gName][b.name]=doh.perfTestResults[gName][d]}catch(e){doh.debug(e)}},doh._groupStarted=function(a){this._setParent||(_doh._curTestCount=this._testCount,_doh._curGroupCount=this._groupCount,this._setParent=!0)},doh._report=function(){}}}}()