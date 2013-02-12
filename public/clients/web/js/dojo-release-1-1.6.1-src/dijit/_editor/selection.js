define("dijit/_editor/selection",["dojo","dijit"],function(a,b){a.getObject("_editor.selection",!0,b),a.mixin(b._editor.selection,{getType:function(){if(a.isIE<9)return a.doc.selection.type.toLowerCase();var b="text",c;try{c=a.global.getSelection()}catch(d){}if(c&&c.rangeCount==1){var e=c.getRangeAt(0);e.startContainer==e.endContainer&&e.endOffset-e.startOffset==1&&e.startContainer.nodeType!=3&&(b="control")}return b},getSelectedText:function(){if(a.isIE<9){if(b._editor.selection.getType()=="control")return null;return a.doc.selection.createRange().text}var c=a.global.getSelection();if(c)return c.toString();return""},getSelectedHtml:function(){if(a.isIE<9){if(b._editor.selection.getType()=="control")return null;return a.doc.selection.createRange().htmlText}var c=a.global.getSelection();if(c&&c.rangeCount){var d,e="";for(d=0;d<c.rangeCount;d++){var f=c.getRangeAt(d).cloneContents(),g=a.doc.createElement("div");g.appendChild(f),e+=g.innerHTML}return e}return null},getSelectedElement:function(){if(b._editor.selection.getType()=="control"){if(a.isIE>=9){var d=a.global.getSelection();return d.anchorNode.childNodes[d.anchorOffset]}var c=a.doc.selection.createRange();if(c&&c.item)return a.doc.selection.createRange().item(0)}return null},getParentElement:function(){if(b._editor.selection.getType()=="control"){var c=this.getSelectedElement();if(c)return c.parentNode}else{if(a.isIE<9){var d=a.doc.selection.createRange();d.collapse(!0);return d.parentElement()}var e=a.global.getSelection();if(e){var f=e.anchorNode;while(f&&f.nodeType!=1)f=f.parentNode;return f}}return null},hasAncestorElement:function(a){return this.getAncestorElement.apply(this,arguments)!=null},getAncestorElement:function(a){var b=this.getSelectedElement()||this.getParentElement();return this.getParentOfType(b,arguments)},isTag:function(a,b){if(a&&a.tagName){var c=a.tagName.toLowerCase();for(var d=0;d<b.length;d++){var e=String(b[d]).toLowerCase();if(c==e)return e}}return""},getParentOfType:function(a,b){while(a){if(this.isTag(a,b).length)return a;a=a.parentNode}return null},collapse:function(b){if(window.getSelection){var c=a.global.getSelection();c.removeAllRanges?b?c.collapseToStart():c.collapseToEnd():c.collapse(b)}else if(a.isIE){var d=a.doc.selection.createRange();d.collapse(b),d.select()}},remove:function(){var b=a.doc.selection;if(a.isIE<9){b.type.toLowerCase()!="none"&&b.clear();return b}b=a.global.getSelection(),b.deleteFromDocument();return b},selectElementChildren:function(b,c){var d=a.global,e=a.doc,f;b=a.byId(b);if(e.selection&&a.isIE<9&&a.body().createTextRange){f=b.ownerDocument.body.createTextRange(),f.moveToElementText(b);if(!c)try{f.select()}catch(g){}}else if(d.getSelection){var h=a.global.getSelection();a.isOpera?(h.rangeCount?f=h.getRangeAt(0):f=e.createRange(),f.setStart(b,0),f.setEnd(b,b.nodeType==3?b.length:b.childNodes.length),h.addRange(f)):h.selectAllChildren(b)}},selectElement:function(b,c){var d,e=a.doc,f=a.global;b=a.byId(b);if(a.isIE<9&&a.body().createTextRange)try{var g=b.tagName?b.tagName.toLowerCase():"";g==="img"||g==="table"?d=a.body().createControlRange():d=a.body().createRange(),d.addElement(b),c||d.select()}catch(h){this.selectElementChildren(b,c)}else if(a.global.getSelection){var i=f.getSelection();d=e.createRange(),i.removeAllRanges&&(a.isOpera&&(i.getRangeAt(0)&&(d=i.getRangeAt(0))),d.selectNode(b),i.removeAllRanges(),i.addRange(d))}},inSelection:function(b){if(b){var c,d=a.doc,e;if(a.global.getSelection){var f=a.global.getSelection();f&&f.rangeCount>0&&(e=f.getRangeAt(0));if(e&&e.compareBoundaryPoints&&d.createRange)try{c=d.createRange(),c.setStart(b,0);if(e.compareBoundaryPoints(e.START_TO_END,c)===1)return!0}catch(g){}}else if(d.selection){e=d.selection.createRange();try{c=b.ownerDocument.body.createControlRange(),c&&c.addElement(b)}catch(h){try{c=b.ownerDocument.body.createTextRange(),c.moveToElementText(b)}catch(i){}}if(e&&c)if(e.compareEndPoints("EndToStart",c)===1)return!0}}return!1}});return b._editor.selection})