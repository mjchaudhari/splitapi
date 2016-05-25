var oauth2orize = require('oauth2orize');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
//var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;


var dbConfig = require("./db.connection.js")
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;

    
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
    passport.use(new BearerStrategy( function(accessToken, done) {
        
            //get account basid on acess token
        mongo.connect(dbConfig.mongoURI,function(err, db){  
            db.collection("accounts")
            .findOne({"AccessToken": accessToken}, function (err, acct) {
                if (err) { 
	            	return done(err); 
	            }
	            if (!acct) { 
	            	return done(null, false); 
	            }
                
                db.collection("profiles").findOne({"_id":acct.User},function(e,p){
                    var info = { scope: '*' };
                    acct.User = p;
                    return done(null, acct, info);                    
                });
                

            });
	    });    
    }));
    

exports.isAuthenticated = function(){
    console.log("authenticating");
    passport.authenticate('basic', { session : false });}

exports.isBearerAuth = passport.authenticate('bearer', { session : false });;