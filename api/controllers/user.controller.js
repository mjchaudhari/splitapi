/*
Manage user account
*/
var _dir = process.cwd();

var models = require("./../response.models.js").models;
var userModels = require("./../models/account.model.js");
var uuid = require("node-uuid");
exports.v1 = function(dbConfig){
    var m =  userModels(dbConfig);
    var userModel = m.userModel;
     
    //get single user based on username     
    this.getUsers =function(req, cb)
    {
        //var options = {"UserName":req.userName};
        userModel.find(req, function   (e, data)
        {
            if(e)
            {
                return cb(new models.error(e));
            }
            var ret = new models.success(data);
            return cb(ret);
        });
    };
    
    this._isLoggedIn = function (req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
    
        // if they aren't redirect them to the home page
        res.redirect('/');
    };
    
    /**
    Check if the user name and authToken is correct
    */
    this.authenticate = function(req, cb)
    {
        var r = req.body;
    
        var options = {"UserName":r.UserName, "Secret":r.Secret};
        
        userModel.findOne(options, function   (e, data)
        {
            if(e != null)
            {
                return cb(new models.error(e));
            }
            if(data == null)
            {
                return cb(new models.error("Invalid credentials"));
            }
            
            var u = {
                "Id":data.Id,
                "AccessToken":12345,
            };
            
            userModel.findOneAndUpdate({"Id":data.Id}, { $set: u } ,{new:true}, function (e, u) {
                if(e != null)
                    {
                        var e = new models.error(e, "Error while setting new secret");
                        return cb(e);
                    }
                    
                    //REturn the auth token
                    var retUser = {
                            "FirstName":u.FirstName
                            , "LastName": u.LastName
                            , "UserName":u.UserName
                            , "Status":u.Status
                            ,"CreatedOn":u.CreatedOn
                            ,"ClientKey" : u.ClientKey,
                            'AccessToken':'123456'
                    }
                     var m = new models.success(retUser);
                     return cb(m);
                            
            });
            
        });
        
    }
    //Register User
    this.registerUser = function (req, cb) {
        console.log("controller : post user");
        var r = req.body;
    
        var options = {"UserName":r.UserName};
        userModel.find(options, function   (e, data)
        {
            if(e != null)
            {
                var e = new models.error(e, req.params.userName + " already registered.");
                return cb(e);
            }
            var randomPin = getRandomPin();
            var u = userModel    ({
                UserName: r.UserName,
                FirstName: r.FirstName,
                LastName: r.LastName,
                Secret :r.Secret,
                ForceReset: false,
                Status:"REQUESTED",
                AlternateEmail : r.AlternateEmail,
                CreatedOn : new Date()
            });
            
            u.save(function(err){
                if(err){
                    console.error(err);
                    return cb(err);
                }   
                console.log(u);
            
                //since user is registering, we need to send the limited registration information
                var retUser = {
                    "FirstName":u.FirstName
                    , "LastName": u.LastName
                    , "UserName":u.UserName
                    , "Status":u.Status
                    ,"CreatedOn":u.CreatedOn
                    ,"ClientKey" : u.ClientKey
                }
                var m = new models.success(retUser);
                //Send email or SMS with pin
                return cb(m);    
            });
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
    
    //Get random pin
    var getRandomPin = function()
    {
        var randomPin = Math.floor(Math.random() * (999999- 111111) + 111111);
        randomPin = 654321;
        return randomPin;
    };
    /*
     Resend the Pin code via sms or email after successful registration.
     @bodyParam : UserName, Pin
     @retParam : bool
     */
    this.resendPin = function (req, cb) {
        console.log("controller : verifySecret");
        var r = req.body;
        var options = {"UserName":r.UserName.toString()};
        userModel.findOne(options, function   (e, data)
        {
            if(e != null)
            {
                return cb(new models.error(e));
            }
            //Update the user with new PIN
            var pin =getRandomPin();
            var u = {
                "Id":data.Id,
                "Secret":pin,
            };
            
            userModel.findOneAndUpdate({"Id":data.Id}, { $set: u } ,{new:false}, function (e, d ) {
                if(e != null)
                    {
                        var e = new models.error(e, "Error while setting new secret");
                        return cb(e);
                    }
                    var resp = new models.success({"secret":d.Secret});
                    //TODO send this sceret on mobile or email
                    return cb(resp);
            });
        });
    };
    
    /*
     Verify the Pin code that user must ave been recieved via sms or email after successful registration.
     @bodyParam : UserName, Pin
     @retParam : bool
     */
    this.verifySecret = function (req, cb) {
        console.log("controller : verifySecret");
        var r = req.body;
        var options = {"UserName":r.UserName.toString()};
        userModel.getUser(options, function   (e, data)
        {
            if(e != null || data == null)
            {
                var e = new models.error(e, r.UserName + " not found or pin is not correct.");
                return cb(e);
            }
            
            if(data.UserName == r.UserName && data.Secret == r.Pin)
            {
                data.Status = "REGISTERED";
                if(data.AsscessToken == undefined || data.AsscessToken == '')
                {
                    data.AccessToken = uuid.v4();
                }
                _userMgmt.updateUser(data, function(e, d){
                
                    if(e != null)
                    {
                        var e = new models.error(e, "Error while saving the status");
                        return cb(e);
                    
                    }
                    var resp = new models.success({"token":d.AccessToken});
                    return cb(resp);
                    
                    
                });
            }
            else {
                return cb(new models.error(null,"Invalid Pin."));
            }
            
        });
    }
    
    //Change PAssword
    this.changePassword = function (req,cb) {
        console.log("controller : Change password");
        
        userModel.changePassword(req, function(err, data){
            if(err){
                console.error(err);
                var e = models.error(err, "");
                return cb(e);

            }
            var m = new models.success(data);
            return cb(m);

        });
    };
    
    //reset force reset Password status
    this.forceRest = function (req,cb) {
        console.log("controller : Change password");
        
        userModel.forceRest(req, function (err, user ) {
            if(err){
                console.error(err);
                var e = models.error(err, "");
                return cb(e);

            }
            
            if (!user) {
                //console.error();
                var e = models.error(err, "User with user name '" + req.params.userName + "' not found.");
                return cb(e);
            }
                
                var m = models.success(user);
                return cb(m);
        });
    };
    //reset force reset Password status
    this.ResetAuthTokens = function (user,cb) {
        console.log("controller : Change password");
        
        var u =  {
            Id: user.Id
            
            ,AccessToken : user.AccessToken
            ,RefreshToken:user.RefreshToken
        };
        userModel.updateUser(u, function (err, user ) {
            if(err){
                console.error(err);
                var e = models.error(err, "");
                return cb(e);

            }
            
            if (!user) {
                //console.error();
                var e = models.error(err, "User with user name '" + req.params.userName + "' not found.");
                return cb(e);
            }
                
                var m = models.success(user);
                return cb(m);
        });
    };
    /***
     * Client APIs
     */
}