var startDojoMappings=function(a){a.query=function(b,c,d){d=d||a.NodeList;if(!b)return new d;if(b.constructor==d)return b;if(!a.isString(b))return new d(b);if(a.isString(c)){c=a.byId(c);if(!c)return new d}return a.Sizzle(b,c,new d)},a._filterQueryResult=function(b,c){return a.Sizzle.filter(c,b)}},defineSizzle=function(a){function k(a,b,c,d,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){i=i[a];var j=!1;while(i&&i.nodeType){if(i[c]){j=d[i[c]];break}if(i.nodeType===1){i[c]=g;if(typeof b!=="string"){if(i===b){j=!0;break}}else if(e.filter(b,[i]).length>0){j=i;break}}i=i[a]}d[g]=j}}}function j(a,b,c,d,e){for(var f=0,g=d.length;f<g;f++){var h=d[f];if(h){h=h[a];var i=!1;while(h&&h.nodeType){var j=h[c];if(j){i=d[j];break}h.nodeType===1&&(h[c]=f);if(h.nodeName===b){i=h;break}h=h[a]}d[f]=i}}}var b=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|[^[\]]+)+\]|\\.|[^ >+~,(\[]+)+|[>+~])(\s*,\s*)?/g,c=0,d=Object.prototype.toString,e=function(a,c,g,i){g=g||[],c=c||document;if(c.nodeType!==1&&c.nodeType!==9)return[];if(!a||typeof a!=="string")return g;var j=[],k,m,n,o,p,q,r=!0;b.lastIndex=0;while((k=b.exec(a))!==null){j.push(k[1]);if(k[2]){q=RegExp.rightContext;break}}if(j.length>1&&f.match.POS.exec(a))if(j.length===2&&f.relative[j[0]]){var s="",t;while(t=f.match.POS.exec(a))s+=t[0],a=a.replace(f.match.POS,"");m=e.filter(s,e(a,c))}else{m=f.relative[j[0]]?[c]:e(j.shift(),c);while(j.length){var u=[];a=j.shift(),f.relative[a]&&(a+=j.shift());for(var v=0,w=m.length;v<w;v++)e(a,m[v],u);m=u}}else{var x=i?{expr:j.pop(),set:h(i)}:e.find(j.pop(),j.length===1&&c.parentNode?c.parentNode:c);m=e.filter(x.expr,x.set),j.length>0?n=h(m):r=!1;while(j.length){var y=j.pop(),z=y;f.relative[y]?z=j.pop():y="",z==null&&(z=c),f.relative[y](n,z)}}n||(n=m);if(!n)throw"Syntax error, unrecognized expression: "+(y||a);if(d.call(n)==="[object Array]")if(r)if(c.nodeType===1)for(var v=0;n[v]!=null;v++)n[v]&&(n[v]===!0||n[v].nodeType===1&&l(c,n[v]))&&g.push(m[v]);else for(var v=0;n[v]!=null;v++)n[v]&&n[v].nodeType===1&&g.push(m[v]);else g.push.apply(g,n);else h(n,g);q&&e(q,c,g,i);return g};e.matches=function(a,b){return e(a,null,null,b)},e.find=function(a,b){var c,d;if(!a)return[];for(var e=0,g=f.order.length;e<g;e++){var h=f.order[e],d;if(d=f.match[h].exec(a)){var i=RegExp.leftContext;if(i.substr(i.length-1)!=="\\"){d[1]=(d[1]||"").replace(/\\/g,""),c=f.find[h](d,b);if(c!=null){a=a.replace(f.match[h],"");break}}}}c||(c=b.getElementsByTagName("*"));return{set:c,expr:a}},e.filter=function(a,b,c,d){var e=a,g=[],h=b,i,j;while(a&&b.length){for(var k in f.filter)if((i=f.match[k].exec(a))!=null){var l=f.filter[k],m=null,n=0,o,p;j=!1,h==g&&(g=[]);if(f.preFilter[k]){i=f.preFilter[k](i,h,c,g,d);if(i){if(i[0]===!0){m=[];var q=null,r;for(var s=0;(r=h[s])!==undefined;s++)r&&q!==r&&(m.push(r),q=r)}}else j=o=!0}if(i)for(var s=0;(p=h[s])!==undefined;s++)if(p){m&&p!=m[n]&&n++,o=l(p,i,n,m);var t=d^!!o;c&&o!=null?t?j=!0:h[s]=!1:t&&(g.push(p),j=!0)}if(o!==undefined){c||(h=g),a=a.replace(f.match[k],"");if(!j)return[];break}}a=a.replace(/\s*,\s*/,"");if(a==e){if(j==null)throw"Syntax error, unrecognized expression: "+a;break}e=a}return h};var f=e.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u0128-\uFFFF_-]|\\.)+)/,CLASS:/\.((?:[\w\u0128-\uFFFF_-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u0128-\uFFFF_-]|\\.)+)['"]*\]/,ATTR:/\[((?:[\w\u0128-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\]/,TAG:/^((?:[\w\u0128-\uFFFF\*_-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child\(?(even|odd|[\dn+-]*)\)?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)\(?(\d*)\)?(?:[^-]|$)/,PSEUDO:/:((?:[\w\u0128-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/},attrMap:{"class":"className","for":"htmlFor"},relative:{"+":function(a,b){for(var c=0,d=a.length;c<d;c++){var f=a[c];if(f){var g=f.previousSibling;while(g&&g.nodeType!==1)g=g.previousSibling;a[c]=typeof b==="string"?g||!1:g===b}}typeof b==="string"&&e.filter(b,a,!0)},">":function(a,b){if(typeof b!=="string"||/\W/.test(b)){for(var c=0,d=a.length;c<d;c++){var f=a[c];f&&(a[c]=typeof b==="string"?f.parentNode:f.parentNode===b)}typeof b==="string"&&e.filter(b,a,!0)}else{b=b.toUpperCase();for(var c=0,d=a.length;c<d;c++){var f=a[c];if(f){var g=f.parentNode;a[c]=g.nodeName===b?g:!1}}}},"":function(a,b){var d="done"+c++,e=k;if(!b.match(/\W/)){var f=b=b.toUpperCase();e=j}e("parentNode",b,d,a,f)},"~":function(a,b){var d="done"+c++,e=k;if(typeof b==="string"&&!b.match(/\W/)){var f=b=b.toUpperCase();e=j}e("previousSibling",b,d,a,f)}},find:{ID:function(a,b){if(b.getElementById){var c=b.getElementById(a[1]);return c?[c]:[]}},NAME:function(a,b){return b.getElementsByName?b.getElementsByName(a[1]):null},TAG:function(a,b){return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e){a=" "+a[1].replace(/\\/g,"")+" ";for(var f=0;b[f];f++)e^(" "+b[f].className+" ").indexOf(a)>=0?c||d.push(b[f]):c&&(b[f]=!1);return!1},ID:function(a){return a[1]},TAG:function(a){return a[1].toUpperCase()},CHILD:function(a){if(a[1]=="nth"){var b=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(a[2]=="even"&&"2n"||a[2]=="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}a[0]="done"+c++;return a},ATTR:function(a){var b=a[1];f.attrMap[b]&&(a[1]=f.attrMap[b]),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(a,c,d,f,g){if(a[1]==="not")if(a[3].match(b).length>1)a[3]=e(a[3],null,null,c);else{var h=e.filter(a[3],c,d,!0^g);d||f.push.apply(f,h);return!1}return a},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!e(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){return"text"===a.type},radio:function(a){return"radio"===a.type},checkbox:function(a){return"checkbox"===a.type},file:function(a){return"file"===a.type},password:function(a){return"password"===a.type},submit:function(a){return"submit"===a.type},image:function(a){return"image"===a.type},reset:function(a){return"reset"===a.type},button:function(a){return"button"===a.type||a.nodeName.toUpperCase()==="BUTTON"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0==b},eq:function(a,b,c){return c[3]-0==b}},filter:{CHILD:function(a,b){var c=b[1],d=a.parentNode,e=b[0];if(d&&!d[e]){var f=1;for(var g=d.firstChild;g;g=g.nextSibling)g.nodeType==1&&(g.nodeIndex=f++);d[e]=f-1}if(c=="first")return a.nodeIndex==1;if(c=="last")return a.nodeIndex==d[e];if(c=="only")return d[e]==1;if(c=="nth"){var h=!1,i=b[2],j=b[3];if(i==1&&j==0)return!0;i==0?a.nodeIndex==j&&(h=!0):(a.nodeIndex-j)%i==0&&(a.nodeIndex-j)/i>=0&&(h=!0);return h}},PSEUDO:function(a,b,c,d){var e=b[1],g=f.filters[e];if(g)return g(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||"").indexOf(b[3])>=0;if(e==="not"){var h=b[3];for(var c=0,i=h.length;c<i;c++)if(h[c]===a)return!1;return!0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||a.nodeName===b},CLASS:function(a,b){return b.test(a.className)},ATTR:function(a,b){var c=a[b[1]]||a.getAttribute(b[1]),d=c+"",e=b[2],f=b[4];return c==null?!1:e==="="?d===f:e==="*="?d.indexOf(f)>=0:e==="~="?(" "+d+" ").indexOf(f)>=0:b[4]?e==="!="?d!=f:e==="^="?d.indexOf(f)===0:e==="$="?d.substr(d.length-f.length)===f:e==="|="?d===f||d.substr(0,f.length+1)===f+"-":!1:c},POS:function(a,b,c,d){var e=b[2],g=f.setFilters[e];if(g)return g(a,c,b,d)}}};for(var g in f.match)f.match[g]=RegExp(f.match[g].source+/(?![^\[]*\])(?![^\(]*\))/.source);var h=function(a,b){a=Array.prototype.slice.call(a);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(document.documentElement.childNodes)}catch(i){h=function(a,b){var c=b||[];if(d.call(a)==="[object Array]")Array.prototype.push.apply(c,a);else if(typeof a.length==="number")for(var e=0,f=a.length;e<f;e++)c.push(a[e]);else for(var e=0;a[e];e++)c.push(a[e]);return c}}(function(){var a=document.createElement("form"),b="script"+(new Date).getTime();a.innerHTML="<input name='"+b+"'/>";var c=document.documentElement;c.insertBefore(a,c.firstChild),!document.getElementById(b)||(f.find.ID=function(a,b){if(b.getElementById){var c=b.getElementById(a[1]);return c?c.id===a[1]||c.getAttributeNode&&c.getAttributeNode("id").nodeValue===a[1]?[c]:undefined:[]}},f.filter.ID=function(a,b){var c=a.getAttributeNode&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),c.removeChild(a)})(),function(){var a=document.createElement("div");a.appendChild(document.createComment("")),a.getElementsByTagName("*").length>0&&(f.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c})}(),document.querySelectorAll&&function(){var a=e;e=function(b,c,d,e){c=c||document;if(!e&&c.nodeType===9)try{return h(c.querySelectorAll(b),d)}catch(f){}return a(b,c,d,e)},e.find=a.find,e.filter=a.filter,e.selectors=a.selectors,e.matches=a.matches}(),document.documentElement.getElementsByClassName&&(f.order.splice(1,0,"CLASS"),f.find.CLASS=function(a,b){return b.getElementsByClassName(a[1])});var l=document.compareDocumentPosition?function(a,b){return a.compareDocumentPosition(b)&16}:function(a,b){return a!==b&&(a.contains?a.contains(b):!0)};a.Sizzle=e};if(this.dojo){var defined=0;defined=1,define("dojo/_base/query",["dojo","dojo/_base/NodeList"],function(a){startDojoMappings(a),defineSizzle(a)}),defined||(dojo.provide("dojo._base.query"),dojo.require("dojo._base.NodeList"),defineSizzle(dojo))}else defineSizzle(window)