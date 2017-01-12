
var drive = require("./../googleDriveHelper.js")();
var mongo        = require("./../db.connection.js")
var apiException = require("./API.Exception.js");

var API = API || {} // Namespace
API.Group = function(data){
    
    //Properties
    this._id = data.__id;
    this.name = data.name;
    this.description = data.description;
    this.locale = data.locale;
    this.status = data.status;
    this.thumbnail = data.thumbnail;
    this.members = data.members;
    this.url = data.url;
    this.groupType = data.groupType;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.updatedOn  = data.updatedOn;
    this._fileStorage = data._fileStorage;
}

API.Group.prototype.init = function(id, userId, cb){
    console.log("API.Group : init");
    _dbConfig.mongodbClient.connect( _dbConfig.mongoURI,function(err, db){
        db.collection("groups")
        .findOne({"_id":id, "members" : {$in: [userId]}}, function (e, g) {
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
                    _id = g._id;
                    this.name = g.name;
                    this.description = g.description;
                    this.locale = g.locale;
                    this.status = g.status;
                    this.thumbnail = g.thumbnail;
                    this.members = g.data;
                    this.url = g.url;
                    this.groupType = g.groupType;
                    this.createdBy = g.createdBy;
                    this.updatedBy = g.createdBy;
                    this.updatedOn  = g.updatedBy;
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
/**
 * Get assets of this group
 * @param {object} params
 * @param {string} params.groupId - group id
 * @param {string} params.profileId - profile id who is seeking for assets
 * @return {array[asset]} array - list of assets
 */
API.Group.prototype.getAssets = function(params, callback){
    mongo.connect( )
        .then(function(db){
            //find the groups of this user
            var filter = { "_id": params.groupId,  "members": { $in: [params.profileId] } }
            db.collection("groups").find(filter).toArray(function(err, data){
                if(err){
                    db.close();  
                    return callback(err);
                }
                if(data.length <= 0 ){
                    db.close();
                    //This user has no access to the assets of this group.
                    return callback(new apiException().unauthenticated('unauthorized', 'Group'));
                }
                
                var parentId = options.parentId;
                if(options.parentId == null){
                    parentId = options.groupId;
                }
                
                var filter = {
                    "groupId": options.groupId,
                    "auditTrail.updatedOn" : {"$gte": options.from},
                    "accessibility": {$or : [ null, [{ $in: [params.profileId] }]]}
                }
                
                //return assetsas per criteria
                filter._paths = {$in : [new RegExp('/' + parentId + '$')]};
                
                db.collection("assets").find(filter).toArray(function(err, data){
                    db.close();
                    return callback(err, data);
                });
            });
        });
}

/** Gets the assets of given group if the current user is member of this group
     * 
    */     
this.getAssetTree =function(req, cb)
{
    var u = req.user.User;         
    var q = req.query;
    var g = req.params.groupId;
    var options = {
        parentId : q.p,
        groupId:g,
        levels : q.levels ? 10 : q.levels,
        structure_only: q.structure_only == "true" ? true : false 
    };
    
    if(options.from == null ){
        options.from = new Date("01-01-01");
    }
    
    mongo.connect( ).then(function(db){
        
        //find the groups of this user
        var filter = { "_id": options.groupId,  "Members": { $in: [u._id] } }
        db.collection("groups").find(filter).toArray(function(err, data){
            if(err){
                db.close();  
                return cb(err);
            }
            if(data.length <= 0 ){
                db.close();
                //This user has no access to the assets of this group.
                return cb(new models.error("Unauthorize access","User is not authorized to access group."));
            }
            
            var parentId = options.parentId;
            if(options.parentId == null){
                parentId = options.groupId;
            }
            
            var filter = {
                "GroupId": options.groupId,
                "AuditTrail.UpdatedOn" : {"$gte": options.from},
            }
            if(options.structure_only){
                filter.AssetTypeId = "type_collection"
            }
            
            //return assetsas per criteria
            //var parentMatch = "/" + parentId + "/$";
            //var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
            //{Paths: {$in : [/V1WC-H7_e/,/V1WC-H7_e$/,]}}
            //filter.Accessibility = {$or : [{"CreateBy":u._id}, {"Accessibility" : {$or : [ null, [{ $in: [u._id] }]]}}]} ;
            var AccessibilityExpr = {"$or": [
                {"CreateBy":u._id}, 
                {"Accessibility" : null}, {"Accessibility" : { $in: [u._id] }}]};
            var pathsExpr = {"$or" : [
                {"_id" : parentId}, 
                { "_paths" : {$in : [new RegExp('/' + parentId + '/'), new RegExp('/' + parentId + '$')]}}
            ]};
            
            filter["$and"] = [AccessibilityExpr, pathsExpr ];
            
            db.collection("assets").find(filter).toArray(function(err, data){
                db.close();
                if(err){      
                    return cb(err);
                }
                
                var hierarchy = buildTree(data, parentId, options.levels);
                return cb(new models.success(hierarchy));
            });
        });
    });
}

function buildAssetModel(data, currentUser, createId) {
    if(createId == undefined){
        createId = true;
    }
    
    var isNew = data._id == null; 
    var a = {}
    
    //Check if this is new docuemnt
    if(data._id){
        a._id = data._id;
    }
    else if(data._id == null && createId){
        a._id = shortId.generate();    
    }
    
    a._uid = data._uid ? "" : a._id
    
    a.groupId = data.groupId;
    if(data.TopicId ){
        a.topicId = data.topicId
    }
    else{
        a.topicId = data.groupId
    }
    
    //We do not consider the paths those are sent with data as we want to determine it ourself.
    if(data.parentIds){
        a.parentIds = data.parentIds;
    }
    else{
        a.parentIds = [data.groupId];
    }
    
    a.name          = data.name;
    a.description   = data.description;
    a.locale        = data.locale;
    a.publish       = data.publish;
    a.allowComment  = data.allowComment;
    a.allowLike     = data.allowLike;
    a.status        = data.status;
    a.thumbnail     = data.thumbnail;
    a.urls          = data.urls;
    a.moderators    = data.moderators;
    a.activateOn    = data.activateOn;
    a.expireOn      = data.expireOn;
    a.alloudTypes   = data.allowedTypes;
    a.updatedOn     = new Date();
    a.updatedById   = currentUser._id; 
    if(data.accessibility){
        a.accessibility = data.accessibility;
    }

    if (data.assetType != null){
        a.assetTypeId = data.assetType._id;
    }
    else if (data.assetTypeId != null){
        a.assetTypeId = data.assetTypeId;
    }
    
    if (data.assetCategory != null){
        a.assetCategoryId = data.assetCategory._id
    }
    else if (data.assetCategoryId != null){
        a.assetCategoryId = data.assetCategoryId
    }
    
    if(isNew){
        a.areatedOn = new Date();
        a.areateBy = currentUser._id;
    }
    //Audit trail
    a.auditTrail = data.auditTrail;
        
    if(a.auditTrail == null){
        a.auditTrail = [];    
    } 
    a.auditTrail.push({
        action: data._id == null ? "Create" : "Update",
        updatedById : currentUser._id,   
        updatedOn : new Date(),
        description : "",
        notify : true,
    });
    
    a.customData = data.customData;
        
    switch (data.assetTypeId) {
        case "type_collection":
        {
            a.allowComment  = false;
            a.allowLike     = false;
            break;
        }
        case "type_document":
        {
            break;
        }
        case "type_calendar":
        {
            a.calendar.startDate         = data.calendar.startDate;
            a.calendar.endDate           = data.calendar.endDate;
            a.calendar.venue             = data.calendar.venue;
            a.calendar.venueAddress      = data.calendar.venueAddress;
            a.calendar.venueMapLocation  = data.calendar.venueMapLocation;
            a.calendar.contact           = data.calendar.contact;
            break;
        }
        case "type_task":
        {
            a.task = {};
            a.task.taskType = data.task.taskType;
            a.task.taskStatus    = data.task.taskStatus;
            a.task.isClosed  = data.task.isClosed;
            a.task.closedOn  = data.task.closedOn;
            a.task.owners    = data.task.owners;
            a.task.updates   = data.task.updates; 
            
            break;
        }
        case "type_demand":
        {
            break;
        }
        case "type_transaction":
        {
            break;
        }
        case "type_form":
        {
            break;
        }
        
        default:{
            
            break;
        }
            
    }
    
    return a;
}

module.exports = API.Group;
