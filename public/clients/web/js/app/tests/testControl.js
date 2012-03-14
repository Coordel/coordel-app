define(
  ["dojo",
  "dijit/form/Button", 
  "app/form/Uploader", 
  "app/form/dojox/uploader/plugins/Flash",
  "app/form/dojox/uploader/FileList"
], 
  function(dojo) {
	var test = {
	  
	  db: "/" + djConfig.couchdb + "/",
	  
	  init: function(){
	    
	    var uploader = dijit.byId("uploader");
	    console.log("uploader", uploader, uploader.submit, uploader.upload);
	    dojo.connect(uploader, "onChange", this, function(fileList){
        console.debug("got files to upload", fileList);
        dojo.forEach(fileList, function(f){
          dojo.connect(f, "onLoading", test,  "showLoading");
          dojo.connect(f, "onError", test,  "showError");
          dojo.connect(f, "onComplete", test, "showComplete");
          uploader.upload(f);
        });
  
      });
      
      dojo.connect(uploader, "onBegin", this, function(file){
        console.debug("file upload started", file);
      });
      
      dojo.connect(dijit.byId("sendFiles"), "onClick", this, function(){
        console.log("submit clicked");
        uploader.upload();
      });
	  },
	  
	  showLoading: function(){
  	  console.log("showLoading");
  	},
  	
  	showError: function(){
  	  console.log("showError");
  	},
  	
  	showComplete: function(){
  	  console.log("showComplete");
  	}
	  
	};
		
	return test;
});