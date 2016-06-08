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
                filter._paths = {$in : [new RegExp('/' + parentId + '$')]};
                
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
    this.getAssetTree =function(req, cb)
    {
        var u = req.user.User;         
        var q = req.query;
        var g = req.params.groupId;
		var options = {
            parentId : q.parentId,
		    groupId:g,
            levels : q.levels ? 10 : q.levels,
            structure_only: q.level ? true : false 
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
                if(structure_only){
                    filter.AssetTypeId = "type_collection"
                }
                
                //return assetsas per criteria
                //var parentMatch = "/" + parentId + "/$";
                //var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
                //{Paths: {$in : [/V1WC-H7_e/,/V1WC-H7_e$/,]}}
                filter._paths = {$in : [new RegExp('/' + parentId + '/'), new RegExp('/' + parentId + '$')]};
                
                db.collection("assets").find(filter).toArray(function(err, data){
                    db.close();
                    var hierarchy = buildTree(data, parentId, options.levels);
                    return cb(new models.success(hierarchy));
                });
            });
        });
    }
    
    /** Gets the asset detail if the current user is member of this group
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
        determinePath(data.ParentIds, function (paths) {
            data._paths = paths;
            mongo.connect( mongoURI,function(err, db){
                db.collection('assets').update({"_id" : data._id},data,{"forceServerObjectId":false, "upsert":true,  "fullResult":true},function(e, r){
                    if(e){return models.error(e);}
                    
                    if(r == null){
                        return cb(new models.error("Record not saved"));
                    }
                    if(r.result.ok == 0){
                        return cb(new models.error("Record not saved"));
                    }
                    getFullAsset(data._id, function(e, result){
                        if(e){
                            return cb(new models.error(e));
                        }
                        return cb(new models.success(result));    
                    });
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
        
        a.GroupId = data.GroupId;
        if(data.TopicId ){
            a.TopicId = data.TopicId
        }
        else{
            a.TopicId = data.GroupId
        }
        
        //We do not consider the paths those are sent with data as we want to determine it ourself.
        if(data.ParentIds){
            a.ParentIds = data.ParentIds;
        }
        else{
            a.ParentIds = [data.GroupId];
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
        a.UpdatedById   = currentUser._id; 
        
        if (data.AssetType != null){
            a.AssetTypeId = data.AssetType._id;
        }
        else if (data.AssetTypeId != null){
            a.AssetTypeId = data.AssetTypeId;
        }
        
        if (data.AssetCategory != null){
            a.AssetCategoryId = data.AssetCategory._id
        }
        else if (data.AssetCategoryId != null){
            a.AssetCategoryId = data.AssetCategoryId
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
         
        switch (data.AssetTypeId) {
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
                    parents: function(cb){
                        db.collection("assets").find({"_id": {$in : result.ParentIds } }).toArray(function(err, parents){
                            if(parents != null){
                                var pArray = [];
                                parents.forEach(function(p){
                                    var prnt = {
                                        "_id" : p._id,
                                        "_uid" : p._uid,
                                        "AssetTypeId" : p.AssetTypeId,
                                        "Name" : p.Name,
                                        "ParentIds" : p.ParentIds,
                                        "_paths" : p._paths
                                    }
                                    pArray.push(prnt);
                                });
                                
                                cb(null, pArray);        
                            }
                            else{
                                cb(null, null);    
                            }
                            
                        });
                    },
                    // pathInfo : function (cb) {
                    //     var allParents = [];
                    //     result._paths.forEach(function(element) {
                    //         var elements = element.split('/');
                    //         allParents = _.union(allParents,elements);
                    //     }, this);
                        
                    //     db.collection("assets").find({"_id": {$in : allParents } }).toArray(function(err, parents){
                    //         //TODO
                    //     });
                        
                    // }
                },
                function(err, results) {
                    retAsset.AssetType = results.assetType;
                    retAsset.Group = results.group;
                    retAsset.UpdatedBy = results.updatedBy;
                    retAsset.Parents = results.parents;
                    return callback(err, retAsset);
                });
            });
        });
    }
    /**
     * DEtermine the path for given parentId.
     */
    function determinePath(parentIds, callback){
        var parentIds = parentIds;
        mongo.connect( mongoURI,function(err, db){
            db.collection("assets").find({"_id":{$in: parentIds }}).toArray(function(err, data){
                var result = data;
                if(err){
                    return callback(err,result);
                }
                
                var paths = [];
                if(result == null){
                    //if the result is null, it means the parent is root element itself.
                    //consider parentId itself as result.
                    parentIds.forEach(function (parentId) {
                        paths.push( "/" + parentId);
                    }); 
                }
                else{
                    parentIds.forEach(function (parentId) {
                        result.forEach(function(a){
                            if(a._paths == null){
                               
                                paths.push( "/" + parentId) ;
                            }
                            else{
                                a._paths.forEach(function(p){
                                    var newPath = p + "/" + parentId;
                                    paths.push(newPath);    
                                });    
                            }
                            
                        });
                    });    
                }
                
                callback(paths);
            });
        });
    }
    
    function buildTree(data, rootId, levels) {
        //find the root
        //find the record with root id
        if (levels == undefined || levels <1){
            levels = 10;    
        }
        this.level = 0;
        
        var root = _.findWhere(data, {"_id": rootId});
        if(root == undefined){
            root = {
                Name : "root",
                _id : rootId,
                Description : "The autocreated root node"
            }
        }
        root._childrenCount  = 0;
        root.Children        = []
        root._level          = this.level
        
        function findChildren (data, node, level){
            var children = _(data).chain()
                        .pluck('ParentIds')
                        .flatten()
                        .where(node._id);
            var children = [];
            
            data.forEach(function(d) {
                var chNode = _.indexOf(d.ParentIds, node._id);
                if(chNode >= 0){
                    d._childrenCount  = 0;
                    d.Children        = [];
                    d._level          = level;
                    children.push(d);
                }
            }, this);
            
            node.Children = children;
            level++;
            if(level < levels){
                
                node.Children.forEach(function (c) {
                    c = findChildren(data,c, level)
                })
            }
            return node;
        };
       
        var node = findChildren(data,root, ++this.level);
        return node;
    }
    
};