
'use strict';
var mongo = require("./../db.connection.js");
var shortId = require("shortid");
var apiException = require("./API.Exception.js");

var API = API || {}; // Namespace

/**
 * Core object. 
 */
API.Core = function (){

};

/**
 * Authenticate user credentiala
 * @param {object} credential
 * @param {string} object.userName - user name
 * @param {string} object.secret - secret
 * @return {object} user profile
 * @param {string} user.accessToken - access token
 */
API.Core.prototype.authenticate = function(credential, cb){
    console.log("controller : verifySecret");
    getUser(credential.userName, function(e, u){
        if(e){
            return cb(apiException.serverError("invalid credentials","authenticate")); 
        }
        if(u == null){
            return cb(apiException.notFound("invalid credentials","authenticate")); 
        }
        if(u.secret != credential.secret){
            return cb(apiException.invalidInput("invalid credentials","authenticate")); 
        }
        generateToken(u._id, function(e, t){
            if(e){
                console.error(e);
                db.close();
                return cb(e);
            }
            var p = u.profile;
            var ret = {
                _id : p._id,
                accessToken:t.accessToken,
                userName: p.userName,
                firstName: p.firstName,
                lastName: p.lastName,
                picture : p.picture,
                emailId: p.emailId,
                address : p.address,
                city : p.city,
                country : p.country,
                zipCode : p.zipCode
            };
            return cb(null,ret); 
        });
    });
};
API.Core.prototype.getUserFromAccessToken = function(accessToken, done){
    mongo.connect()
    .then(function(db){  
        db.collection("users")
        .findOne({"AccessToken": accessToken}, function (err, user) {
            if (err) { 
                return done(err); 
            }
            if (!user) { 
                return done(null, false); 
            }
            db.collection("profiles").findOne({"_id":user.profileId}, function(e,p){
                db.close();
                var u = {};
                u._id = p._id;
                u.userName = p.userName;
                u.firstName = p.FirstName;
                u.lastName = p.lastName;
                u.picture = p.picture;
                u.emailId = p.emailId;
                u.address = p.address;
                u.city = p.city;
                u.country = p.country;
                u.zipCode = p.zipCode;
                return done(null,u);                    
            });
        });
    });    
};

API.Core.prototype.searchUsers = function(searchTerm, callback){
        
    var re = new RegExp( searchTerm , 'gi');
    mongo.connect()
    .then(function(db){
        var filter = {$or: [
            { 'firstName': { $regex: re }}, 
            { 'lastName': { $regex: re }},
            { 'userName': { $regex: re }},
            { 'emailId': { $regex: re }}]
        };
        db.collection("profiles").find(filter).toArray(function(e, data){
            if(e){
                db.close();
                return callback(apiException.serverError(null, "Core", e)); 
            }
            db.close();
            //TODO: Format data before sending
            return callback(null, data);
        });
    });//Mongo connect end
};
/**
 * Get the user
 * @param {string} userName - user name
 * @return {object} userProfile - profile of the user
 */
API.Core.prototype.getUser = function(userName, cb){
    console.log("API.Core : init");
    mongo.connect()
    .then(function(db){
        db.collection("profiles").findOne({"userName":userName}, function(err,p){
            if(err){
                db.close();
                return cb(err,p);
            }   
            if(p == null){
                console.error("user credentials mismatch");
                db.close();
                return cb("Not found");
            }

            db.collection("users").findOne({"profileId":p._id}, function(err,a){
                db.close();
                a.User = p;
                var u = {};
                u._isReady = true;
                u._id = p._id;
                u.userName = p.userName;
                u.firstName = p.FirstName;
                u.lastName = p.lastName;
                u.picture = p.picture;
                u.emailId = p.emailId;
                u.address = p.address;
                u.city = p.city;
                u.country = p.country;
                u.zipCode = p.zipCode;
                return cb(null, u);                 
            });  
        });
    });
};
/**
 * Create or update user if exist
 * @param {object} user - user object to update
 * @return {object} userProfile - profile of the user
 * @return {string} userProfile.userName - user name
 * @return {string} userProfile.firstName - first name of the user
 * @return {string} userProfile.lastName - Last Name of the user
 * @return {string} userProfile.picture - picture of the user
 * @return {string} userProfile - EmailId of the user
 * @return {string} userProfile - Address of the user
 * @return {string} userProfile - City of the user
 * @return {string} userProfile - ZipCode of the user
 * @return {string} userProfile - ZipCode of the user
 * 
 */
API.Core.prototype.createUser = function(user, cb){
    //validate
    if(user.userName == null || user.userName == ""){
        return cb(apiException.invalidInput("userName required", "Core")); 
    }
    //Find if this user already exist
    var filter = {"userName": user.userName};
    mongo.connect()
    .then(function(db){
        var filter = {"userName":user.userName};
        db.collection("profiles").find(filter).toArray(function(e, data){
            if (e) {
                db.close();
                return cb(apiException.invalidInput(e.message, "Core")); 
            }
            if (data.length > 0){
                db.close();
                return cb(apiException.invalidInput(user.userName + " already registered.", "Core")); 
            }
            var p = {
                _id: shortId.generate(),
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                status: "REQUESTED",
                alternateEmail: user.alternateEmail,
                emailId: user.emailId,
                picture: user.picture,
                address: user.address,
                createdOn: new Date(),
                city: user.city,
                country: user.country,
                zipCode: user.zipCode
            };
            //db.collection("profiles").insert(p, {"forceServerObjectId": false, "upsert": true, "fullResult": true}, function (e, data) {
            db.collection("profiles").insert(p, {"forceServerObjectId":true, "upsert":true,  "fullResult":true}, function(e, data){
                if (e) {
                    db.close();
                    return cb(apiException.serverError(null, "Core", e));
                }
                var randomPin = getRandomPin();
                var u = {
                    _id: shortId.generate(),
                    profileId: p._id,
                    secret: randomPin,
                    forceReset: false,
                    secretsUsed: [randomPin]        
                };
                db.collection("users").insert(u, {"forceServerObjectId": true},  function(e, data){
                    if (e) {
                        db.close();
                        return cb(apiException.serverError(null, "Core", e));
                    }
                    db.close();
                    return cb(null, p);
                });
            });
        });
    });//mongo connect
};

//Get random pin
var getRandomPin = function(){
    var randomPin = Math.floor(Math.random() * (999999 - 111111) + 111111);
    randomPin = 654321;
    return randomPin;
};
var generateToken = function(userId, callback){
    var token =  getRandomPin();
    token = userId;
    mongo.connect()
    .then(function(db){
        db.collection("users").update({"_id": userId},{$set: {"accessToken": token}}, function(e, d){
            if(e){
                return callback(e, d);    
            }
            return callback(null, {"accessToken": token});
        });
    });
};
var getUser = function(userName, cb){
    console.log("controller : verifySecret");
    mongo.connect()
    .then(function(db){
        db.collection("profiles").findOne({"userName":userName}, function(err,u){
            if(err){
                db.close();
                return cb(err, u);
            }   
            if(u == null){
                console.error("user not found");
                db.close();
                return cb("Not found");
            }

            db.collection("users").findOne({"profileId":u._id}, function(err,a){
                db.close();
                a.profile = u;
                return cb(null, a);                 
            });  
        });

    });
};

module.exports = API.Core;