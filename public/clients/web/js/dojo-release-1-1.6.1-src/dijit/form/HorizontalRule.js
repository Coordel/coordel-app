define("dijit/form/HorizontalRule",["dojo","dijit","dijit/_Widget","dijit/_Templated"],function(a,b){a.declare("dijit.form.HorizontalRule",[b._Widget,b._Templated],{templateString:'<div class="dijitRuleContainer dijitRuleContainerH"></div>',count:3,container:"containerNode",ruleStyle:"",_positionPrefix:'<div class="dijitRuleMark dijitRuleMarkH" style="left:',_positionSuffix:"%;",_suffix:'"></div>',_genHTML:function(a,b){return this._positionPrefix+a+this._positionSuffix+this.ruleStyle+this._suffix},_isHorizontal:!0,buildRendering:function(){this.inherited(arguments);var a;if(this.count==1)a=this._genHTML(50,0);else{var b,c=100/(this.count-1);if(!this._isHorizontal||this.isLeftToRight()){a=this._genHTML(0,0);for(b=1;b<this.count-1;b++)a+=this._genHTML(c*b,b);a+=this._genHTML(100,this.count-1)}else{a=this._genHTML(100,0);for(b=1;b<this.count-1;b++)a+=this._genHTML(100-c*b,b);a+=this._genHTML(0,this.count-1)}}this.domNode.innerHTML=a}});return b.form.HorizontalRule})