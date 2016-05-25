/*
Manage user account
*/
var _dir = process.cwd();
var models = require("./../response.models.js").models;
var shortId     =require("shortid");
var dbConfig =  require("../db.connection.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;

exports.v1 = function(){
    
    this.searchUsers = function(req,callback){
        var param = req.params.term;
        if(!param){
            param = req.query.term;
        }
        
        var re = new RegExp( param , 'gi');
        mongo.connect( dbConfig.mongoURI,function(err, db){
            var filter = {$or: [
                { 'FirstName': { $regex: re }}, 
                { 'LastName': { $regex: re }},
                { 'UserName': { $regex: re }},
                { 'EmailId': { $regex: re }}]
            };
            
            db.collection("profiles").find(filter).toArray(function(e, data){
                if(e){
                    db.close();
                    return callback(new models.error(e));
                }
                if(data){
                    db.close();
                    return callback(new models.success(data));
                };
            });
        });//Mongo connect end
    };
    
    //Register User
    this.createUser = function (req, callback) {
        console.log("controller : post user");
        var r = req.body;
        mongo.connect( dbConfig.mongoURI,function(err, db){
            var filter = {"UserName":r.UserName};
        
            db.collection("profiles").find(filter).toArray(function(e, data){
                if(e){
                    db.close();
                    return callback(new models.error(e));
                }
                if(data.length > 0){
                    db.close();
                    var e = new models.error(e, r.UserName + " already registered.");
                    return callback(e);
                };
                
                var u = {
                    _id : shortId.generate(),
                    UserName: r.UserName,
                    FirstName: r.FirstName,
                    LastName: r.LastName,
                    
                    Status:"REQUESTED",
                    AlternateEmail : r.AlternateEmail,
                    EmailId : r.EmailId,
                    Picture : r.Picture,
                    CreatedOn : new Date(),
                    Address : r.Address,
                    City : r.City,
                    Country : r.Country,
                    ZipCode : r.ZipCode
                };
                
                db.collection("profiles").insert(u, {"forceServerObjectId":false, "upsert":true,  "fullResult":true}, function(e, data){
                    if(e){
                        db.close();
                        return callback(new models.error(e));
                    }   
                
                    var randomPin = getRandomPin();
                    var acct = {
                        UserId : u._id,
                        Secret :randomPin,
                        ForceReset: false,
                        SecretsUsed : [randomPin]        
                    };
                    
                    db.collection("accounts").insert(acct, {"forceServerObjectId":false},  function(e, data){
                        if(e){
                            db.close();
                            return callback(new models.error(e));
                        }
                        db.close();
                        return callback(new models.success(u));
                    });
                }); //PRofile save end               
            });
        });//Mongo connect end
    };
    
    //save User
    this.saveUser = function (req, cb) {
        console.log("controller : post user");
        var r = req.body;
        var id = r._id;
        var usr = {};
            //UserName: r.UserName,
        if(r.FirstName){ u.FirstName = r.FirstName;}
        if(r.LastName){ u.LastName = r.LastName}
            
            
        if(r.AlternateEmail) { u.AlternateEmail = r.AlternateEmail;}
        if(r.EmailId){ u.EmailId = r.EmailId;}
        if(r.Picture){ u.Picture = r.Picture;}
        if(r.Address){ u.Address = r.Address;}
        if(r.Citye) { u.City = r.City;}
        if(r.Country){ u.Country = r.Country}
        if(r.ZipCode){ u.ZipCode = r.ZipCode}
        
        mongo.connect( dbConfig.mongoURI,function(err, db){
            userModel.findOneAndUpdate({"_id":id},{$set: usr}, function(err,u){
                if(err){
                    console.error(err);
                    db.close();
                    return cb(new models.error(e));
                }   
                db.close();
                return cb(new models.success(u));
            });
        });
    };
    
    this.authenticate = function(req, cb){
        console.log("controller : verifySecret");
        var r = req.body;
        var secret = r.Secret;    
        getAccount(r.UserName, function(e,a){
            if(e){
                
                return cb(new models.error("invalid credentials")); 
            }
            if(a == null){
                return cb(new models.error("invalid credentials"));
            }
            if(a.Secret != secret){
                return cb(new models.error("invalid credentials"));
            }
            generateToken(a._id, function(e, t){
                if(e){
                    console.error(e);
                    db.close();
                    return cb(new models.error("Internal error"));
                }
                var u = a.User;
                var ret = {
                        _id : u._id,
                        AccessToken:t.AccessToken,
                        UserName: u.UserName,
                        FirstName: u.FirstName,
                        LastName: u.LastName,
                        Picture : u.Picture,
                        EmailId: u.EmailId,
                        Address : u.Address,
                        City : u.City,
                        Country : u.Country,
                        ZipCode : u.ZipCode
                }
                var m =  new models.success(ret);
                return cb(m); 
            })
        });
    }
    
    this.resetPasword = function(req, callback){
        console.log("controller : verifySecret");
        var r = req.body;
        getAccount(r.UserName, function(err, acct){
            if(err){
                return callback(new models.error(err));
            } 
            if(!acct){
                return callback("User account not found");
            } 
            //Update new random password
            //User exist ..now change the password
            var pwd = r.NewSecret;
            if(r.NewSecret == null){
                    pwd = getRandomPin();
            }
                
            var secretsUsed = [];
            if(acct && acct.SecretsUsed)
            {
                secretsUsed = acct.SecretsUsed
            }
            
            db.collection("accounts").findAndModify(
                {_id:acct._id},
                {$set: {
                    Secret :pwd,
                    SecretsUsed : secretsUsed.push(pwd)}
                },
                {new:true}, 
                function(err, a)
                {
                    if(err) { 
                        db.close();
                        return callback(new models.error(err));
                    }
                    
                    var m = new models.success({"secret":pwd});
                    
                    // send SMS on acct.User.MobileNo
                    
                    //Send email or SMS with pin
                    return callback(m);
                });
            
        });
        
    }
    //Get random pin
    var getRandomPin = function()
    {
        var randomPin = Math.floor(Math.random() * (999999- 111111) + 111111);
        randomPin = 654321;
        return randomPin;
    };
    var generateToken = function(accountId, callback){
        
        var token =  getRandomPin();
        token = accountId;
        mongo.connect( dbConfig.mongoURI,function(err, db){
            db.collection("accounts").update({"_id":accountId},{$set:{"AccessToken":token}},function(e,d){
                if(e){
                    return callback(e, d);    
                }                
                return callback(null, {"AccessToken":token});
            });
        });
    }
    //GEt user account from user name
    var getAccount = function(userName, cb){
        console.log("controller : verifySecret");
        mongo.connect( dbConfig.mongoURI,function(err, db){
            db.collection("profiles").findOne({"UserName":userName}, function(err,u){
                if(err){
                    db.close();
                    return cb(err,u);
                }   
                if(u == null){
                    console.error("user credentials mismatch");
                    db.close();
                    return cb("Not found");
                }

                db.collection("accounts").findOne({"User":u._id}, function(err,a){
                    db.close();
                    a.User = u;
                    return cb(null, a);                 
                });  
                
            });
    
        });
    }
}