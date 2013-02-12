dojo.provide("dojox.form.PasswordValidator"),dojo.require("dijit.form._FormWidget"),dojo.require("dijit.form.ValidationTextBox"),dojo.requireLocalization("dojox.form","PasswordValidator"),dojo.declare("dojox.form._ChildTextBox",dijit.form.ValidationTextBox,{containerWidget:null,type:"password",reset:function(){dijit.form.ValidationTextBox.prototype._setValueAttr.call(this,"",!0),this._hasBeenBlurred=!1},postCreate:function(){this.inherited(arguments),this.name||dojo.removeAttr(this.focusNode,"name"),this.connect(this.focusNode,"onkeypress","_onChildKeyPress")},_onChildKeyPress:function(a){a&&a.keyCode==dojo.keys.ENTER&&this._setBlurValue()}}),dojo.declare("dojox.form._OldPWBox",dojox.form._ChildTextBox,{_isPWValid:!1,_setValueAttr:function(a,b){a===""&&(a=dojox.form._OldPWBox.superclass.attr.call(this,"value")),b!==null&&(this._isPWValid=this.containerWidget.pwCheck(a)),this.inherited(arguments),this.containerWidget._childValueAttr(this.containerWidget._inputWidgets[1].get("value"))},isValid:function(a){return this.inherited("isValid",arguments)&&this._isPWValid},_update:function(a){this._hasBeenBlurred&&this.validate(!0),this._onMouse(a)},_getValueAttr:function(){if(this.containerWidget._started&&this.containerWidget.isValid())return this.inherited(arguments);return""},_setBlurValue:function(){var a=dijit.form.ValidationTextBox.prototype._getValueAttr.call(this);this._setValueAttr(a,this.isValid?this.isValid():!0)}}),dojo.declare("dojox.form._NewPWBox",dojox.form._ChildTextBox,{required:!0,onChange:function(){this.containerWidget._inputWidgets[2].validate(!1),this.inherited(arguments)}}),dojo.declare("dojox.form._VerifyPWBox",dojox.form._ChildTextBox,{isValid:function(a){return this.inherited("isValid",arguments)&&this.get("value")==this.containerWidget._inputWidgets[1].get("value")}}),dojo.declare("dojox.form.PasswordValidator",dijit.form._FormValueWidget,{required:!0,_inputWidgets:null,oldName:"",templateString:dojo.cache("dojox.form","resources/PasswordValidator.html"),_hasBeenBlurred:!1,isValid:function(a){return dojo.every(this._inputWidgets,function(a){a&&a._setStateClass&&a._setStateClass();return!a||a.isValid()})},validate:function(a){return dojo.every(dojo.map(this._inputWidgets,function(a){if(a&&a.validate){a._hasBeenBlurred=a._hasBeenBlurred||this._hasBeenBlurred;return a.validate()}return!0},this),"return item;")},reset:function(){this._hasBeenBlurred=!1,dojo.forEach(this._inputWidgets,function(a){a&&a.reset&&a.reset()},this)},_createSubWidgets:function(){var a=this._inputWidgets,b=dojo.i18n.getLocalization("dojox.form","PasswordValidator",this.lang);dojo.forEach(a,function(c,d){if(c){var e={containerWidget:this},f;d===0?(e.name=this.oldName,e.invalidMessage=b.badPasswordMessage,f=dojox.form._OldPWBox):d===1?(e.required=this.required,f=dojox.form._NewPWBox):d===2&&(e.invalidMessage=b.nomatchMessage,f=dojox.form._VerifyPWBox),a[d]=new f(e,c)}},this)},pwCheck:function(a){return!1},postCreate:function(){this.inherited(arguments);var a=this._inputWidgets=[];dojo.forEach(["old","new","verify"],function(b){a.push(dojo.query("input[pwType="+b+"]",this.containerNode)[0])},this);if(!a[1]||!a[2])throw new Error('Need at least pwType="new" and pwType="verify"');if(this.oldName&&!a[0])throw new Error('Need to specify pwType="old" if using oldName');this.containerNode=this.domNode,this._createSubWidgets(),this.connect(this._inputWidgets[1],"_setValueAttr","_childValueAttr"),this.connect(this._inputWidgets[2],"_setValueAttr","_childValueAttr")},_childValueAttr:function(a){this.set("value",this.isValid()?a:"")},_setDisabledAttr:function(a){this.inherited(arguments),dojo.forEach(this._inputWidgets,function(b){b&&b.set&&b.set("disabled",a)})},_setRequiredAttribute:function(a){this.required=a,dojo.attr(this.focusNode,"required",a),dijit.setWaiState(this.focusNode,"required",a),this._refreshState(),dojo.forEach(this._inputWidgets,function(b){b&&b.set&&b.set("required",a)})},_setValueAttr:function(a){this.inherited(arguments),dojo.attr(this.focusNode,"value",a)},_getValueAttr:function(){return this.inherited(arguments)||""},focus:function(){var a=!1;dojo.forEach(this._inputWidgets,function(b){b&&!b.isValid()&&!a&&(b.focus(),a=!0)}),a||this._inputWidgets[1].focus()}})