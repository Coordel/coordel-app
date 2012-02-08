var email       = require('mailer'),
    settings    = require('./../settings'),
    config      = settings.config.sendgridOptions;

exports.send = function(args, fn){
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
    data: {
      firstName: args.firstName,
      fromFirstName: args.fromFirstName,
      fromLastName: args.fromLastName,
      inviteId: args.inviteId,
      url: settings.url
    }},
    function(err, result){
      if(err){ console.log(err); }
    });
};