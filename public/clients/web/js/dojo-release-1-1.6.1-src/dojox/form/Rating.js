dojo.provide("dojox.form.Rating"),dojo.require("dijit.form._FormWidget"),dojo.declare("dojox.form.Rating",dijit.form._FormWidget,{templateString:null,numStars:3,value:0,constructor:function(a){dojo.mixin(this,a);var b='<div dojoAttachPoint="domNode" class="dojoxRating dijitInline"><input type="hidden" value="0" dojoAttachPoint="focusNode" /><ul>${stars}</ul></div>',c='<li class="dojoxRatingStar dijitInline" dojoAttachEvent="onclick:onStarClick,onmouseover:_onMouse,onmouseout:_onMouse" value="${value}"></li>',d="";for(var e=0;e<this.numStars;e++)d+=dojo.string.substitute(c,{value:e+1});this.templateString=dojo.string.substitute(b,{stars:d})},postCreate:function(){this.inherited(arguments),this._renderStars(this.value)},_onMouse:function(a){if(this.hovering){var b=+dojo.attr(a.target,"value");this.onMouseOver(a,b),this._renderStars(b,!0)}else this._renderStars(this.value)},_renderStars:function(a,b){dojo.query(".dojoxRatingStar",this.domNode).forEach(function(c,d){d+1>a?(dojo.removeClass(c,"dojoxRatingStarHover"),dojo.removeClass(c,"dojoxRatingStarChecked")):(dojo.removeClass(c,"dojoxRatingStar"+(b?"Checked":"Hover")),dojo.addClass(c,"dojoxRatingStar"+(b?"Hover":"Checked")))})},onStarClick:function(a){var b=+dojo.attr(a.target,"value");this.setAttribute("value",b==this.value?0:b),this._renderStars(this.value),this.onChange(this.value)},onMouseOver:function(){},setAttribute:function(a,b){this.inherited("setAttribute",arguments),a=="value"&&(this._renderStars(this.value),this.onChange(this.value))}})