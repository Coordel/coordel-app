define(["../../jslib/parse"],function(a){function i(b,d){if(a.isArray(b)){var e,f,j;b[0]==="call"&&b[1][0]==="name"&&b[1][1]==="steal"?h(b[2],d):(e=b[b.length-1],f=b[b.length-2],j=f[f.length-1],typeof j==="string"&&c[j]&&(j==="plugins"?h(e,d):j==="views"&&h(e,d,g),f=f[f.length-2],i(f,d)))}}function h(b,c,d){var e,f,g=[];for(e=0;e<b.length;e++)f=b[e],f&&a.isArray(f)&&f[0]==="string"&&g.push(d?d(f[1]):f[1]);g.length&&(g.unshift(0),g.unshift(0),c.splice.apply(c,g))}function g(a){return"ejs!"+a.replace(d,"")}function f(a){e(a).isRequireJSParsed=!0}function e(b){if(!a.isArray(b))return!1;if(b[0]==="name"&&b[1]==="steal"&&!b.isRequireJSParsed)return b;if(b[0]==="call"){if(b[1][0]==="name"&&b[1][1]==="steal")return e(b[1]);if(b[1][0]==="dot")return e(b[1][1])}return null}var b=a,c={plugins:!0,views:!0},d=/^\/\//;b.oldParseNode=b.parseNode,b.parseNode=function(a){var b;if(!this.isArray(a))return null;b=this.oldParseNode(a);if(b)return b;if(e(a)){b=[],i(a,b);if(b.length){f(a);return"require("+JSON.stringify(b)+");"}return""}return null};return b})