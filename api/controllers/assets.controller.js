var models = require("./../response.models.js").models;
var shortId     =require("shortid");
var dbConfig =  require("../db.connection.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;
var fileCtrl = require("./file.controller.js");

var mongoURI = dbConfig.mongoURI;
/*
group module
*/
exports.v1 = function(){
    
    this.getAssetConfig = function(){
        //return assetConfigModel.find();
    }

    this.getAllAssets = function(cb){
       
        
    }
    /** Gets the assets of given group if the current user is member of this group
     * 
    */     
    this.getAssets =function(req, cb)
    {
        var u = req.user.User;         
        var q = req.query;
        var g = req.params.groupId;
		var options = {
            parentId : q.parentId,
		    groupId:g,
			count:100,
            from : q.from
		};
        if(options.from == null ){
            options.from = new Date("01-01-01");
        }
        
        mongo.connect( mongoURI,function(err, db){
            
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
                
                //return assetsas per criteria
                //var parentMatch = "/" + parentId + "/$";
                //var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
                var parentMatch =  parentId ;
                filter.Paths = {$in: [parentMatch] };
                
                db.collection("assets").find(filter).toArray(function(err, data){
                    db.close();
                    return cb(new models.success(data));
                });
            });
        });
    }
    /** Gets the assets of given group if the current user is member of this group
     * 
    */     
    this.getAsset =function(req, cb)
    {
        var u = req.user.User;         
        
        getFullAsset(req.query.id,function(e, asset){
            if(e){
                return cb(new models.error(e));
            }
        
            mongo.connect( mongoURI,function(err, db){
                if(asset.GroupId == null){ 
                    return cb(models.error("Unauthorized access"));
                }
                //Check group membership
                db.collection("groups").find({"_id":asset.GroupId, "Members" : {$in : [u._id]}}).toArray(function(err, data){
                    if(err){
                        db.close();  
                        return cb(err);
                    }
                    if(data.length <= 0 ){
                        db.close();
                        //This user has no access to the assets of this group.
                        return cb(new models.error("Unauthorize access","User is not authorized to access group."));
                    }   
                    db.close();
                    return cb(new models.success(asset));
                });
            
            });
        });
    }
    
    /**
     * Create the new asset based on data. This can be used to create empty asset.
     * 
     */
    this.create = function(req,cb){
        console.log("controller : create artifact");
        var currentUser = req.user.User
        //mandatory checks
        if(req.body.GroupId == null){
            return cb(new models.error("group required"));
        }
        if(req.body.Name == null){
            return cb(new models.error("Name required"));
        }
        
        var data = buildAssetModel(req.body);
        
        var audit = {
            AssetId : data._id,
            Action: data.auditTrail == null ? "Create" : "Update",
            UpdatedBy : currentUser,
            UpdatedOn : new Date(),
            Description : "",
            Notify : true,
        }
        if(data.auditTrail == null){
            data.AuditTrail = [];    
        } 
        data.AuditTrail.push(audit)
        mongo.connect( mongoURI,function(err, db){
            db.collection('assets').insert(data,function(e, r){
                
                return cb(e, r);
            });
        });
    }
    /**
     * Save the assets
     */
    this.createOrUpdate = function(req,cb){
        console.log("controller : create artifact");
        var currentUser = req.user.User
        //mandatory checks
        if(req.body.GroupId == null){
            return cb(new models.error("group required"));
        }
        if(req.body.Name == null){
            return cb(new models.error("Name required"));
        }
        
        var data = buildAssetModel(req.body, currentUser);
        
        mongo.connect( mongoURI,function(err, db){
            db.collection('assets').update({"_id" : data._id},data,{"forceServerObjectId":false, "upsert":true,  "fullResult":true},function(e, r){
                if(e){return models.error(e);}
                
                if(r == null){
                    return cb(models.error("Record not saved"));
                }
                if(r.result.upserted == null){
                    return cb(models.error("Record not saved"));
                }
                getFullAsset(_id, function(e, resul){
                    if(e){
                        return cb(new models.error(e));
                    }
                    return cb(new models.success(result));    
                });
            });
        });
    }
    
    /***
     * save the thumbnail
     */
    this.saveBase64Thumbnail = function(req, cb){
        var assetId = req.body.assetId;
        var imgUrl = req.body.base64ImgUrl;

        fileCtrl.saveFileFromBase64( assetId, imgUrl, function(err, data){
            if(err){
                console.error(err);
                return cb(new models.error(err));
            }
            var fileUrl = "//" + req.headers.host +'/file/'+  path.basename(data);
            var ast = new assetModel({"_id":assetId, "Thumbnail":fileUrl});
            assetModel.findOneAndUpdate({"_id":ast._id},{$set: ast},{new:true}, function(err,g){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }
                var ret = new models.success({"imageUrl" : fileUrl});
                return cb(ret);
            });
        });
    };
    
    /**
     * Get asset data from body
     */
    var getAssetDataFromBody = function(req){
      var param = req.body;
        var currentUser = req.user.User; //req.userIsAcount and user.User is actual user profile

        var data = {}
        if(param._id)
            data._id = param._id;
        if(param._uid)
            data._uid = param._uid;
        if(param.Name)
            data.Name=param.Name;
            
        if(param.AssetCategory){
            data.AssetCategory=param.AssetCategory;
        }
        if(param.Description)
            data.Description=param.Description;
        if(param.Status)
            data.Status = param.Status;
        if(param.Locale)
            data.Locale = param.Locale;
        if(param.Thumbnail)
            data.Thumbnail= param.Thumbnail;
        if(param.Urls)
            data.Urls= param.Urls;
        if(param.Moderators)
            data.Moderators = param.Moderators;
        if(param.ActivateOn)
            data.ActivateOn = param.ActivateOn;
        if(param.ExpireOn)
            data.ExpireOn = param.ExpireOn
        data.GroupId = param.GroupId;
        if(param.TopicId ){
            data.TopicId = param.TopicId
        }
        else{
            data.TopicId = data.GroupId
        }
        if(param.Paths ){
            data.Paths = param.Paths
        }
        else{
            data.Paths = [
                data.TopicId 
            ]
        }
        
        data.AllowLike = param.AllowLike
        data.AllowComment = param.AllowComment
        data.Publish = param.Publish
        data.UpdatedBy = currentUser;
        return data;  
    };
    
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
        
        if(data.TopicId ){
            a.TopicId = {
                "$ref":"assets",
                "$id" : data.TopicId
            }
        }
        a.GroupId = data.GroupId;
        if(data.Paths ){
            a.Paths = data.Paths
        }
        else{
            a.Paths = [
                data.TopicId 
            ]
        }
        a.Name          = data.Name;
        a.Description   = data.Description;
        a.Locale        = data.Locale;
        a.Publish       = data.Publish;
        a.AllowComment  = data.AllowComment;
        a.AllowLike     = data.AllowLike;
        a.Status        = data.Status;
        a.Thumbnail     = data.Thumbnail;
        a.Urls          = data.Urls;
        a.Moderators    = data.Moderators;
        a.ActivateOn    = data.ActivateOn;
        a.ExpireOn      = data.ExpireOn;
        a.AlloudTypes   = data.AllowedTypes;
        a.UpdatedOn     = new Date();
        a.UpdatedById  = currentUser._id; 
        
        if (data.AssetType != null){
            a.AssetTypeId = data.AssetType._id
        }
        
        if (data.AssetCategory != null){
            a.AssetCategory = data.AssetCategory._id
        }
        
        if(isNew){
            a.CreatedOn = new Date();
        }
        //Audit trail
        a.AuditTrail = data.AuditTrail;
         
        if(a.auditTrail == null){
            a.AuditTrail = [];    
        } 
        a.AuditTrail.push({
            Action: data._id == null ? "Create" : "Update",
            UpdatedById : currentUser._id,   
            UpdatedOn : new Date(),
            Description : "",
            Notify : true,
        });
        
        a.CustomData = data.CustomData;
         
        switch (data.AssetType.Name) {
            case "type_collection":
            {
                a.AllowComment  = false;
                a.AllowLike     = false;
                break;
            }
            case "type_document":
            {
                break;
            }
            case "type_calendar":
            {
                a.startDate = data.startDate;
                a.endDate       = data.endDate;
                a.venue         = data.venue;
                a.venueAddress  =  data.venueAddress;
                a.venueMapLocation=data.venueMapLocation;
                a.contact       = data.contact;
                break;
            }
            case "type_task":
            {
                a.taskType = data.taskType;
                a.status    = data.status;
                a.isClosed  = data.isClosed;
                a.closedOn  = data.closedOn;
                a.owners    = data.owners;
                a.updates   = data.updates; 
                
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
    
    /**
     * get fully populated assets of given id
     */
    var getFullAsset = function (id, callback){
        mongo.connect( mongoURI,function(err, db){
            db.collection("assets").findOne({"_id":id}, function(err, result){
                if(err){
                    return callback(err,result);
                }
                
                if(result == null){
                    return callback("Not found",result);
                }
                
                var retAsset = result;
                //populate other referenced documents parallelly
                async.parallel({
                    assetType: function(cb){
                        db.collection("configs").findOne({"_id":result.AssetTypeId}, function(err, group){
                            cb(null, group);
                        });
                    },
                    group: function(cb){
                        db.collection("groups").findOne({"_id":result.GroupId}, function(err, group){
                            cb(null, group);
                        });
                    },
                    updatedBy: function(cb){
                        db.collection("profiles").findOne({"_id":result.UpdatedById}, function(err, updatedBy){
                            cb(null, updatedBy);
                        });
                    },
                    
                },
                function(err, results) {
                    // results is now equals to: {one: 1, two: 2}
                    retAsset.Group = results.group;
                    retAsset.UpdatedBy = results.updatedBy;
                    return callback(err, retAsset);
                });
            });
        });
    }
    
};