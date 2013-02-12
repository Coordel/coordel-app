define("dijit/layout/StackContainer",["dojo","dijit","dijit/_Templated","dijit/layout/_LayoutWidget","i18n!dijit/nls/common","dojo/cookie","dijit/layout/StackController"],function(a,b){a.declare("dijit.layout.StackContainer",b.layout._LayoutWidget,{doLayout:!0,persist:!1,baseClass:"dijitStackContainer",buildRendering:function(){this.inherited(arguments),a.addClass(this.domNode,"dijitLayoutContainer"),b.setWaiRole(this.containerNode,"tabpanel")},postCreate:function(){this.inherited(arguments),this.connect(this.domNode,"onkeypress",this._onKeyPress)},startup:function(){if(!this._started){var c=this.getChildren();a.forEach(c,this._setupChild,this),this.persist?this.selectedChildWidget=b.byId(a.cookie(this.id+"_selectedChild")):a.some(c,function(a){a.selected&&(this.selectedChildWidget=a);return a.selected},this);var d=this.selectedChildWidget;!d&&c[0]&&(d=this.selectedChildWidget=c[0],d.selected=!0),a.publish(this.id+"-startup",[{children:c,selected:d}]),this.inherited(arguments)}},resize:function(){var a=this.selectedChildWidget;a&&!this._hasBeenShown&&(this._hasBeenShown=!0,this._showChild(a)),this.inherited(arguments)},_setupChild:function(b){this.inherited(arguments),a.replaceClass(b.domNode,"dijitHidden","dijitVisible"),b.domNode.title=""},addChild:function(b,c){this.inherited(arguments),this._started&&(a.publish(this.id+"-addChild",[b,c]),this.layout(),this.selectedChildWidget||this.selectChild(b))},removeChild:function(b){this.inherited(arguments),this._started&&a.publish(this.id+"-removeChild",[b]);if(!this._beingDestroyed){if(this.selectedChildWidget===b){this.selectedChildWidget=undefined;if(this._started){var c=this.getChildren();c.length&&this.selectChild(c[0])}}this._started&&this.layout()}},selectChild:function(c,d){c=b.byId(c);if(this.selectedChildWidget!=c){var e=this._transition(c,this.selectedChildWidget,d);this._set("selectedChildWidget",c),a.publish(this.id+"-selectChild",[c]),this.persist&&a.cookie(this.id+"_selectedChild",this.selectedChildWidget.id)}return e},_transition:function(a,b,c){b&&this._hideChild(b);var d=this._showChild(a);a.resize&&(this.doLayout?a.resize(this._containerContentBox||this._contentBox):a.resize());return d},_adjacent:function(b){var c=this.getChildren(),d=a.indexOf(c,this.selectedChildWidget);d+=b?1:c.length-1;return c[d%c.length]},forward:function(){return this.selectChild(this._adjacent(!0),!0)},back:function(){return this.selectChild(this._adjacent(!1),!0)},_onKeyPress:function(b){a.publish(this.id+"-containerKeyPress",[{e:b,page:this}])},layout:function(){this.doLayout&&this.selectedChildWidget&&this.selectedChildWidget.resize&&this.selectedChildWidget.resize(this._containerContentBox||this._contentBox)},_showChild:function(b){var c=this.getChildren();b.isFirstChild=b==c[0],b.isLastChild=b==c[c.length-1],b._set("selected",!0),a.replaceClass(b.domNode,"dijitVisible","dijitHidden");return b._onShow()||!0},_hideChild:function(b){b._set("selected",!1),a.replaceClass(b.domNode,"dijitHidden","dijitVisible"),b.onHide()},closeChild:function(a){var b=a.onClose(this,a);b&&(this.removeChild(a),a.destroyRecursive())},destroyDescendants:function(b){a.forEach(this.getChildren(),function(a){this.removeChild(a),a.destroyRecursive(b)},this)}}),a.extend(b._Widget,{selected:!1,closable:!1,iconClass:"",showTitle:!0});return b.layout.StackContainer})