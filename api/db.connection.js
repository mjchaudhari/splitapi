var mongoose = require("mongoose");
var mongodb = require('mongodb');

//mongoURI = 'mongodb://127.0.0.1:27017/easyapp';
var mongoURI = 'mongodb://admin:admin@ds050077.mongolab.com:50077/easyapp';

module.exports = {
    mongoURI : mongoURI,
    mongodbClient:mongodb.MongoClient
};
    
