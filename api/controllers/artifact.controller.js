    var models = require("./../response.models.js").models;
var uuid = require("node-uuid");
var artifactModels =  require("./../models/artifact.model.js");

var _hlp =  require("../utils.js");
var _ = require("underscore-node");

/*
Artifact module
*/
exports.v1 = function(dbConfig){
    
    var a =  artifactModels(dbConfig);
    var artifactModel = a.artifactModel;
    
    //get single user based on username     
    this.getArtifact =function(req, cb)
    {
        
        artifactModel.find(r.body, function   (e, data)
        {
            if(e != null)
            {
                return cb(new models.error(e));
            }
            return cb(new models.success(data));
        });
        
    };
    /***
     * Get the root folder for current client
     */
    this.getRootAsset = function(){
        var clientId = 1;
        artifactModel.findOne({"Account.ExternalId":clientId,"Path":"/"},function(e,a){
            if(e)
            {
                return cb(new models.error(e));
            }
            var asset = models.asset();
            return asset.parse(a);
        });
    }
    //get single user based on username     
    this.getTree =function(req, cb)
    {
        var q = req.query;
		var options = {
			id:q.id,
			depth:q.depth,
			structureonly:q.structureonly,
			
		}
        
        //var options = {parentId:req.params.username};
        
        var clientId = 1;
        var parentId = options.id;
        
        if(clientId == null)
        {
            var msg =  "clientId not specified";
            return cb(new models.error(msg));
        }
        
        if(parentId == null)
        {
            var msg = "artifactId not specified";
            return cb(new models.error(msg));
        }
        
        var root = null;
        var search = {};
        if(parentId > 0)
        {
            search = {"ExternalId":parentId};
        }
        else{
            //search = {"Account.ExternalId":clientId,"Path":"/"};
            search = {"Path":"/"};
        }
        
        artifactModel.findOne(search, function(e,a){
            if(e)
            {
                return cb(new models.error(e));
            }
            var r =  models.asset();
            root = r.parse(a);
            root._level = 0;
            
            //var pathPattern = "/[" + artifactId + "]*/";"\/[d]*\/[,]|\/[d]*\/$"
            //find all items of which this parent is ancester
            var parentPattern = _hlp.regex.ancesterPattern(parentId);
            var regex = new RegExp(parentPattern, 'i');
            artifactModel.find({"Path":{$in: [regex]}}, function(e, artifacts){
                if(e)
                {
                    return cb(new models.error(e));
                }
                
                var buildTree = function (node, allItems){
                    //if c is not a collection then skip
                    if(!node.IsCollection)
                    {
                        return;
                    }
                    var pattern = _hlp.regex.parentPattern(node.ExternalId);
                    //find the items who are child of this item
                    var children = [];
                    for (var idx = 0; idx < allItems.length; idx++) {
                        var i = allItems[idx];
                       
                        if(! i.Path) {
                            continue;
                        } 
                        
                        i.Path.forEach(function(p)
                        {
                            var matched = p.match(pattern)
                            if(matched){
                                children.push(i);
                            }    
                        });
                    }
                    
                    
                    if(children.length > 0)
                    {
                        if ( node.Children == undefined) {
                            node.Children = [];
                        }   
                        
                       children.forEach(function(child){
                           var r =  models.asset();
                           var asset = r.parse(child);
                           asset._level = node._level + 1;
                           //if require to fetch only structure then exclude assets which are not collections
                           if(options && options.structureonly)
                           {
                               if(!asset.IsCollection){
                                    return;    
                               }
                           }
                           
                           node.Children.push(asset);
                           buildTree(asset, allItems);
                       }); 
                       
                    }
                    else{return ;}
                }; //build tree ends
                
                //build tree
                
                buildTree(root, artifacts);
                return cb(new models.success(root));
                
            });
            
        });
        
    };
    
    
    
    
    //Create new User User
    this.save = function (req, cb) {
        console.log("controller : post artifact");
        var param = req.body;
    
        var data = {}
        
        if(param.Name)
            data.Name=param.Name;
        if(param.Name)
            data.Description= param.Name;
        if(param.Locale)
            data.Locale = param.Locale;
        if(param.Version)
            data.Version = param.Version;
        if(param.Status)
            data.Status = param.Status;
        if(param.IsCollection)
            data.IsCollection= param.IsCollection;
        
        if(param.Path)
            data.Path = param.Path;
        
        if(param.Thumbnail)
            data.Thumbnail= param.Thumbnail;
        if(param.Url)
            data.Url= param.Url;
        if(param.ArtifactType)
            data.ArtifactType= param.ArtifactType;
        if(param.CreatedBy)
            data.CreatedBy = param.CreatedBy;
        if(param.UpdatedBy)
            data.UpdatedBy = param.UpdatedBy;
            data.UpdatedOn  = new Date();
        if(param.ClientId)
            data.ClientId = param.ClientId;
        
        
        if(param.ExternalId && param.ExternalId > 0)
        {
            var a = artifactModel(data);
            artifactModel.findOneAndUpdate({"ExternalId":a.Id},a,{upsert: false}, function(err){
                if(err){
                    console.error(err);
                    return cb(new models.error(err));
                }   
                console.log(a);
                return cb(new models.success(a));
            });
        }
        else{
            a.save( function(err){
                if(err){
                    console.error(err);
                    
                    return cb(new models.error(err));
                }   
                console.log(a);
                
                return cb(new models.success(a));
            });
        };
          
    };
    
}
