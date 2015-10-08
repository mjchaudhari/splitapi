    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var groupCollection =  require("./../models/group.model.js");

var _hlp =  require("../utils.js");
var _ = require("underscore-node");

/*
group module
*/
exports.v1 = function(dbConfig){
    
    var g =  groupCollection(dbConfig);
    var groupModel = g.groupModel;
    
    
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
            search = {"ExternalId":options.id};
        }
        if(options.name && options.name.length > 0)
        {
            search = {"Name":options.name};
        }
        if(options.name && options.name.length > 0)
        {
            search = {"Name":options.name};
        }
        //TODO
        //search.Members = [{"_id" : u._id}];
        groupModel.find(search, function(e,g){
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
        if(param.CreatedBy)
            data.CreatedBy = param.CreatedBy;
        if(param.UpdatedBy)
            data.UpdatedBy = param.UpdatedBy;
            data.UpdatedOn  = new Date();
        if(param.ClientId)
            data.ClientId = param.ClientId;
        
        var grp = groupModel(data);
        if(param.ExternalId && param.ExternalId > 0)
        {
            console.log(grp.ExternalId);
            groupModel.update({"ExternalId":data.ExternalId},data,{}, function(err,g){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                log.debug(g);
                return cb(setReturnGroup(g));
            });
            
        }
        else{
            
            grp.save( function(err){
                if(err){
                    console.error(err);
                    
                    return cb(new models.error(err));
                }   
                console.log(grp);
                return cb(setReturnGroup(g));
                
            });
        };
        
    };
    
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
