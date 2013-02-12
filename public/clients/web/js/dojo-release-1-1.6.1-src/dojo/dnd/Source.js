define("dojo/dnd/Source",["dojo","dojo/dnd/Selector","dojo/dnd/Manager"],function(a){a.declare("dojo.dnd.Source",a.dnd.Selector,{isSource:!0,horizontal:!1,copyOnly:!1,selfCopy:!1,selfAccept:!0,skipForm:!1,withHandles:!1,autoSync:!1,delay:0,accept:["text"],generateText:!0,constructor:function(b,c){a.mixin(this,a.mixin({},c));var d=this.accept;if(d.length){this.accept={};for(var e=0;e<d.length;++e)this.accept[d[e]]=1}this.isDragging=!1,this.mouseDown=!1,this.targetAnchor=null,this.targetBox=null,this.before=!0,this._lastX=0,this._lastY=0,this.sourceState="",this.isSource&&a.addClass(this.node,"dojoDndSource"),this.targetState="",this.accept&&a.addClass(this.node,"dojoDndTarget"),this.horizontal&&a.addClass(this.node,"dojoDndHorizontal"),this.topics=[a.subscribe("/dnd/source/over",this,"onDndSourceOver"),a.subscribe("/dnd/start",this,"onDndStart"),a.subscribe("/dnd/drop",this,"onDndDrop"),a.subscribe("/dnd/cancel",this,"onDndCancel")]},checkAcceptance:function(a,b){if(this==a)return!this.copyOnly||this.selfAccept;for(var c=0;c<b.length;++c){var d=a.getItem(b[c].id).type,e=!1;for(var f=0;f<d.length;++f)if(d[f]in this.accept){e=!0;break}if(!e)return!1}return!0},copyState:function(b,c){if(b)return!0;arguments.length<2&&(c=this==a.dnd.manager().target);if(!c)return this.copyOnly;if(this.copyOnly)return this.selfCopy;return!1},destroy:function(){a.dnd.Source.superclass.destroy.call(this),a.forEach(this.topics,a.unsubscribe),this.targetAnchor=null},markupFactory:function(b,c){b._skipStartup=!0;return new a.dnd.Source(c,b)},onMouseMove:function(b){if(!this.isDragging||this.targetState!="Disabled"){a.dnd.Source.superclass.onMouseMove.call(this,b);var c=a.dnd.manager();if(!this.isDragging)if(this.mouseDown&&this.isSource&&(Math.abs(b.pageX-this._lastX)>this.delay||Math.abs(b.pageY-this._lastY)>this.delay)){var d=this.getSelectedNodes();d.length&&c.startDrag(this,d,this.copyState(a.isCopyKey(b),!0))}if(this.isDragging){var e=!1;if(this.current){if(!this.targetBox||this.targetAnchor!=this.current)this.targetBox=a.position(this.current,!0);this.horizontal?e=b.pageX-this.targetBox.x<this.targetBox.w/2:e=b.pageY-this.targetBox.y<this.targetBox.h/2}if(this.current!=this.targetAnchor||e!=this.before)this._markTargetAnchor(e),c.canDrop(!this.current||c.source!=this||!(this.current.id in this.selection))}}},onMouseDown:function(b){!this.mouseDown&&this._legalMouseDown(b)&&(!this.skipForm||!a.dnd.isFormElement(b))&&(this.mouseDown=!0,this._lastX=b.pageX,this._lastY=b.pageY,a.dnd.Source.superclass.onMouseDown.call(this,b))},onMouseUp:function(b){this.mouseDown&&(this.mouseDown=!1,a.dnd.Source.superclass.onMouseUp.call(this,b))},onDndSourceOver:function(b){if(this!=b)this.mouseDown=!1,this.targetAnchor&&this._unmarkTargetAnchor();else if(this.isDragging){var c=a.dnd.manager();c.canDrop(this.targetState!="Disabled"&&(!this.current||c.source!=this||!(this.current.id in this.selection)))}},onDndStart:function(b,c,d){this.autoSync&&this.sync(),this.isSource&&this._changeState("Source",this==b?d?"Copied":"Moved":"");var e=this.accept&&this.checkAcceptance(b,c);this._changeState("Target",e?"":"Disabled"),this==b&&a.dnd.manager().overSource(this),this.isDragging=!0},onDndDrop:function(a,b,c,d){this==d&&this.onDrop(a,b,c),this.onDndCancel()},onDndCancel:function(){this.targetAnchor&&(this._unmarkTargetAnchor(),this.targetAnchor=null),this.before=!0,this.isDragging=!1,this.mouseDown=!1,this._changeState("Source",""),this._changeState("Target","")},onDrop:function(a,b,c){this!=a?this.onDropExternal(a,b,c):this.onDropInternal(b,c)},onDropExternal:function(b,c,d){var e=this._normalizedCreator;this.creator?this._normalizedCreator=function(a,c){return e.call(this,b.getItem(a.id).data,c)}:d?this._normalizedCreator=function(c,d){var e=b.getItem(c.id),f=c.cloneNode(!0);f.id=a.dnd.getUniqueId();return{node:f,data:e.data,type:e.type}}:this._normalizedCreator=function(a,c){var d=b.getItem(a.id);b.delItem(a.id);return{node:a,data:d.data,type:d.type}},this.selectNone(),!d&&!this.creator&&b.selectNone(),this.insertNodes(!0,c,this.before,this.current),!d&&this.creator&&b.deleteSelectedNodes(),this._normalizedCreator=e},onDropInternal:function(b,c){var d=this._normalizedCreator;if(!(this.current&&this.current.id in this.selection)){if(c)this.creator?this._normalizedCreator=function(a,b){return d.call(this,this.getItem(a.id).data,b)}:this._normalizedCreator=function(b,c){var d=this.getItem(b.id),e=b.cloneNode(!0);e.id=a.dnd.getUniqueId();return{node:e,data:d.data,type:d.type}};else{if(!this.current)return;this._normalizedCreator=function(a,b){var c=this.getItem(a.id);return{node:a,data:c.data,type:c.type}}}this._removeSelection(),this.insertNodes(!0,b,this.before,this.current),this._normalizedCreator=d}},onDraggingOver:function(){},onDraggingOut:function(){},onOverEvent:function(){a.dnd.Source.superclass.onOverEvent.call(this),a.dnd.manager().overSource(this),this.isDragging&&this.targetState!="Disabled"&&this.onDraggingOver()},onOutEvent:function(){a.dnd.Source.superclass.onOutEvent.call(this),a.dnd.manager().outSource(this),this.isDragging&&this.targetState!="Disabled"&&this.onDraggingOut()},_markTargetAnchor:function(a){if(this.current!=this.targetAnchor||this.before!=a)this.targetAnchor&&this._removeItemClass(this.targetAnchor,this.before?"Before":"After"),this.targetAnchor=this.current,this.targetBox=null,this.before=a,this.targetAnchor&&this._addItemClass(this.targetAnchor,this.before?"Before":"After")},_unmarkTargetAnchor:function(){this.targetAnchor&&(this._removeItemClass(this.targetAnchor,this.before?"Before":"After"),this.targetAnchor=null,this.targetBox=null,this.before=!0)},_markDndStatus:function(a){this._changeState("Source",a?"Copied":"Moved")},_legalMouseDown:function(b){if(!a.mouseButtons.isLeft(b))return!1;if(!this.withHandles)return!0;for(var c=b.target;c&&c!==this.node;c=c.parentNode){if(a.hasClass(c,"dojoDndHandle"))return!0;if(a.hasClass(c,"dojoDndItem")||a.hasClass(c,"dojoDndIgnore"))break}return!1}}),a.declare("dojo.dnd.Target",a.dnd.Source,{constructor:function(b,c){this.isSource=!1,a.removeClass(this.node,"dojoDndSource")},markupFactory:function(b,c){b._skipStartup=!0;return new a.dnd.Target(c,b)}}),a.declare("dojo.dnd.AutoSource",a.dnd.Source,{constructor:function(a,b){this.autoSync=!0},markupFactory:function(b,c){b._skipStartup=!0;return new a.dnd.AutoSource(c,b)}});return a.dnd.Source})