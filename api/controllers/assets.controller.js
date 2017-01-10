var models = require("./../response.models.js").models;
var shortId     =require("shortid");
var mongo =  require("../db.connection.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");
var fileCtrl = require("./../file.handler.js");
var drive = require("./../googleDriveHelper.js")();

var Group = require("./../classes/API.Group.js");

var fs = require('fs-extra'); 
;
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
        var u = req.user;         
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
        
        var group = new Group({_id : options.g});
        group.getAssets( options, function(err, data){
            if(err){
                return cb(new models.error(err));
            }
            return cb(new models.success(data));
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
                    "groupId": options.groupId,
                    "auditTrail.updatedOn" : {"$gte": options.from},
                }
                if(options.structure_only){
                    filter.assetTypeId = "type_collection"
                }
                
                //return assetsas per criteria
                //var parentMatch = "/" + parentId + "/$";
                //var filter = {'Path': {'$regex': '/' + parentMatch + '/'}};
                //{Paths: {$in : [/V1WC-H7_e/,/V1WC-H7_e$/,]}}
                //filter.Accessibility = {$or : [{"CreateBy":u._id}, {"Accessibility" : {$or : [ null, [{ $in: [u._id] }]]}}]} ;
                var accessibilityExpr = {"$or": [
                    {"createBy":u._id}, 
                    {"accessibility" : null}, {"accessibility" : { $in: [u._id] }}]};
                var pathsExpr = {"$or" : [
                    {"_id" : parentId}, 
                    { "_paths" : {$in : [new RegExp('/' + parentId + '/'), new RegExp('/' + parentId + '$')]}}
                ]};
                
                filter["$and"] = [accessibilityExpr, pathsExpr ];
                
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
        
            mongo.connect( ).then(function(db){
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
        var currentUser = req.user
        //mandatory checks
        if(req.body.groupId == null){
            return cb(new models.error("group required"));
        }
        if(req.body.name == null){
            return cb(new models.error("Name required"));
        }
        var f = req.files ;
        if(f){
            var urls = []
            f.forEach(function(file){
                var newPath = path.join(file.destination,file.originalname);
                var fn = fs.renameSync(file.path, newPath)
                file.path = newPath;
                urls.push( '//' + req.headers.host + '/file/'+f.originalname);

            });
            //set the local url of the uploaded file
            req.body.Urls = urls
        }
        //find group folder
        mongo.connect( ).then(function(db){
            db.collection("groups").findOne({"_id":req.body.groupId}, function(err, group){
    
                var f = req.files ;
                if(f){
                    var urls = []
                    f.forEach(function(file){
                        var newPath = path.join(file.destination,file.originalname);
                        var fn = fs.renameSync(file.path, newPath)
                        file.path = newPath;
                        urls.push( '//' + req.headers.host + '/file/'+f.originalname);

                    });
                    //set the local url of the uploaded file
                    req.body.Urls = urls
                }

                var data = buildAssetModel(req.body, currentUser);
                determinePath(data.ParentIds, function (paths) {
                    data._paths = paths;
                    db.collection('assets').update({"_id" : data._id},{$set:data},{"forceServerObjectId":false, "upsert":true,  "fullResult":true},function(e, r){
                        if(e){return models.error(e);}
                        
                        if(r == null){
                            return cb(new models.error("Record not saved"));
                        }
                        if(r.result.ok == 0){
                            return cb(new models.error("Record not saved"));
                        }
                        if(f instanceof Array && f.length >=0){
                            console.info("savng file(s) to drive");
                            uploadAssetFileToDrive(data._id,group._fileStorage,f,function(err, result){
                                if(e){
                                    return cb(e);    
                                }
                                getFullAsset(data._id, function(e, result){
                                    return cb(e,result);    
                                });
                            });
                        }
                        else{
                            getFullAsset(data._id, function(e, result){
                                return cb(e, result);    
                            });
                        }
                    });
                });
            });
        });
    }
    
    var uploadAssetFileToDrive = function(assetId,folderId, files, callback){
        var fileInfo = [];
        var urls = [];
        async.each(files,
            function(f, callback){
                //upload this file
                drive.createFile(f.path,'Asset file',folderId,function(err, data){
                    //update url to asset
                    if(err){
                        console.log("Create file failed")
                        return callback(err);
                    }
                    fileInfo.push({
                            fileId:data.id, 
                            iconLink : data.iconLink, 
                            thumbnailLink: data.thumbnailLink, 
                            webViewLink:data.webViewLink, 
                            parents : data.parents,
                            webContentLink:data.webContentLink}); 
                     
                    urls.push(data.webViewLink);
                    return callback(null, "file created");
                });
            }, 
            function(err, res){
                if(err){
                    console.error(err)
                    return callback(err);
                }
                mongo.connect( ).then(function(db){
                    var dataToSave = {
                        "Files":fileInfo, 
                        "Urls":urls
                    }; 
                    db.collection('assets').update({"_id" : assetId},{$set:dataToSave},{"forceServerObjectId":false, "upsert":true,  "fullResult":true},function(e, r){
                            return callback(err, r);                            
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
            var ast = new assetModel({"_id":assetId, "thumbnail":fileUrl});
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
    /**
     * get fully populated assets of given id
     */
    var getFullAsset = function (id, callback){
        mongo.connect( ).then(function(db){
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
                        db.collection("configs").findOne({"_id":result.assetTypeId}, function(err, group){
                            cb(null, group);
                        });
                    },
                    group: function(cb){
                        db.collection("groups").findOne({"_id":result.groupId}, function(err, group){
                            cb(null, group);
                        });
                    },
                    updatedBy: function(cb){
                        db.collection("profiles").findOne({"_id":result.updatedById}, function(err, updatedBy){
                            cb(null, updatedBy);
                        });
                    },
                    accessibility: function(cb){
                        var profileIds = result.accessibility == null ? [] : result.accessibility;
                        db.collection("profiles").find({"_id":{$in: profileIds}}).toArray(function(err, accessibility){
                            cb(null, accessibility);
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
                                        "assetTypeId" : p.pssetTypeId,
                                        "name" : p.name,
                                        "parentIds" : p.parentIds,
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
                    retAsset.assetType = results.assetType;
                    retAsset.group = results.group;
                    retAsset.updatedBy = results.updatedBy;
                    retAsset.parents = results.parents;
                    retAsset.accessibility =results.accessibility;
                    switch (retAsset.assetTypeId) {
                        case "type_task":
                            populateTask(retAsset, function(err, ast){
                                return callback(err, ast);    
                            })
                            break;
                        default:
                            return callback(err, retAsset);
                    }
                    
                });
            });
        });
    }
    /**
     * DEtermine the path for given parentId.
     */
    function determinePath(parentIds, callback){
        var parentIds = parentIds;
        mongo.connect( ).then(function(db){
            db.collection("assets").find({"_id":{$in: parentIds }}).toArray(function(err, data){
                var result = data;
                if(err){
                    return callback(err,result);
                }
                
                var paths = [];
                if(result == null || (_.isArray(result) && result.length == 0)){
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
                Description : "The autocreated root node",
                
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
                    if(d._parents == undefined){
                        d._parents = [];
                    }            
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
    
    /**
     * Populate Task related data
     */
    function populateTask (asset, callback){
        //populate owners and updated by
        //populate other referenced documents parallelly
        async.parallel({
            
            owners: function(cb){
                var profileIds = asset.task != null && asset.task.owners != null ?  asset.task.owners : [] ;
                mongo.connect( ).then(function(db){
                    db.collection("profiles").find({"_id":{$in: profileIds}}).toArray(function(err, owners){
                        db.close();
                        cb(null, owners);
                    });
                });
            },
        },
        function(err, results) {
            asset.task.owners = results.owners;
            return callback(err, asset);
        });
    }

};