/*
Manage user user
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
                
                var p = {
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
                
                db.collection("profiles").insert(p, {"forceServerObjectId":false, "upsert":true,  "fullResult":true}, function(e, data){
                    if(e){
                        db.close();
                        return callback(new models.error(e));
                    }   
                
                    var randomPin = getRandomPin();
                    var user = {
                        _id : shortId.generate(),
                        ProfileId : p._id,
                        Secret :randomPin,
                        ForceReset: false,
                        SecretsUsed : [randomPin]        
                    };
                    
                    db.collection("users").insert(user, {"forceServerObjectId":false},  function(e, data){
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
        var p = {};
            //UserName: r.UserName,
        if(r.FirstName){ p.FirstName = r.FirstName;}
        if(r.LastName){ p.LastName = r.LastName}
            
            
        if(r.AlternateEmail) {p.AlternateEmail = r.AlternateEmail;}
        if(r.EmailId){ p.EmailId = r.EmailId;}
        if(r.Picture){ p.Picture = r.Picture;}
        if(r.Address){ p.Address = r.Address;}
        if(r.City) { p.City = r.City;}
        if(r.Country){ p.Country = r.Country}
        if(r.ZipCode){ p.ZipCode = r.ZipCode}
        
        mongo.connect( dbConfig.mongoURI,function(err, db){
            db.collection("profiles").findOneAndUpdate({"_id":p._id},{$set: p}, {"upsert":true, "forceServerObjectId":false, "returnOriginal":false}, function (err, profile) {
                if(err){
                    console.error(err);
                    db.close();
                    return cb(new models.error(e));
                }   
                db.close();
                return cb(new models.success(profile.value));
            });
        });
    };
    this.getAccounts =function(req, cb)
    {
        var u = req.user.User; //req.userIsAcount and user.User is actual user profile
        
        var q = req.query;
		var options = {
			_id:q._id,
			name:q.name,
			userId : q.userId 
		};

        var search = {};
        if(u == null){
            var err = new models.error("Unauthenticated");
            return cb(err)
        }

        if(options._id && options._id != 0)
        {
            search._id = options._id;
        }
        if(options.name && options.name.length > 0)
        {
            search.Name = options.name;
        }
        
        if(options.userId && options.userId.length > 0)
        {
            search.Users = {$in :[options.userId]};
        }
        
        //TODO
        //search.Members = {$in : [new mongoose.Types.ObjectId(u._id)]};
        //search.Members = {$in : [ u._id]};
        mongo.connect(dbConfig.mongoURI,function(err, db){
            db.collection("accounts")
            .find(search).toArray(function (e, a) {
                if(e)
                {
                    db.close();
                    return cb(new models.error(e));
                }
                var result = [];
                async.eachSeries(a, function(a, callback){
                    //{"_id":  {$in: ["VJvggm7ug","VJ0esDQ_e","41yeBrY_l","NJ6PJdKFe","EyfRUZB5x"]} }
                    var users = a.User;
                    mongo.connect(dbConfig.mongoURI, function(e, conn){
                        conn.collection("profiles")
                        .find({"_id" : {$in: users}}).toArray(function (e, profiles) {
                            if(e){
                                conn.close();
                                return callback();
                            }
                            else{
                                a.Profiles=profiles;
                                result.push(a);
                                conn.close();
                                return callback();
                            }
                        });
                    });
                        
                }, function () {    
                    db.close();
                    return cb(new models.success(result));
                });
                
            });
        });
    };
    
    this.saveAccount = function (req, cb) {
        console.log("controller : post account");
        var r = req.body;
        
        var p = {};
        if(r._id){ 
            p._id = r.Name;
        }
        else{
            p._id = shortId.generate();
        }   
         
        if(r.Name){ p.Name = r.Name;}
        if(r.Description){ p.Description = r.Description}
        if(r.ProfileIds){ p.Profiles = r.ProfileIds}
        
        mongo.connect( dbConfig.mongoURI,function(err, db){
            db.collection("accounts").findOneAndUpdate({"_id":p._id},{$set: p}, {"upsert":true, "forceServerObjectId":false, "returnOriginal":false}, function (err, acct) {
                if(err){
                    console.error(err);
                    db.close();
                    return cb(new models.error(e));
                }   
                db.close();
                return cb(new models.success(acct.value));
            });
        });
    };
    
    this.authenticate = function(req, cb){
        console.log("controller : verifySecret");
        var r = req.body;
        var secret = r.Secret;    
        getUser(r.UserName, function(e,u){
            if(e){
                
                return cb(new models.error("invalid credentials")); 
            }
            if(u == null){
                return cb(new models.error("invalid credentials"));
            }
            if(u.Secret != secret){
                return cb(new models.error("invalid credentials"));
            }
            generateToken(u._id, function(e, t){
                if(e){
                    console.error(e);
                    db.close();
                    return cb(new models.error("Internal error"));
                }
                var p = u.User;
                var ret = {
                        _id : p._id,
                        AccessToken:t.AccessToken,
                        UserName: p.UserName,
                        FirstName: p.FirstName,
                        LastName: p.LastName,
                        Picture : p.Picture,
                        EmailId: p.EmailId,
                        Address : p.Address,
                        City : p.City,
                        Country : p.Country,
                        ZipCode : p.ZipCode
                }
                var m =  new models.success(ret);
                return cb(m); 
            })
        });
    }
    
    this.resetPasword = function(req, callback){
        console.log("controller : verifySecret");
        var r = req.body;
        getUser(r.UserName, function(err, user){
            if(err){
                return callback(new models.error(err));
            } 
            if(!user){
                return callback("User user not found");
            } 
            //Update new random password
            //User exist ..now change the password
            var pwd = r.NewSecret;
            if(r.NewSecret == null){
                    pwd = getRandomPin();
            }
                
            var secretsUsed = [];
            if(user && user.SecretsUsed)
            {
                secretsUsed = user.SecretsUsed
            }
            
            db.collection("users").findAndModify(
                {_id:user._id},
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
    var generateToken = function(userId, callback){
        
        var token =  getRandomPin();
        token = userId;
        mongo.connect( dbConfig.mongoURI,function(err, db){
            db.collection("users").update({"_id":userId},{$set:{"AccessToken":token}},function(e,d){
                if(e){
                    return callback(e, d);    
                }                
                return callback(null, {"AccessToken":token});
            });
        });
    }
    //GEt user user from user name
    var getUser = function(userName, cb){
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

                db.collection("users").findOne({"ProfileId":u._id}, function(err,a){
                    db.close();
                    a.User = u;
                    return cb(null, a);                 
                });  
                
            });
    
        });
    }
}