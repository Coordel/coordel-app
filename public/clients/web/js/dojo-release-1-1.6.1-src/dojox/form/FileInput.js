dojo.provide("dojox.form.FileInput"),dojo.experimental("dojox.form.FileInput"),dojo.require("dijit.form._FormWidget"),dojo.require("dijit._Templated"),dojo.declare("dojox.form.FileInput",dijit.form._FormWidget,{label:"Browse ...",cancelText:"Cancel",name:"uploadFile",templateString:dojo.cache("dojox.form","resources/FileInput.html"),startup:function(){this._listener=this.connect(this.fileInput,"onchange","_matchValue"),this._keyListener=this.connect(this.fileInput,"onkeyup","_matchValue")},postCreate:function(){},_matchValue:function(){this.inputNode.value=this.fileInput.value,this.inputNode.value&&(this.cancelNode.style.visibility="visible",dojo.fadeIn({node:this.cancelNode,duration:275}).play())},setLabel:function(a,b){this.titleNode.innerHTML=a},reset:function(a){this.disconnect(this._listener),this.disconnect(this._keyListener),this.fileInput&&this.domNode.removeChild(this.fileInput),dojo.fadeOut({node:this.cancelNode,duration:275}).play(),this.fileInput=document.createElement("input"),this.fileInput.setAttribute("type","file"),this.fileInput.setAttribute("id",this.id),this.fileInput.setAttribute("name",this.name),dojo.addClass(this.fileInput,"dijitFileInputReal"),this.domNode.appendChild(this.fileInput),this._keyListener=this.connect(this.fileInput,"onkeyup","_matchValue"),this._listener=this.connect(this.fileInput,"onchange","_matchValue"),this.inputNode.value=""}})