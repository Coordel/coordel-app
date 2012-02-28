var email       = require('mailer'),
    settings    = require('./../settings'),
    config      = settings.config.sendgridOptions;

exports.send = function(args, fn){
  
  console.log("SENDING EMAIL", args, args.data);
  
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
      if(err){ console.log(err); }
    });
};