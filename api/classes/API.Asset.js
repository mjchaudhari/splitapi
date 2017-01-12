
var drive = require("./../googleDriveHelper.js")();
var _dbConfig        = require("./../db.connection.js")

var API = API || {} // Namespace
API.Asset = function(){}
    
//Properties
API.Asset.prototype._id           =null;
API.Asset.prototype.name          = null;
API.Asset.prototype.description   = null;
API.Asset.prototype.locale        = null;
API.Asset.prototype.publish       = null;
API.Asset.prototype.allowComment  = null;
API.Asset.prototype.allowLike     = null;
API.Asset.prototype.allowLike     = null;
API.Asset.prototype.status        = null;
API.Asset.prototype.thumbnail     = null;
API.Asset.prototype.urls          = null;
API.Asset.prototype.moderators    = null;
API.Asset.prototype.activateOn    = null;
API.Asset.prototype.expireOn      = null;
API.Asset.prototype.alloudTypes   = null;
API.Asset.prototype.updatedOn     = new Date();
API.Asset.prototype.updatedById   = null;
API.Asset.prototype.assetTypeId   = null;
API.Asset.prototype.assetCategoryId =null;
API.Asset.prototype.createdOn       =null;
API.Asset.prototype.createBy        = null;
API.Asset.prototype.accessibility        = null;
API.Asset.prototype.auditTrail        = null;
API.Asset.prototype.fileDetails        = [];

module.exports = API.Asset;
