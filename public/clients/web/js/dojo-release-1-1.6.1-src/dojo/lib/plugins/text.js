define(["dojo","dojo/cache"],function(a){var b={},c=function(c,d,e){b[c]=e,a.cache({toString:function(){return d}},e)},d=function(a){if(a){a=a.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");var b=a.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);b&&(a=b[1])}else a="";return a};return{load:function(e,f,g){var h,i,j,k=e.split("!");if(f.toAbsMid){h=k[0].match(/(.+)(\.[^\/]*)$/),i=h?f.toAbsMid(h[1])+h[2]:f.toAbsMid(k[0]);if(i in b){g(k[1]=="strip"?d(b[i]):b[i]);return}}j=f.toUrl(k[0]),a.xhrGet({url:j,load:function(a){i&&c(i,j,a),g(k[1]=="strip"?d(a):a)}})},cache:function(a,b,d,e){c(a,require.nameToUrl(b)+d,e)}}})