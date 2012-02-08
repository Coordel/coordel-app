var User        = require('./../models/user'),
    Invite      = require('./../models/invite');

module.exports = function(app, validate){
  
  app.get('/login', function(req, res){
    if (req.session.auth && req.session.auth.loggedIn){
      //NOTE when required detect which client and redirect appropriately
      //only web client now so redirect to it
      res.render('/web');
    } else {
      res.render('users/login');
    }
  });
  
  app.get('/reset', function(req, res){
    //res.render('login', {auth: req.session.user});
    res.render('users/reset');
  });

  app.get('/invite', validate, function(req, res){
    res.render('users/invite');
  });

  app.get('/invite/:id', function(req, res){
    //this is the link that is sent in the invitation email
    console.log("CLAIM INVITE", req.params.id);

    Invite.get(req.params.id, function(err, invite){
      if(err) {

      } else {
        User.get(invite.to, function(err, user){
          var invite = {
            id: req.params.id,
            firstName: user.firstName,
            email: user.email
          };
          req.session.invite = invite;
          res.render('users/redeemInvite', {firstName: user.firstName, layout: 'users/layout'});
        });
      }
    });
  });
  
  app.post('/invite', function(req, res){
     console.log("INVITED POSTED");
     var inv = {to:{}, from:{}};
     inv.to.firstName = req.body.firstName;
     inv.to.lastName = req.body.lastName;
     inv.to.email = req.body.email;
     inv.from.appId = req.body.fromAppId;
     inv.from.firstName = req.body.fromFirstName;
     inv.from.lastName = req.body.fromLastName;
     inv.from.email    = req.body.fromEmail;

     //this is where the invite is added
     console.log("SEND INVITE", inv);
     User.invite(inv, function(err, reply){
       if (err){
         console.log("ERROR", err);
         res.json({error: err});
       } else {
         res.render('users/confirmInvite', {firstName: inv.firstName, layout: 'users/layout'});
       }
     });
   });

  app.post('/password', function(req, res){
    //this updates the user password. 
    var newPass = req.body.newPass,
        oldPass = req.body.oldPass,
        login = req.body.login,
        invite = req.session.invite;

    if (invite){
      Invite.get(invite.id, function(err, i){
        if (err){

        } else {
          User.get(i.to, function(err, user){
            user.password = newPass;
            var u = new User(user);
            u.update(function(err, reply){
              if (err){
                console.log("ERROR: ", err);
              } else {
                delete req.invite;
                res.redirect('/logout');
              }

            });
          });
        }
      });
    } else {
      User.get(login, function(err, user){
        if (user.password === oldPass){
          user.password = newPass;
          var u = new User(user);
          u.update(function(err, reply){
            res.redirect('/logout');
          });
        }
      });
    }
  });
};