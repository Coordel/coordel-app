dojo.provide("dojox.form.RangeSlider"),dojo.require("dijit.form.HorizontalSlider"),dojo.require("dijit.form.VerticalSlider"),dojo.require("dojox.fx"),function(){var a=function(a,b){return b-a},b=function(a,b){return a-b};dojo.declare("dojox.form._RangeSliderMixin",null,{value:[0,100],postMixInProperties:function(){this.inherited(arguments),this.value=dojo.map(this.value,function(a){return parseInt(a,10)})},postCreate:function(){this.inherited(arguments),this.value.sort(this._isReversed()?a:b);var c=this,d=dojo.declare(dijit.form._SliderMoverMax,{constructor:function(){this.widget=c}});this._movableMax=new dojo.dnd.Moveable(this.sliderHandleMax,{mover:d}),dijit.setWaiState(this.focusNodeMax,"valuemin",this.minimum),dijit.setWaiState(this.focusNodeMax,"valuemax",this.maximum);var e=dojo.declare(dijit.form._SliderBarMover,{constructor:function(){this.widget=c}});this._movableBar=new dojo.dnd.Moveable(this.progressBar,{mover:e})},destroy:function(){this.inherited(arguments),this._movableMax.destroy(),this._movableBar.destroy()},_onKeyPress:function(a){if(!(this.disabled||this.readOnly||a.altKey||a.ctrlKey)){var b=a.currentTarget,c=!1,d=!1,e=dojo.keys;b==this.sliderHandle?c=!0:b==this.progressBar?d=c=!0:b==this.sliderHandleMax&&(d=!0);switch(a.keyCode){case e.HOME:this._setValueAttr(this.minimum,!0,d);break;case e.END:this._setValueAttr(this.maximum,!0,d);break;case this._descending||this.isLeftToRight()?e.RIGHT_ARROW:e.LEFT_ARROW:case this._descending===!1?e.DOWN_ARROW:e.UP_ARROW:case this._descending===!1?e.PAGE_DOWN:e.PAGE_UP:c&&d?this._bumpValue([{change:a.keyCode==e.PAGE_UP?this.pageIncrement:1,useMaxValue:!0},{change:a.keyCode==e.PAGE_UP?this.pageIncrement:1,useMaxValue:!1}]):c?this._bumpValue(a.keyCode==e.PAGE_UP?this.pageIncrement:1,!0):d&&this._bumpValue(a.keyCode==e.PAGE_UP?this.pageIncrement:1);break;case this._descending||this.isLeftToRight()?e.LEFT_ARROW:e.RIGHT_ARROW:case this._descending===!1?e.UP_ARROW:e.DOWN_ARROW:case this._descending===!1?e.PAGE_UP:e.PAGE_DOWN:c&&d?this._bumpValue([{change:a.keyCode==e.PAGE_DOWN?-this.pageIncrement:-1,useMaxValue:!1},{change:a.keyCode==e.PAGE_DOWN?-this.pageIncrement:-1,useMaxValue:!0}]):c?this._bumpValue(a.keyCode==e.PAGE_DOWN?-this.pageIncrement:-1):d&&this._bumpValue(a.keyCode==e.PAGE_DOWN?-this.pageIncrement:-1,!0);break;default:dijit.form._FormValueWidget.prototype._onKeyPress.apply(this,arguments),this.inherited(arguments);return}dojo.stopEvent(a)}},_onHandleClickMax:function(a){!this.disabled&&!this.readOnly&&(dojo.isIE||dijit.focus(this.sliderHandleMax),dojo.stopEvent(a))},_onClkIncBumper:function(){this._setValueAttr(this._descending===!1?this.minimum:this.maximum,!0,!0)},_bumpValue:function(a,b){var c=dojo.isArray(a)?[this._getBumpValue(a[0].change,a[0].useMaxValue),this._getBumpValue(a[1].change,a[1].useMaxValue)]:this._getBumpValue(a,b);this._setValueAttr(c,!0,!dojo.isArray(a)&&(a>0&&!b||b&&a<0))},_getBumpValue:function(a,b){var c=dojo.getComputedStyle(this.sliderBarContainer),d=dojo._getContentBox(this.sliderBarContainer,c),e=this.discreteValues,f=b?this.value[1]:this.value[0];if(e<=1||e==Infinity)e=d[this._pixelCount];e--;if(this._isReversed()&&a<0||a>0&&!this._isReversed())f=b?this.value[0]:this.value[1];var g=(f-this.minimum)*e/(this.maximum-this.minimum)+a;g<0&&(g=0),g>e&&(g=e);return g*(this.maximum-this.minimum)/e+this.minimum},_onBarClick:function(a){!this.disabled&&!this.readOnly&&(dojo.isIE||dijit.focus(this.progressBar),dojo.stopEvent(a))},_onRemainingBarClick:function(a){if(!this.disabled&&!this.readOnly){dojo.isIE||dijit.focus(this.progressBar);var b=dojo.coords(this.sliderBarContainer,!0),c=dojo.coords(this.progressBar,!0),d=a[this._mousePixelCoord]-b[this._startingPixelCoord],e=c[this._startingPixelCount],f=e+c[this._pixelCount],g=this._isReversed()?d<=e:d>=f,h=this._isReversed()?b[this._pixelCount]-d:d;this._setPixelValue(h,b[this._pixelCount],!0,g),dojo.stopEvent(a)}},_setPixelValue:function(a,b,c,d){if(!this.disabled&&!this.readOnly){var e=this._getValueByPixelValue(a,b);this._setValueAttr(e,c,d)}},_getValueByPixelValue:function(a,b){a=a<0?0:b<a?b:a;var c=this.discreteValues;if(c<=1||c==Infinity)c=b;c--;var d=b/c,e=Math.round(a/d);return(this.maximum-this.minimum)*e/c+this.minimum},_setValueAttr:function(c,d,e){var f=this.value;dojo.isArray(c)?f=c:e?this._isReversed()?f[0]=c:f[1]=c:this._isReversed()?f[1]=c:f[0]=c,this._lastValueReported="",this.valueNode.value=this.value=c=f,dijit.setWaiState(this.focusNode,"valuenow",f[0]),dijit.setWaiState(this.focusNodeMax,"valuenow",f[1]),this.value.sort(this._isReversed()?a:b),dijit.form._FormValueWidget.prototype._setValueAttr.apply(this,arguments),this._printSliderBar(d,e)},_printSliderBar:function(a,b){var c=(this.value[0]-this.minimum)/(this.maximum-this.minimum),d=(this.value[1]-this.minimum)/(this.maximum-this.minimum),e=c;c>d&&(c=d,d=e);var f=this._isReversed()?(1-c)*100:c*100,g=this._isReversed()?(1-d)*100:d*100,h=this._isReversed()?(1-d)*100:c*100;if(a&&this.slideDuration>0&&this.progressBar.style[this._progressPixelSize]){var i=b?d:c,j=this,k={},l=parseFloat(this.progressBar.style[this._handleOffsetCoord]),m=this.slideDuration/10;if(m===0)return;m<0&&(m=0-m);var n={},o={},p={};n[this._handleOffsetCoord]={start:this.sliderHandle.style[this._handleOffsetCoord],end:f,units:"%"},o[this._handleOffsetCoord]={start:this.sliderHandleMax.style[this._handleOffsetCoord],end:g,units:"%"},p[this._handleOffsetCoord]={start:this.progressBar.style[this._handleOffsetCoord],end:h,units:"%"},p[this._progressPixelSize]={start:this.progressBar.style[this._progressPixelSize],end:(d-c)*100,units:"%"};var q=dojo.animateProperty({node:this.sliderHandle,duration:m,properties:n}),r=dojo.animateProperty({node:this.sliderHandleMax,duration:m,properties:o}),s=dojo.animateProperty({node:this.progressBar,duration:m,properties:p}),t=dojo.fx.combine([q,r,s]);t.play()}else this.sliderHandle.style[this._handleOffsetCoord]=f+"%",this.sliderHandleMax.style[this._handleOffsetCoord]=g+"%",this.progressBar.style[this._handleOffsetCoord]=h+"%",this.progressBar.style[this._progressPixelSize]=(d-c)*100+"%"}}),dojo.declare("dijit.form._SliderMoverMax",dijit.form._SliderMover,{onMouseMove:function(a){var b=this.widget,c=b._abspos;c||(c=b._abspos=dojo.coords(b.sliderBarContainer,!0),b._setPixelValue_=dojo.hitch(b,"_setPixelValue"),b._isReversed_=b._isReversed());var d=a.touches?a.touches[0]:a,e=d[b._mousePixelCoord]-c[b._startingPixelCoord];b._setPixelValue_(b._isReversed_?c[b._pixelCount]-e:e,c[b._pixelCount],!1,!0)},destroy:function(a){dojo.dnd.Mover.prototype.destroy.apply(this,arguments);var b=this.widget;b._abspos=null,b._setValueAttr(b.value,!0)}}),dojo.declare("dijit.form._SliderBarMover",dojo.dnd.Mover,{onMouseMove:function(a){var c=this.widget;if(!c.disabled&&!c.readOnly){var d=c._abspos,e=c._bar,f=c._mouseOffset;d||(d=c._abspos=dojo.coords(c.sliderBarContainer,!0),c._setPixelValue_=dojo.hitch(c,"_setPixelValue"),c._getValueByPixelValue_=dojo.hitch(c,"_getValueByPixelValue"),c._isReversed_=c._isReversed()),e||(e=c._bar=dojo.coords(c.progressBar,!0));var g=a.touches?a.touches[0]:a;f||(f=c._mouseOffset=g[c._mousePixelCoord]-d[c._startingPixelCoord]-e[c._startingPixelCount]);var h=g[c._mousePixelCoord]-d[c._startingPixelCoord]-f,i=h+e[c._pixelCount];pixelValues=[h,i],pixelValues.sort(b),pixelValues[0]<=0&&(pixelValues[0]=0,pixelValues[1]=e[c._pixelCount]),pixelValues[1]>=d[c._pixelCount]&&(pixelValues[1]=d[c._pixelCount],pixelValues[0]=d[c._pixelCount]-e[c._pixelCount]);var j=[c._getValueByPixelValue(c._isReversed_?d[c._pixelCount]-pixelValues[0]:pixelValues[0],d[c._pixelCount]),c._getValueByPixelValue(c._isReversed_?d[c._pixelCount]-pixelValues[1]:pixelValues[1],d[c._pixelCount])];c._setValueAttr(j,!1,!1)}},destroy:function(){dojo.dnd.Mover.prototype.destroy.apply(this,arguments);var a=this.widget;a._abspos=null,a._bar=null,a._mouseOffset=null,a._setValueAttr(a.value,!0)}}),dojo.declare("dojox.form.HorizontalRangeSlider",[dijit.form.HorizontalSlider,dojox.form._RangeSliderMixin],{templateString:dojo.cache("dojox.form","resources/HorizontalRangeSlider.html")}),dojo.declare("dojox.form.VerticalRangeSlider",[dijit.form.VerticalSlider,dojox.form._RangeSliderMixin],{templateString:dojo.cache("dojox.form","resources/VerticalRangeSlider.html")})}()