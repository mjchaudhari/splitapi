
var drive = require("./../googleDriveHelper.js")();
var _dbConfig        = require("./../db.connection.js")

var API = API || {} // Namespace
API.Asset = function(){
    
    
    _isReady = false;

    //Properties
    _id             =null;
    Name          = null;
    Description   = null;
    Locale        = null;
    Publish       = null;
    AllowComment  = null;
    AllowLike     = null;
    Status        = null;
    Thumbnail     = null;
    Urls          = null;
    Moderators    = null;
    ActivateOn    = null;
    ExpireOn      = null;
    AlloudTypes   = null;
    UpdatedOn     = new Date();
    UpdatedById   = null;
    AssetTypeId = null;
    AssetCategoryId =null;
    CreatedOn       =null;
    CreateBy        = null;
}

API.Group.prototype.init = function(id, userId, cb){
    console.log("API.Group : init");
    _dbConfig.mongodbClient.connect( _dbConfig.mongoURI,function(err, db){
        db.collection("groups")
        .findOne({"_id":id, "Members" : {$in: [userId]}}, function (e, g) {
            if(e){
                return cb(e,g);
            }
            else if(g == null){
                return cb("Group is not found", null);
            }
            var filter = {"_id" : {$in : g.Members}};
            db.collection("profiles").find(filter).toArray(function(e, data){
                if(e){
                    db.close();
                    return cb(new models.error(e));
                }
                if(data){
                    db.close();
                    
                    _isReady = true;
                    
                    _id = g._id;
                    this.Name = g.Name;
                    this.Description = g.Description;
                    this.Locale = g.Locale;
                    this.Status = g.Status;
                    this.Thumbnail = g.Thumbnail;
                    this.Members = g.Data;
                    this.Url = g.Url;
                    this.GroupType = g.GroupType;
                    this.CreatedBy = g.CreatedBy;
                    this.UpdatedBy = g.CreatedBy;
                    this.UpdatedOn  = g.UpdatedBy;
                    this._fileStorage = g._fileStorage;
                    return cb(err, this);
                };
            });
        });
    });
}

API.Group.prototype.getFilesFromStorage = function(callback){
    if(!this._isReady){
        //throw new API.ApiException("Group is not instanciated.", "Group.getFileStarage()");
        return callback("Group is not instanciated.");
    }
    drive.getFiles({parentId : this._fileStorage}, function(e,d){

        return callback(e,d);
    });
    
}

API.Group.prototype.getFileTreeFromStorage = function(callback){
    if(!this._isReady){
        //throw new API.ApiException("Group is not instanciated.", "Group.getFileStarage()");
        return callback("Group is not instanciated.");
    }
    drive.getFileTree({parentId : this._fileStorage}, function(e,d){
        return callback(e,d);
    });
    
}

API.Group.prototype.getFileFromStorage = function(params,callback){
    if(!this._isReady){
        //throw new API.ApiException("Group is not instanciated.", "Group.getFileStarage()");
        return callback("Group is not instanciated.");
    }
    drive.getFile({id : params.id}, function(e,d){
        return callback(e,d);
    });
    
}

module.exports = API.Group;
