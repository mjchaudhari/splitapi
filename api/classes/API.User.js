var _dbConfig        = require("./../db.connection.js")
var API = API || {} // Namespace

API.User = function(){
    var self = this;
    self._isReady = false;
}    
    
//Properties
API.User.prototype._id = "";
API.User.prototype.UserName= "";
API.User.prototype.FirstName =  "";
API.User.prototype.LastName =  "";
API.User.prototype.Picture =  "";
API.User.prototype.EmailId =  "";
API.User.prototype.Address =  "";
API.User.prototype.City =  "";
API.User.prototype.Country =  "";
API.User.prototype.ZipCode =  "";


API.User.prototype.init = function(userName, cb){
    console.log("API.User : init");
    var self = this;
    _dbConfig.mongodbClient.connect( _dbConfig.mongoURI,function(err, db){
        db.collection("profiles").findOne({"UserName":userName}, function(err,p){
            if(err){
                db.close();
                return cb(err,p);
            }   
            if(p == null){
                console.error("user credentials mismatch");
                db.close();
                return cb("Not found");
            }

            db.collection("users").findOne({"ProfileId":p._id}, function(err,a){
                db.close();
                a.User = p;
                self._isReady = true;
                self._id = p._id;
                self.UserName= p.UserName;
                self.FirstName = p.FirstName;
                self.LastName = p.LastName;
                self.Picture = p.Picture;
                self.EmailId = p.EmailId;
                self.Address = p.Address;
                self.City = p.City;
                self.Country = p.Country;
                self.ZipCode = p.ZipCode;
                self._isReady = true;
                return cb(null, p);                 
            });  
        });
    });
}

API.User.prototype.resetPasword = function(newPassword, callback){
    var self = this;
    //validate
    if(self._id == null || self._id == "" || !self._isReady){
        throw new API.ApiException("User is not initialized", "User.resetPassword()");
    }
    _dbConfig.mongodbClient.connect( _dbConfig.mongoURI,function(err, db){
        db.collection("users").findOne({"ProfileId":self._id}, function(err,user){
            var pwd = newPassword;
            if(newPassword == null){
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
                        return callback(err);
                    }
                    
                    var m = ({"secret":pwd});
                    //TODO: send SMS on acct.User.MobileNo
                    //TODO: Send email or SMS with pin
                    return callback(m);
                });
        });    
    });
    
    return callback();
}


//Save this object
API.User.prototype.CreateGroup = function(group, callback){
    //validate
    if(this.Name == null || this.Name == "" ){
        throw new API.ApiException("Group Name required", "Group.save()");
    }

    return callback();
}

API.User.prototype.getGroups = function(searchTerm, callback){
    
        _dbConfig.mongodbClient.connect(_dbConfig.mongoURI,function(err, db){
        db.collection("groups")
        .findOne({"Members" : {$in: [this._id]}}, function (e, g) {
            if(e){
                return callback(e,g);
            }
            else if(g == null){
                return callback("Group is not accessible", null);
            }
            var result = {accessAs : "Member"};
            //check if this user has admin accessible
            if(g.CreatedBy == userId){
                result.accessAs = "Creator";
            }
            return callback(null, result);
        });
    });     
}

API.User.prototype.checkGroupMembership = function(groupId, cb){
    _dbConfig.mongodbClient.connect(_dbConfig.mongoURI,function(err, db){
        db.collection("groups")
        .findOne({"_id":groupId, "Members" : {$in: [this._id]}}, function (e, g) {
            if(e){
                return cb(e,g);
            }
            else if(g == null){
                return cb("Group is not accessible", null);
            }
            var result = {accessAs : "Member"};
            //check if this user has admin accessible
            if(g.CreatedBy == userId){
                result.accessAs = "Creator";
            }
            return cb(null, result);
        });
    });     
}

var getRandomPin = function()
{
    var randomPin = Math.floor(Math.random() * (999999- 111111) + 111111);
    randomPin = 654321;
    return randomPin;
};
var generateToken = function(userId, callback){
        
    var token =  getRandomPin();
    token = userId;
    _dbConfig.mongodbclient.connect( _dbConfig.mongoURI,function(err, db){
        db.collection("users").update({"_id":userId},{$set:{"AccessToken":token}},function(e,d){
            if(e){
                return callback(e, d);    
            }                
            return callback(null, {"AccessToken":token});
        });
    });
}
module.exports = API.User;