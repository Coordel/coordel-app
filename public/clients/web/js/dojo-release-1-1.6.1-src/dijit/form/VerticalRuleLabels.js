define("dijit/form/VerticalRuleLabels",["dojo","dijit","dijit/form/HorizontalRuleLabels"],function(a,b){a.declare("dijit.form.VerticalRuleLabels",b.form.HorizontalRuleLabels,{templateString:'<div class="dijitRuleContainer dijitRuleContainerV dijitRuleLabelsContainer dijitRuleLabelsContainerV"></div>',_positionPrefix:'<div class="dijitRuleLabelContainer dijitRuleLabelContainerV" style="top:',_labelPrefix:'"><span class="dijitRuleLabel dijitRuleLabelV">',_calcPosition:function(a){return 100-a},_isHorizontal:!1});return b.form.VerticalRuleLabels})