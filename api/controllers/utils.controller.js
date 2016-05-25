var path = require("path");
var fs = require('fs-extra'); 
var shortid	= require("shortid");
var async = require ("async");
var dbConfig =  require("../db.connection.js");
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;

var models = require("./../response.models.js").models;
//var configModels = require("./../models/config.model.js");

/*
group module
*/
exports.v1 = function(){

    var _self= this;
    this.tempUploadFolder = path.normalize(__dirname + "/../../tmpStore");
    
    this.createOrUpdateConfig = function(config,cb){
        mongodb.connect(dbConfig.mongoURI, function (e, db){
            db.collection("configs").findOneAndUpdate({"_id":config._id},{$set: config}, {"upsert":true, "forceServerObjectId":false, "returnOriginal":false}, 
            function (err, data) {
                if(cb){
                    return cb(e,data);    
                }
                
            });
        });
    };
    this.getCategories = function(name, categoryGroup, callback){
        var query = {};
        if(name){
            query.Name =  { $regex : new RegExp(name,"i") };
        }
        if(categoryGroup){
            query.ConfigGroup = { $regex : new RegExp(categoryGroup,"i") };;
        }
        mongodb.connect(dbConfig.mongoURI, function (e, db){
            db.collection("configs").find(query).toArray(function(e,d){
                return callback(e,d)
            });
        });
        
    };
    this.initConfig = function (){
        var type_collection = {"_id":"type_collection", "Name":"type_collection", "Description":"Topic", "DisplayName":"Topic", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_document = {"_id":"type_document","Name":"type_document", "Description":"Document", "DisplayName":"Document", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_calendar = {"_id":"type_calendar","Name":"type_calendar", "Description":"Comment", "DisplayName":"Comment", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_demand = {"_id":"type_demand", "Name":"type_demand", "Description":"Issue", "DisplayName":"Issue", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_transacton = {"_id":"type_transacton","Name":"type_transacton", "Description":"Announcement", "DisplayName":"Announcement", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_form = {"_id":"type_form", "Name":"type_form", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_task = {"_id":"type_task", "Name":"type_task", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        
        async.parallel([
            function(callback){
                _self.createOrUpdateConfig( type_collection, callback)
                    
            },
            function(callback){    
                _self.createOrUpdateConfig( type_document, callback)
                },
            function(callback){    
                _self.createOrUpdateConfig( type_calendar, callback)
                },
            function(callback){    
                _self.createOrUpdateConfig( type_demand, callback)
                },
            function(callback){    
                _self.createOrUpdateConfig( type_transacton, callback)
                },
            function(callback){    
                _self.createOrUpdateConfig( type_task, callback)
                },
            function(callback){    
                _self.createOrUpdateConfig( type_form, callback)
                }    
            ],
            function(err, callback) {
                // results is now equals to: {one: 1, two: 2}
                console.log("type config created");
        });
        
        var catTopic = {"_id":"ct_topic", "Name":"ct_topic", "Description":"Topic", "DisplayName":"Topic", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
        var catDocument = {"_id":"ct_post","Name":"ct_post", "Description":"Document", "DisplayName":"Document", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
        var catComment = {"_id":"ct_comment","Name":"ct_comment", "Description":"Comment", "DisplayName":"Comment", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
        var catAnnouncement = {"_id":"ct_announcement","Name":"ct_announcement", "Description":"Announcement", "DisplayName":"Announcement", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
        var categoryTask = {"_id":"ct_task", "Name":"ct_task", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        var categoryIssue = {"_id":"ct_issue", "Name":"ct_issue", "Description":"Issue", "DisplayName":"Issue", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        var categoryEvent = {"_id":"ct_event", "Name":"ct_event", "Description":"Event", "DisplayName":"Event", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        var categoryDemand = {"_id":"ct_demand","Name":"ct_demand", "Description":"Demand for resource (help/money)", "DisplayName":"Demand", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        var categoryTransaction = {"_id":"ct_transaction","Name":"ct_transaction", "Description":"Transaction", "DisplayName":"Transaction", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        var categoryQuestionnaire = {"_id":"ct_questionnaire","Name":"ct_questionnaire", "Description":"Questionnaire", "DisplayName":"Questionnaire", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
        
        
        async.parallel([
                
            function(callback){
                _self.createOrUpdateConfig( catTopic, callback);
            },
            function(callback){    
                _self.createOrUpdateConfig( catDocument,callback); 
            },
            function(callback){
                _self.createOrUpdateConfig( catComment, callback);
                    },
            function(callback){
                _self.createOrUpdateConfig( catAnnouncement, callback);
                    },
            function(callback){
                _self.createOrUpdateConfig( categoryTask, callback);
            },
            function(callback){
                _self.createOrUpdateConfig( categoryIssue, callback);
            },
            function(callback){
                _self.createOrUpdateConfig( categoryEvent, callback);
            },
            function(callback){
                _self.createOrUpdateConfig( categoryTransaction, callback);
            },
            function(callback){
                _self.createOrUpdateConfig( categoryQuestionnaire, callback);
            },
            function(callback){
                _self.createOrUpdateConfig( categoryDemand, callback);
            }
            ],
            function(err, results) {
                // results is now equals to: {one: 1, two: 2}
                console.log("category config created");
        });
    };
    
    this.fileUpload = function(req, res){
        		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
			
            fstream = fs.createWriteStream(_self.tempUploadFolder + '/' + filename);
            var options = {
					 container:"gallary",
                     saveAs:filename,
                     
            }
            options.fileStream = fstream;
            // azureStorage.uploadStream(options, function(err,result){
            //         if(err){
            //             console.error(err);    
            //         }
            //         res.json(JSON.parse(result));
                    
            // });
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);         
				var m = new models.success("File upload.");
                var fn = _self.tempUploadFolder + '/' + filename;
				options.fileName = fn;
                
                var downloadUrl = '//' + req.headers.host + '/file/'+filename;
                var s = new models.success({
                   url:downloadUrl,
                   fileName:filename
                });
                
                res.json(s);
                
            	
            });
        });
    }
}
