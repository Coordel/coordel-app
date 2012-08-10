var should = require('should');
var User = require('./../models/user');
var Util = require('./../models/util');

describe('Delegate', function(){

  before(function(done){
    Util.flush(function(err){
      if (err) done(err);
      done();
    });
  });
  
  
  describe('#register users', function(){
    it('get the user back that was registered', function(done){
      User.register({ firstName: 'Jeff',
          lastName: 'Gorder',
          email: 'jeff.gorder@coordel.com',
          password: 'password',
          invited: 0 }, function(err, user){
            if (err) return done(err);
            user.email.should.equal('jeff.gorder@coordel.com');
            User.register({ firstName: 'Dev',
                lastName: 'Coordel',
                email: 'dev@coordel.com',
                password: 'password',
                invited: 0 }, function(err, user){
                  if (err) return done(err);
                  user.email.should.equal('dev@coordel.com');
                  User.register({ firstName: 'Carol',
                      lastName: 'Jones',
                      email: 'coordel.demo2@gmail.com',
                      password: 'password',
                      invited: 0 }, function(err, user){
                        if (err) return done(err);
                        user.email.should.equal('coordel.demo2@gmail.com');
                        return done();
                      });
                  });
                });
            });
   
          
  });
  
});
