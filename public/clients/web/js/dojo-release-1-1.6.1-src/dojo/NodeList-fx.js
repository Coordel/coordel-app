define("dojo/NodeList-fx",["dojo","dojo/fx"],function(a){a.extend(a.NodeList,{_anim:function(b,c,d){d=d||{};var e=a.fx.combine(this.map(function(e){var f={node:e};a.mixin(f,d);return b[c](f)}));return d.auto?e.play()&&this:e},wipeIn:function(b){return this._anim(a.fx,"wipeIn",b)},wipeOut:function(b){return this._anim(a.fx,"wipeOut",b)},slideTo:function(b){return this._anim(a.fx,"slideTo",b)},fadeIn:function(b){return this._anim(a,"fadeIn",b)},fadeOut:function(b){return this._anim(a,"fadeOut",b)},animateProperty:function(b){return this._anim(a,"animateProperty",b)},anim:function(b,c,d,e,f){var g=a.fx.combine(this.map(function(e){return a.animateProperty({node:e,properties:b,duration:c||350,easing:d})}));e&&a.connect(g,"onEnd",e);return g.play(f||0)}});return a.NodeList})