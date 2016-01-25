var mongoose = require('mongoose');
var shortId     =require("shortid");

var Schema = mongoose.Schema;

var assetConfigSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    Name:{type:String, required:true},
    Description:{type:String},
    DisplayName:{type:String},
    ConfigGroup : {type:String},
    IsContainer:{type:Boolean},
    ChildrenTypes:[{
        type:String, 
        ref:'assetConfig'
    }],
    IsStandard : {type:Boolean}
    
}); 

var auditSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    AssetId:{
        type:String, 
        ref:'asset'
    },
    Action:{type:String},
    UpdatedOn:{type:Date},
    Description: {type:String},
    Notify:{type:Boolean}
}); 

var assetSchema = new Schema({
    //_id:{type:Number, unique:true, required:true,},//This id will be used as public facing Id
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    _uid: {
	    type: String,  
	},
    Type:{
        type:String, 
        ref:'assetConfig'
    },
    
    Name:{type:String, required:true},
    Description:{type:String},
    Locale : {
        type:String,
        default:"en-us"
    }, 
    Status : {type:String},
    Thumbnail:{type:String},
    Urls:[{type:String}],
    Moderators : [{
        type:String, 
        ref:'Profiles'
    }],
    ActivateOn : {type:Date, default:Date.now()   },
    ExpireOn : {type:Date, default:Date.now()   },
    AuditTrail : [
        {
            
            Action:{type:String},
            UpdatedOn:{type:Date},
            Description: {type:String},
            Notify:{type:Boolean}
        }
    ],
    // AuditTrail :
    // [{
    //     type:String, 
    //     ref:'AssetAudits'
    // }],
    GroupId:
    {
        type:String, 
        ref:'Groups'
    },
    Paths:
    {
        type:String, 
    },
});

var createConfigIfNew =  function(model, data){
    var query = {
        "Name":data.Name
        ,"Category":data.Category
    },
    update = { data},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    
    // // Find the document
    // model.findOneAndUpdate(query, update, options, function(error, result) {
    //     if (error) return;
    //     console.info("Creted document: " + data.Name);        
    // });
    
     // Find the document
    model.findOne(query, function(error, result) {
        if (error) {
            console.error(error);
            return;}
        
        if(result){
            data._id = result._id;
            var m = model(data);
            m.save(function(){
                console.info("Updated document: " + data.Name);        
            });
        } 
        else if(result == null){
            var m = model(data);
            m.save(function(){
                console.info("Created document: " + data.Name);        
            });
        }       
    });
    
}
module.exports = function(dbConfig){
        var _assetModel = dbConfig.conn.model("Assets", assetSchema);
        var _assetConfigModel = dbConfig.conn.model("AssetConfigs", assetConfigSchema);
        
        var init = function (){
            var catTopic = {"Name":"Ct_Topic", "Description":"Topic", "DisplayName":"Topic", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var catComment = {"Name":"Ct_Comment", "Description":"Comment", "DisplayName":"Comment", "IsContainer":false,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var categoryTask = {"Name":"Ct_Task", "Description":"Task", "DisplayName":"Task", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var categoryIssue = {"Name":"Ct_Issue", "Description":"Issue", "DisplayName":"Issue", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var categoryEvent = {"Name":"Ct_Event", "Description":"Event", "DisplayName":"Event", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var categoryTransaction = {"Name":"Ct_Transaction", "Description":"Transaction", "DisplayName":"Transaction", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            var categoryQuestionnaire = {"Name":"Ct_Questionnaire", "Description":"Questionnaire", "DisplayName":"Questionnaire", "IsContainer":true,"IsStandard":true, "ConfigGroup":"AssetCategory"};
            
            createConfigIfNew(_assetConfigModel, catTopic);
            createConfigIfNew(_assetConfigModel, catComment);
            createConfigIfNew(_assetConfigModel, categoryTask);
            createConfigIfNew(_assetConfigModel, categoryIssue);
            createConfigIfNew(_assetConfigModel, categoryEvent);
            createConfigIfNew(_assetConfigModel, categoryTransaction);
            createConfigIfNew(_assetConfigModel, categoryQuestionnaire);
            
            
        };
       
        init();
    return { 
        assetModel: _assetModel,
        assetConfigModel:_assetConfigModel
    };
}
