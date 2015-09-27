/*
    Artifact Management module
    Deals with 
        -Manage artifacts
        
*/
var models =  require("./lib/artifact.model.js");
var config =  require("./lib/config.js");
var _hlp =  require("../utils/utils.js");
var _ = require("underscore-node");

/*
Get All users based on filer
*/
module.exports = function(dbConfig){
    
    var a =  models(dbConfig);
    var artifactModel = a.artifactModel;
    
    this.getArtifacts = function (options, callback) {
        console.log("controller  : get users");
        //
        artifactModel.find(options,function(err, users){
            if(err){
                console.error(err);
                //res.send({message:"error", error:err});
                
                return callback(err);
            }
            return callback(null, users);
            
        });
    };
    
    this.save = function (param,  cb) {
        //var isAddNew = true;
        //find the one with same external id
        if(param.ExternalId && param.ExternalId > 0)
        {
            update(param, function(e,d){
                return cb(e,d);
            });  
        }
        else{
            create(param, function(e,d){
                return cb(e,d);
                
            });
        };
    }
    
    /** 
     * chect if the attributes already  exist 
     */
    var isDuplicate =  function(data, cb){
      
      artifactModel.find(data,function(err, a){
       if(err){
           return cb(err);
       }
       if(a)
       {
            //check if the duplicate name exist and has different id
            if(data.ExternalId != a.ExternlaId)
            {
                //some other record exist with same name;
               return cb(null, true); 
            }
            else{
                return cb(null, false);    
            }
        }
        else{
            return cb(null, false);
        } 
            
       });
        
    };
    
    //Create new User
    var create = function (param, cb) {
        console.log("controller : post user");
        
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
        
        
        var a = artifactModel(data);
        a.save( function(err){
            if(err){
                console.error(err);
                return cb(err);
            }   
            console.log(a);
            return cb(null,a);
        });
    };
    
    
    /**Update the artifact
     * 
    */
    var update = function (param, cb) {
        console.log("controller : post user");
        
        var data = {}
        if(param.Id)
        data.Id=param.Id;
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
        
        var a = new artifactModel(data);
        artifactModel.findOneAndUpdate({"ExternalId":a.Id},a,{upsert: false}, function(err){
            if(err){
                console.error(err);
                return cb(err);
            }   
            console.log(a);
            return cb(null,a);
        });
    };
    
/**
 * Get the children tree on requested artifact if it a collection type artifact.
 *
 * @public
 * @param {String|Buffer} external clientId whose assets are being queried
 * @param {ref} ArtifactId whose hierarchy is to be returned
 * @param {Object} [options{levels, category}] tree parameters like number of levels to be fetched. defaults to 1, category of the artifacts to be fetched
 * @return {Function} 
 */
this.getTree = function(clientId, parentId, options, cb)
{
    
    
    
};

    
    
}//module export ends