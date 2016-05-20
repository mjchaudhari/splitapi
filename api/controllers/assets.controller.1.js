    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var mongoose = require('mongoose');
var configModels =  require("./../models/config.model.js");
var assetModels =  require("./../models/artifact.model.js");
var userModels = require("./../models/user.model.js");
var groupCollection =  require("./../models/group.model.js");
var fileCtrl =  require("./file.controller.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");

/*
group module
*/
exports.v1 = function(dbConfig){
    
    var am =  assetModels(dbConfig);
    var assetConfigModel = configModels(dbConfig).assetConfigModel;
    var assetModel = am.assetModel;
    
    var grpModel = groupCollection(dbConfig).groupModel;
    
    var m =  userModels(dbConfig);
    var userModel = m.userModel;
    
    this.getAssetConfig = function(){
        //return assetConfigModel.find();
    }

    this.getAllAssets = function(cb){
       
        assetModel.find()
            .populate("AssetCategory")
            .exec(function(e,g){
                return cb(g);
            });//get single user based on username
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
            options.from = new Date("01-01-01")
        }
        var result = {
            
        }
        //find the last user visited date time to determine which post we should be giving back
        grpModel.find({
                "_id": options.groupId,
                //"Members":{$in:[u._id]},
            })
            .populate("Members")
            .exec()
            .then(function(d){
                if(d.length == 0){
                    result = models.error("Unauthorize: Not a group member");
                    return cb(result);    
                }
                
                return d; 
            },function (err) {
                result = new models.error("Unauthenticated");
                return cb(result);
            })
            //
            .then(function (d) {
                var lastVisited = new Date("01-01-01").toISOString()
                if(d.LastVisited){
                  lastVisited = d.lastVisited;
                }
                else{
                    
                }
                var parentId = options.parentId;
                if(options.parentId == null){
                    parentId = options.groupId;
                }
                
                
                var fromDate = new Date(1,1,1).toISOString();
                if(q.from)
                {
                    fromDate = new Date(q.from).toISOString();
                }
                
                var filter = {
                    "GroupId": options.groupId,
                    "AuditTrail.UpdatedOn" : {"$gte": fromDate}
                    //"Members":{$in:[u._id]},
                }
                
                
                //return assetsas per criteria
                //var parentMatch = "/" + parentId + "/$";
                
                //var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
                var parentMatch =  parentId ;
                //"Members" : {$in: [userId]}
                filter.Paths = {$in: [parentMatch] };
                
                
                //filter.AuditTrail = {"UpdatedOn" : {"$gte": fromDate}};
                
                // if(q.count){
                //     options.count = q.count
                // }
                
                assetModel.find(filter)
                .populate("AssetCategory")
                .populate("AuditTrail.UpdatedBy")
                .exec()
                .then(function (d) {
                    //transform and then resolve the promice the data
                    result = new models.success(d);
                    return cb(result);
                }, function (e) {
                    var err = new models.error(e);
                    //reject the Promise
                    return cb(err);
                });
            });
    }
    /** Gets the assets of given group if the current user is member of this group
     * 
    */     
    this.getAsset =function(req, cb)
    {
        var u = req.user.User;         
        
        var result = {
            
        }
        
        assetModel.findOne({"_id":req.query.id})
            .populate("AssetCategory")
            .populate("AuditTrail.UpdatedBy")
            .exec()
            .then(function (d) {
                //Check if this group is accessible for this user
                var groupId = d.GroupId;
                var p = grpModel.find({"_id":groupId,  "Members" : {$in: [u._id]}})
                    .exec()
                    .then(function(e){
                            if( e.length > 0){
                                //transform and then resolve the promice the data
                                result = new models.success(d);                
                                return cb(result);    
                            }
                            else{
                                //transform and then resolve the promice the data
                                var err = new models.error(null,"This asset is not accessible to user");     
                                return cb(result);
                            }
                            
                        },
                        function (e) {
                            var err = new models.error(e);
                            return cb(err);
                    });
                
            }, function (e) {
                var err = new models.error(e);
                //reject the Promise
                return cb(err);
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

        var data = getAssetDataFromBody(req);
        createEmptyAsset(data,currentUser,function(r){
            return cb(r);
        });
    }
        //Create new User User
    this.saveOld = function (req, cb) {
        console.log("controller : post artifact");
        //validate memebership to the group
        var currentUser = req.user.User
        //mandatory checks
        if(req.body.GroupId == null){
            return cb(new models.error("group required"));
        }

        if(req.body.Name == null){
            return cb(new models.error("Name required"));
        }

        var data = buildAssetModel(req.body);
        if(req.body.Thumbnail && _hlp.isBase64Image(req.body.Thumbnail)){
            var base64Thumbnail = req.body.Thumbnail;
            fileCtrl.saveFileFromBase64(null, base64Thumbnail, function(err, file){
                var fileUrl = "//" + req.headers.host +'/file/'+  path.basename(file);
                data.Thumbnail = fileUrl;
                saveAssetData(data,currentUser, function(d){
                    return cb(d);
                })
            });
        }
        else{
            saveAssetData(data,currentUser, function(d){
                    return cb(d);
            });
        }
        
        
    };
    this.save = function (req, cb) {
        console.log("controller : post artifact");
        //validate memebership to the group
        var currentUser = req.user.User
        //mandatory checks
        if(req.body.GroupId == null){
            return cb(new models.error("group required"));
        }

        if(req.body.Name == null){
            return cb(new models.error("Name required"));
        }

        var model = buildAssetModel(req.body);
        
        model.save( function(d){
            return cb(d);
        });
        
        
        
    };
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
    
    var createEmptyAsset = function(ast, currentUser, callback){
        
        //var ast = assetModel(data);
        var audit = {
                    AssetId : ast._id,
                    Action: "Create",
                    UpdatedBy : currentUser,
                    UpdatedOn : new Date(),
                    Description : "",
                    Notify : true,
                }
                if(ast.auditTrail == null){
                    ast.AuditTrail = [];    
                }
        ast.AuditTrail = [audit];
        ast.save( function(err, data){
            if(err){
                console.error(err);
                return callback(new models.error(err));
            }
            
            assetModel.findOne({"_id" : data._id})
            .populate("AssetCategory")
            .populate("AuditTrail.UpdatedBy")
            .exec(function(e,g){
                var result = setReturnAsset(g);
                return callback(new models.success(result));
            });
        });
    }
    var saveAssetData = function(ast, currentUser, callback){
        //var ast = assetModel(data);
        
        if(ast._id && ast._id != 0)
        {
            //Update
            console.log(ast._id);
            
            //var ast = setDocToSave(data, ast);
            var audit = {
                AssetId : ast._id,
                Action: "Update",
                UpdatedBy : currentUser,
                UpdatedOn : new Date(),
                Description : "",
                Notify : true,
            }
            if(ast.auditTrail == null){
                ast.AuditTrail = [];    
            }
            ast.AuditTrail.push(audit);
            
            ast.findOneAndUpdate({"_id":ast._id},{$set: ast},{new:true}, function(err,g){
                if(err){
                    console.error(err);
                    return callback(new models.error(err));
                }   
                //console.log(g);
                assetModel.findOne({"_id" : g._id})
                .populate("AssetCategory")
                .populate("AuditTrail.UpdatedBy")
                .exec(function(e,g){
                    var result = setReturnAsset(g);
                    return callback(new models.success(result));
                });
            });
            
        }
        else{
                //var a = {};
                //var dataToSave = setDocToSave(ast, a);
                //determine path based on parent
                //if there is parent then find the path of parent and add
                //parentId in path to make path for this asset
                var audit = {
                    AssetId : ast._id,
                    Action: "Created",
                    UpdatedBy : currentUser,
                    UpdatedOn : new Date(),
                    Description : "",
                    Notify : true,
                }
                
                ast.AuditTrail = [audit];
                ast.save( function(err, data){
                    if(err){
                        console.error(err);
                        return callback(new models.error(err));
                    }
                    
                    assetModel.findOne({"_id" : data._id})
                    .populate("AssetCategory")
                    .populate("AuditTrail.UpdatedBy")
                    .exec(function(e,g){
                        var result = setReturnAsset(g);
                        return callback(new models.success(result));
                    });
            });
        };
    }
    var setReturnAsset = function(a){
        var as = {
            _id : a._id
            , _uid : a._uid
            , Name : a.Name
            , Description : a.Description
            , Thumbnail: a.Thumbnail
            , Urls : a.Urls 
            , Paths:a.Paths
            , AllowComment:a.AllowComment
            , AllowLike : a.AllowLike
            , GroupId: a.GroupId
            , ActivateOn : a.ActivateOn
            , ExpireOn : a.ExpireOn
            , AuditTrail : a.AuditTrail
            , AssetCategory : a.AssetCategory
            , Publish : a.Publish
        }
        
        as.CreatedBy = null;
        as.UpdatedBy = null;
        
        if(a.AuditTrail && Array.isArray( a.AuditTrail) ){
            //first is always created by
            as.CreatedBy = a.AuditTrail[0];
            as.UpdatedBy = a.AuditTrail[a.AuditTrail.length - 1];
        }
        
        return as;
    }
    
    function buildAssetModel(data, assetType) {
        var a = {}
        if(data._id != undefined){
            a._id           = data._id;
            a._uid          = data._uid ? "" : a._id;    
        }
        if(data.TopicId ){
            a.TopicId = param.TopicId
        }
        else{
            a.TopicId = data.GroupId
        }
        a.GroupId       = data.GroupId;
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
        a.AssetType     = data.AssetType;
        a.AssetCategory = data.AssetCategory;
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
        
        var model = null;
        
        switch (data.AssetType.Name) {
            case "type_collection":
            {
                a.AllowComment  = false;
                a.AllowLike     = false;
                model = new am.collectionModel(a);
                break;
            }
            case "type_document":
            {
                model = am.documentModel(a);
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
                
                model =  am.calendarModel(a);
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
                
                model =  am.taskModel(a);
                break;
            }
            case "type_demand":
            {
                model =  am.demandModel(a);
                break;
            }
            case "type_transaction":
            {
                model =  am.transactionModel(a);
                break;
            }
            case "type_form":
            {
                model =  am.formModel(a);
                break;
            }
            
            default:{
                
                model = new am.documentModel(a);
            }
                break;
        }
        
        return model;
    }
    
};