
var API = API || {} // Namespace
API.User = function(mongodbClient, dbConfig){
    _mongo = mongodbClient;
    _dbConfig = dbConfig;
    _isReady = false;
    //Properties
    _id = "";
    UserName= "";
    FirstName =  "";
    LastName =  "";
    Picture =  "";
    EmailId =  "";
    Address =  "";
    City =  "";
    Country =  "";
    ZipCode =  "";
}

API.User.prototype.init = function(userName, cb){
    console.log("API.User : init");
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
API.User.prototype.CreateGroup = function(group, callback){
    //validate
    if(this.Name == null || this.Name == ""){
        throw new API.ApiException("Group Name required", "Group.save()");
    }

    return callback();
}

API.User.prototype.getGroups = function(searchTerm, callback){
    
        mongo.connect(dbConfig.mongoURI,function(err, db){
        db.collection("groups")
        .findOne({"_id":groupId, "Members" : {$in: [this._id]}}, function (e, g) {
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

API.User.prototype.getGroups.checkGroupMembership = function(groupId, cb){
    mongo.connect(dbConfig.mongoURI,function(err, db){
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
module.exports = API.User;