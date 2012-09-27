var email       = require('mailer'),
    cfg         = require('konphyg')(__dirname + './../config'),
    settings    = cfg('settings'),
    config      = settings.config.sendgridOptions,
    nls         = require('./../lib/nls/email-alert');

exports.send = function(args, fn){
  
  //console.log("SENDING EMAIL", args);
  
  var data = args.data;
  
  data.url = settings.url;

  email.send({
    host: config.host,
    port : config.port,
    domain: config.domain,
    authentication: 'login',
    username: config.username,
    password: config.password,
    to : args.to, //to
    from : args.from, //from
    subject : args.subject, //subject
    template: args.template, //template
    data: data},
    function(err, result){
      if(err) return fn(err, false);
			return fn(false, true);
    });
};

exports.getAlert = function(args, fn){
  //this function should return an object that can be passed as the args to the send function
  var alert = {};
  //console.log("GETTING ALERT");
  return fn(null, alert);
};