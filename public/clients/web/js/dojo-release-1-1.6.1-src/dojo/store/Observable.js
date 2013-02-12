define("dojo/store/Observable",["dojo"],function(a){a.getObject("store",!0,a),a.store.Observable=function(b){function g(c,d){var e=b[c];e&&(b[c]=function(b){if(f)return e.apply(this,arguments);f=!0;try{return a.when(e.apply(this,arguments),function(a){d(typeof a=="object"&&a||b);return a})}finally{f=!1}})}var c=[],d=0;b.notify=function(a,b){d++;var e=c.slice();for(var f=0,g=e.length;f<g;f++)e[f](a,b)};var e=b.query;b.query=function(f,g){g=g||{};var h=e.apply(this,arguments);if(h&&h.forEach){var i=a.mixin({},g);delete i.start,delete i.count;var j=b.queryEngine&&b.queryEngine(f,i),k=d,m=[],n;h.observe=function(e,f){m.push(e)==1&&c.push(n=function(c,i){a.when(h,function(h){var n=h.length!=g.count,o;if(++k!=d)throw new Error("Query is out of date, you must observe() the query prior to any data modifications");var p,q=-1,r=-1;if(i)for(o=0,l=h.length;o<l;o++){var s=h[o];if(b.getIdentity(s)==i){p=s,q=o,(j||!c)&&h.splice(o,1);break}}if(j){if(c&&(j.matches?j.matches(c):j([c]).length)){q>-1?h.splice(q,0,c):h.push(c),r=a.indexOf(j(h),c);if(g.start&&r==0||!n&&r==h.length-1)r=-1}}else c&&(r=q>=0?q:b.defaultIndex||0);if((q>-1||r>-1)&&(f||!j||q!=r)){var t=m.slice();for(o=0;e=t[o];o++)e(c||p,q,r)}})});return{cancel:function(){m.splice(a.indexOf(m,e),1),m.length||c.splice(a.indexOf(c,n),1)}}}}return h};var f;g("put",function(a){b.notify(a,b.getIdentity(a))}),g("add",function(a){b.notify(a)}),g("remove",function(a){b.notify(undefined,a)});return b};return a.store.Observable})