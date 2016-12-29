/*
Manage user user
*/
var _dir = process.cwd();
var models = require("./../response.models.js").models;
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");
var apiCore = require("./../classes/API.Core.js");
var Core = new apiCore();
exports.v1 = function(){
    
    this.searchUsers = function(req,callback){
        var param = req.params.term;
        if(!param){
            param = req.query.term;
        }
        Core.searchUsers(param, function(e, data){
            if(e){
                return callback(new models.error(e));
            }
            if(data){
                return callback(new models.success(data));
            };
        });

    };
    
    //Register User
    this.createUser = function (req, callback) {
        var data = req.body
        Core.createUser(data, function(e, p) {
            if(e){
                return callback(new models.error(e));
            }
            return callback(new models.success(p));
        });
    };
    
    //save User
    this.saveUser = function (req, cb) {
        console.log("controller : post user");
        var r = req.body;
        var id = r._id;
        var p = {};
            //UserName: r.UserName,
        if(r.firstName){ p.firstName = r.firstName;}
        if(r.lastName){ p.lastName = r.lastName}
        if(r.alternateEmail) {p.alternateEmail = r.alternateEmail;}
        if(r.emailId){ p.emailId = r.emailId;}
        if(r.picture){ p.picture = r.picture;}
        if(r.address){ p.address = r.address;}
        if(r.city) { p.city = r.city;}
        if(r.country){ p.country = r.country}
        if(r.zipCode){ p.zipCode = r.zipCode}
        
        mongo.client.connect( mongo.URI,function(err, db){
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
        dbConfig.mongodbclient.connect(dbConfig.mongoURI,function(err, db){
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
                    dbConfig.mongodbclient.connect(dbConfig.mongoURI, function(e, conn){
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
        
        dbConfig.mongodbclient.connect( dbConfig.mongoURI,function(err, db){
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
        var c = {
            userName: r.userName,
            secret: r.secret
        };   
        Core.authenticate(c, function(e,p){
            if(e){
                return cb(new models.error(e)); 
            }
            var m =  new models.success(p);
            return cb(m); 
        });
    };
    
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
    
    //GEt user user from user name
    var getUser = function(userName, cb){
        console.log("controller : verifySecret");
        dbConfig.mongodbclient.connect( dbConfig.mongoURI,function(err, db){
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