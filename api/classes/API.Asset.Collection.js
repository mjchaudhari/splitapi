
var drive = require("./../googleDriveHelper.js")();
var _dbConfig        = require("./../db.connection.js")
var Asset        = require("./API.Asset.js");
var q =require("q");


API.Asset.task = function(){}
//Prototype
API.Asset.Collection.prototype = new Asset();
API.Asset.Collection.__proto__ = Asset.prototype;

//Properties
API.Asset.Collection.prototype.allowedTypes = [];
API.Asset.Collection.prototype.contentCount = null;
API.Asset.Collection.prototype.cumulativeContentCount = null;

/**
 * populate it self as per database. This method can be called only if the __id is set else throws error.
 */
API.Asset.Collection.prototype.build = function(){
    if(this._id == null){
        throw Error("Require _id set for building collection");
    }
    var defered = q.defer();

    return defered.promise;
};

module.exports = API.Asset;
