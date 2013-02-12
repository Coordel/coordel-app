define("dijit/form/_FormWidget",["dojo","dijit","dojo/window","dijit/_Widget","dijit/_Templated","dijit/_CssStateMixin"],function(a,b){a.declare("dijit.form._FormWidget",[b._Widget,b._Templated,b._CssStateMixin],{name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:!1,intermediateChanges:!1,scrollOnFocus:!0,attributeMap:a.delegate(b._Widget.prototype.attributeMap,{value:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode",title:"focusNode"}),postMixInProperties:function(){this.nameAttrSetting=this.name?'name="'+this.name.replace(/'/g,"&quot;")+'"':"",this.inherited(arguments)},postCreate:function(){this.inherited(arguments),this.connect(this.domNode,"onmousedown","_onMouseDown")},_setDisabledAttr:function(c){this._set("disabled",c),a.attr(this.focusNode,"disabled",c),this.valueNode&&a.attr(this.valueNode,"disabled",c),b.setWaiState(this.focusNode,"disabled",c);if(c){this._set("hovering",!1),this._set("active",!1);var d="tabIndex"in this.attributeMap?this.attributeMap.tabIndex:"focusNode";a.forEach(a.isArray(d)?d:[d],function(c){var d=this[c];a.isWebKit||b.hasDefaultTabStop(d)?d.setAttribute("tabIndex","-1"):d.removeAttribute("tabIndex")},this)}else this.tabIndex!=""&&this.focusNode.setAttribute("tabIndex",this.tabIndex)},setDisabled:function(b){a.deprecated("setDisabled("+b+") is deprecated. Use set('disabled',"+b+") instead.","","2.0"),this.set("disabled",b)},_onFocus:function(b){this.scrollOnFocus&&a.window.scrollIntoView(this.domNode),this.inherited(arguments)},isFocusable:function(){return!this.disabled&&this.focusNode&&a.style(this.domNode,"display")!="none"},focus:function(){this.disabled||b.focus(this.focusNode)},compare:function(a,b){return typeof a=="number"&&typeof b=="number"?isNaN(a)&&isNaN(b)?0:a-b:a>b?1:a<b?-1:0},onChange:function(a){},_onChangeActive:!1,_handleOnChange:function(b,c){this._lastValueReported==undefined&&(c===null||!this._onChangeActive)&&(this._resetValue=this._lastValueReported=b),this._pendingOnChange=this._pendingOnChange||typeof b!=typeof this._lastValueReported||this.compare(b,this._lastValueReported)!=0,(this.intermediateChanges||c||c===undefined)&&this._pendingOnChange&&(this._lastValueReported=b,this._pendingOnChange=!1,this._onChangeActive&&(this._onChangeHandle&&clearTimeout(this._onChangeHandle),this._onChangeHandle=setTimeout(a.hitch(this,function(){this._onChangeHandle=null,this.onChange(b)}),0)))},create:function(){this.inherited(arguments),this._onChangeActive=!0},destroy:function(){this._onChangeHandle&&(clearTimeout(this._onChangeHandle),this.onChange(this._lastValueReported)),this.inherited(arguments)},setValue:function(b){a.deprecated("dijit.form._FormWidget:setValue("+b+") is deprecated.  Use set('value',"+b+") instead.","","2.0"),this.set("value",b)},getValue:function(){a.deprecated(this.declaredClass+"::getValue() is deprecated. Use get('value') instead.","","2.0");return this.get("value")},_onMouseDown:function(b){if(!b.ctrlKey&&a.mouseButtons.isLeft(b)&&this.isFocusable())var c=this.connect(a.body(),"onmouseup",function(){this.isFocusable()&&this.focus(),this.disconnect(c)})}}),a.declare("dijit.form._FormValueWidget",b.form._FormWidget,{readOnly:!1,attributeMap:a.delegate(b.form._FormWidget.prototype.attributeMap,{value:"",readOnly:"focusNode"}),_setReadOnlyAttr:function(c){a.attr(this.focusNode,"readOnly",c),b.setWaiState(this.focusNode,"readonly",c),this._set("readOnly",c)},postCreate:function(){this.inherited(arguments),(a.isIE<9||a.isIE&&a.isQuirks)&&this.connect(this.focusNode||this.domNode,"onkeydown",this._onKeyDown),this._resetValue===undefined&&(this._lastValueReported=this._resetValue=this.value)},_setValueAttr:function(a,b){this._handleOnChange(a,b)},_handleOnChange:function(a,b){this._set("value",a),this.inherited(arguments)},undo:function(){this._setValueAttr(this._lastValueReported,!1)},reset:function(){this._hasBeenBlurred=!1,this._setValueAttr(this._resetValue,!0)},_onKeyDown:function(b){if(b.keyCode==a.keys.ESCAPE&&!(b.ctrlKey||b.altKey||b.metaKey)){var c;a.isIE&&(b.preventDefault(),c=document.createEventObject(),c.keyCode=a.keys.ESCAPE,c.shiftKey=b.shiftKey,b.srcElement.fireEvent("onkeypress",c))}},_layoutHackIE7:function(){if(a.isIE==7){var b=this.domNode,c=b.parentNode,d=b.firstChild||b,e=d.style.filter,f=this;while(c&&c.clientHeight==0)(function g(){var a=f.connect(c,"onscroll",function(b){f.disconnect(a),d.style.filter=(new Date).getMilliseconds(),setTimeout(function(){d.style.filter=e},0)})})(),c=c.parentNode}}});return b.form._FormWidget})