define("dojo/date",["dojo"],function(a){a.getObject("date",!0,a),a.date.getDaysInMonth=function(b){var c=b.getMonth(),d=[31,28,31,30,31,30,31,31,30,31,30,31];if(c==1&&a.date.isLeapYear(b))return 29;return d[c]},a.date.isLeapYear=function(a){var b=a.getFullYear();return!(b%400)||!(b%4)&&!!(b%100)},a.date.getTimezoneName=function(a){var b=a.toString(),c="",d,e=b.indexOf("(");if(e>-1)c=b.substring(++e,b.indexOf(")"));else{var f=/([A-Z\/]+) \d{4}$/;if(d=b.match(f))c=d[1];else{b=a.toLocaleString(),f=/ ([A-Z\/]+)$/;if(d=b.match(f))c=d[1]}}return c=="AM"||c=="PM"?"":c},a.date.compare=function(a,b,c){a=new Date(+a),b=new Date(+(b||new Date)),c=="date"?(a.setHours(0,0,0,0),b.setHours(0,0,0,0)):c=="time"&&(a.setFullYear(0,0,0),b.setFullYear(0,0,0));if(a>b)return 1;if(a<b)return-1;return 0},a.date.add=function(a,b,c){var d=new Date(+a),e=!1,f="Date";switch(b){case"day":break;case"weekday":var g,h,i=c%5;i?(g=i,h=parseInt(c/5)):(g=c>0?5:-5,h=c>0?(c-5)/5:(c+5)/5);var j=a.getDay(),k=0;j==6&&c>0?k=1:j==0&&c<0&&(k=-1);var l=j+g;if(l==0||l==6)k=c>0?2:-2;c=7*h+g+k;break;case"year":f="FullYear",e=!0;break;case"week":c*=7;break;case"quarter":c*=3;case"month":e=!0,f="Month";break;default:f="UTC"+b.charAt(0).toUpperCase()+b.substring(1)+"s"}f&&d["set"+f](d["get"+f]()+c),e&&d.getDate()<a.getDate()&&d.setDate(0);return d},a.date.difference=function(b,c,d){c=c||new Date,d=d||"day";var e=c.getFullYear()-b.getFullYear(),f=1;switch(d){case"quarter":var g=b.getMonth(),h=c.getMonth(),i=Math.floor(g/3)+1,j=Math.floor(h/3)+1;j+=e*4,f=j-i;break;case"weekday":var k=Math.round(a.date.difference(b,c,"day")),l=parseInt(a.date.difference(b,c,"week")),m=k%7;if(m==0)k=l*5;else{var n=0,o=b.getDay(),p=c.getDay();l=parseInt(k/7),m=k%7;var q=new Date(b);q.setDate(q.getDate()+l*7);var r=q.getDay();if(k>0)switch(!0){case o==6:n=-1;break;case o==0:n=0;break;case p==6:n=-1;break;case p==0:n=-2;break;case r+m>5:n=-2}else if(k<0)switch(!0){case o==6:n=0;break;case o==0:n=1;break;case p==6:n=2;break;case p==0:n=1;break;case r+m<0:n=2}k+=n,k-=l*2}f=k;break;case"year":f=e;break;case"month":f=c.getMonth()-b.getMonth()+e*12;break;case"week":f=parseInt(a.date.difference(b,c,"day")/7);break;case"day":f/=24;case"hour":f/=60;case"minute":f/=60;case"second":f/=1e3;case"millisecond":f*=c.getTime()-b.getTime()}return Math.round(f)};return a.date})