define(function(a,b,c){function j(a){var b=e.ast_walker(),c=b.walk;return b.with_walkers({call:function(a,b){if(a[0]=="dot"&&a[2]=="toString"&&b.length==0)return["binary","+",a[1],["string",""]]}},function(){return c(a)})}var d=a("./parse-js"),e=a("./process"),f=d.slice,g=d.member,h=d.PRECEDENCE,i=d.OPERATORS;b.ast_squeeze_more=j})