/* **********
*  Holds everything to be saved to the design doc of the app
*/

var settings = require('./../settings'),
	couchOpts = settings.config.couchOptions,
	cradle = require('cradle').setup(couchOpts),
	cclient = new cradle.Connection(),
	fields = require('./ddocFields');



function _createdb(dbname) {
	var db = cclient.database(dbname);
	db.exists(function(err, exists) {
		if (!exists) db.create();
	});
	return db;
}

var DB_NAME = _createdb(settings.config.couchName);



function cradle_error(err, res) {
	if (err) console.log(err);
}





function update_views(db, docpath, code) {
	function save_doc(fn) {
		db.save(docpath, code, cradle_error);
		return true;
	}
	
	function add_doc(fn) {
		db.save(docpath, code, handle_templates);
		return true;
	}
	
	function handle_templates(err, res){
    if (err) console.log('Failed to add DDOC', err);
    var templates = require('./defaultTemplates');
    db.save(templates, function(err, reply){
      if (err) console.log('Failed to add Default Templates', err); 
      if (!err) console.log('default templates uploaded');
    });
  }
  
	// compare function definitions in document and in code
	function compare_def(docdef, codedef) {
		var i = 0;
		if (!codedef && !docdef) {
			return false;
		}
		if ((!docdef && codedef) || (!codedef && docdef)) {
			console.log('new definitions - updating "' + docpath + '"');
			return true;
		}
		for (var d in docdef) {
			i++;
			if (!codedef[d] || docdef[d] != codedef[d].toString()) {
				console.log('definition of "' + d + '" changed - updating "' + docpath + '"');
				return true;
			}
		}
		// check that both doc and code have same number of functions
		for (var c in codedef) {
			i--;
			if (i < 0) {
				console.log('new definitions - updating "' + docpath + '"');
				return true;
			}
		}
		return false;
	}
	db.get(docpath, function(err, doc) {
		console.log('"' + docpath + '" up to date');
		if (doc && (!doc.version || doc.version !== code.version)) {
			console.log('new version found updating "' + docpath + '"');
			return save_doc();
		}
		if (!doc) {
			console.log('no design doc found updating "' + docpath + '"');
			return add_doc();
		}
		if (compare_def(doc.updates, code.updates) || compare_def(doc.views, code.views)) {
			return save_doc();
		}
	});
}

module.exports.update = function() {
	update_views(DB_NAME, '_design/coordel', fields);
};
