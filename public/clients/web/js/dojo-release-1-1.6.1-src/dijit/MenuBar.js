define("dijit/MenuBar",["dojo","dijit","text!dijit/templates/MenuBar.html","dijit/Menu"],function(a,b){a.declare("dijit.MenuBar",b._MenuBase,{templateString:a.cache("dijit","templates/MenuBar.html"),baseClass:"dijitMenuBar",_isMenuBar:!0,postCreate:function(){var b=a.keys,c=this.isLeftToRight();this.connectKeyNavHandlers(c?[b.LEFT_ARROW]:[b.RIGHT_ARROW],c?[b.RIGHT_ARROW]:[b.LEFT_ARROW]),this._orient=this.isLeftToRight()?{BL:"TL"}:{BR:"TR"}},focusChild:function(a){var b=this.focusedChild,c=b&&b.popup&&b.popup.isShowingNow;this.inherited(arguments),c&&a.popup&&!a.disabled&&this._openPopup()},_onKeyPress:function(b){if(!b.ctrlKey&&!b.altKey)switch(b.charOrCode){case a.keys.DOWN_ARROW:this._moveToPopup(b),a.stopEvent(b)}},onItemClick:function(a,b){a.popup&&a.popup.isShowingNow?a.popup.onCancel():this.inherited(arguments)}});return b.MenuBar})