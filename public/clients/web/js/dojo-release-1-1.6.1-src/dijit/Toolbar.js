define("dijit/Toolbar",["dojo","dijit","dijit/_Widget","dijit/_KeyNavContainer","dijit/_Templated","dijit/ToolbarSeparator"],function(a,b){a.declare("dijit.Toolbar",[b._Widget,b._Templated,b._KeyNavContainer],{templateString:'<div class="dijit" role="toolbar" tabIndex="${tabIndex}" dojoAttachPoint="containerNode"></div>',baseClass:"dijitToolbar",postCreate:function(){this.inherited(arguments),this.connectKeyNavHandlers(this.isLeftToRight()?[a.keys.LEFT_ARROW]:[a.keys.RIGHT_ARROW],this.isLeftToRight()?[a.keys.RIGHT_ARROW]:[a.keys.LEFT_ARROW])},startup:function(){this._started||(this.startupKeyNavChildren(),this.inherited(arguments))}});return b.Toolbar})