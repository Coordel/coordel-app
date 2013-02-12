define("dijit/tree/dndSource",["dojo","dijit","dijit/tree/_dndSelector","dojo/dnd/Manager"],function(a,b){a.declare("dijit.tree.dndSource",b.tree._dndSelector,{isSource:!0,accept:["text","treeNode"],copyOnly:!1,dragThreshold:5,betweenThreshold:0,constructor:function(b,c){c||(c={}),a.mixin(this,c),this.isSource=typeof c.isSource=="undefined"?!0:c.isSource;var d=c.accept instanceof Array?c.accept:["text","treeNode"];this.accept=null;if(d.length){this.accept={};for(var e=0;e<d.length;++e)this.accept[d[e]]=1}this.isDragging=!1,this.mouseDown=!1,this.targetAnchor=null,this.targetBox=null,this.dropPosition="",this._lastX=0,this._lastY=0,this.sourceState="",this.isSource&&a.addClass(this.node,"dojoDndSource"),this.targetState="",this.accept&&a.addClass(this.node,"dojoDndTarget"),this.topics=[a.subscribe("/dnd/source/over",this,"onDndSourceOver"),a.subscribe("/dnd/start",this,"onDndStart"),a.subscribe("/dnd/drop",this,"onDndDrop"),a.subscribe("/dnd/cancel",this,"onDndCancel")]},checkAcceptance:function(a,b){return!0},copyState:function(a){return this.copyOnly||a},destroy:function(){this.inherited("destroy",arguments),a.forEach(this.topics,a.unsubscribe),this.targetAnchor=null},_onDragMouse:function(b){var c=a.dnd.manager(),d=this.targetAnchor,e=this.current,f=this.dropPosition,g="Over";if(e&&this.betweenThreshold>0){if(!this.targetBox||d!=e)this.targetBox=a.position(e.rowNode,!0);b.pageY-this.targetBox.y>this.betweenThreshold?b.pageY-this.targetBox.y>=this.targetBox.h-this.betweenThreshold&&(g="After"):g="Before"}if(e!=d||g!=f)d&&this._removeItemClass(d.rowNode,f),e&&this._addItemClass(e.rowNode,g),e?e==this.tree.rootNode&&g!="Over"?c.canDrop(!1):c.source==this&&e.id in this.selection?c.canDrop(!1):this.checkItemAcceptance(e.rowNode,c.source,g.toLowerCase())&&!this._isParentChildDrop(c.source,e.rowNode)?c.canDrop(!0):c.canDrop(!1):c.canDrop(!1),this.targetAnchor=e,this.dropPosition=g},onMouseMove:function(b){if(!this.isDragging||this.targetState!="Disabled"){this.inherited(arguments);var c=a.dnd.manager();if(this.isDragging)this._onDragMouse(b);else if(this.mouseDown&&this.isSource&&(Math.abs(b.pageX-this._lastX)>=this.dragThreshold||Math.abs(b.pageY-this._lastY)>=this.dragThreshold)){var d=this.getSelectedTreeNodes();if(d.length){if(d.length>1){var e=this.selection,f=0,g=[],h,i;nextitem:while(h=d[f++]){for(i=h.getParent();i&&i!==this.tree;i=i.getParent())if(e[i.id])continue nextitem;g.push(h)}d=g}d=a.map(d,function(a){return a.domNode}),c.startDrag(this,d,this.copyState(a.isCopyKey(b)))}}}},onMouseDown:function(a){this.mouseDown=!0,this.mouseButton=a.button,this._lastX=a.pageX,this._lastY=a.pageY,this.inherited(arguments)},onMouseUp:function(a){this.mouseDown&&(this.mouseDown=!1,this.inherited(arguments))},onMouseOut:function(){this.inherited(arguments),this._unmarkTargetAnchor()},checkItemAcceptance:function(a,b,c){return!0},onDndSourceOver:function(b){if(this!=b)this.mouseDown=!1,this._unmarkTargetAnchor();else if(this.isDragging){var c=a.dnd.manager();c.canDrop(!1)}},onDndStart:function(b,c,d){this.isSource&&this._changeState("Source",this==b?d?"Copied":"Moved":"");var e=this.checkAcceptance(b,c);this._changeState("Target",e?"":"Disabled"),this==b&&a.dnd.manager().overSource(this),this.isDragging=!0},itemCreator:function(b,c,d){return a.map(b,function(a){return{id:a.id,name:a.textContent||a.innerText||""}})},onDndDrop:function(b,c,d){if(this.containerState=="Over"){var e=this.tree,f=e.model,g=this.targetAnchor,h=!1;this.isDragging=!1;var i=g,j,k;j=i&&i.item||e.item,this.dropPosition=="Before"||this.dropPosition=="After"?(j=i.getParent()&&i.getParent().item||e.item,k=i.getIndexInParent(),this.dropPosition=="After"&&(k=i.getIndexInParent()+1)):j=i&&i.item||e.item;var l;a.forEach(c,function(e,h){var i=b.getItem(e.id);if(a.indexOf(i.type,"treeNode")!=-1)var m=i.data,n=m.item,o=m.getParent().item;b==this?(typeof k=="number"&&(j==o&&m.getIndexInParent()<k&&(k-=1)),f.pasteItem(n,o,j,d,k)):f.isItem(n)?f.pasteItem(n,o,j,d,k):(l||(l=this.itemCreator(c,g.rowNode,b)),f.newItem(l[h],j,k))},this),this.tree._expandNode(i)}this.onDndCancel()},onDndCancel:function(){this._unmarkTargetAnchor(),this.isDragging=!1,this.mouseDown=!1,delete this.mouseButton,this._changeState("Source",""),this._changeState("Target","")},onOverEvent:function(){this.inherited(arguments),a.dnd.manager().overSource(this)},onOutEvent:function(){this._unmarkTargetAnchor();var b=a.dnd.manager();this.isDragging&&b.canDrop(!1),b.outSource(this),this.inherited(arguments)},_isParentChildDrop:function(a,b){if(!a.tree||a.tree!=this.tree)return!1;var c=a.tree.domNode,d=a.selection,e=b.parentNode;while(e!=c&&!d[e.id])e=e.parentNode;return e.id&&d[e.id]},_unmarkTargetAnchor:function(){this.targetAnchor&&(this._removeItemClass(this.targetAnchor.rowNode,this.dropPosition),this.targetAnchor=null,this.targetBox=null,this.dropPosition=null)},_markDndStatus:function(a){this._changeState("Source",a?"Copied":"Moved")}});return b.tree.dndSource})