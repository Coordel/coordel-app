define("dijit/form/_FormMixin",["dojo","dijit","dojo/window"],function(a,b){a.declare("dijit.form._FormMixin",null,{state:"",reset:function(){a.forEach(this.getDescendants(),function(a){a.reset&&a.reset()})},validate:function(){var b=!1;return a.every(a.map(this.getDescendants(),function(c){c._hasBeenBlurred=!0;var d=c.disabled||!c.validate||c.validate();!d&&!b&&(a.window.scrollIntoView(c.containerNode||c.domNode),c.focus(),b=!0);return d}),function(a){return a})},setValues:function(b){a.deprecated(this.declaredClass+"::setValues() is deprecated. Use set('value', val) instead.","","2.0");return this.set("value",b)},_setValueAttr:function(b){var c={};a.forEach(this.getDescendants(),function(a){if(a.name){var b=c[a.name]||(c[a.name]=[]);b.push(a)}});for(var d in c){if(!c.hasOwnProperty(d))continue;var e=c[d],f=a.getObject(d,!1,b);if(f===undefined)continue;a.isArray(f)||(f=[f]),typeof e[0].checked=="boolean"?a.forEach(e,function(b,c){b.set("value",a.indexOf(f,b.value)!=-1)}):e[0].multiple?e[0].set("value",f):a.forEach(e,function(a,b){a.set("value",f[b])})}},getValues:function(){a.deprecated(this.declaredClass+"::getValues() is deprecated. Use get('value') instead.","","2.0");return this.get("value")},_getValueAttr:function(){var b={};a.forEach(this.getDescendants(),function(c){var d=c.name;if(d&&!c.disabled){var e=c.get("value");if(typeof c.checked=="boolean")if(/Radio/.test(c.declaredClass))e!==!1?a.setObject(d,e,b):(e=a.getObject(d,!1,b),e===undefined&&a.setObject(d,null,b));else{var f=a.getObject(d,!1,b);f||(f=[],a.setObject(d,f,b)),e!==!1&&f.push(e)}else{var g=a.getObject(d,!1,b);typeof g!="undefined"?a.isArray(g)?g.push(e):a.setObject(d,[g,e],b):a.setObject(d,e,b)}}});return b},isValid:function(){return this.state==""},onValidStateChange:function(a){},_getState:function(){var b=a.map(this._descendants,function(a){return a.get("state")||""});return a.indexOf(b,"Error")>=0?"Error":a.indexOf(b,"Incomplete")>=0?"Incomplete":""},disconnectChildren:function(){a.forEach(this._childConnections||[],a.hitch(this,"disconnect")),a.forEach(this._childWatches||[],function(a){a.unwatch()})},connectChildren:function(b){var c=this;this.disconnectChildren(),this._descendants=this.getDescendants();var d=b?function(a,b){c[a]=b}:a.hitch(this,"_set");d("value",this.get("value")),d("state",this._getState());var e=this._childConnections=[],f=this._childWatches=[];a.forEach(a.filter(this._descendants,function(a){return a.validate}),function(b){a.forEach(["state","disabled"],function(a){f.push(b.watch(a,function(a,b,d){c.set("state",c._getState())}))})});var g=function(){c._onChangeDelayTimer&&clearTimeout(c._onChangeDelayTimer),c._onChangeDelayTimer=setTimeout(function(){delete c._onChangeDelayTimer,c._set("value",c.get("value"))},10)};a.forEach(a.filter(this._descendants,function(a){return a.onChange}),function(a){e.push(c.connect(a,"onChange",g)),f.push(a.watch("disabled",g))})},startup:function(){this.inherited(arguments),this.connectChildren(!0),this.watch("state",function(a,b,c){this.onValidStateChange(c=="")})},destroy:function(){this.disconnectChildren(),this.inherited(arguments)}});return b.form._FormMixin})