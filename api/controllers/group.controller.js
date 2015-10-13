    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var groupCollection =  require("./../models/group.model.js");
var userModels = require("./../models/user.model.js");
var _hlp =  require("../utils.js");
var _ = require("underscore-node");
var async = require ("async");

/*
group module
*/
exports.v1 = function(dbConfig){
    
    var g =  groupCollection(dbConfig);
    var groupModel = g.groupModel;
    var m =  userModels(dbConfig);
    var userModel = m.userModel;
    
    //get single user based on username     
    this.getGroups =function(req, cb)
    {
        var u = req.user;
        var q = req.query;
		var options = {
			id:q.id,
			name:q.name,
			status:q.status
		};

        var search = {};
        if(u == null){
            var err = new models.error("Unauthenticated");
            cb(err)
        }

        if(options.id > 0)
        {
            search.ExternalId = options.id;
        }
        if(options.name && options.name.length > 0)
        {
            search.Name = options.name;
        }
        //TODO
        //search.Members = [{"_id" : u._id}];
        groupModel.find(search)
        .populate("CreatedBy")
        .populate("Members")
        .exec(function(e,g){
            if(e)
            {
                return cb(new models.error(e));
            }
            return cb(new models.success(g));
            
        });
        
    };
    
    //Create new User User
    this.save = function (req, cb) {
        console.log("controller : post artifact");
        var param = req.body;
    
        var data = {}
        if(param.ExternalId)
            data.ExternalId = param.ExternalId;
        if(param.Name)
            data.Name=param.Name;
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
            data.GroupType= param.GroupType;
        
        
        data.UpdatedBy = req.user
        data.UpdatedOn  = new Date();
        if(param.ClientId)
            data.ClientId = param.ClientId;
        
        var grp = groupModel(data);
        if(param.ExternalId && param.ExternalId > 0)
        {
            console.log(grp.ExternalId);
            groupModel.findOneAndUpdate({"ExternalId":data.ExternalId},{$set: data},{new:false}, function(err,g){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                //console.log(g);
                return cb(setReturnGroup(g));
            });
            
        }
        else{
            grp.CreatedBy = req.user;
            grp.save( function(err){
                if(err){
                    console.error(err);
                    
                    return cb(new models.error(err));
                }   
                //console.log(grp);
                groupModel.findOne({ExternalId:param.groupId})
                .populate("Members")
                .exec(function(e,g){
                    return cb(setReturnGroup(g))
                });
                
                
            });
        };
        
    };
    /***
     * Add emeber if not already exist
     */
    this.addMembers = function (req, cb) {
        console.log("controller : add members");
        var param = req.body;
    
        var data = {};
        if(!param.groupId)
            return cb(new models.error("GroupId is not provided" ));
        
        if(!param.members)
            return cb(new models.error("Member ids (single or csv ) is not provided" ));
        
        var usersArray = param.members.split(',');
        
        userModel.find({ "Id" : {$in: usersArray} } )
        .exec(function(e, lst){
            if(e){
                return cb(new models.error(e));
            }
            
            groupModel.findOne({ExternalId:param.groupId} )
            .populate("Members")
            .exec(function(e,g){
                if(e){
                    return cb(new models.error(e));
                }
                if(g == null){
                    return cb(new models.error("Group not found"));
                }
                var membersToAdd=[];
                for (var index = 0; index < lst.length; index++) {
                        var element = lst[index];
                        if(element == null)
                        {
                            continue;
                        }
                        var m = _.find(g.Members, function(item) {
                            return item._id.equals(element._id);
                        }); 
                        if(!m){
                            membersToAdd.push(element);
                        }
                    }
                    for (var index = 0; index < membersToAdd.length; index++) {
                        g.Members.push(membersToAdd[index]._id);
                    }
                
                //Update now
                groupModel.findOneAndUpdate({"ExternalId":g.ExternalId},{$set: g},{new:false}, function(err,grp){
                    if(err){
                        console.error(err);
                        return cb(new models.error(err));
                    }   
                    groupModel.findOne({ExternalId:param.groupId})
                    .populate("Members")
                    .exec(function(e,g){
                        return cb(setReturnGroup(g))
                    });
                    
                });
            });
        });
        
            
    };
    this.removeMembers = function (req, cb) {
        
        console.log("controller : add members");
        var param = req.body;
    
        var data = {};
        if(!param.groupId)
            return cb(new models.error("GroupId is not provided" ));
        
        if(!param.members)
            return cb(new models.error("Member ids (single or csv ) is not provided" ));
        
        var usersArray = param.members.split(',');
        var callbackParam={};
        //Parallel stack to fetch the users to be removed and the group in context
        var parallelStack = {}
        parallelStack.usersToRemove = function(cb){
            //get all users
            userModel.find(
                { "Id" : {$in: usersArray} }, 
                function(e, lst){
                    if(e){
                         cb(e);
                    }
                   //callbackParam.users = lst; 
                    cb(null,lst);
                });                           
            }
        parallelStack.theGroup =   function(cb){
            //get group
            groupModel
            .findOne({ExternalId:param.groupId})
            .populate("Members")
            .exec(function(e,g){
                if(e){
                    cb(e);
                }
                if(g == null){
                    
                    cb(null, "Group not found");
                }
                //callbackParam.group = g;
                cb(null, g);
            });
            
        }
        
        async.parallel(parallelStack,function(err, result){
            //here we have group and the users object
            if(err){
                return cb(new models.error(err));
            }
            
            //Check if the users 
            result.usersToRemove.forEach(function(u){
                var idx = -1;
                for (var i = 0;i < result.theGroup.Members.length; i++){
                    if(result.theGroup.Members[i]._id.equals(u._id)){
                        idx = i;
                    }
                    
                }; 
                if(idx >= 0)
                {
                     result.theGroup.Members.splice(idx,1)
                }
            });
            //Update the group now
            groupModel.findOneAndUpdate({"ExternalId":result.theGroup.ExternalId},{$set: result.theGroup},{new:false}, function(err,grp){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                
                groupModel.findOne({ExternalId:param.groupId})
                .populate("Members")
                .exec(function(e,g){
                    return cb(setReturnGroup(g))
                });
            });
        });
        
    }
    var setReturnGroup = function(g){
        var retVal = {
                ExternalId : g.ExternalId,
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
