
var drive = require("./../googleDriveHelper.js")();
var _ = require("underscore-node");
var dbConfig        = require("./api/db.connection.js")

var Asset = require("./API.Asset.js");
var API = API || {} // Namespace

API.Transaction = function(){
    
    Asset.call(this)
}


module.exports = API.Transaction;
