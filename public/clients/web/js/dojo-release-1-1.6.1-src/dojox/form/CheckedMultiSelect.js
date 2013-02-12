define(["dojo","dijit","dojo/i18n","dijit/_Templated","dijit/_Widget","dijit/Menu","dijit/MenuItem","dijit/Tooltip","dijit/form/_FormSelectWidget","dijit/form/CheckBox","dijit/form/ComboButton"],function(a,b){a.declare("dojox.form._CheckedMultiSelectItem",[b._Widget,b._Templated],{widgetsInTemplate:!0,templateString:a.cache("dojox.form","resources/_CheckedMultiSelectItem.html"),baseClass:"dojoxMultiSelectItem",option:null,parent:null,disabled:!1,readOnly:!1,postMixInProperties:function(){this._type=this.parent.multiple?{type:"checkbox",baseClass:"dijitCheckBox"}:{type:"radio",baseClass:"dijitRadio"},this.disabled=this.option.disabled=this.option.disabled||!1,this.inherited(arguments)},postCreate:function(){this.inherited(arguments),this.labelNode.innerHTML=this.option.label},_changeBox:function(){!this.get("disabled")&&!this.get("readOnly")&&(this.parent.multiple?this.option.selected=this.checkBox.get("value")&&!0:this.parent.set("value",this.option.value),this.parent._updateSelection(),this.parent.focus())},_onClick:function(b){this.get("disabled")||this.get("readOnly")?a.stopEvent(b):this.checkBox._onClick(b)},_updateBox:function(){this.checkBox.set("value",this.option.selected)},_setDisabledAttr:function(b){this.disabled=b||this.option.disabled,this.checkBox.set("disabled",this.disabled),a.toggleClass(this.domNode,"dojoxMultiSelectDisabled",this.disabled)},_setReadOnlyAttr:function(a){this.checkBox.set("readOnly",a),this.readOnly=a}}),a.declare("dojox.form._CheckedMultiSelectMenu",b.Menu,{multiple:!1,buildRendering:function(){this.inherited(arguments);var b=this.menuTableNode=this.domNode,c=this.domNode=a.create("div",{style:{overflowX:"hidden",overflowY:"scroll"}});b.parentNode&&b.parentNode.replaceChild(c,b),a.removeClass(b,"dijitMenuTable"),c.className=b.className+" dojoxCheckedMultiSelectMenu",b.className="dijitReset dijitMenuTable",b.setAttribute("role","listbox"),c.setAttribute("role","presentation"),c.appendChild(b)},resize:function(b){b&&(a.marginBox(this.domNode,b),"w"in b&&(this.menuTableNode.style.width="100%"))},onClose:function(){this.inherited(arguments),this.menuTableNode&&(this.menuTableNode.style.width="")},onItemClick:function(a,b){typeof this.isShowingNow=="undefined"&&this._markActive(),this.focusChild(a);if(a.disabled||a.readOnly)return!1;this.multiple||this.onExecute(),a.onClick(b)}}),a.declare("dojox.form._CheckedMultiSelectMenuItem",b.MenuItem,{templateString:a.cache("dojox.form","resources/_CheckedMultiSelectMenuItem.html"),option:null,parent:null,_iconClass:"",postMixInProperties:function(){this.parent.multiple?(this._iconClass="dojoxCheckedMultiSelectMenuCheckBoxItemIcon",this._type={type:"checkbox"}):(this._iconClass="",this._type={type:"hidden"}),this.disabled=this.option.disabled,this.checked=this.option.selected,this.label=this.option.label,this.readOnly=this.option.readOnly,this.inherited(arguments)},onChange:function(a){},_updateBox:function(){a.toggleClass(this.domNode,"dojoxCheckedMultiSelectMenuItemChecked",!!this.option.selected),this.domNode.setAttribute("aria-checked",this.option.selected),this.inputNode.checked=this.option.selected,this.parent.multiple||a.toggleClass(this.domNode,"dijitSelectSelectedOption",!!this.option.selected)},_onClick:function(b){!this.disabled&&!this.readOnly&&(this.parent.multiple?(this.option.selected=!this.option.selected,this.parent.onChange(),this.onChange(this.option.selected)):this.option.selected||(a.forEach(this.parent.getChildren(),function(a){a.option.selected=!1}),this.option.selected=!0,this.parent.onChange(),this.onChange(this.option.selected))),this.inherited(arguments)}}),a.declare("dojox.form.CheckedMultiSelect",b.form._FormSelectWidget,{templateString:a.cache("dojox.form","resources/CheckedMultiSelect.html"),baseClass:"dojoxCheckedMultiSelect",required:!1,invalidMessage:"$_unset_$",_message:"",dropDown:!1,labelText:"",tooltipPosition:[],setStore:function(b,c,d){this.inherited(arguments);var e=function(b){var c=a.map(b,function(a){return a.value[0]});c.length&&this.set("value",c)};this.store.fetch({query:{selected:!0},onComplete:e,scope:this})},postMixInProperties:function(){this.inherited(arguments)},_fillContent:function(){this.inherited(arguments);if(this.options.length&&!this.value&&this.srcNodeRef){var b=this.srcNodeRef.selectedIndex||0;this.value=this.options[b>=0?b:0].value}this.dropDown&&(a.toggleClass(this.selectNode,"dojoxCheckedMultiSelectHidden"),this.dropDownMenu=new dojox.form._CheckedMultiSelectMenu({id:this.id+"_menu",style:"display: none;",multiple:this.multiple,onChange:a.hitch(this,"_updateSelection")}))},startup:function(){this.inherited(arguments),this.dropDown&&(this.dropDownButton=new b.form.ComboButton({label:this.labelText,dropDown:this.dropDownMenu,baseClass:"dojoxCheckedMultiSelectButton",maxHeight:this.maxHeight},this.comboButtonNode))},_onMouseDown:function(b){a.stopEvent(b)},validator:function(){if(!this.required)return!0;return a.some(this.getOptions(),function(a){return a.selected&&a.value!=null&&a.value.toString().length!=0})},validate:function(a){b.hideTooltip(this.domNode);var c=this.isValid(a);c||this.displayMessage(this.invalidMessage);return c},isValid:function(a){return this.validator()},getErrorMessage:function(a){return this.invalidMessage},displayMessage:function(a){b.hideTooltip(this.domNode),a&&b.showTooltip(a,this.domNode,this.tooltipPosition)},onAfterAddOptionItem:function(a,b){},_addOptionItem:function(a){var b;this.dropDown?(b=new dojox.form._CheckedMultiSelectMenuItem({option:a,parent:this.dropDownMenu}),this.dropDownMenu.addChild(b)):(b=new dojox.form._CheckedMultiSelectItem({option:a,parent:this}),this.wrapperDiv.appendChild(b.domNode)),this.onAfterAddOptionItem(b,a)},_refreshState:function(){this.validate(this.focused)},onChange:function(a){this._refreshState()},reset:function(){this.inherited(arguments),b.hideTooltip(this.domNode)},_updateSelection:function(){this.inherited(arguments),this._handleOnChange(this.value),a.forEach(this._getChildren(),function(a){a._updateBox()});if(this.dropDown&&this.dropDownButton){var b=0,c="";a.forEach(this.options,function(a){a.selected&&(b++,c=a.label)})}},_getChildren:function(){return this.dropDown?this.dropDownMenu.getChildren():a.map(this.wrapperDiv.childNodes,function(a){return b.byNode(a)})},invertSelection:function(b){this.multiple&&(a.forEach(this.options,function(a){a.selected=!a.selected}),this._updateSelection())},_setDisabledAttr:function(b){this.inherited(arguments),this.dropDown&&this.dropDownButton.set("disabled",b),a.forEach(this._getChildren(),function(a){a&&a.set&&a.set("disabled",b)})},_setReadOnlyAttr:function(b){this.inherited(arguments),"readOnly"in this.attributeMap&&this._attrToDom("readOnly",b),this.readOnly=b,a.forEach(this._getChildren(),function(a){a&&a.set&&a.set("readOnly",b)})},uninitialize:function(){b.hideTooltip(this.domNode),a.forEach(this._getChildren(),function(a){a.destroyRecursive()}),this.inherited(arguments)}});return dojox.form.CheckedMultiSelect})