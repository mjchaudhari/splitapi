var oauth2orize = require('oauth2orize');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var Core = require("./classes/API.Core.js");

passport.use(new BearerStrategy( function(accessToken, done) {    
    Core.getUserFromAccessToken(accessToken, function(e,u){
        var info = { scope: '*' };
        return done(e, u, info);                        
    })
}));
exports.isBearerAuth = passport.authenticate('bearer', { session : false });;