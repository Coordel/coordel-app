define("dojo/dnd/Avatar",["dojo","dojo/dnd/common"],function(a){a.declare("dojo.dnd.Avatar",null,{constructor:function(a){this.manager=a,this.construct()},construct:function(){this.isA11y=a.hasClass(a.body(),"dijit_a11y");var b=a.create("table",{"class":"dojoDndAvatar",style:{position:"absolute",zIndex:"1999",margin:"0px"}}),c=this.manager.source,d,e=a.create("tbody",null,b),f=a.create("tr",null,e),g=a.create("td",null,f),h=this.isA11y?a.create("span",{id:"a11yIcon",innerHTML:this.manager.copy?"+":"<"},g):null,i=a.create("span",{innerHTML:c.generateText?this._generateText():""},g),j=Math.min(5,this.manager.nodes.length),k=0;a.attr(f,{"class":"dojoDndAvatarHeader",style:{opacity:.9}});for(;k<j;++k){if(c.creator)d=c._normalizedCreator(c.getItem(this.manager.nodes[k].id).data,"avatar").node;else{d=this.manager.nodes[k].cloneNode(!0);if(d.tagName.toLowerCase()=="tr"){var l=a.create("table"),m=a.create("tbody",null,l);m.appendChild(d),d=l}}d.id="",f=a.create("tr",null,e),g=a.create("td",null,f),g.appendChild(d),a.attr(f,{"class":"dojoDndAvatarItem",style:{opacity:(9-k)/10}})}this.node=b},destroy:function(){a.destroy(this.node),this.node=!1},update:function(){a[(this.manager.canDropFlag?"add":"remove")+"Class"](this.node,"dojoDndAvatarCanDrop");if(this.isA11y){var b=a.byId("a11yIcon"),c="+";this.manager.canDropFlag&&!this.manager.copy?c="< ":this.manager.canDropFlag||this.manager.copy?this.manager.canDropFlag||(c="x"):c="o",b.innerHTML=c}a.query("tr.dojoDndAvatarHeader td span"+(this.isA11y?" span":""),this.node).forEach(function(a){a.innerHTML=this._generateText()},this)},_generateText:function(){return this.manager.nodes.length.toString()}});return a.dnd.Avatar})