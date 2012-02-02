define(['dojo'],function(dojo){
	

dojo.declare("app.form.uploader.IFrame", [], {
	//
	// Version: 1.6
	//
	// summary:
	//		Altered version of the dojox.form.uploader.plugin.IFrame for use with Couchdb
	//
	//	description:
	//    NOTES FROM dojox.form.uploader.plugin.IFrame
	//		Only supported by IE, due to the specifc iFrame hack used. The
	//		dojox.form.uploader.plugins.HTML5  plugin should be used along with this to add HTML5
	//		capabilities to browsers that support them. Progress events are not supported.
	//		Inherits all properties from dojox.form.Uploader and dojox.form.uploader.plugins.HTML5.
	//
	//    NOTES COORDEL
	//    Altered the code not to use plugins for the couch uploader and just mix in the iframe and 
	//    HTML 5 capability with the uploader

	force:"",

	postMixInProperties: function(){
		this.inherited(arguments);
		if(!this.supports("multiple") || this.force =="iframe"){
			this.uploadType = "iframe";
			this.upload = this.uploadIFrame;
			this.submit = this.submitIFrame;
		}
	},

	submitIFrame: function(data){
		this.uploadIFrame(data);
	},

	uploadIFrame: function(data){
		// summary:
		//		Internal. You could use this, but you should use upload() or submit();
		//		which can also handle the post data.
		//
		var form, destroyAfter = false;
		if(!this.getForm()){
			form = dojo.create('form', {enctype:"multipart/form-data", method:"post"}, this.domNode);
			dojo.forEach(this._inputs, function(n, i){
				if(n.value) form.appendChild(n);
			}, this);
			destroyAfter = true;
		}else{
			form = this.form;
		}

		var url = this.getUrl();

		var dfd = dojo.io.iframe.send({
			url: url,
			form: form,
			handleAs: "json",
			error: dojo.hitch(this, function(err){
				if(destroyAfter){ dojo.destroy(form); }
				this.onError(err);
			}),
			load: dojo.hitch(this, function(data, ioArgs, widgetRef){
				if(destroyAfter){ dojo.destroy(form); }
				if(data["ERROR"] || data["error"]){
					this.onError(data);
				}else{
					this.onComplete(data);
				}
			})
		});
	}
});

return app.form.uploader.IFrame;
});
