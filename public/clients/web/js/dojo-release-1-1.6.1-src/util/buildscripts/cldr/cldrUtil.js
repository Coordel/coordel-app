function compare(a,b){if(dojo.isArray(a)&&dojo.isArray(b)){for(var c=0;c<a.length;c++)if(a[c]!=b[c])return!1;return!0}return a==b}function getNativeBundle(a){try{var b=readFile(a,"utf-8");return!b||!b.length?{}:dojo.fromJson(b)}catch(c){return{}}}function isLocaleAliasSrc(a,b){if(!b)return!1;var c=!1,d="@localeAlias";for(x in b)if(x.indexOf(d)>0){var e=x.substring(0,x.indexOf(d));a.indexOf(e)==0&&(c=!0)}return c}(function(){var a=dojo.fromJson;dojo.fromJson=function(b){b=b.replace(/[\u200E\u200F\u202A-\u202E]/g,function(a){return"\\u"+a.charCodeAt(0).toString(16)});return b?a(b):""}})()