/*
Manage user account
*/
var _dir = process.cwd();

var models = require("./../response.models.js").models;
var userModels = require("./../models/user.model.js");


exports.v1 = function(dbConfig){
    var m =  userModels(dbConfig);
    var userModel = m.userModel;
    var accountModel = m.accountModel;

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
                
                Status:"REQUESTED",
                AlternateEmail : r.AlternateEmail,
                CreatedOn : new Date()
            });
            
            u.save(function(err, u){
                if(err){
                    console.error(err);
                    return cb(err);
                }   
                console.log(u);
                
                var pwd = getRandomPin();
                
                var acct = accountModel({
                    User : u,
                    Secret :pwd,
                    ForceReset: false,
                    SecretsUsed : [pwd],
                        
                });
                acct.save(function()
                {
                    //since user is registering, we need to send the limited registration information
                    var retUser = {
                        "FirstName":u.FirstName
                        , "LastName": u.LastName
                        , "UserName":u.UserName
                        , "Status":u.Status
                        ,"CreatedOn":u.CreatedOn
                        
                    }
                    var m = new models.success(retUser);
                    //Send email or SMS with pin
                    return cb(m);
                });
            });
        });
    };
    
    this.authenticate = function(req, callback){
        console.log("controller : verifySecret");
        var r = req.body;
        var options = {"UserName":r.UserName.toString()};
        userModel.findOne(options)
        .exec(function   (e, u)
        {
            if(e != null || u == null)
            {
                var e = new models.error(e, r.UserName + " not found or pin is not correct.");
                return cb(e);
            }
            
            accountModel.findOne({
                Secret:r.Secret
            })
            .populate({
                path:"User",
                match:{UserName:r.UserName}
            })
            .exec(function(err, acct){
                if(err){
                    console.error(err);
                    var e = models.error(err, "");
                    return callback(e);
                }
                
                if(!acct)
                {
                    return callback(
                        new models.error("Credentials invalid")
                    );
                }
                
                //TODO: generate token
                var token =  getRandomPin();
                
                accountModel.findOneAndUpdate(
                    {_id:acct._id},
                    {$set: {AccessToken:token}},
                    {new:false}, 
                    function(err,a)
                    {
                        var ret = {
                            AccessToken:token,
                            UserName: acct.User.UserName,
                            FirstName: acct.User.FirstName,
                            LastName: acct.User.LastName,
                            EmailId: acct.User.EmailId}
                        var m = new models.success(ret);
                        return callback(m);      
                    });           
            });
            //Fins the password for this user
        });
    }
    //Get random pin
    var getRandomPin = function()
    {
        var randomPin = Math.floor(Math.random() * (999999- 111111) + 111111);
        randomPin = 654321;
        return randomPin;
    };
    
}