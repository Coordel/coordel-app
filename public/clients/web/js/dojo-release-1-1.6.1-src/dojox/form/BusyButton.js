dojo.provide("dojox.form.BusyButton"),dojo.require("dijit.form.Button"),dojo.requireLocalization("dijit","loading"),dojo.declare("dojox.form._BusyButtonMixin",null,{isBusy:!1,busyLabel:"",timeout:null,useIcon:!0,postMixInProperties:function(){this.inherited(arguments),this.busyLabel||(this.busyLabel=dojo.i18n.getLocalization("dijit","loading",this.lang).loadingState)},postCreate:function(){this.inherited(arguments),this._label=this.containerNode.innerHTML,this._initTimeout=this.timeout,this.isBusy&&this.makeBusy()},makeBusy:function(){this.isBusy=!0,this.set("disabled",!0),this.setLabel(this.busyLabel,this.timeout)},cancel:function(){this.set("disabled",!1),this.isBusy=!1,this.setLabel(this._label),this._timeout&&clearTimeout(this._timeout),this.timeout=this._initTimeout},resetTimeout:function(a){this._timeout&&clearTimeout(this._timeout),a?this._timeout=setTimeout(dojo.hitch(this,function(){this.cancel()}),a):(a==undefined||a===0)&&this.cancel()},setLabel:function(a,b){this.label=a;while(this.containerNode.firstChild)this.containerNode.removeChild(this.containerNode.firstChild);this.containerNode.innerHTML=this.label,this.showLabel==!1&&!dojo.attr(this.domNode,"title")&&(this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"")),b?this.resetTimeout(b):this.timeout=null;if(this.useIcon&&this.isBusy){var c=new Image;c.src=this._blankGif,dojo.attr(c,"id",this.id+"_icon"),dojo.addClass(c,"dojoxBusyButtonIcon"),this.containerNode.appendChild(c)}},_clicked:function(a){this.isBusy||this.makeBusy()}}),dojo.declare("dojox.form.BusyButton",[dijit.form.Button,dojox.form._BusyButtonMixin],{}),dojo.declare("dojox.form.BusyComboButton",[dijit.form.ComboButton,dojox.form._BusyButtonMixin],{}),dojo.declare("dojox.form.BusyDropDownButton",[dijit.form.DropDownButton,dojox.form._BusyButtonMixin],{})