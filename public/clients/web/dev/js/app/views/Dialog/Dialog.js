define(
  ["dojo", 
  "dijit/Dialog", 
  "text!./templates/dialog.html",
  "i18n!app/nls/coordel",
  "dijit/form/Button",
  "dijit/_Widget",
  "dijit/_Templated"], function(dojo, Dialog, html, coordel) {
  dojo.declare(
  "app.views.Dialog", 
  [Dialog], 
  {
    templateString: html,
    
    cancelText: coordel.cancel,
    
    postCreate: function(){
      this.inherited(arguments);
      //console.debug("in app/views/dialog", this);
    },
    
    _position: function(){
			// summary:
			//		Position modal dialog in the viewport. If no relative offset
			//		in the viewport has been determined (by dragging, for instance),
			//		center the node. Otherwise, use the Dialog's stored relative offset,
			//		and position the node to top: left: values based on the viewport.
			// tags:
			//		private
			
			//override the positioning to put the viewport a third from the top rather than at the center
			if(!dojo.hasClass(dojo.body(),"dojoMove")){
				var node = this.domNode,
					viewport = dojo.window.getBox(),
					p = this._relativePosition,
					bb = p ? null : dojo._getBorderBox(node),
					l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)),
					t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 4))
				;
				dojo.style(node,{
					left: l + "px",
					top: t + "px"
				});
			}
		}
     
  });
  return app.views.Dialog;    
});

