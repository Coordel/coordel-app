define(["env!env/print"],function(a){var b={TRACE:0,INFO:1,WARN:2,ERROR:3,level:0,logPrefix:"",trace:function(a){this.level<=this.TRACE&&this._print(a)},info:function(a){this.level<=this.INFO&&this._print(a)},warn:function(a){this.level<=this.WARN&&this._print(a)},error:function(a){this.level<=this.ERROR&&this._print(a)},_print:function(a){this._sysPrint((this.logPrefix?this.logPrefix+" ":"")+a)},_sysPrint:function(b){a(b)}};return b})