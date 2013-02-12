define("dojo/io/iframe",["dojo"],function(a){a.getObject("io",!0,a),a.io.iframe={create:function(b,c,d){if(window[b])return window[b];if(window.frames[b])return window.frames[b];var e=null,f=d;f||(a.config.useXDomain&&!a.config.dojoBlankHtmlUrl&&console.warn("dojo.io.iframe.create: When using cross-domain Dojo builds, please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl to the path on your domain to blank.html"),f=a.config.dojoBlankHtmlUrl||a.moduleUrl("dojo","resources/blank.html"));var e=a.place('<iframe id="'+b+'" name="'+b+'" src="'+f+'" onload="'+c+'" style="position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden">',a.body());window[b]=e;return e},setSrc:function(b,c,d){try{if(d){var e;a.isIE||a.isWebKit?e=b.contentWindow.document:e=b.contentWindow;if(e)e.location.replace(c);else{b.location=c;return}}else a.isWebKit?b.location=c:frames[b.name].location=c}catch(f){console.log("dojo.io.iframe.setSrc: ",f)}},doc:function(b){var c=b.contentDocument||b.name&&b.document&&a.doc.getElementsByTagName("iframe")[b.name].contentWindow&&a.doc.getElementsByTagName("iframe")[b.name].contentWindow.document||b.name&&a.doc.frames[b.name]&&a.doc.frames[b.name].document||null;return c},send:function(b){this._frame||(this._frame=this.create(this._iframeName,a._scopeName+".io.iframe._iframeOnload();"));var c=a._ioSetArgs(b,function(a){a.canceled=!0,a.ioArgs._callNext()},function(b){var c=null;try{var d=b.ioArgs,e=a.io.iframe,f=e.doc(e._frame),g=d.handleAs;c=f;if(g!="html")if(g=="xml"){if(a.isIE<9||a.isIE&&a.isQuirks){a.query("a",e._frame.contentWindow.document.documentElement).orphan();var h=e._frame.contentWindow.document.documentElement.innerText;h=h.replace(/>\s+</g,"><"),h=a.trim(h);var i={responseText:h};c=a._contentHandlers.xml(i)}}else c=f.getElementsByTagName("textarea")[0].value,g=="json"?c=a.fromJson(c):g=="javascript"&&(c=a.eval(c))}catch(j){c=j}finally{d._callNext()}return c},function(a,b){b.ioArgs._hasError=!0,b.ioArgs._callNext();return a});c.ioArgs._callNext=function(){this._calledNext||(this._calledNext=!0,a.io.iframe._currentDfd=null,a.io.iframe._fireNextRequest())},this._dfdQueue.push(c),this._fireNextRequest(),a._ioWatch(c,function(a){return!a.ioArgs._hasError},function(a){return!!a.ioArgs._finished},function(a){a.ioArgs._finished?a.callback(a):a.errback(new Error("Invalid dojo.io.iframe request state"))});return c},_currentDfd:null,_dfdQueue:[],_iframeName:a._scopeName+"IoIframe",_fireNextRequest:function(){try{if(this._currentDfd||this._dfdQueue.length==0)return;do var b=this._currentDfd=this._dfdQueue.shift();while(b&&b.canceled&&this._dfdQueue.length);if(!b||b.canceled){this._currentDfd=null;return}var c=b.ioArgs,d=c.args;c._contentToClean=[];var e=a.byId(d.form),f=d.content||{};if(e){if(f){var g=function(b,d){a.create("input",{type:"hidden",name:b,value:d},e),c._contentToClean.push(b)};for(var h in f){var i=f[h];if(a.isArray(i)&&i.length>1){var j;for(j=0;j<i.length;j++)g(h,i[j])}else e[h]?e[h].value=i:g(h,i)}}var k=e.getAttributeNode("action"),l=e.getAttributeNode("method"),m=e.getAttributeNode("target");d.url&&(c._originalAction=k?k.value:null,k?k.value=d.url:e.setAttribute("action",d.url));if(!l||!l.value)l?l.value=d.method?d.method:"post":e.setAttribute("method",d.method?d.method:"post");c._originalTarget=m?m.value:null,m?m.value=this._iframeName:e.setAttribute("target",this._iframeName),e.target=this._iframeName,a._ioNotifyStart(b),e.submit()}else{var n=d.url+(d.url.indexOf("?")>-1?"&":"?")+c.query;a._ioNotifyStart(b),this.setSrc(this._frame,n,!0)}}catch(o){b.errback(o)}},_iframeOnload:function(){var b=this._currentDfd;if(b){var c=b.ioArgs,d=c.args,e=a.byId(d.form);if(e){var f=c._contentToClean;for(var g=0;g<f.length;g++){var h=f[g];for(var i=0;i<e.childNodes.length;i++){var j=e.childNodes[i];if(j.name==h){a.destroy(j);break}}}c._originalAction&&e.setAttribute("action",c._originalAction),c._originalTarget&&(e.setAttribute("target",c._originalTarget),e.target=c._originalTarget)}c._finished=!0}else this._fireNextRequest()}};return a.io.iframe})