var oauth2orize = require('oauth2orize');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
//var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var userModels = require("./models/user.model.js");

var dbConfig = require("./db.connection.js")
var m =  userModels(dbConfig);
var userModel =  m.userModel;
var accountModel = m.accountModel;
    
    passport.use(new BasicStrategy(
      function(username, password, callback) {
        userModel.findOne({ UserName: username, Secret:password }, function (err, user) {
          if (err) { return callback(err); }
    
          // No user found with that username
          if (!user) { return callback(null, false); }
            // Success
            return callback(null, user);
        });
      }
    ));
    
    passport.use(new BearerStrategy(
	    function(accessToken, done) {
            
            accountModel.findOne({
                 AccessToken: accessToken
            })
            .populate({
                path:"User",
            })
            .exec(function(err, acct){
                if (err) { 
	            	return done(err); 
	            }
	           
	            if (!acct) { 
	            	return done(null, false); 
	            }
	           var info = { scope: '*' };
	                return done(null, acct, info);
                    
//	            userModel.findById(token.userId, function(err, user) {
//	                if (err) { 
//	                	return done(err); 
//	                }
//	
//	                if (!user) { 
//	                	return done(null, false, { message: 'Unknown user' }); 
//	                }
//	
//	                var info = { scope: '*' };
//	                done(null, user, info);
//	            });

            });
	    }
    ));
        

exports.isAuthenticated = function(){
    console.log("authenticating");
    passport.authenticate('basic', { session : false });}

exports.isBearerAuth = passport.authenticate('bearer', { session : false });;