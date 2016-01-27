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
            var catTopic = {"_id":"Ct_Topic", "Name":"Ct_Topic", "Description":"Topic", "DisplayName":"Topic", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
            var catDocument = {"_id":"Ct_Document","Name":"Ct_Document", "Description":"Document", "DisplayName":"Document", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
            var catComment = {"_id":"Ct_Comment","Name":"Ct_Comment", "Description":"Comment", "DisplayName":"Comment", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":true};
            var categoryTask = {"_id":"Ct_Task", "Name":"Ct_Task", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
            var categoryIssue = {"_id":"Ct_Issue", "Name":"Ct_Issue", "Description":"Issue", "DisplayName":"Issue", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
            var categoryEvent = {"_id":"Ct_Event", "Name":"Ct_Event", "Description":"Event", "DisplayName":"Event", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
            var categoryTransaction = {"_id":"Ct_Transaction","Name":"Ct_Transaction", "Description":"Transaction", "DisplayName":"Transaction", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
            var categoryQuestionnaire = {"_id":"Ct_Questionnaire","Name":"Ct_Questionnaire", "Description":"Questionnaire", "DisplayName":"Questionnaire", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory","IsActive":false};
            
            createConfigIfNew(_assetConfigModel, catTopic);
            createConfigIfNew(_assetConfigModel, catDocument);
            createConfigIfNew(_assetConfigModel, catComment);
            createConfigIfNew(_assetConfigModel, categoryTask);
            createConfigIfNew(_assetConfigModel, categoryIssue);
            createConfigIfNew(_assetConfigModel, categoryEvent);
            createConfigIfNew(_assetConfigModel, categoryTransaction);
            createConfigIfNew(_assetConfigModel, categoryQuestionnaire);
            
            
        };
       _init();
       
        return { 
            //init:_init,
            assetConfigModel:_assetConfigModel,
            
        };
    }
