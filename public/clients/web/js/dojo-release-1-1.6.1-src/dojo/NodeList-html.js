define("dojo/NodeList-html",["dojo","dojo/html"],function(a){a.extend(a.NodeList,{html:function(b,c){var d=new a.html._ContentSetter(c||{});this.forEach(function(a){d.node=a,d.set(b),d.tearDown()});return this}});return a.NodeList})