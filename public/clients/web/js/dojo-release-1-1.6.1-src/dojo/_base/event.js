define("dojo/_base/event",["dojo/lib/kernel","dojo/_base/connect"],function(a){(function(){var b=a._event_listener={add:function(c,d,e){if(c){d=b._normalizeEventName(d),e=b._fixCallback(d,e);if(!a.isIE&&(d=="mouseenter"||d=="mouseleave")){var f=e;d=d=="mouseenter"?"mouseover":"mouseout",e=function(b){if(!a.isDescendant(b.relatedTarget,c))return f.call(this,b)}}c.addEventListener(d,e,!1);return e}},remove:function(c,d,e){c&&(d=b._normalizeEventName(d),!a.isIE&&(d=="mouseenter"||d=="mouseleave")&&(d=d=="mouseenter"?"mouseover":"mouseout"),c.removeEventListener(d,e,!1))},_normalizeEventName:function(a){return a.slice(0,2)=="on"?a.slice(2):a},_fixCallback:function(a,c){return a!="keypress"?c:function(a){return c.call(this,b._fixEvent(a,this))}},_fixEvent:function(a,c){switch(a.type){case"keypress":b._setKeyChar(a)}return a},_setKeyChar:function(a){a.keyChar=a.charCode>=32?String.fromCharCode(a.charCode):"",a.charOrCode=a.keyChar||a.keyCode},_punctMap:{106:42,111:47,186:59,187:43,188:44,189:45,190:46,191:47,192:96,219:91,220:92,221:93,222:39}};a.fixEvent=function(a,c){return b._fixEvent(a,c)},a.stopEvent=function(a){a.preventDefault(),a.stopPropagation()};var c=a._listener;a._connect=function(d,e,f,g,h){var i=d&&(d.nodeType||d.attachEvent||d.addEventListener),j=i?h?2:1:0,k=[a._listener,b,c][j],l=k.add(d,e,a.hitch(f,g));return[d,e,l,j]},a._disconnect=function(d,e,f,g){[a._listener,b,c][g].remove(d,e,f)},a.keys={BACKSPACE:8,TAB:9,CLEAR:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,META:a.isSafari?91:224,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,HELP:47,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,NUMPAD_MULTIPLY:106,NUMPAD_PLUS:107,NUMPAD_ENTER:108,NUMPAD_MINUS:109,NUMPAD_PERIOD:110,NUMPAD_DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,F13:124,F14:125,F15:126,NUM_LOCK:144,SCROLL_LOCK:145,copyKey:a.isMac&&!a.isAIR?a.isSafari?91:224:17};var d=a.isMac?"metaKey":"ctrlKey";a.isCopyKey=function(a){return a[d]},a.isIE<9||a.isIE&&a.isQuirks?a.mouseButtons={LEFT:1,MIDDLE:4,RIGHT:2,isButton:function(a,b){return a.button&b},isLeft:function(a){return a.button&1},isMiddle:function(a){return a.button&4},isRight:function(a){return a.button&2}}:a.mouseButtons={LEFT:0,MIDDLE:1,RIGHT:2,isButton:function(a,b){return a.button==b},isLeft:function(a){return a.button==0},isMiddle:function(a){return a.button==1},isRight:function(a){return a.button==2}};if(a.isIE){var e=function(a,b){try{return a.keyCode=b}catch(a){return 0}},f=a._listener,g=a._ieListenersName="_"+a._scopeName+"_listeners";if(!a.config._allow_leaks){c=f=a._ie_listener={handlers:[],add:function(b,c,d){b=b||a.global;var e=b[c];if(!e||!e[g]){var f=a._getIeDispatcher();f.target=e&&h.push(e)-1,f[g]=[],e=b[c]=f}return e[g].push(h.push(d)-1)},remove:function(b,c,d){var e=(b||a.global)[c],f=e&&e[g];e&&f&&d--&&(delete h[f[d]],delete f[d])}};var h=f.handlers}a.mixin(b,{add:function(a,c,d){if(a){c=b._normalizeEventName(c);if(c=="onkeypress"){var e=a.onkeydown;if(e&&e[g]&&e._stealthKeydownHandle)e._stealthKeydownRefs++;else{var h=b.add(a,"onkeydown",b._stealthKeyDown);e=a.onkeydown,e._stealthKeydownHandle=h,e._stealthKeydownRefs=1}}return f.add(a,c,b._fixCallback(d))}},remove:function(a,c,d){c=b._normalizeEventName(c),f.remove(a,c,d);if(c=="onkeypress"){var e=a.onkeydown;--e._stealthKeydownRefs<=0&&(f.remove(a,"onkeydown",e._stealthKeydownHandle),delete e._stealthKeydownHandle)}},_normalizeEventName:function(a){return a.slice(0,2)!="on"?"on"+a:a},_nop:function(){},_fixEvent:function(c,d){if(!c){var e=d&&(d.ownerDocument||d.document||d).parentWindow||window;c=e.event}if(!c)return c;c.target=c.srcElement,c.currentTarget=d||c.srcElement,c.layerX=c.offsetX,c.layerY=c.offsetY;var f=c.srcElement,g=f&&f.ownerDocument||document,h=a.isIE<6||g.compatMode=="BackCompat"?g.body:g.documentElement,i=a._getIeDocumentElementOffset();c.pageX=c.clientX+a._fixIeBiDiScrollLeft(h.scrollLeft||0)-i.x,c.pageY=c.clientY+(h.scrollTop||0)-i.y,c.type=="mouseover"&&(c.relatedTarget=c.fromElement),c.type=="mouseout"&&(c.relatedTarget=c.toElement);if(a.isIE<9||a.isQuirks)c.stopPropagation=b._stopPropagation,c.preventDefault=b._preventDefault;return b._fixKeys(c)},_fixKeys:function(a){switch(a.type){case"keypress":var c="charCode"in a?a.charCode:a.keyCode;c==10?(c=0,a.keyCode=13):c==13||c==27?c=0:c==3&&(c=99),a.charCode=c,b._setKeyChar(a)}return a},_stealthKeyDown:function(c){var d=c.currentTarget.onkeypress;if(d&&d[g]){var f=c.keyCode,h=(f!=13||a.isIE>=9&&!a.isQuirks)&&f!=32&&f!=27&&(f<48||f>90)&&(f<96||f>111)&&(f<186||f>192)&&(f<219||f>222);if(h||c.ctrlKey){var i=h?0:f;if(c.ctrlKey){if(f==3||f==13)return;i>95&&i<106?i-=48:c.shiftKey||(i<65||i>90)?i=b._punctMap[i]||i:i+=32}var j=b._synthesizeEvent(c,{type:"keypress",faux:!0,charCode:i});d.call(c.currentTarget,j);if(a.isIE<9||a.isIE&&a.isQuirks)c.cancelBubble=j.cancelBubble;c.returnValue=j.returnValue,e(c,j.keyCode)}}},_stopPropagation:function(){this.cancelBubble=!0},_preventDefault:function(){this.bubbledKeyCode=this.keyCode,this.ctrlKey&&e(this,0),this.returnValue=!1}}),a.stopEvent=a.isIE<9||a.isQuirks?function(a){a=a||window.event,b._stopPropagation.call(a),b._preventDefault.call(a)}:a.stopEvent}b._synthesizeEvent=function(c,d){var e=a.mixin({},c,d);b._setKeyChar(e),e.preventDefault=function(){c.preventDefault()},e.stopPropagation=function(){c.stopPropagation()};return e},a.isOpera&&a.mixin(b,{_fixEvent:function(a,c){switch(a.type){case"keypress":var d=a.which;d==3&&(d=99),d=d<41&&!a.shiftKey?0:d,a.ctrlKey&&!a.shiftKey&&d>=65&&d<=90&&(d+=32);return b._synthesizeEvent(a,{charCode:d})}return a}}),a.isWebKit&&(b._add=b.add,b._remove=b.remove,a.mixin(b,{add:function(a,c,d){if(a){var e=b._add(a,c,d);b._normalizeEventName(c)=="keypress"&&(e._stealthKeyDownHandle=b._add(a,"keydown",function(a){var c=a.keyCode,e=c!=13&&c!=32&&(c<48||c>90)&&(c<96||c>111)&&(c<186||c>192)&&(c<219||c>222);if(e||a.ctrlKey){var f=e?0:c;if(a.ctrlKey){if(c==3||c==13)return;f>95&&f<106?f-=48:a.shiftKey||f<65||f>90?f=b._punctMap[f]||f:f+=32}var g=b._synthesizeEvent(a,{type:"keypress",faux:!0,charCode:f});d.call(a.currentTarget,g)}}));return e}},remove:function(a,c,d){a&&(d._stealthKeyDownHandle&&b._remove(a,"keydown",d._stealthKeyDownHandle),b._remove(a,c,d))},_fixEvent:function(a,c){switch(a.type){case"keypress":if(a.faux)return a;var d=a.charCode;d=d>=32?d:0;return b._synthesizeEvent(a,{charCode:d,faux:!0})}return a}}))})(),a.isIE&&(a._ieDispatcher=function(b,c){var d=Array.prototype,e=a._ie_listener.handlers,f=b.callee,g=f[a._ieListenersName],h=e[f.target],i=h&&h.apply(c,b),j=[].concat(g);for(var k in j){var l=e[j[k]];!(k in d)&&l&&l.apply(c,b)}return i},a._getIeDispatcher=function(){return new Function(a._scopeName+"._ieDispatcher(arguments, this)")},a._event_listener._fixCallback=function(b){var c=a._event_listener._fixEvent;return function(a){return b.call(this,c(a,this))}});return a.connect})