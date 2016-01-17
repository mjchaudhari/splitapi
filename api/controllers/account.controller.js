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

    this.searchUsers = function(req,callback){
        var param = req.params.term;
        if(!param){
            param = req.query.term;
        }
        
        var re = new RegExp( param , 'gi');
        userModel.find()
        .or([{ 'FirstName': { $regex: re }}, 
            { 'LastName': { $regex: re }},
            { 'UserName': { $regex: re }},
            { 'EmailId': { $regex: re }}])
        .exec(
            function (e, data){
                if(e){
                    return callback(new models.error(e));
                }
                var ret = [];
                data.forEach(function(u){
                    var udata = {
                        "_id": u._id
                        , "FirstName":u.FirstName
                        , "LastName": u.LastName
                        , "UserName":u.UserName
                        , "Status":u.Status
                        ,"CreatedOn":u.CreatedOn
                        ,"EmailId" : u.EmailId
                        ,"Picture" : u.Picture
                        ,"City" : u.City
                        ,"Country" : u.Country
                        ,"ZipCode" : u.ZipCode
                    }
                    ret.push(udata);
                });
                return callback(new models.success(ret));
            });
    };
    
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
                EmailId : r.EmailId,
                Picture : r.Picture,
                CreatedOn : new Date(),
                Address : r.Address,
                City : r.City,
                Country : r.Country,
                ZipCode : r.ZipCode
                
                
            });
            
            u.save(function(err, u){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                console.log(u);
                
                var pwd = getRandomPin();
                
                var acct = accountModel({
                    User : u,
                    Secret :pwd,
                    ForceReset: false,
                    SecretsUsed : [pwd],
                        
                });
                acct.save(function(e,a)
                {
                    //since user is registering, we need to send the limited registration information
                    var retUser = {
                        "_id": u._id
                        ,"FirstName":u.FirstName
                        , "LastName": u.LastName
                        , "UserName":u.UserName
                        , "Status":u.Status
                        , "CreatedOn":u.CreatedOn
                        , "Secret":a.Secret
                        , "EmailId" : u.EmailId
                        , "Picture" : u.Picture
                        , "Address" : r.Address
                        , "City" : r.City
                        , "Country" : r.Country
                        , "ZipCode" : r.ZipCode
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
        var secret = r.Secret;
        getAccount(r.UserName,function(e,acct){
            if(e){
                return callback(new models.error(e));
            }
            if(!acct)
            {
                return callback(new models.error("Invalid credentials"));
            }
            
            if(acct.Secret != secret){
                return callback(
                        new models.error("Credentials invalid"))
            }
            //else authentication success
            //TODO: generate token
            var token =  getRandomPin();
             token = r.UserName;
            accountModel.findOneAndUpdate(
                {_id:acct._id},
                {$set: {AccessToken:token}},
                {new:false}, 
                function(err,a)
                {
                    if(err){
                        return callback(new models.error(err));
                    }
                    var ret = {
                        _id : acct.User._id,
                        AccessToken:a.AccessToken,
                        UserName: acct.User.UserName,
                        FirstName: acct.User.FirstName,
                        LastName: acct.User.LastName,
                        Picture : acct.User.Picture,
                        EmailId: acct.User.EmailId,
                        Address : acct.User.Address,
                        City : acct.User.City,
                        Country : acct.User.Country,
                        ZipCode : acct.User.ZipCode}
                    var m =  new models.success(ret);
                    return callback(m);      
                });
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
            var pwd = getRandomPin();
            var secretsUsed = [];
            if(acct && acct.SecretsUsed)
            {
                secretsUsed = acct.SecretsUsed
            }
            
            accountModel.findOneAndUpdate(
                {_id:acct._id},
                {$set: {
                    Secret :pwd,
                    SecretsUsed : secretsUsed.push(pwd)}},
                {new:false}, 
            function(err, a)
            {
                if(err) { return callback(new models.error(err));}
                //since user is registering, we need to send the limited registration information
                var retUser = {
                    "_id" : acct.User._id
                    ,"FirstName":acct.User.FirstName
                    , "LastName": acct.User.LastName
                    , "UserName":acct.User.UserName
                    , "Status":acct.User.Status
                    ,"CreatedOn":acct.User.CreatedOn
                    ,"Secret":a.Secret
                    ,"EmailId" : acct.User.EmailId
                    ,"Picture" : acct.User.Picture
                    , "Address" : r.Address
                    , "City" : r.City
                    , "Country" : r.Country
                    , "ZipCode" : r.ZipCode
                }
                var m = new models.success(retUser);
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

    //GEt user account from user name
    var getAccount = function(userName, callback){
        
        
        var options = {"UserName":userName};
        
        //get the user id first and then find the account
        userModel.findOne(options, function   (err, data)
        {
            if(err || data == undefined){
                var e = models.error(err, "");
                return callback(e);
            }       
            //Find the matching account
            accountModel.findOne({"User":data._id})
            .populate("User")
            .exec(function(err,acct){
                if(err){
                    var e = models.error(err, "");
                    return callback(e);
                }   
                 //Send email or SMS with pin
                return callback(null,acct);        
            });     
        });
        
        
    };
}