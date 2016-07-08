var _dir = process.cwd();
var models = require("./../response.models.js").models;
var shortId     =require("shortid");
var dbConfig =  require("../db.connection.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");
var path = require("path");
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;
var drive = require("./../googleDriveHelper.js")();
var fileCtrl =  require("./file.controller.js");

/*
group module
*/
exports.v1 = function(){
    
    //get single user based on username
    var checkGroupMembership = function(groupId, userId, cb){
        mongo.connect(dbConfig.mongoURI,function(err, db){
            db.collection("groups")
            .findOne({"_id":groupId, "Members" : {$in: [userId]}}, function (e, g) {
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
    
    this.getMembers = function(groupId, cb){
        mongo.connect(dbConfig.mongoURI,function(err, db){
            db.collection("groups")
            .findOne({"_id":groupId}, function (e, g) {
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
                        return cb(new models.success(data));
                    };
                });
            });
        });
    
    }
    
    this.getGroups =function(req, cb)
    {
        var u = req.user.User; //req.userIsAcount and user.User is actual user profile
        
        var q = req.query;
		var options = {
			_id:q._id,
			name:q.name,
			status:q.status
		};

        var search = {};
        if(u == null){
            var err = new models.error("Unauthenticated");
            return cb(err)
        }

        if(options._id && options._id != 0)
        {
            search._id = options._id;
        }
        if(options.name && options.name.length > 0)
        {
            search.Name = options.name;
        }
        //TODO
        //search.Members = {$in : [new mongoose.Types.ObjectId(u._id)]};
        //search.Members = {$in : [ u._id]};
        mongo.connect(dbConfig.mongoURI,function(err, db){
            db.collection("groups")
            .find({"Members" : {$in: [u._id]}}).toArray(function (e, g) {
                if(e)
                {
                    db.close();
                    return cb(new models.error(e));
                }
                var result = [];
                async.eachSeries(g, function(g, callback){
                    //{"_id":  {$in: ["VJvggm7ug","VJ0esDQ_e","41yeBrY_l","NJ6PJdKFe","EyfRUZB5x"]} }
                    var members = g.Members;
                    mongo.connect(dbConfig.mongoURI, function(e, conn){
                        conn.collection("profiles")
                        .find({"_id" : {$in: members}}).toArray(function (e, members) {
                            if(e){
                                conn.close();
                                return callback();
                            }
                            else{
                                g.Members=members;
                                result.push(g);
                                conn.close();
                                return callback();
                            }
                        });
                    });
                        
                }, function () {    
                    db.close();
                    return cb(new models.success(result));
                });
                
            });
        });
    };
    
    //Create or update the group
    this.save = function (req, cb) {
        console.log("controller : post artifact");
        var param = req.body;
        var currentUser = req.user.User; //req.userIsAcount and user.User is actual user profile
        
        var data = {}
        
        if(param._id){
            data._id = param._id;
        }
        else {
            data._id = shortId.generate();
            data.CreatedBy = currentUser._id;
        }
        
        if(param.Name){
            data.Name=param.Name;
        }
        
            
        if(param.Description)
            data.Description= param.Description;
        if(param.Locale)
            data.Locale = param.Locale;
        if(param.Status)
            data.Status = param.Status;
        if(param.Thumbnail)
            data.Thumbnail= param.Thumbnail;
        if(param.Url)
            data.Url= param.Url;
        if(param.GroupType)
            data.GroupType = param.GroupType;
        if(param.Members){
            data.Members = [];
            data.Members = _.pluck(param.Members, "_id");
        }
        data.UpdatedBy = currentUser._id;
        data.UpdatedOn  = new Date();
        if(param.ClientId)
            data.ClientId = param.ClientId;
        
        if(data.Thumbnail && _hlp.isBase64Image(req.body.Thumbnail)){
            var base64Thumbnail = req.body.Thumbnail;
            fileCtrl.saveFileFromBase64(null, base64Thumbnail, function(err, file){
                var fileUrl = "//" + req.headers.host +'/file/'+  path.basename(file);
                data.Thumbnail = fileUrl;
                saveGroupData(data, function(e,d){
                    if(e){
                        return cb(new models.error("internal error", "Error while saving group"));
                    }
                    return cb(d.value);
                });
            });
        }else{
            saveGroupData(data, function(e, d){
                if(e){
                        return cb(new models.error("internal error", "Error while saving group"));
                    }
                    return cb(d);
            });
        }
    };
    
    /***
     * Add emeber if not already exist
     */
    this.addMembers = function (req, cb) {
        console.log("controller : add members");
        var param = req.body;
        var currentUser = req.user.User; //req.userIsAcount and user.User is actual user profile
        var data = {};
        if(!param.groupId)
            return cb(new models.error("GroupId is not provided" ));
        
        var groupId = param.groupId;
        
        if(!param.members)
            return cb(new models.error("Member ids (single or csv ) is not provided" ));
        var usersArray = [];
        if(_.isArray(param.members)){
            usersArray = param.members;
        }
        else
        {
            usersArray = param.members.split(',');
        }
        
        checkGroupMembership(groupId, currentUser._id, function(e, data){
            if(e){
                return cb(new models.error("Unauthorized", "No permission to add members"));
            }
            
            mongodb.connect(dbConfig.mongoURI, function(e, db){
                db.collection("groups").findOne({"_id":groupId}, function (e, g) {
                    if(e){
                        db.close();
                        return cb(new models.error("Internla error"));         
                    }
                    var membersToAdd=[];
                    usersArray.forEach(function (u) {
                        var m = _.find(g.Members, function(item) {
                            return item == u;
                        }); 
                        if(!m){
                            membersToAdd.push(u);
                        }
                    })
                        
                    for (var index = 0; index < membersToAdd.length; index++) {
                        g.Members.push(membersToAdd[index]._id);
                    }
                    
                    db.collection("groups").findOneAndUpdate({"_id":groupId}, {$set:{Members:g.Members}},
                    function (e,data) {
                        if(e){
                            db.close();
                            return cb(new models.error("Internla error"));         
                        }
                        return cb(new models.success(data.value));
                    });
                });
            });    
        });
            
    };
    this.removeMembers = function (req, cb) {
        console.log("controller : add members");
        var param = req.body;
        var currentUser = req.user.User; //req.userIsAcount and user.User is actual user profile
        var data = {};
        if(!param.groupId)
            return cb(new models.error("GroupId is not provided" ));
        
        var groupId = param.groupId;
        
        if(!param.members)
            return cb(new models.error("Member ids (single or csv ) is not provided" ));
        var usersArray = [];
        if(_.isArray(param.members)){
            usersArray = param.members;
        }
        else
        {
            usersArray = param.members.split(',');
        }
        
        checkGroupMembership(groupId, currentUser._id, function(e, data){
            if(e){
                return cb(new models.error("Unauthorized", "No permission to add members"));
            }
            
            mongodb.connect(dbConfig.mongoURI, function(e, db){
                db.collection("groups").findOne({"_id":groupId}, function (e, g) {
                    if(e){
                        db.close();
                        return cb(new models.error("Internla error"));         
                    }
                    var membersToRemove=[];
                    usersArray.forEach(function (u) {
                        var m = _.find(g.Members, function(item) {
                            return item == u;
                        }); 
                        if(m){
                            membersToRemove.push(u);
                        }
                    })
                    
                    for (var index = 0; index < membersToRemove.length; index++) {
                        var index = _.indexOf(g.Members, membersToRemove[index]);
                        g.Members.splice(index-1,1);
                    }
                    
                    db.collection("groups").findOneAndUpdate({"_id":groupId}, {$set:{Members:g.Members}},
                    function (e,data) {
                        if(e){
                            db.close();
                            return cb(new models.error("Internla error"));         
                        }
                        return cb(new models.success(data.value));
                    });
                });
            });    
        });
    }
    
    var saveGroupData = function(data, cb ){
        mongodb.connect(dbConfig.mongoURI,function(err, db){
            
            db.collection("groups").findOneAndUpdate({"_id":data._id},{$set: data}, {"upsert":true, "forceServerObjectId":false, "returnOriginal":false}, function (err, data) {
                
                if(err){
                    return cb(err)
                }

                var gdata  = data.value;

                if(gdata._fileStorage == null){
                    drive.createFolder(gdata._id, gdata.Name, null, function(err, resp){
                        if(err){
                            console.error(err);
                            return cb(null,gdata);
                        }
                        
                        db.collection("groups").findOneAndUpdate({"_id":gdata._id},{$set: {"fileStorage" : resp.id}}, null, function (err, data) {
                            //gdata._fileStorage = resp.id;
                            return cb(null,gdata);
                        });
                    });
                }
                else{
                    return cb(err,data.value);
                }
            });
        });
    }
    
    var setReturnGroup = function(g){
        var retVal = {
                _id : g._id,
                Name:g.Name,
                Description: g.Description,
                Locale : g.Locale,
                Status : g.Status,
                Thumbnail : g.Thumbnail,
                Members : g.Members,
                Url : g.Url,
                GroupType : g.GroupType,
                CreatedBy : g.CreatedBy,
                UpdatedBy : g.UpdatedBy,
                UpdatedOn  : g.UpdatedOn,
            }

            return retVal;
    }
    
}
