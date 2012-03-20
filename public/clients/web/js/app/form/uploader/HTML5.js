define(['dojo'],function(dojo){

dojo.declare("app.form.plugins.HTML5", [], {
	//
	// Version: 1.6
	//
	// summary:
	//			Altered version of the dojox.form.uploader.plugin.HTML5 for use with Couchdb
	//
	//	description:
	//		Add this plugin to have HTML5 capabilities in the Uploader. 
	//
	//  COORDEL NOTES
	//  rather than using the plugin model, we mixin iFrame and html5 with the uploader 
	//  to handle couch uploads
	
	rev: null,
	
	errMsg:"Error uploading files to CouchDb. Try checking permissions",

	// Overwrites "form" and could possibly be overwritten again by iframe or flash plugin.
	uploadType:"html5",

	postCreate: function(){
		this.connectForm();
		this.inherited(arguments);
		if(this.uploadOnSelect){
			this.connect(this, "onChange", "upload");
		}
	},
	
	/*************************
	 *	   Public Events	 *
	 *************************/
	 onBeginFile: function(file){
	   //this indicates that there is a file starting to upload

	 },
	 
	 onCompleteFile: function(file){
	   //this indicates that the file has uploaded
	
	 },
	 
	/*************************
	 *	   Public Methods	 *
	 *************************/

	upload: function(/*Object ? */formData){
		// summary:
		// 		See: dojox.form.Uploader.upload
		//
		//console.log("upload html5");
		this.onBegin(this.getFileList());
		if(this.supports("FormData")){
		  //console.log("sending with formdata");
			this.uploadWithFormData(formData);
		}else if(this.supports("sendAsBinary")){
		  //console.log("sending as binary");
			this.sendAsBinary(formData);
		}
	},

	submit: function(/* form Node ? */form){
		// summary:
		//		See: dojox.form.Uploader.submit
		//
		form = !!form ? form.tagName ? form : this.getForm() : this.getForm();
		var data = dojo.formToObject(form);
		//console.log("form data:", data);
		this.upload(data);
	},

	sendAsBinary: function(/* Object */data){
		// summary:
		// 		Used primarily in FF < 4.0. Sends files and form object as binary data, written to
		// 		still enable use of $_FILES in PHP (or equivalent).
		// tags:
		// 		private
		//
		if(!this.getUrl()){
			console.error("No upload url found.", this); return;
		}

		// The date/number doesn't matter but amount of dashes do. The actual boundary
		// will have two more dashes than this one which is used in the header.
		var boundary = "---------------------------" + (new Date).getTime();
		var xhr = this.createXhr();

		xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

		// finally send the request as binary data
		// still accessed as $_FILES
		var msg = this._buildRequestBody(data, boundary);
		if(!msg){
			this.onError(this.errMsg);
		}else{
			xhr.sendAsBinary(msg);
		}
	},
	

	uploadWithFormData: function(data){
		// summary
		// 		Used with WebKit and Firefox 4+
		// 		Upload files using the much friendlier FormData browser object.
		// tags:
		// 		private
		//
		var self = this;
		//console.debug("uploading to couch with HTML5 FormData");

    // summary
		// 		Used with WebKit and Firefox 4+
		// 		Upload files using the much friendlier FormData browser object.
		// tags:
		// 		private
		//
		if(!this.getUrl()){
			console.error("No upload url found.", this); return;
		}
		
		var files = [];
		
    var submitFile = function(file){
      //console.debug("in submit file");
	
		  var def = new dojo.Deferred();
		  
		  //console.debug("heres the form data", fd);

  		var xhr = self.createXhr(def, file, self.rev);
  		
  		xhr.send(file.fd);
  		
  		return def;
		  
		};
		
		var submit = function(){
		  //console.debug("in submit: files.length", files.length, self.rev);
		  var file;
		  if (files.length > 0){
		    file = files.shift();
		    var def = submitFile(file);
		    def.then(function(resp){
		      //console.debug("response from submit", resp);
		      self.onCompleteFile(file);
		      file.onComplete();
		      file = null;
		      submit();
		    });
		  } else {
		    //console.debug("onComplete");
		    self.onComplete();
		  }
		};
	
		dojo.forEach(this.inputNode.files, function(f, i){
		  var file = {
		    onLoading: function(){},
		    onError: function(){},
		    onComplete: function(){}
		  };
		  
			file.fd = f;
			if (data){
			  file.info = data[i];
			}
			
			//console.debug("appending file", file);
			this.onBeginFile(file);
			files.push(file);
		}, this);
		
		
		submit();
   
	},

	/*
	uploadWithFormData: function(data){
		// summary
		// 		Used with WebKit and Firefox 4+
		// 		Upload files using the much friendlier FormData browser object.
		// tags:
		// 		private
		//
		if(!this.getUrl()){
			console.error("No upload url found.", this); return;
		}

		var fd = new FormData();
		dojo.forEach(this.inputNode.files, function(f, i){
		  var file = {
		    onLoading: function(){},
		    onError: function(){},
		    onComplete: function(){}
		  };
		  
		  file.fd = f;
		  if (data){
			  file.info = data[i];
			}
		  
			fd.append(this.name+"s[]", f);
			
			console.log("FILES", fd, file);
		}, this);

		if(data){
			for(var nm in data){
				fd.append(nm, data[nm]);
			}
		}

		var xhr = this.createXhr();
		console.log("SENDING", fd);
		xhr.send(fd);
	},
  */
  
	_xhrProgress: function(evt){
		if(evt.lengthComputable){
			var o = {
				bytesLoaded:evt.loaded,
				bytesTotal:evt.total,
				type:evt.type,
				timeStamp:evt.timeStamp
			};
			if(evt.type == "load"){
				// 100%
				o.percent = "100%";
				o.decimal = 1;
			}else{
				o.decimal = evt.loaded / evt.total;
				o.percent = Math.ceil((evt.loaded / evt.total)*100)+"%";
			}
			this.onProgress(o);
		}
	},
	
	/*
	createXhr: function(){
		var xhr = new XMLHttpRequest();
		var timer;
        xhr.upload.addEventListener("progress", dojo.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("load", dojo.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("error", dojo.hitch(this, function(evt){
			this.onError(evt);
			clearInterval(timer);
		}), false);
        xhr.addEventListener("abort", dojo.hitch(this, function(evt){
			this.onAbort(evt);
			clearInterval(timer);
		}), false);
        xhr.onreadystatechange = dojo.hitch(this, function() {
			if (xhr.readyState === 4) {
				console.info("COMPLETE");
				clearInterval(timer);
				console.log("XHR responseText", xhr.responseText);
				this.onComplete(dojo.eval(xhr.responseText));
			}
		});
        xhr.open("POST", this.getUrl());

		timer = setInterval(dojo.hitch(this, function(){
			try{
				if(typeof(xhr.statusText)){} // accessing this error throws an error. Awesomeness.
			}catch(e){
				//this.onError("Error uploading file."); // not always an error.
				clearInterval(timer);
			}
		}),250);

		return xhr;
	},
  */
  
 
	createXhr: function(def, file, rev){
		//console.debug("in modified createXhr");
    
    var xhr = new XMLHttpRequest();
		var timer;
    
    xhr.upload.addEventListener("progress", dojo.hitch(this, "_xhrProgress"), false);
    xhr.addEventListener("load", dojo.hitch(this, "_xhrProgress"), false);
    xhr.addEventListener("error", dojo.hitch(this, function(evt){
			this.onError(evt);
			file.onError(evt);
			clearInterval(timer);
		}), false);
		
    xhr.addEventListener("abort", dojo.hitch(this, function(evt){
			this.onAbort(evt);
			clearInterval(timer);
		}), false);
		
		
    xhr.onreadystatechange = dojo.hitch(this, function() {
			if (xhr.readyState === 4) {
				//console.info("COMPLETE");
				clearInterval(timer);
				var resp = dojo.fromJson(xhr.responseText);
				this.rev = resp.rev;
				//console.debug("COMPLETE", resp);
				def.callback(resp);
			} else if (xhr.readyState === 1){
  		  //console.debug("OPENED", file.info.type);
  		  xhr.setRequestHeader("Content-Type", file.info.type);
  		}
		});
		
		var url = this.getUrl() + "/" + escape(file.info.name);
		
		//console.log("URL", url);
		
		if (rev){
		  url = url + '/?rev=' + rev;
		}
		
    xhr.open("PUT", url);

		timer = setInterval(dojo.hitch(this, function(){
			try{
				if(typeof(xhr.statusText)){} // accessing this error throws an error. Awesomeness.
			}catch(e){
				//this.onError("Error uploading file."); // not always an error.
				clearInterval(timer);
			}
		}),250);

		return xhr;
	},

	
	_buildRequestBody : function(data, boundary) {
		var EOL  = "\r\n";
		var part = "";
		boundary = "--" + boundary;

		var filesInError = [];
		dojo.forEach(this.inputNode.files, function(f, i){
			var fieldName = this.name+"s[]";//+i;
			var fileName  = this.inputNode.files[i].fileName;
			var binary;

			try{
				binary = this.inputNode.files[i].getAsBinary() + EOL;
				part += boundary + EOL;
				part += 'Content-Disposition: form-data; ';
				part += 'name="' + fieldName + '"; ';
				part += 'filename="'+ fileName + '"' + EOL;
				part += "Content-Type: " + this.getMimeType() + EOL + EOL;
				part += binary;
			}catch(e){
				filesInError.push({index:i, name:fileName});
			}
		}, this);

		if(filesInError.length){
			if(filesInError.length >= this.inputNode.files.length){
				// all files were bad. Nothing to upload.
				this.onError({
					message:this.errMsg,
					filesInError:filesInError
				});
				part = false;
			}
		}

		if(!part) return false;

		if(data){
			for(var nm in data){
				part += boundary + EOL;
				part += 'Content-Disposition: form-data; ';
				part += 'name="' + nm + '"' + EOL + EOL;
				part += data[nm] + EOL;
			}
		}


		part += boundary + "--" + EOL;
		return part;
	},
	
	updateRev: function(rev){
	  this.rev = rev;
	}

});
return app.form.plugins.HTML5;
});
