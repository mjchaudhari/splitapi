var oauth2orize = require('oauth2orize');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;


var crypto = require('crypto');

var _dir = process.cwd();

var AccessToken = require( './accessToken');
var RefreshToken = require('./refreshToken');

module.exports = function(dbConfig){
  
	//var _userModule = require( _dir + '/users/index.js')(dbConfig);
    	
	passport.use(new BasicStrategy(
	    function(username, password, done) {
	        _userModule.verifySecret({ UserName: username , Password:password  }, function(err, client) {
	            if (err) { 
	            	return done(err); 
	            }
	
	            if (!client) { 
	            	return done(null, false); 
	            }
	
	            if (client.clientSecret !== password) { 
	            	return done(null, false); 
	            }
	
	            return done(null, client);
	        });
	    }
	));
	
	passport.use(new ClientPasswordStrategy(
	    function(clientId, clientSecret, done) {
	        Client.findOne({ clientId: clientId }, function(err, client) {
	            if (err) { 
	            	return done(err); 
	            }
	
	            if (!client) { 
	            	return done(null, false); 
	            }
	
	            if (client.clientSecret !== clientSecret) { 
	            	return done(null, false); 
	            }
	
	            return done(null, client);
	        });
	    }
	));
	
	passport.use(new BearerStrategy(
	    function(accessToken, done) {
	        AccessToken.findOne({ token: accessToken }, function(err, token) {
	
	            if (err) { 
	            	return done(err); 
	            }
	
	            if (!token) { 
	            	return done(null, false); 
	            }
	
	            if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {
	
	                AccessToken.remove({ token: accessToken }, function (err) {
	                    if (err) {
	                    	return done(err);
	                    } 
	                });
	
	                return done(null, false, { message: 'Token expired' });
	            }
	
	            User.findById(token.userId, function(err, user) {
	            
	                if (err) { 
	                	return done(err); 
	                }
	
	                if (!user) { 
	                	return done(null, false, { message: 'Unknown user' }); 
	                }
	
	                var info = { scope: '*' };
	                done(null, user, info);
	            });
	        });
	    }
	));
	// create OAuth 2.0 server
	var aserver = oauth2orize.createServer();
	
	// Generic error handler
	var errFn = function (cb, err) {
		if (err) { 
			return cb(err); 
		}
	};
	
	// Destroys any old tokens and generates a new access and refresh token
	var generateTokens = function (data, done) {
	
		// curries in `done` callback so we don't need to pass it
	    var errorHandler = errFn.bind(undefined, done), 
		    refreshToken,
		    refreshTokenValue,
		    token,
		    tokenValue;
	
	    RefreshToken.remove(data, errorHandler);
	    AccessToken.remove(data, errorHandler);
	
	    tokenValue = crypto.randomBytes(32).toString('hex');
	    refreshTokenValue = crypto.randomBytes(32).toString('hex');
	
	    data.token = tokenValue;
	    token = new AccessToken(data);
	
	    data.token = refreshTokenValue;
	    refreshToken = new RefreshToken(data);
	
	    refreshToken.save(errorHandler);
	
	    token.save(function (err) {
	    	if (err) {
				
				log.error(err);
	    		return done(err); 
	    	}
	    	done(null, tokenValue, refreshTokenValue, { 
	    		'expires_in': config.get('security:tokenLife') 
	    	});
	    });
	};
	
	// Exchange username & password for access token.
	aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
		
		User.findOne({ username: username }, function(err, user) {
			
			if (err) { 
				return done(err); 
			}
			
			if (!user || !user.checkPassword(password)) {
				return done(null, false);
			}
	
			var model = { 
				userId: user.userId, 
				clientId: client.clientId 
			};
	
			generateTokens(model, done);
		});
	
	}));
	
	// Exchange refreshToken for access token.
	aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
	
		RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
			if (err) { 
				return done(err); 
			}
	
			if (!token) { 
				return done(null, false); 
			}
	
			User.findById(token.userId, function(err, user) {
				if (err) { return done(err); }
				if (!user) { return done(null, false); }
	
				var model = { 
					userId: user.userId, 
					clientId: client.clientId 
				};
	
				generateTokens(model, done);
			});
		});
	}));
	
	// token endpoint
	//
	// `token` middleware handles client requests to exchange authorization grants
	// for access tokens.  Based on the grant type being exchanged, the above
	// exchange middleware will be invoked to handle the request.  Clients must
	// authenticate when making requests to this endpoint.
	
	this.token = [
  		passport.authenticate(['bearer'], { session: false }),
		aserver.token(),
		aserver.errorHandler()
	];
}