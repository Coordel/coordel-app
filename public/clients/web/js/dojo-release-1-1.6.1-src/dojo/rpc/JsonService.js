define("dojo/rpc/JsonService",["dojo","dojo/rpc/RpcService"],function(a){a.declare("dojo.rpc.JsonService",a.rpc.RpcService,{bustCache:!1,contentType:"application/json-rpc",lastSubmissionId:0,callRemote:function(b,c){var d=new a.Deferred;this.bind(b,c,d);return d},bind:function(b,c,d,e){var f=a.rawXhrPost({url:e||this.serviceUrl,postData:this.createRequest(b,c),contentType:this.contentType,timeout:this.timeout,handleAs:"json-comment-optional"});f.addCallbacks(this.resultCallback(d),this.errorCallback(d))},createRequest:function(b,c){var d={params:c,method:b,id:++this.lastSubmissionId},e=a.toJson(d);return e},parseResults:function(b){if(a.isObject(b)){if("result"in b)return b.result;if("Result"in b)return b.Result;if("ResultSet"in b)return b.ResultSet}return b}});return a.rpc.JsonService})