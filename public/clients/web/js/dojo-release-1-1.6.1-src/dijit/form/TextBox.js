define("dijit/form/TextBox",["dojo","dijit","text!dijit/form/templates/TextBox.html","dijit/form/_FormWidget"],function(a,b){a.declare("dijit.form.TextBox",b.form._FormValueWidget,{trim:!1,uppercase:!1,lowercase:!1,propercase:!1,maxLength:"",selectOnClick:!1,placeHolder:"",templateString:a.cache("dijit.form","templates/TextBox.html"),_singleNodeTemplate:'<input class="dijit dijitReset dijitLeft dijitInputField" dojoAttachPoint="textbox,focusNode" autocomplete="off" type="${type}" ${!nameAttrSetting} />',_buttonInputDisabled:a.isIE?"disabled":"",baseClass:"dijitTextBox",attributeMap:a.delegate(b.form._FormValueWidget.prototype.attributeMap,{maxLength:"focusNode"}),postMixInProperties:function(){var a=this.type.toLowerCase();if(this.templateString&&this.templateString.toLowerCase()=="input"||(a=="hidden"||a=="file")&&this.templateString==b.form.TextBox.prototype.templateString)this.templateString=this._singleNodeTemplate;this.inherited(arguments)},_setPlaceHolderAttr:function(b){this._set("placeHolder",b),this._phspan||(this._attachPoints.push("_phspan"),this._phspan=a.create("span",{className:"dijitPlaceHolder dijitInputField"},this.textbox,"after")),this._phspan.innerHTML="",this._phspan.appendChild(document.createTextNode(b)),this._updatePlaceHolder()},_updatePlaceHolder:function(){this._phspan&&(this._phspan.style.display=this.placeHolder&&!this._focused&&!this.textbox.value?"":"none")},_getValueAttr:function(){return this.parse(this.get("displayedValue"),this.constraints)},_setValueAttr:function(a,b,c){var d;a!==undefined&&(d=this.filter(a),typeof c!="string"&&(d===null||typeof d=="number"&&isNaN(d)?c="":c=this.filter(this.format(d,this.constraints)))),c!=null&&c!=undefined&&(typeof c!="number"||!isNaN(c))&&this.textbox.value!=c&&(this.textbox.value=c,this._set("displayedValue",this.get("displayedValue"))),this._updatePlaceHolder(),this.inherited(arguments,[d,b])},displayedValue:"",getDisplayedValue:function(){a.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use set('displayedValue') instead.","","2.0");return this.get("displayedValue")},_getDisplayedValueAttr:function(){return this.filter(this.textbox.value)},setDisplayedValue:function(b){a.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.","","2.0"),this.set("displayedValue",b)},_setDisplayedValueAttr:function(a){a===null||a===undefined?a="":typeof a!="string"&&(a=String(a)),this.textbox.value=a,this._setValueAttr(this.get("value"),undefined),this._set("displayedValue",this.get("displayedValue"))},format:function(a,b){return a==null||a==undefined?"":a.toString?a.toString():a},parse:function(a,b){return a},_refreshState:function(){},_onInput:function(b){if(b&&b.type&&/key/i.test(b.type)&&b.keyCode)switch(b.keyCode){case a.keys.SHIFT:case a.keys.ALT:case a.keys.CTRL:case a.keys.TAB:return}if(this.intermediateChanges){var c=this;setTimeout(function(){c._handleOnChange(c.get("value"),!1)},0)}this._refreshState(),this._set("displayedValue",this.get("displayedValue"))},postCreate:function(){a.isIE&&setTimeout(a.hitch(this,function(){var b=a.getComputedStyle(this.domNode);if(b){var c=b.fontFamily;if(c){var d=this.domNode.getElementsByTagName("INPUT");if(d)for(var e=0;e<d.length;e++)d[e].style.fontFamily=c}}}),0),this.textbox.setAttribute("value",this.textbox.value),this.inherited(arguments),a.isMoz||a.isOpera?this.connect(this.textbox,"oninput","_onInput"):(this.connect(this.textbox,"onkeydown","_onInput"),this.connect(this.textbox,"onkeyup","_onInput"),this.connect(this.textbox,"onpaste","_onInput"),this.connect(this.textbox,"oncut","_onInput"))},_blankValue:"",filter:function(b){if(b===null)return this._blankValue;if(typeof b!="string")return b;this.trim&&(b=a.trim(b)),this.uppercase&&(b=b.toUpperCase()),this.lowercase&&(b=b.toLowerCase()),this.propercase&&(b=b.replace(/[^\s]+/g,function(a){return a.substring(0,1).toUpperCase()+a.substring(1)}));return b},_setBlurValue:function(){this._setValueAttr(this.get("value"),!0)},_onBlur:function(b){this.disabled||(this._setBlurValue(),this.inherited(arguments),this._selectOnClickHandle&&this.disconnect(this._selectOnClickHandle),this.selectOnClick&&a.isMoz&&(this.textbox.selectionStart=this.textbox.selectionEnd=undefined),this._updatePlaceHolder())},_onFocus:function(c){!this.disabled&&!this.readOnly&&(this.selectOnClick&&c=="mouse"&&(this._selectOnClickHandle=this.connect(this.domNode,"onmouseup",function(){this.disconnect(this._selectOnClickHandle);var c;if(a.isIE){var d=a.doc.selection.createRange(),e=d.parentElement();c=e==this.textbox&&d.text.length==0}else c=this.textbox.selectionStart==this.textbox.selectionEnd;c&&b.selectInputText(this.textbox)})),this._updatePlaceHolder(),this.inherited(arguments),this._refreshState())},reset:function(){this.textbox.value="",this.inherited(arguments)}}),b.selectInputText=function(c,d,e){var f=a.global,g=a.doc;c=a.byId(c),isNaN(d)&&(d=0),isNaN(e)&&(e=c.value?c.value.length:0),b.focus(c);if(g.selection&&a.body().createTextRange){if(c.createTextRange){var h=c.createTextRange();h.collapse(!0),h.moveStart("character",-99999),h.moveStart("character",d),h.moveEnd("character",e-d),h.select()}}else f.getSelection&&(c.setSelectionRange&&c.setSelectionRange(d,e))};return b.form.TextBox})