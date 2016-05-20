var mongoose = require('mongoose');
var shortId     =require("shortid");
var Schema = mongoose.Schema;

var assetConfigSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	},
    //_id:{type:String},   
    Name:{type:String, required:true},
    Description:{type:String},
    DisplayName:{type:String},
    ConfigGroup : {type:String},
    IsContainer:{type:Boolean},
    // ChildrenTypes:[{
    //     type:String, 
    //     ref:'assetConfig'
    // }],
    IsStandard : {type:Boolean}
    
    },
    {_id:false}
    ); 

var createConfigIfNew =  function(model, data){
    var query = {
        // "Name":data.Name
        // ,"ConfigGroup":data.ConfigGroup
        "_id" : data._id
    },
    update = { data},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    
    // // Find the document
    // model.findOneAndUpdate(query, update, options, function(error, result) {
    //     if (error) {
    //         console.info("Err :" + error.toString());
    //         return};
    //     if(result.isNew){
    //         console.info("Creted document: " + result.Name);
    //     }else{
    //         console.info("Updated document: " + result.Name);    
    //     }
        
                
    // });
    
    // Find the document
    model.findOne(query, function(error, result) {
        if (error) {
            console.error(error);
            return;}
        
        if(result){
            data._id = result._id;
            var m = model(data);
            result.Name = result.Name,
            result.ConfigGroup = result.ConfigGroup;
            result.Description = data.Description;
            result.DisplayName = data.DisplayName;
            result.IsStandard = data.IsStandard;
            result.IsContainer = data.IsContainer;
            result.save(function(e,d){
                if(e){
                    console.info("Updated document: " + e.toString());
                }
                else{
                    console.info("Updated document: " + d.Name);
                }     
            });
        } 
        else if(result == null){
            var m = model(data);
            m.save(function(e,d){
                if(e){
                    console.info("Created document: " + e.toString());
                }
                else{
                    console.info("Created document: " + d.Name);
                }
                    
            });
        }       
    });
}
module.exports = function(dbConfig){
    var _assetConfigModel = dbConfig.conn.model("Configs", assetConfigSchema);
    var _init = function (){
        var type_collection = {"_id":"type_collection", "Name":"type_collection", "Description":"Topic", "DisplayName":"Topic", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_document = {"_id":"type_document","Name":"type_document", "Description":"Document", "DisplayName":"Document", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_calendar = {"_id":"type_calendar","Name":"type_calendar", "Description":"Comment", "DisplayName":"Comment", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_demand = {"_id":"type_demand", "Name":"type_demand", "Description":"Issue", "DisplayName":"Issue", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_transacton = {"_id":"type_transacton","Name":"type_transacton", "Description":"Announcement", "DisplayName":"Announcement", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_form = {"_id":"type_form", "Name":"type_form", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        var type_task = {"_id":"type_task", "Name":"type_task", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetType","IsActive":true};
        
        createConfigIfNew(_assetConfigModel, type_collection);
        createConfigIfNew(_assetConfigModel, type_document);
        createConfigIfNew(_assetConfigModel, type_calendar);
        createConfigIfNew(_assetConfigModel, type_demand);
        createConfigIfNew(_assetConfigModel, type_transacton);
        createConfigIfNew(_assetConfigModel, type_task);
        createConfigIfNew(_assetConfigModel, type_form);
        
        
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
        
        createConfigIfNew(_assetConfigModel, catTopic);
        createConfigIfNew(_assetConfigModel, catDocument);
        createConfigIfNew(_assetConfigModel, catComment);
        createConfigIfNew(_assetConfigModel, catAnnouncement);
        createConfigIfNew(_assetConfigModel, categoryTask);
        createConfigIfNew(_assetConfigModel, categoryIssue);
        createConfigIfNew(_assetConfigModel, categoryEvent);
        createConfigIfNew(_assetConfigModel, categoryTransaction);
        createConfigIfNew(_assetConfigModel, categoryQuestionnaire);
        createConfigIfNew(_assetConfigModel, categoryDemand);
        
    };
    _init();
    
    return { 
        //init:_init,
        assetConfigModel:_assetConfigModel,
        
    };
}
