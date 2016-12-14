
var API = API || {} // Namespace
API.Core = function(mongodbClient, dbConfig){
    _mongo = mongodbClient;
    _dbConfig = dbConfig;
}
/**
 * Get User
 */
API.Core.prototype.getUser = function(userName, cb){
    console.log("API.Core : init");
    _mongo.connect( _dbConfig.mongoURI,function(err, db){
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
                this._isReady = true;
                this._id = p._id;
                this.UserName= p.UserName;
                this.FirstName = p.FirstName;
                this.LastName = p.LastName;
                this.Picture = p.Picture;
                this.EmailId = p.EmailId;
                this.Address = p.Address;
                this.City = p.City;
                this.Country = p.Country;
                this.ZipCode = p.ZipCode;
                this._isReady = true;
                return cb(null, p);                 
            });  
        });
    });
}

//Save this object
API.Core.prototype.SaveUser = function(user, callback){
    //validate
    if(user.name == null || user.Name == ""){
        throw new API.ApiException("Name required", "Group.save()");
    }

    if(user.userName == null || user.userName == ""){
        throw new API.ApiException("User name required", "Group.save()");
    }

    //Find if this user already exist
    var filter = {"userName":userName};
    _mongo.connect(dbConfig.mongoURI, function(conErr, db){
        
    });//mongo connect

    return callback();
}



module.exports = API.Core;