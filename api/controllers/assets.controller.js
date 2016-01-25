    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var mongoose = require('mongoose');
var assetModels =  require("./../models/artifact.model.js");
var userModels = require("./../models/user.model.js");
var groupCollection =  require("./../models/group.model.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");

/*
group module
*/
exports.v1 = function(dbConfig){
    
    var am =  assetModels(dbConfig);
    var assetModel = am.assetModel;
    var assetConfigModel = am.assetModel;
    var auditModel = am.auditModel;
    var grpModel = groupCollection(dbConfig).groupModel;
    
    var m =  userModels(dbConfig);
    var userModel = m.userModel;
    
    //get single user based on username
    /** Gets the assets of given group if the current user is member of this group
     * 
    */     
    this.getAssets =function(req, cb)
    {
        var u = req.user.User;         
        var q = req.query;
		var options = {
            parentId : q.parent,
		    groupId:q.groupId,
			count:100,
            latest : true
		};
        var result = {
            
        }
        //find the last user visited date time to determine which post we should be giving back
        grpModel.find({
                "_id": options.groupId,
                "Members":{$in:[]},
            })
            .populate("Members")
            .exec()
            .then(function(d){
                if(d.length == 0){
                    result = models.error("Unauthorize: Not a group member");
                    return result;    
                }
                
                return d; 
            },function (err) {
                new models.error("Unauthenticated");
            })
            //
            .then(function(d){}, function (params) {
                var lastVisited = new Date("01-01-01")
                if(d.LastVisited){
                  lastVisited = d.lastVisited;
                }
                else{
                    
                }
                var parentId = options.parentId;
                if(options.parentId == null){
                    parentId = options.groupId
                }
                
                
                
                //return assetsas per criteria
                var parentMatch = "/" + parent + "/$"
                var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
                assetModel.find(filter)
                .populate("Type")
                .exec()
                .then(function (d) {
                    //transform and then resolve the promice the data
                }, function (err) {
                    var err = new models.error("Unauthenticated");
                    //reject the Promise
                })
                
                
            })
            
            
            
        var search = {};
        
        if(u == null){
            var err = new models.error("Unauthenticated");
            return cb(err)
        }

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
                    //console.log(g);
                    assetModel.findOne({"_id" : g._id})
                    .populate("Type")
                    .exec(function(e,g){
                        return cb(setReturnAsset(g));
                    });
                });
                    
            })
            
        }
        else{
                //var a = {};
                //var dataToSave = setDocToSave(ast, a);
                
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
                        return cb(new models.error(err));
                    }
                    assetModel.findOne({"_id" : data._id})
                    .populate("Type")
                    .exec(function(e,g){
                        return cb(setReturnAsset(g));
                    });
                
                
            });
        };
        
    };
    
    var setDocToSave = function(src, target){
        
        if(target == null){
            target = {};
        }
        target.Name = src.Name;
        target.Description = src.Description;
        target.Type = src.Type;
        target.Status =src.Status;
        target.Thumbnail = src.Thumbnail;
        target.Urls = src.Urls;
        target.ActivateOn = src.ActivateOn;
        target.ExpireOn = src.ExpireOn;
        if(src.GroupId){
            target.GroupId = src.GroupId;
        }
        if(target.AuditTrail = null)
        {
            target.AuditTrail = [];
        }

        if(src.Paths){
            target.Paths = src.Paths    
        }
                    
        return target;            
    }
    var setReturnAsset = function(a){
        var as = {
            _id : a._id,
            _uid : a._uid
            ,Name : a.Name
            ,Description : a.Description
            , Thumbnails: a.Thumbnail
            , Urls : a.Urls 
            , Paths:a.Paths
            , GroupId: a.GroupId
            , ActivateOn : a.ActivateOn
            , ExpireOn : a.ExpireOn
            , AuditTrail : a.AuditTrail
            
            
        }
        return as;
    }

    
};