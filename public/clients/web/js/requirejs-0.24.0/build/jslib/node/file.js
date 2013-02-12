define(["fs","path"],function(a,b){function d(a){var b=a.split("/"),d="",e=!0;b.forEach(function(a){d+=a+"/",e=!1,a&&c(d)})}function c(c){b.existsSync(c)||a.mkdirSync(c,511)}var e={backSlashRegExp:/\\/g,getLineSeparator:function(){return"/"},exists:function(a){return b.existsSync(a)},parent:function(a){var b=a.split("/");b.pop();return b.join("/")},absPath:function(c){return b.normalize(a.realpathSync(c).replace(/\\/g,"/"))},normalize:function(a){return b.normalize(a)},isFile:function(b){return a.statSync(b).isFile()},isDirectory:function(b){return a.statSync(b).isDirectory()},getFilteredFileList:function(c,d,e){var f=[],g,h,i,j,k,l,m,n,o,p;g=c,h=d.include||d,i=d.exclude||null;if(b.existsSync(g)){j=a.readdirSync(g);for(k=0;k<j.length;k++)p=j[k],m=b.join(g,p),l=a.statSync(m),l.isFile()?(e&&(m.indexOf("/")===-1&&(m=m.replace(/\\/g,"/"))),n=!0,h&&(n=m.match(h)),n&&i&&(n=!m.match(i)),n&&!p.match(/^\./)&&f.push(m)):l.isDirectory()&&!p.match(/^\./)&&(o=this.getFilteredFileList(m,d,e),f.push.apply(f,o))}return f},copyDir:function(a,b,c,d){c=c||/\w/;var f=e.getFilteredFileList(a,c,!0),g=[],h,i,j;for(h=0;h<f.length;h++)i=f[h],j=i.replace(a,b),e.copyFile(i,j,d)&&g.push(j);return g.length?g:null},copyFile:function(c,e,f){var g;if(f)if(b.existsSync(e)&&a.statSync(e).mtime.getTime()>=a.statSync(c).mtime.getTime())return!1;g=b.dirname(e),b.existsSync(g)||d(g),a.writeFileSync(e,a.readFileSync(c,"binary"),"binary");return!0},readFile:function(b,c){c==="utf-8"&&(c="utf8"),c||(c="utf8");return a.readFileSync(b,c)},saveUtf8File:function(a,b){e.saveFile(a,b,"utf8")},saveFile:function(c,e,f){var g;f==="utf-8"&&(f="utf8"),f||(f="utf8"),g=b.dirname(c),b.existsSync(g)||d(g),a.writeFileSync(c,e,f)},deleteFile:function(c){var d,e,f;if(b.existsSync(c)){f=a.statSync(c);if(f.isDirectory()){d=a.readdirSync(c);for(e=0;e<d.length;e++)this.deleteFile(b.join(c,d[e]));a.rmdirSync(c)}else a.unlinkSync(c)}}};return e})