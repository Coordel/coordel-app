define("dijit/layout/ContentPane",["dojo","dijit","dijit/_Widget","dijit/layout/_ContentPaneResizeMixin","dojo/string","dojo/html","i18n!dijit/nls/loading"],function(a,b){a.declare("dijit.layout.ContentPane",[b._Widget,b.layout._ContentPaneResizeMixin],{href:"",extractContent:!1,parseOnLoad:!0,parserScope:a._scopeName,preventCache:!1,preload:!1,refreshOnShow:!1,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:!1,baseClass:"dijitContentPane",ioArgs:{},onLoadDeferred:null,attributeMap:a.delegate(b._Widget.prototype.attributeMap,{title:[]}),stopParser:!0,template:!1,create:function(b,c){if((!b||!b.template)&&c&&!("href"in b)&&!("content"in b)){var d=a.doc.createDocumentFragment();c=a.byId(c);while(c.firstChild)d.appendChild(c.firstChild);b=a.delegate(b,{content:d})}this.inherited(arguments,[b,c])},postMixInProperties:function(){this.inherited(arguments);var b=a.i18n.getLocalization("dijit","loading",this.lang);this.loadingMessage=a.string.substitute(this.loadingMessage,b),this.errorMessage=a.string.substitute(this.errorMessage,b)},buildRendering:function(){this.inherited(arguments),this.containerNode||(this.containerNode=this.domNode),this.domNode.title="",a.attr(this.domNode,"role")||b.setWaiRole(this.domNode,"group")},_startChildren:function(){this.inherited(arguments),this._contentSetter&&a.forEach(this._contentSetter.parseResults,function(b){!b._started&&!b._destroyed&&a.isFunction(b.startup)&&(b.startup(),b._started=!0)},this)},setHref:function(b){a.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.","","2.0");return this.set("href",b)},_setHrefAttr:function(b){this.cancel(),this.onLoadDeferred=new a.Deferred(a.hitch(this,"cancel")),this.onLoadDeferred.addCallback(a.hitch(this,"onLoad")),this._set("href",b),this.preload||this._created&&this._isShown()?this._load():this._hrefChanged=!0;return this.onLoadDeferred},setContent:function(b){a.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.","","2.0"),this.set("content",b)},_setContentAttr:function(b){this._set("href",""),this.cancel(),this.onLoadDeferred=new a.Deferred(a.hitch(this,"cancel")),this._created&&this.onLoadDeferred.addCallback(a.hitch(this,"onLoad")),this._setContent(b||""),this._isDownloaded=!1;return this.onLoadDeferred},_getContentAttr:function(){return this.containerNode.innerHTML},cancel:function(){this._xhrDfd&&this._xhrDfd.fired==-1&&this._xhrDfd.cancel(),delete this._xhrDfd,this.onLoadDeferred=null},uninitialize:function(){this._beingDestroyed&&this.cancel(),this.inherited(arguments)},destroyRecursive:function(a){this._beingDestroyed||this.inherited(arguments)},_onShow:function(){this.inherited(arguments);if(this.href)if(!this._xhrDfd&&(!this.isLoaded||this._hrefChanged||this.refreshOnShow))return this.refresh()},refresh:function(){this.cancel(),this.onLoadDeferred=new a.Deferred(a.hitch(this,"cancel")),this.onLoadDeferred.addCallback(a.hitch(this,"onLoad")),this._load();return this.onLoadDeferred},_load:function(){this._setContent(this.onDownloadStart(),!0);var b=this,c={preventCache:this.preventCache||this.refreshOnShow,url:this.href,handleAs:"text"};a.isObject(this.ioArgs)&&a.mixin(c,this.ioArgs);var d=this._xhrDfd=(this.ioMethod||a.xhrGet)(c);d.addCallback(function(a){try{b._isDownloaded=!0,b._setContent(a,!1),b.onDownloadEnd()}catch(c){b._onError("Content",c)}delete b._xhrDfd;return a}),d.addErrback(function(a){d.canceled||b._onError("Download",a),delete b._xhrDfd;return a}),delete this._hrefChanged},_onLoadHandler:function(a){this._set("isLoaded",!0);try{this.onLoadDeferred.callback(a)}catch(b){console.error("Error "+this.widgetId+" running custom onLoad code: "+b.message)}},_onUnloadHandler:function(){this._set("isLoaded",!1);try{this.onUnload()}catch(a){console.error("Error "+this.widgetId+" running custom onUnload code: "+a.message)}},destroyDescendants:function(){this.isLoaded&&this._onUnloadHandler();var b=this._contentSetter;a.forEach(this.getChildren(),function(a){a.destroyRecursive&&a.destroyRecursive()}),b&&(a.forEach(b.parseResults,function(b){b.destroyRecursive&&b.domNode&&b.domNode.parentNode==a.body()&&b.destroyRecursive()}),delete b.parseResults),a.html._emptyNode(this.containerNode),delete this._singleChild},_setContent:function(b,c){this.destroyDescendants();var d=this._contentSetter;d&&d instanceof a.html._ContentSetter||(d=this._contentSetter=new a.html._ContentSetter({node:this.containerNode,_onError:a.hitch(this,this._onError),onContentError:a.hitch(this,function(a){var b=this.onContentError(a);try{this.containerNode.innerHTML=b}catch(a){console.error("Fatal "+this.id+" could not change content due to "+a.message,a)}})}));var e=a.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:this.parseOnLoad,parserScope:this.parserScope,startup:!1,dir:this.dir,lang:this.lang},this._contentSetterParams||{});d.set(a.isObject(b)&&b.domNode?b.domNode:b,e),delete this._contentSetterParams,this.doLayout&&this._checkIfSingleChild(),c||(this._started&&(this._startChildren(),this._scheduleLayout()),this._onLoadHandler(b))},_onError:function(a,b,c){this.onLoadDeferred.errback(b);var d=this["on"+a+"Error"].call(this,b);c?console.error(c,b):d&&this._setContent(d,!0)},onLoad:function(a){},onUnload:function(){},onDownloadStart:function(){return this.loadingMessage},onContentError:function(a){},onDownloadError:function(a){return this.errorMessage},onDownloadEnd:function(){}});return b.layout.ContentPane})