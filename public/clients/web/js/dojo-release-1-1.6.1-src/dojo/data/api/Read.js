define("dojo/data/api/Read",["dojo","dojo/data/api/Request"],function(a){a.declare("dojo.data.api.Read",null,{getValue:function(a,b,c){var d=null;throw new Error("Unimplemented API: dojo.data.api.Read.getValue")},getValues:function(a,b){var c=[];throw new Error("Unimplemented API: dojo.data.api.Read.getValues")},getAttributes:function(a){var b=[];throw new Error("Unimplemented API: dojo.data.api.Read.getAttributes")},hasAttribute:function(a,b){throw new Error("Unimplemented API: dojo.data.api.Read.hasAttribute")},containsValue:function(a,b,c){throw new Error("Unimplemented API: dojo.data.api.Read.containsValue")},isItem:function(a){throw new Error("Unimplemented API: dojo.data.api.Read.isItem")},isItemLoaded:function(a){throw new Error("Unimplemented API: dojo.data.api.Read.isItemLoaded")},loadItem:function(a){if(!this.isItemLoaded(a.item))throw new Error("Unimplemented API: dojo.data.api.Read.loadItem")},fetch:function(a){var b=null;throw new Error("Unimplemented API: dojo.data.api.Read.fetch")},getFeatures:function(){return{"dojo.data.api.Read":!0}},close:function(a){throw new Error("Unimplemented API: dojo.data.api.Read.close")},getLabel:function(a){throw new Error("Unimplemented API: dojo.data.api.Read.getLabel")},getLabelAttributes:function(a){throw new Error("Unimplemented API: dojo.data.api.Read.getLabelAttributes")}});return a.data.api.Read})