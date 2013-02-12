define("dijit/_CssStateMixin",["dojo","dijit"],function(a,b){a.declare("dijit._CssStateMixin",[],{cssStateNodes:{},hovering:!1,active:!1,_applyAttributes:function(){this.inherited(arguments),a.forEach(["onmouseenter","onmouseleave","onmousedown"],function(a){this.connect(this.domNode,a,"_cssMouseEvent")},this),a.forEach(["disabled","readOnly","checked","selected","focused","state","hovering","active"],function(b){this.watch(b,a.hitch(this,"_setStateClass"))},this);for(var b in this.cssStateNodes)this._trackMouseState(this[b],this.cssStateNodes[b]);this._setStateClass()},_cssMouseEvent:function(b){if(!this.disabled)switch(b.type){case"mouseenter":case"mouseover":this._set("hovering",!0),this._set("active",this._mouseDown);break;case"mouseleave":case"mouseout":this._set("hovering",!1),this._set("active",!1);break;case"mousedown":this._set("active",!0),this._mouseDown=!0;var c=this.connect(a.body(),"onmouseup",function(){this._mouseDown=!1,this._set("active",!1),this.disconnect(c)})}},_setStateClass:function(){function c(c){b=b.concat(a.map(b,function(a){return a+c}),"dijit"+c)}var b=this.baseClass.split(" ");this.isLeftToRight()||c("Rtl"),this.checked&&c("Checked"),this.state&&c(this.state),this.selected&&c("Selected"),this.disabled?c("Disabled"):this.readOnly?c("ReadOnly"):this.active?c("Active"):this.hovering&&c("Hover"),this._focused&&c("Focused");var d=this.stateNode||this.domNode,e={};a.forEach(d.className.split(" "),function(a){e[a]=!0}),"_stateClasses"in this&&a.forEach(this._stateClasses,function(a){delete e[a]}),a.forEach(b,function(a){e[a]=!0});var f=[];for(var g in e)f.push(g);d.className=f.join(" "),this._stateClasses=b},_trackMouseState:function(b,c){function i(){var h="disabled"in g&&g.disabled||"readonly"in g&&g.readonly;a.toggleClass(b,c+"Hover",d&&!e&&!h),a.toggleClass(b,c+"Active",e&&!h),a.toggleClass(b,c+"Focused",f&&!h)}var d=!1,e=!1,f=!1,g=this,h=a.hitch(this,"connect",b);h("onmouseenter",function(){d=!0,i()}),h("onmouseleave",function(){d=!1,e=!1,i()}),h("onmousedown",function(){e=!0,i()}),h("onmouseup",function(){e=!1,i()}),h("onfocus",function(){f=!0,i()}),h("onblur",function(){f=!1,i()}),this.watch("disabled",i),this.watch("readOnly",i)}});return b._CssStateMixin})