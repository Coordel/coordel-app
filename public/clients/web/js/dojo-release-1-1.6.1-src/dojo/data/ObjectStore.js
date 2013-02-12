define("dojo/data/ObjectStore",["dojo","dojo/regexp"],function(a){a.declare("dojo.data.ObjectStore",null,{objectStore:null,constructor:function(b){a.mixin(this,b)},labelProperty:"label",getValue:function(a,b,c){return typeof a.get==="function"?a.get(b):b in a?a[b]:c},getValues:function(a,b){var c=this.getValue(a,b);return c instanceof Array?c:c===undefined?[]:[c]},getAttributes:function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&(c.charAt(0)!="_"||c.charAt(1)!="_")&&b.push(c);return b},hasAttribute:function(a,b){return b in a},containsValue:function(b,c,d){return a.indexOf(this.getValues(b,c),d)>-1},isItem:function(a){return typeof a=="object"&&a&&!(a instanceof Date)},isItemLoaded:function(a){return a&&typeof a.load!=="function"},loadItem:function(b){var c;typeof b.item.load==="function"?a.when(b.item.load(),function(a){c=a;var d=a instanceof Error?b.onError:b.onItem;d&&d.call(b.scope,a)}):b.onItem&&b.onItem.call(b.scope,b.item);return c},close:function(a){return a&&a.abort&&a.abort()},fetch:function(b){function i(a){b.onError&&b.onError.call(d,a,b)}b=b||{};var c=this,d=b.scope||c,e=b.query;if(typeof e=="object"){e=a.delegate(e);for(var f in e){var g=e[f];typeof g=="string"&&(e[f]=RegExp("^"+a.regexp.escapeString(g,"*?").replace(/\*/g,".*").replace(/\?/g,".")+"$",b.queryOptions&&b.queryOptions.ignoreCase?"mi":"m"),e[f].toString=function(a){return function(){return a}}(g))}}var h=this.objectStore.query(e,b);a.when(h.total,function(c){a.when(h,function(a){b.onBegin&&b.onBegin.call(d,c||a.length,b);if(b.onItem)for(var e=0;e<a.length;e++)b.onItem.call(d,a[e],b);b.onComplete&&b.onComplete.call(d,b.onItem?null:a,b);return a},i)},i),b.abort=function(){h.cancel&&h.cancel()},b.store=this;return b},getFeatures:function(){return{"dojo.data.api.Read":!!this.objectStore.get,"dojo.data.api.Identity":!0,"dojo.data.api.Write":!!this.objectStore.put,"dojo.data.api.Notification":!0}},getLabel:function(a){if(this.isItem(a))return this.getValue(a,this.labelProperty);return undefined},getLabelAttributes:function(a){return[this.labelProperty]},getIdentity:function(a){return a.getId?a.getId():a[this.objectStore.idProperty||"id"]},getIdentityAttributes:function(a){return[this.objectStore.idProperty]},fetchItemByIdentity:function(b){var c;a.when(this.objectStore.get(b.identity),function(a){c=a,b.onItem.call(b.scope,a)},function(a){b.onError.call(b.scope,a)});return c},newItem:function(a,b){if(b){var c=this.getValue(b.parent,b.attribute,[]);c=c.concat([a]),a.__parent=c,this.setValue(b.parent,b.attribute,c)}this._dirtyObjects.push({object:a,save:!0}),this.onNew(a);return a},deleteItem:function(a){this.changing(a,!0),this.onDelete(a)},setValue:function(a,b,c){var d=a[b];this.changing(a),a[b]=c,this.onSet(a,b,d,c)},setValues:function(b,c,d){if(!a.isArray(d))throw new Error("setValues expects to be passed an Array object as its value");this.setValue(b,c,d)},unsetAttribute:function(a,b){this.changing(a);var c=a[b];delete a[b],this.onSet(a,b,c,undefined)},_dirtyObjects:[],changing:function(a,b){a.__isDirty=!0;for(var c=0;c<this._dirtyObjects.length;c++){var d=this._dirtyObjects[c];if(a==d.object){b&&(d.object=!1,this._saveNotNeeded||(d.save=!0));return}}var e=a instanceof Array?[]:{};for(c in a)a.hasOwnProperty(c)&&(e[c]=a[c]);this._dirtyObjects.push({object:!b&&a,old:e,save:!this._saveNotNeeded})},save:function(b){b=b||{};var c,d=[],e={},f=[],g,h=this._dirtyObjects,i=h.length;try{a.connect(b,"onError",function(){if(b.revertOnError!==!1){var a=h;h=f;var c=0;jr.revert(),g._dirtyObjects=a}else g._dirtyObjects=dirtyObject.concat(f)});if(this.objectStore.transaction)var j=this.objectStore.transaction();for(var k=0;k<h.length;k++){var l=h[k],m=l.object,n=l.old;delete m.__isDirty,m?c=this.objectStore.put(m,{overwrite:!!n}):c=this.objectStore.remove(this.getIdentity(n)),f.push(l),h.splice(k--,1),a.when(c,function(a){--i||b.onComplete&&b.onComplete.call(b.scope,d)},function(a){i=-1,b.onError.call(b.scope,a)})}j&&j.commit()}catch(o){b.onError.call(b.scope,value)}},revert:function(a){var b=this._dirtyObjects;for(var c=b.length;c>0;){c--;var d=b[c],e=d.object,f=d.old;if(e&&f){for(var g in f)f.hasOwnProperty(g)&&e[g]!==f[g]&&(this.onSet(e,g,e[g],f[g]),e[g]=f[g]);for(g in e)f.hasOwnProperty(g)||(this.onSet(e,g,e[g]),delete e[g])}else f?this.onNew(f):this.onDelete(e);delete (e||f).__isDirty,b.splice(c,1)}},isDirty:function(a){if(!a)return!!this._dirtyObjects.length;return a.__isDirty},onSet:function(){},onNew:function(){},onDelete:function(){}});return a.data.ObjectStore})