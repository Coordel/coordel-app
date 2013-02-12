define("dojo/NodeList-traverse",["dojo"],function(a){a.extend(a.NodeList,{_buildArrayFromCallback:function(a){var b=[];for(var c=0;c<this.length;c++){var d=a.call(this[c],this[c],b);d&&(b=b.concat(d))}return b},_getUniqueAsNodeList:function(b){var c=[];for(var d=0,e;e=b[d];d++)e.nodeType==1&&a.indexOf(c,e)==-1&&c.push(e);return this._wrap(c,null,this._NodeListCtor)},_getUniqueNodeListWithParent:function(b,c){var d=this._getUniqueAsNodeList(b);d=c?a._filterQueryResult(d,c):d;return d._stash(this)},_getRelatedUniqueNodes:function(a,b){return this._getUniqueNodeListWithParent(this._buildArrayFromCallback(b),a)},children:function(b){return this._getRelatedUniqueNodes(b,function(b,c){return a._toArray(b.childNodes)})},closest:function(b,c){return this._getRelatedUniqueNodes(null,function(d,e){do if(a._filterQueryResult([d],b,c).length)return d;while(d!=c&&(d=d.parentNode)&&d.nodeType==1);return null})},parent:function(a){return this._getRelatedUniqueNodes(a,function(a,b){return a.parentNode})},parents:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=[];while(a.parentNode)a=a.parentNode,c.push(a);return c})},siblings:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=[],d=a.parentNode&&a.parentNode.childNodes;for(var e=0;e<d.length;e++)d[e]!=a&&c.push(d[e]);return c})},next:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=a.nextSibling;while(c&&c.nodeType!=1)c=c.nextSibling;return c})},nextAll:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=[],d=a;while(d=d.nextSibling)d.nodeType==1&&c.push(d);return c})},prev:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=a.previousSibling;while(c&&c.nodeType!=1)c=c.previousSibling;return c})},prevAll:function(a){return this._getRelatedUniqueNodes(a,function(a,b){var c=[],d=a;while(d=d.previousSibling)d.nodeType==1&&c.push(d);return c})},andSelf:function(){return this.concat(this._parent)},first:function(){return this._wrap(this[0]&&[this[0]]||[],this)},last:function(){return this._wrap(this.length?[this[this.length-1]]:[],this)},even:function(){return this.filter(function(a,b){return b%2!=0})},odd:function(){return this.filter(function(a,b){return b%2==0})}});return a.NodeList})