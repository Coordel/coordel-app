define("dojo/data/api/Identity",["dojo","dojo/data/api/Read"],function(a){a.declare("dojo.data.api.Identity",a.data.api.Read,{getFeatures:function(){return{"dojo.data.api.Read":!0,"dojo.data.api.Identity":!0}},getIdentity:function(a){throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentity");var b=null},getIdentityAttributes:function(a){throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentityAttributes")},fetchItemByIdentity:function(a){if(!this.isItemLoaded(a.item))throw new Error("Unimplemented API: dojo.data.api.Identity.fetchItemByIdentity")}});return a.data.api.Identity})