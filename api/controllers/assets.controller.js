    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var path = require("path");
var mongoose = require('mongoose');
var configModels =  require("./../models/config.model.js");
var assetModels =  require("./../models/artifact.model.js");
var userModels = require("./../models/user.model.js");
var groupCollection =  require("./../models/group.model.js");
var fileCtrl =  require("./file.controller.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");

/*
group module
*/
exports.v1 = function(dbConfig){
    
    //var am =  assetModels(dbConfig);
    var assetConfigModel = configModels(dbConfig).assetConfigModel;
    var assetModel = assetModels(dbConfig).assetModel;
    
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
                var lastVisited = new Date("01-01-01")
                if(d.LastVisited){
                  lastVisited = d.lastVisited;
                }
                else{
                    
                }
                var parentId = options.parentId;
                if(options.parentId == null){
                    parentId = options.groupId;
                }
                
                
                var fromDate = new Date(1,1,1);
                if(q.from)
                {
                    fromDate = new Date(q.from)
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
                }, function (err) {
                    var err = new models.error(err);
                    //reject the Promise
                    return cb(err);
                })
                
                
            });
            

    }
    
        //Create new User User
    this.save = function (req, cb) {
        console.log("controller : post artifact");
        var param = req.body;
        var currentUser = req.user.User; //req.userIsAcount and user.User is actual user profile
        //validate memebership to the group
        
        //mandatory checks
        if(param.GroupId == null){
            return cb(new models.error("group required"));
        }

        if(param.Name == null){
            return cb(new models.error("Name required"));
        }

        

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
        if(param.Thumbnail){
            if(isBase64Image(param.Thumbnail)){
                data.base64Thumbnail = param.Thumbnail;
            }else{
                data.Thumbnail= param.Thumbnail;
            }
            
        }
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
        data.UpdatedBy = currentUser;
        
        var ast = assetModel(data);
        
        if(param._id && param._id != 0)
        {
            //Update
            console.log(ast._id);
            var original = null;
            
            assetModel.findOne({"_id":ast._id})
            .then(function(a){
                original = a;
            })
            .then(function(a){
                assetConfigModel.find();
            })
            .then(function(a){
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
                
                assetModel.findOneAndUpdate({"_id":ast._id},{$set: ast},{new:true}, function(err,g){
                    if(err){
                        console.error(err);
                        return cb(new models.error(err));
                    }   
                    if(data.base64Thumbnail){
                        saveThumbnail(req, g._id, g._id,data.base64Thumbnail, function(e, thumb){
                            assetModel.findOne({"_id" : g._id})
                            .populate("AssetCategory")
                            .populate("AuditTrail.UpdatedBy")
                            .exec(function(e,g){
                                var result = setReturnAsset(g);
                                return cb(new models.success(result));
                            });
                        })
                    }
                    else
                    {
                        assetModel.findOne({"_id" : data._id})
                        .populate("AssetCategory")
                        .populate("AuditTrail.UpdatedBy")
                        .exec(function(e,g){
                            var result = setReturnAsset(g);
                            return cb(new models.success(result));
                        });
                    }
                });
                    
            })
            
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
                ast.save( function(err, d){
                    if(err){
                        console.error(err);
                        return cb(new models.error(err));
                    }
                    if(data.base64Thumbnail){
                        saveThumbnail(req, d._id, d._id,data.base64Thumbnail, function(e, thumb){
                            assetModel.findOne({"_id" : d._id})
                            .populate("AssetCategory")
                            .populate("AuditTrail.UpdatedBy")
                            .exec(function(e,g){
                                var result = setReturnAsset(g);
                                return cb(new models.success(result));
                            });
                        })
                    }
                    else
                    {
                        assetModel.findOne({"_id" : data._id})
                        .populate("AssetCategory")
                        .populate("AuditTrail.UpdatedBy")
                        .exec(function(e,g){
                            var result = setReturnAsset(g);
                            return cb(new models.success(result));
                        });
                    }
            });
        };
        
    };
    var isBase64Image = function(data){
        if(data.indexOf("data:image/png;base64,") > -1){
            return true;
        }
        return false;
    }
    var saveThumbnail = function(req, assetId, thumbName, base64Thumbnail, cb){
        fileCtrl.saveFileFromBase64(assetId,base64Thumbnail,function(err, data){
            var downloadUrl = '//' + req.headers.host + '/file/'+ path.basename(data);
            var ast = new assetModel({"_id":assetId, "Thumbnail":downloadUrl});
            assetModel.findOneAndUpdate({"_id":ast._id},{$set: ast},{new:true}, function(err,g){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                return cb(new models.success());
            });    
        });
        
    }
    var setReturnAsset = function(a){
        var as = {
            _id : a._id,
            _uid : a._uid
            ,Name : a.Name
            ,Description : a.Description
            , Thumbnail: a.Thumbnail
            , Urls : a.Urls 
            , Paths:a.Paths
            
            , GroupId: a.GroupId
            , ActivateOn : a.ActivateOn
            , ExpireOn : a.ExpireOn
            , AuditTrail : a.AuditTrail
            , AssetCategory : a.AssetCategory
            
            
            
        }
        
        CreatedBy = null;
        UpdatedBy = null;
        
        if(a.AuditTrail && Array.isArray( a.AuditTrail) ){
            //first is always created by
            a.CreatedBy = a.AuditTrail[0];
            a.UpdatedBy = _.last(a.AuditTrail);
        }
        
        return as;
    }

    
};