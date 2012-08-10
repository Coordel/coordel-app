/**
 * Module dependencies.
 * 
 * Redis generates user.id and appId at userKeys and appKeys
 *
 */

var config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    redisOpts   = settings.config.redisOptions,
    couchOpts   = settings.config.couchOptions,
    couchName   = settings.config.couchName,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    couch       = cn.database(couchName),
    store       = require('redis').createClient(redisOpts.port, redisOpts.host),
    ddoc        = require('./../couchdb/ddoc'),
    User        = require('./../models/user'),
    App         = require('./../models/userApp'),
    nls         = require('i18n');

var auth = settings.auth;

//authenticate the redis clients
store.auth(redisOpts.auth);

exports.flush = function(fn){
  store.flushdb();
  //console.log('redis flushed');
  couch.destroy(function(){
    //console.log('couch destroyed');
    couch.create(function(){
      //console.log('couch recreated');
      ddoc.update();
      fn(null);
    });
  });
};


/* ****************************  UTILITY DELETE FOR DEV and PRODUCTION  *************************/
exports.loadTemplates = function(){
  var templates = require('./couchdb/defaultTemplates');
  couch.save(templates, function(err, reply){
    if (err) {
      console.log("ERROR adding temlates");
      res.redirect('/admin');
    } else {
      //console.log("Loaded default templates");
      res.redirect('/admin');
    }
  });
};

/* ************************************************************************************/
