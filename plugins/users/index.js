/*
    User Management module
    Deals with 
        -Create new user
        -Manage user credentials
        -
    
*/
var models =  require("./lib/user.model.js");
var uuid = require("node-uuid");
/*
Get All users based on filer
*/
module.exports = function(dbConfig){
    
    var m =  models(dbConfig);
    var userModel = m.userModel;
    var roleModel = m.RoleModel;
    var clientModel = m.ClientModel;
    
    this.getUsers = function (options, callback) {
        console.log("controller  : get users");
        //
        userModel.find(options,function(err, users){
            if(err){
                console.error(err);
                //res.send({message:"error", error:err});
                
                return callback(err);
            }
            return callback(null, users);
            
        });
    };
    
    //find user by user name
    this.getUser = function (options, cb) {
        console.log("controller : get users");
        //var user = new userModel(conn);
        //var filter = req.params.userName;
        
        userModel.findOne(options, function(err, user){
            if(err){
                console.error(err);
                return cb(err);
            }
           
            return cb(null,user);
        });
    };
    
    //Create new User
    this.createUser = function (param, cb) {
        console.log("controller : post user");
        
        var u = userModel    ({
            UserName: param.UserName,
            FirstName: param.FirstName,
            LastName: param.LastName,
            Secret :param.Secret,
            ForceReset: false,
            Status:"REQUESTED",
            AlternateEmail : param.AlternateEmail,
            CreatedOn : new Date()
        });
        u.save(function(err){
            if(err){
                console.error(err);
                return cb(err);
            }   
            console.log(u);
            return cb(null, u);
        });
    };
    
    
    ///Update the user
    this.updateUser = function (req,cb) {
        console.log("controller : post user");
                //update user now
            var u = {};
            
            if (req.FirstName) {
                u.FirstName = req.FirstName;    
            }
            
            if(req.LastName){
                u.LastName = req.LastName;
            }
            
            if(req.AlternateEmail){
                u.AlternateEmail = req.AlternateEmail;
            }
            
            if (req.Secret) {
                u.Secret = req.Secret;    
            }
            if(req.Status){
                u.Status = req.Status;
            }
            
            if(req.AccessToken){
                u.AccessToken = req.AccessToken;
            }
            
            if(req.LastLogin){
                u.LastLogin = req.LastLogin;
            }
            if(req.ForceReset){
                u.ForceReset = req.ForceReset;
            }
            if(req.AccessToken){
                u.AccessToken = req.AccessToken;
            }
    
            if(req.ClientSubscriptions){
                u.ClientSubscriptions = req.ClientSubscriptions;
            }
            
        	userModel.findOneAndUpdate({"Id":req.Id}, { $set: u } ,{new:true}, function (e, u ) {
                return cb(e,u);
        });
    };
    
    //Change PAssword
    this.changePassword = function (req,cb) {
        console.log("controller : Change password");
        
        userModel.findOne({"UserName":req.params.userName}, function (e, u ) {
            if(e){
                console.error(e);
                
                return cb(e);
            }
            
            if (!u) {
                console.error(e);
                return cb(e);
            }
           
            //update user now
        
            if(req.body.secret){
                u.Secret = req.body.Password;
                var s=u.SecretesUsed.push(u.Password);
                u.SecretesUsed = s;
                u.ForceReset =false;
            }
            
            u.save(function (err) {
                if(err){
                    return cb(err);
                }
                
                return cb(u);
            });
        });
    };
    
    //reset force reset Password status
    this.forceRest = function (req,cb) {
        console.log("controller : Change password");
        
        userModel.findOne({"UserName":req.params.userName}, function (err, u ) {
            if(err){
                console.error(err);
                return cb(e);
            }
            
            if (!u) {
                console.error(err);
                var e =  "User with user name '" + req.params.userName + "' not found.";
                return cb(e);
            }
           
            //update user now
            u.ForceReset =true;
            
            u.save(function (err) {
                if(err){
                    
                    return cb(err);
                }
                return cb(u);
            });
        });
    };
    
    //reset force reset Password status
    this.verifySecret = function (req,cb) {
        console.log("controller : Change password");
        
        userModel.findOne({"UserName":req.params.userName, "Secret":req.params.password}, function (err, user ) {
            if(err){
                console.error(err);
                return cb(e);
            }
            
            if (!user) {
                console.error(err);
                var e = "Invalid credentials '" + req.params.userName + "' not found.";
                
                 return cb(e);
            }
           
           return cb(user)
        });
    };
    
    this.resetAuthTokens = function (req,cb) {
        console.log("controller : Change password");
        var u = new userModel({
            AccessToken : "",
            RefreshToken:""
        });
        userModel.findOneAndUpdate({"_id":req._id}, { $set: u } ,{new:true}, function (e, u ) {
            return cb(e,u);
        });
    };
    
    /***
     * Create or update the account
     * 
     * @params
     */
    this.SaveAccount=function( req, cb){
        
        //find the account with Id
        clientModel.findOne({"_id":req._id}, function(e,a){
            if(e){
                return cb(e,null);
            }
            
            
            if(!a){
                var appSec = uuid.v4();
                var acct = new clientModel({
                    Name:req.Name,
                    AppSecret:appSec,
                    ContactFirstName:req.ContactFirstName,
                    ContactLastName:req.ContactLastName,
                    ContactEmail:req.ContactEmail,
                    ContactNumbers:req.ContactNumbers 
                });
            
                //Create new
                acct.save(function (err) {
                    if(err){
                        return cb(err);
                    }
                    return cb(null,acct);
                }); 
            }
            else {
                var acct = new clientModel({
                    
                    ContactFirstName:req.ContactFirstName,
                    ContactLastName:req.ContactLastName,
                    ContactEmail:req.ContactEmail,
                    ContactNumbers:req.ContactNumbers 
                });
                //Update existing
                acct.Update(function (err) {
                    if(err){
                        return cb(err);
                    }
                    return cb(null,acct);
                });
            }
            
            
        })
        
    };
    
    
}//module export ends