define(["dojo"], function(dojo) {
    return {
  		init:function(elem, flag, target){
  		  console.log("init fade", elem, flag, target);
  		  var self = this;
  			this.elem = elem;
  			clearInterval(this.elem.si);
  			this.target = target ? target : flag ? 100 : 0;
  			this.flag = flag || -1;
  			this.alpha = this.elem.style.opacity ? parseFloat(this.elem.style.opacity) * 100 : 0;
  			this.si = setInterval(function(){self.tween();}, 40);
  		},
  		tween:function(){
  			if(this.alpha == this.target){
  				clearInterval(this.si);
  			}else{
  				var value = Math.round(this.alpha + ((this.target - this.alpha) * 0.05)) + (1 * this.flag);
  				this.elem.style.opacity = value / 100;
  				this.elem.style.filter = 'alpha(opacity=' + value + ')';
  				this.alpha = value;
  			}
  		}
  	};
});