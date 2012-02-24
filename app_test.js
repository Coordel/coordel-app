var emailer = require('./lib/emailer.js');

var name = "Test sending email task";

var data = {
  firstName: "Dev",
  fromFirstName: "Jeff",
  fromLastName: "Gorder",
  inviteId: "1"
};


data.name = name;
data.purpose = "test purpose";
data.deadline = "Feb 29";
data.starts = "Feb 15";


//send the user an email with the link
console.log("SEND TEST EMAIL");

emailer.send({
  to: "dev@coordel.com",
  from: "jeff.gorder@coordel.com",
  subject: name,
  template: './lib/templates/invite.txt',
  data: data
  }, function(err, res){
    
});