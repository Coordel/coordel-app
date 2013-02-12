define("dijit/form/SimpleTextarea",["dojo","dijit","dijit/form/TextBox"],function(a,b){a.declare("dijit.form.SimpleTextarea",b.form.TextBox,{baseClass:"dijitTextBox dijitTextArea",attributeMap:a.delegate(b.form._FormValueWidget.prototype.attributeMap,{rows:"textbox",cols:"textbox"}),rows:"3",cols:"20",templateString:"<textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",postMixInProperties:function(){!this.value&&this.srcNodeRef&&(this.value=this.srcNodeRef.value),this.inherited(arguments)},buildRendering:function(){this.inherited(arguments),a.isIE&&this.cols&&a.addClass(this.textbox,"dijitTextAreaCols")},filter:function(a){a&&(a=a.replace(/\r/g,""));return this.inherited(arguments)},_previousValue:"",_onInput:function(b){if(this.maxLength){var c=parseInt(this.maxLength),d=this.textbox.value.replace(/\r/g,""),e=d.length-c;if(e>0){b&&a.stopEvent(b);var f=this.textbox;if(f.selectionStart){var g=f.selectionStart,h=0;a.isOpera&&(h=(this.textbox.value.substring(0,g).match(/\r/g)||[]).length),this.textbox.value=d.substring(0,g-e-h)+d.substring(g-h),f.setSelectionRange(g-e,g-e)}else if(a.doc.selection){f.focus();var i=a.doc.selection.createRange();i.moveStart("character",-e),i.text="",i.select()}}this._previousValue=this.textbox.value}this.inherited(arguments)}});return b.form.SimpleTextarea})