var assert = require("assert");
var User = require("./../api/classes/API.User.js");

describe('User', function() {
  describe('#init', function() {
    it('should initialize the instance of known user', function(done) {
      var user = new User();
      user.init("9850890846", function(err, data){
          if(err){
              done(err);
          }
          else{
              //assert.equal(typeof(data), "Object", "Its object");
              //assert.equal(data.isError, false, "Its success");
              //assert.equal(data.data != null, true, "Its not null");
             //assert.equal(data.data.Emailid , "9850890846", "Its not null");
              done();
          }
      });
    });
  });
  
  describe('#resetPassword', function() {
    it('should reset the user password', function(done) {
      var user = new User();
      user.init("9850890846", function(err, data){
          if(err){
              done(err);
          }
          else{
            //assert.equal(typeof(data), "Object", "Its object");
            //assert.equal(data.isError, false, "Its success");
            //assert.equal(data.data != null, true, "Its not null");
            //assert.equal(data.data.Emailid , "9850890846", "Its not null");
            user.resetPasword("", function(err, result){
              if(err){
                 done(err);
              }
              else{
                done();
              }
            });
          }
      });
    });
  });
  
});