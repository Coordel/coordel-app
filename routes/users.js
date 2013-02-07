var User        = require('./../models/user'),
    Invite      = require('./../models/invite'),
    gravatar    = require('gravatar'),
    config      = require('konphyg')(__dirname + './../config'),
    settings    = config('settings'),
    App         = require('./../models/userApp');

require("date-utils");

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
  
  app.del('/login/:id', function(req, res){
    var login = req.params.id;
    //console.log("in delete", login);
    User.get(login, function(err, user){
      //console.log("user", user);
      App.get(login.appId, function(err, userApp){
        //console.log('userApp', userApp);
      });
    });
  });
  
  app.get('/reset', function(req, res){
    //res.render('login', {auth: req.session.user});
    res.render('users/resetRequest', {layout: 'users/layout'});
  });
	
	app.get('/reset/:id', function(req, res){
		var id = req.params.id;
		if (id){
			User.getReset(req.params.id, function(err, reset){
				//console.log("reset", reset);
				if (err){
					console.log("error resetting", err);
					res.render('users/login', {layout: 'users/layout'});
				} else {

					var now = new Date();
					var stamp = new Date(reset.stamp);
					var diff = stamp.getMinutesBetween(now);
					if (diff <= 30){
						res.render('users/reset', {layout: 'users/layout', email: reset.email, username: reset.username});
					} else {
						res.render('users/resetRequest', {layout:'users/layout'});
					}
				}
			});
		}
	});

	app.post('/reset', function(req,res){
		var email = req.body.email;
		if (email){
			User.resetPassword(email, function(err, reply){
				//console.log("reset", reply);
				res.render('users/resetSuccess', {layout: 'users/layout', email: email});
			});
		} else {
			res.redirect('/reset');
		}
		
	});
	
  
  app.get('/gravatar', function(req, res){
    
    var defaultUrl = 'http://' + settings.url + '/images/default_contact.png',
        url = gravatar.url(req.query.email, {s:req.query.s, d:defaultUrl});
    //console.log("gravatar url", req.query.email, url);
    res.json({url:url});
  });
  
  /*
  app.get('/invite', function(req, res){
    res.render('users/invite', {layout:'users/layout'});
  });
  */

  app.get('/invite/:id', function(req, res){
    //this is the link that is sent in the invitation email
    //console.log("CLAIM INVITE", req.params.id);

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
          res.render('users/redeemInvite', {firstName: user.firstName, email: user.email, layout: 'users/layout'});
        });
      }
    });
  });
  
  app.post('/invite', function(req, res){
     console.log("INVITE POSTED", req.body);
     var inv = {to:{}, from:{}};
     inv.to.firstName = req.body.firstName;
     inv.to.lastName = req.body.lastName;
     inv.to.email = req.body.email;
     inv.from.appId = req.body.fromAppId;
     inv.from.firstName = req.body.fromFirstName;
     inv.from.lastName = req.body.fromLastName;
     inv.from.email    = req.body.fromEmail;
     inv.data = req.body.data;
     inv.subject = req.body.subject;
     inv.template = req.body.template;

     //this is where the invite is added
     //console.log("SEND INVITE", inv);
     console.log("INVITE created", inv);
     User.invite(inv, function(err, reply){
       if (err){
         console.log("ERROR Inviting user", err);
         res.json({error: err});
       } else {
         //res.render('users/confirmInvite', {firstName: inv.firstName, layout: 'users/layout'});
         res.json(reply);
       }
     });
     
   });
   
  
  app.get('/user', function(req, res){
    var login = req.query.login;
    //console.log("got login", login);
     User.get(login, function(err, user){
        //console.log('userApp', user);
      });
  });
  
  app.get('/removePerson', function(req, res){
    var user = req.query.user,
        person = req.query.person;
        
    //console.log("remove person", user, person);
    
    /*
    App.remPerson({userAppId: from, personAppId: user}, function(err, reply){
      console.log(reply);
    });
    */
  });

	app.post('/resetPassword', function(req, res){
		var newPass = req.body.newPass,
				username = req.body.username,
				email = req.body.email;
				
		//console.log("resetting password", newPass, username, email);
				
		User.get(email, function(err, user){
			
       user.password = newPass;
       var u = new User(user);
       u.update(function(err, reply){
         res.redirect('/logout');
       });
    	
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
                console.log("ERROR updating password: ", err);
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