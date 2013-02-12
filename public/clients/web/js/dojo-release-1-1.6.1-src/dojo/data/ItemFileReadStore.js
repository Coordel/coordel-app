define("dojo/data/ItemFileReadStore",["dojo","dojo/data/util/filter","dojo/data/util/simpleFetch","dojo/date/stamp"],function(a){a.declare("dojo.data.ItemFileReadStore",null,{constructor:function(b){this._arrayOfAllItems=[],this._arrayOfTopLevelItems=[],this._loadFinished=!1,this._jsonFileUrl=b.url,this._ccUrl=b.url,this.url=b.url,this._jsonData=b.data,this.data=null,this._datatypeMap=b.typeMap||{},this._datatypeMap.Date||(this._datatypeMap.Date={type:Date,deserialize:function(b){return a.date.stamp.fromISOString(b)}}),this._features={"dojo.data.api.Read":!0,"dojo.data.api.Identity":!0},this._itemsByIdentity=null,this._storeRefPropName="_S",this._itemNumPropName="_0",this._rootItemPropName="_RI",this._reverseRefMap="_RRM",this._loadInProgress=!1,this._queuedFetches=[],b.urlPreventCache!==undefined&&(this.urlPreventCache=b.urlPreventCache?!0:!1),b.hierarchical!==undefined&&(this.hierarchical=b.hierarchical?!0:!1),b.clearOnClose&&(this.clearOnClose=!0),"failOk"in b&&(this.failOk=b.failOk?!0:!1)},url:"",_ccUrl:"",data:null,typeMap:null,clearOnClose:!1,urlPreventCache:!1,failOk:!1,hierarchical:!0,_assertIsItem:function(a){if(!this.isItem(a))throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.")},_assertIsAttribute:function(a){if(typeof a!=="string")throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.")},getValue:function(a,b,c){var d=this.getValues(a,b);return d.length>0?d[0]:c},getValues:function(a,b){this._assertIsItem(a),this._assertIsAttribute(b);return(a[b]||[]).slice(0)},getAttributes:function(a){this._assertIsItem(a);var b=[];for(var c in a)c!==this._storeRefPropName&&c!==this._itemNumPropName&&c!==this._rootItemPropName&&c!==this._reverseRefMap&&b.push(c);return b},hasAttribute:function(a,b){this._assertIsItem(a),this._assertIsAttribute(b);return b in a},containsValue:function(b,c,d){var e=undefined;typeof d==="string"&&(e=a.data.util.filter.patternToRegExp(d,!1));return this._containsValue(b,c,d,e)},_containsValue:function(b,c,d,e){return a.some(this.getValues(b,c),function(b){if(b!==null&&!a.isObject(b)&&e){if(b.toString().match(e))return!0}else if(d===b)return!0})},isItem:function(a){if(a&&a[this._storeRefPropName]===this)if(this._arrayOfAllItems[a[this._itemNumPropName]]===a)return!0;return!1},isItemLoaded:function(a){return this.isItem(a)},loadItem:function(a){this._assertIsItem(a.item)},getFeatures:function(){return this._features},getLabel:function(a){if(this._labelAttr&&this.isItem(a))return this.getValue(a,this._labelAttr);return undefined},getLabelAttributes:function(a){if(this._labelAttr)return[this._labelAttr];return null},_fetchItems:function(b,c,d){var e=this,f=function(b,d){var f=[],g,h;if(b.query){var i,j=b.queryOptions?b.queryOptions.ignoreCase:!1,k={};for(h in b.query)i=b.query[h],typeof i==="string"?k[h]=a.data.util.filter.patternToRegExp(i,j):i instanceof RegExp&&(k[h]=i);for(g=0;g<d.length;++g){var l=!0,m=d[g];if(m===null)l=!1;else for(h in b.query)i=b.query[h],e._containsValue(m,h,i,k[h])||(l=!1);l&&f.push(m)}c(f,b)}else{for(g=0;g<d.length;++g){var n=d[g];n!==null&&f.push(n)}c(f,b)}};if(this._loadFinished)f(b,this._getItemsArray(b.queryOptions));else{this._jsonFileUrl!==this._ccUrl?(a.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store, not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0"),this._ccUrl=this._jsonFileUrl,this.url=this._jsonFileUrl):this.url!==this._ccUrl&&(this._jsonFileUrl=this.url,this._ccUrl=this.url),this.data!=null&&(this._jsonData=this.data,this.data=null);if(this._jsonFileUrl)if(this._loadInProgress)this._queuedFetches.push({args:b,filter:f});else{this._loadInProgress=!0;var g={url:e._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk},h=a.xhrGet(g);h.addCallback(function(a){try{e._getItemsFromLoadedData(a),e._loadFinished=!0,e._loadInProgress=!1,f(b,e._getItemsArray(b.queryOptions)),e._handleQueuedFetches()}catch(c){e._loadFinished=!0,e._loadInProgress=!1,d(c,b)}}),h.addErrback(function(a){e._loadInProgress=!1,d(a,b)});var i=null;b.abort&&(i=b.abort),b.abort=function(){var a=h;a&&a.fired===-1&&(a.cancel(),a=null),i&&i.call(b)}}else if(this._jsonData)try{this._loadFinished=!0,this._getItemsFromLoadedData(this._jsonData),this._jsonData=null,f(b,this._getItemsArray(b.queryOptions))}catch(j){d(j,b)}else d(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),b)}},_handleQueuedFetches:function(){if(this._queuedFetches.length>0){for(var a=0;a<this._queuedFetches.length;a++){var b=this._queuedFetches[a],c=b.args,d=b.filter;d?d(c,this._getItemsArray(c.queryOptions)):this.fetchItemByIdentity(c)}this._queuedFetches=[]}},_getItemsArray:function(a){if(a&&a.deep)return this._arrayOfAllItems;return this._arrayOfTopLevelItems},close:function(a){this.clearOnClose&&this._loadFinished&&!this._loadInProgress&&((this._jsonFileUrl==""||this._jsonFileUrl==null)&&(this.url==""||this.url==null)&&this.data==null&&console.debug("dojo.data.ItemFileReadStore: WARNING!  Data reload  information has not been provided.  Please set 'url' or 'data' to the appropriate value before the next fetch"),this._arrayOfAllItems=[],this._arrayOfTopLevelItems=[],this._loadFinished=!1,this._itemsByIdentity=null,this._loadInProgress=!1,this._queuedFetches=[])},_getItemsFromLoadedData:function(b){function f(b){d._arrayOfAllItems.push(b);for(var c in b){var g=b[c];if(g)if(a.isArray(g)){var h=g;for(var i=0;i<h.length;++i){var j=h[i];e(j)&&f(j)}}else e(g)&&f(g)}}function e(b){var e=b!==null&&typeof b==="object"&&(!a.isArray(b)||c)&&!a.isFunction(b)&&(b.constructor==Object||a.isArray(b))&&typeof b._reference==="undefined"&&typeof b._type==="undefined"&&typeof b._value==="undefined"&&d.hierarchical;return e}var c=!1,d=this;this._labelAttr=b.label;var g,h;this._arrayOfAllItems=[],this._arrayOfTopLevelItems=b.items;for(g=0;g<this._arrayOfTopLevelItems.length;++g)h=this._arrayOfTopLevelItems[g],a.isArray(h)&&(c=!0),f(h),h[this._rootItemPropName]=!0;var i={},j;for(g=0;g<this._arrayOfAllItems.length;++g){h=this._arrayOfAllItems[g];for(j in h){if(j!==this._rootItemPropName){var k=h[j];k!==null?a.isArray(k)||(h[j]=[k]):h[j]=[null]}i[j]=j}}while(i[this._storeRefPropName])this._storeRefPropName+="_";while(i[this._itemNumPropName])this._itemNumPropName+="_";while(i[this._reverseRefMap])this._reverseRefMap+="_";var l,m=b.identifier;if(m){this._itemsByIdentity={},this._features["dojo.data.api.Identity"]=m;for(g=0;g<this._arrayOfAllItems.length;++g){h=this._arrayOfAllItems[g],l=h[m];var n=l[0];if(Object.hasOwnProperty.call(this._itemsByIdentity,n)){if(this._jsonFileUrl)throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+m+"].  Value collided: ["+n+"]");if(this._jsonData)throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+m+"].  Value collided: ["+n+"]")}else this._itemsByIdentity[n]=h}}else this._features["dojo.data.api.Identity"]=Number;for(g=0;g<this._arrayOfAllItems.length;++g)h=this._arrayOfAllItems[g],h[this._storeRefPropName]=this,h[this._itemNumPropName]=g;for(g=0;g<this._arrayOfAllItems.length;++g){h=this._arrayOfAllItems[g];for(j in h){l=h[j];for(var o=0;o<l.length;++o){k=l[o];if(k!==null&&typeof k=="object"){if("_type"in k&&"_value"in k){var p=k._type,q=this._datatypeMap[p];if(!q)throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+p+"'");if(a.isFunction(q))l[o]=new q(k._value);else if(a.isFunction(q.deserialize))l[o]=q.deserialize(k._value);else throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function")}if(k._reference){var r=k._reference;if(a.isObject(r))for(var s=0;s<this._arrayOfAllItems.length;++s){var t=this._arrayOfAllItems[s],u=!0;for(var v in r)t[v]!=r[v]&&(u=!1);u&&(l[o]=t)}else l[o]=this._getItemByIdentity(r);if(this.referenceIntegrity){var w=l[o];this.isItem(w)&&this._addReferenceToMap(w,h,j)}}else this.isItem(k)&&(this.referenceIntegrity&&this._addReferenceToMap(k,h,j))}}}}},_addReferenceToMap:function(a,b,c){},getIdentity:function(a){var b=this._features["dojo.data.api.Identity"];if(b===Number)return a[this._itemNumPropName];var c=a[b];if(c)return c[0];return null},fetchItemByIdentity:function(b){var c,d;if(this._loadFinished)c=this._getItemByIdentity(b.identity),b.onItem&&(d=b.scope?b.scope:a.global,b.onItem.call(d,c));else{var e=this;this._jsonFileUrl!==this._ccUrl?(a.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store, not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0"),this._ccUrl=this._jsonFileUrl,this.url=this._jsonFileUrl):this.url!==this._ccUrl&&(this._jsonFileUrl=this.url,this._ccUrl=this.url),this.data!=null&&this._jsonData==null&&(this._jsonData=this.data,this.data=null);if(this._jsonFileUrl)if(this._loadInProgress)this._queuedFetches.push({args:b});else{this._loadInProgress=!0;var f={url:e._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk},g=a.xhrGet(f);g.addCallback(function(d){var f=b.scope?b.scope:a.global;try{e._getItemsFromLoadedData(d),e._loadFinished=!0,e._loadInProgress=!1,c=e._getItemByIdentity(b.identity),b.onItem&&b.onItem.call(f,c),e._handleQueuedFetches()}catch(g){e._loadInProgress=!1,b.onError&&b.onError.call(f,g)}}),g.addErrback(function(c){e._loadInProgress=!1;if(b.onError){var d=b.scope?b.scope:a.global;b.onError.call(d,c)}})}else this._jsonData&&(e._getItemsFromLoadedData(e._jsonData),e._jsonData=null,e._loadFinished=!0,c=e._getItemByIdentity(b.identity),b.onItem&&(d=b.scope?b.scope:a.global,b.onItem.call(d,c)))}},_getItemByIdentity:function(a){var b=null;this._itemsByIdentity&&Object.hasOwnProperty.call(this._itemsByIdentity,a)?b=this._itemsByIdentity[a]:Object.hasOwnProperty.call(this._arrayOfAllItems,a)&&(b=this._arrayOfAllItems[a]),b===undefined&&(b=null);return b},getIdentityAttributes:function(a){var b=this._features["dojo.data.api.Identity"];return b===Number?null:[b]},_forceLoad:function(){var b=this;this._jsonFileUrl!==this._ccUrl?(a.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store, not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0"),this._ccUrl=this._jsonFileUrl,this.url=this._jsonFileUrl):this.url!==this._ccUrl&&(this._jsonFileUrl=this.url,this._ccUrl=this.url),this.data!=null&&(this._jsonData=this.data,this.data=null);if(this._jsonFileUrl){var c={url:this._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk,sync:!0},d=a.xhrGet(c);d.addCallback(function(a){try{if(b._loadInProgress===!0||b._loadFinished){if(b._loadInProgress)throw new Error("dojo.data.ItemFileReadStore:  Unable to perform a synchronous load, an async load is in progress.")}else b._getItemsFromLoadedData(a),b._loadFinished=!0}catch(c){console.log(c);throw c}}),d.addErrback(function(a){throw a})}else this._jsonData&&(b._getItemsFromLoadedData(b._jsonData),b._jsonData=null,b._loadFinished=!0)}}),a.extend(a.data.ItemFileReadStore,a.data.util.simpleFetch);return a.data.ItemFileReadStore})