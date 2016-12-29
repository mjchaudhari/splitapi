
var mongodb = require('mongodb');
var q = require('q');
mongoURI = 'mongodb://127.0.0.1:27017/easyapp';
//var mongoURI = 'mongodb://admin:admin@ds050077.mongolab.com:50077/easyapp';
var connect = function(){
    var defer = q.defer();
    mongodb.MongoClient.connect(mongoURI, function(e, db){
        if(e){
            console.error(e);
            defer.reject("db connection Error");
        }

        defer.resolve(db);
    });
    return defer.promise;
};
module.exports = {
    uri: mongoURI,
    client: mongodb.MongoClient,
    connect : connect
};
    
