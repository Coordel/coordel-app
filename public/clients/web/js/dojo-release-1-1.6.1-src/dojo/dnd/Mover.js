define("dojo/dnd/Mover",["dojo","dojo/dnd/common","dojo/dnd/autoscroll"],function(a){a.declare("dojo.dnd.Mover",null,{constructor:function(b,c,d){this.node=a.byId(b);var e=c.touches?c.touches[0]:c;this.marginBox={l:e.pageX,t:e.pageY},this.mouseButton=c.button;var f=this.host=d,g=b.ownerDocument;this.events=[a.connect(g,"onmousemove",this,"onFirstMove"),a.connect(g,"ontouchmove",this,"onFirstMove"),a.connect(g,"onmousemove",this,"onMouseMove"),a.connect(g,"ontouchmove",this,"onMouseMove"),a.connect(g,"onmouseup",this,"onMouseUp"),a.connect(g,"ontouchend",this,"onMouseUp"),a.connect(g,"ondragstart",a.stopEvent),a.connect(g.body,"onselectstart",a.stopEvent)],f&&f.onMoveStart&&f.onMoveStart(this)},onMouseMove:function(b){a.dnd.autoScroll(b);var c=this.marginBox,d=b.touches?b.touches[0]:b;this.host.onMove(this,{l:c.l+d.pageX,t:c.t+d.pageY},b),a.stopEvent(b)},onMouseUp:function(b){(a.isWebKit&&a.isMac&&this.mouseButton==2?b.button==0:this.mouseButton==b.button)&&this.destroy(),a.stopEvent(b)},onFirstMove:function(b){var c=this.node.style,d,e,f=this.host;switch(c.position){case"relative":case"absolute":d=Math.round(parseFloat(c.left))||0,e=Math.round(parseFloat(c.top))||0;break;default:c.position="absolute";var g=a.marginBox(this.node),h=a.doc.body,i=a.getComputedStyle(h),j=a._getMarginBox(h,i),k=a._getContentBox(h,i);d=g.l-(k.l-j.l),e=g.t-(k.t-j.t)}this.marginBox.l=d-this.marginBox.l,this.marginBox.t=e-this.marginBox.t,f&&f.onFirstMove&&f.onFirstMove(this,b),a.disconnect(this.events.shift()),a.disconnect(this.events.shift())},destroy:function(){a.forEach(this.events,a.disconnect);var b=this.host;b&&b.onMoveStop&&b.onMoveStop(this),this.events=this.node=this.host=null}});return a.dnd.Mover})