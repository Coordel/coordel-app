define("dojo/data/api/Notification",["dojo","dojo/data/api/Read"],function(a){a.declare("dojo.data.api.Notification",a.data.api.Read,{getFeatures:function(){return{"dojo.data.api.Read":!0,"dojo.data.api.Notification":!0}},onSet:function(a,b,c,d){throw new Error("Unimplemented API: dojo.data.api.Notification.onSet")},onNew:function(a,b){throw new Error("Unimplemented API: dojo.data.api.Notification.onNew")},onDelete:function(a){throw new Error("Unimplemented API: dojo.data.api.Notification.onDelete")}});return a.data.api.Notification})