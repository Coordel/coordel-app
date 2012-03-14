define([
  "dojo", 
  "dijit",
  "i18n!app/nls/coordel",
  "text!app/layouts/templates/streamHeader.html",
  "dijit/layout/BorderContainer",
  "app/widgets/ContainerPane"], function(dojo, dijit, coordel, htmlHead, bc, pane) {
	return {
		showLayout: function() {
		  var right = dijit.byId("rightLayout");
		  
		  //main layout right header
		  var rightHead = new pane({
          region: "top",
          id: "mainLayoutHeaderRight",
          "class": "mainLayoutHeader coordel-header"

      }).placeAt(right);
      
      //main layout right content === stream
      var streamContainer = new bc({
        region: "center",
        splitter: false,
        id: "mainLayoutContentRight",
        design: "headline",
        style: "padding:0; width: 10px; background-color: #eaeaea"
        
      }).placeAt(right);
      
      var streamHead = new pane({
        region: "top",
        splitter: false,
        design: "headline",
        id: "streamHeader",
        style:"background-color:#000",
        content: dojo.string.substitute(htmlHead, coordel)
        
      }).placeAt(streamContainer);
      
      var streamMain = new pane({
        region: "center",
        id: "streamContainer",
        style: "padding:0; background: #eaeaea;"
        
      }).placeAt(streamContainer);
      
      var streamFoot = new pane({
        region: "bottom",
        splitter: false,
        design: "headline",
        id: "streamFooter",
        content: "<div>&nbsp;</div>"
        
      }).placeAt(streamContainer);
      
		}
	};
});