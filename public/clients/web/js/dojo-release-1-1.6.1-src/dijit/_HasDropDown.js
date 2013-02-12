define("dijit/_HasDropDown",["dojo","dijit","dijit/_Widget"],function(a,b){a.declare("dijit._HasDropDown",null,{_buttonNode:null,_arrowWrapperNode:null,_popupStateNode:null,_aroundNode:null,dropDown:null,autoWidth:!0,forceWidth:!1,maxHeight:0,dropDownPosition:["below","above"],_stopClickEvents:!0,_onDropDownMouseDown:function(b){!this.disabled&&!this.readOnly&&(a.stopEvent(b),this._docHandler=this.connect(a.doc,"onmouseup","_onDropDownMouseUp"),this.toggleDropDown())},_onDropDownMouseUp:function(c){c&&this._docHandler&&this.disconnect(this._docHandler);var d=this.dropDown,e=!1;if(c&&this._opened){var f=a.position(this._buttonNode,!0);if(c.pageX<f.x||c.pageX>f.x+f.w||(c.pageY<f.y||c.pageY>f.y+f.h)){var g=c.target;while(g&&!e)a.hasClass(g,"dijitPopup")?e=!0:g=g.parentNode;if(e){g=c.target;if(d.onItemClick){var h;while(g&&!(h=b.byNode(g)))g=g.parentNode;h&&h.onClick&&h.getParent&&h.getParent().onItemClick(h,c)}return}}}this._opened&&d.focus&&d.autoFocus!==!1&&window.setTimeout(a.hitch(d,"focus"),1)},_onDropDownClick:function(b){this._stopClickEvents&&a.stopEvent(b)},buildRendering:function(){this.inherited(arguments),this._buttonNode=this._buttonNode||this.focusNode||this.domNode,this._popupStateNode=this._popupStateNode||this.focusNode||this._buttonNode;var b=({after:this.isLeftToRight()?"Right":"Left",before:this.isLeftToRight()?"Left":"Right",above:"Up",below:"Down",left:"Left",right:"Right"})[this.dropDownPosition[0]]||this.dropDownPosition[0]||"Down";a.addClass(this._arrowWrapperNode||this._buttonNode,"dijit"+b+"ArrowButton")},postCreate:function(){this.inherited(arguments),this.connect(this._buttonNode,"onmousedown","_onDropDownMouseDown"),this.connect(this._buttonNode,"onclick","_onDropDownClick"),this.connect(this.focusNode,"onkeypress","_onKey"),this.connect(this.focusNode,"onkeyup","_onKeyUp")},destroy:function(){this.dropDown&&(this.dropDown._destroyed||this.dropDown.destroyRecursive(),delete this.dropDown),this.inherited(arguments)},_onKey:function(b){if(!this.disabled&&!this.readOnly){var c=this.dropDown,d=b.target;if(c&&this._opened&&c.handleKey)if(c.handleKey(b)===!1){a.stopEvent(b);return}c&&this._opened&&b.charOrCode==a.keys.ESCAPE?(this.closeDropDown(),a.stopEvent(b)):!this._opened&&(b.charOrCode==a.keys.DOWN_ARROW||(b.charOrCode==a.keys.ENTER||b.charOrCode==" ")&&((d.tagName||"").toLowerCase()!=="input"||d.type&&d.type.toLowerCase()!=="text"))&&(this._toggleOnKeyUp=!0,a.stopEvent(b))}},_onKeyUp:function(){if(this._toggleOnKeyUp){delete this._toggleOnKeyUp,this.toggleDropDown();var b=this.dropDown;b&&b.focus&&setTimeout(a.hitch(b,"focus"),1)}},_onBlur:function(){var c=b._curFocus&&this.dropDown&&a.isDescendant(b._curFocus,this.dropDown.domNode);this.closeDropDown(c),this.inherited(arguments)},isLoaded:function(){return!0},loadDropDown:function(a){a()},toggleDropDown:function(){if(!this.disabled&&!this.readOnly)if(this._opened)this.closeDropDown();else if(this.isLoaded())this.openDropDown();else{this.loadDropDown(a.hitch(this,"openDropDown"));return}},openDropDown:function(){var c=this.dropDown,d=c.domNode,e=this._aroundNode||this.domNode,f=this;this._preparedNode||(this._preparedNode=!0,d.style.width&&(this._explicitDDWidth=!0),d.style.height&&(this._explicitDDHeight=!0));if(this.maxHeight||this.forceWidth||this.autoWidth){var g={display:"",visibility:"hidden"};this._explicitDDWidth||(g.width=""),this._explicitDDHeight||(g.height=""),a.style(d,g);var h=this.maxHeight;if(h==-1){var i=a.window.getBox(),j=a.position(e,!1);h=Math.floor(Math.max(j.y,i.h-(j.y+j.h)))}c.startup&&!c._started&&c.startup(),b.popup.moveOffScreen(c);var k=a._getMarginSize(d),l=h&&k.h>h;a.style(d,{overflowX:"hidden",overflowY:l?"auto":"hidden"}),l?(k.h=h,"w"in k&&(k.w+=16)):delete k.h,this.forceWidth?k.w=e.offsetWidth:this.autoWidth?k.w=Math.max(k.w,e.offsetWidth):delete k.w,a.isFunction(c.resize)?c.resize(k):a.marginBox(d,k)}var m=b.popup.open({parent:this,popup:c,around:e,orient:b.getPopupAroundAlignment(this.dropDownPosition&&this.dropDownPosition.length?this.dropDownPosition:["below"],this.isLeftToRight()),onExecute:function(){f.closeDropDown(!0)},onCancel:function(){f.closeDropDown(!0)},onClose:function(){a.attr(f._popupStateNode,"popupActive",!1),a.removeClass(f._popupStateNode,"dijitHasDropDownOpen"),f._opened=!1}});a.attr(this._popupStateNode,"popupActive","true"),a.addClass(f._popupStateNode,"dijitHasDropDownOpen"),this._opened=!0;return m},closeDropDown:function(a){this._opened&&(a&&this.focus(),b.popup.close(this.dropDown),this._opened=!1)}});return b._HasDropDown})