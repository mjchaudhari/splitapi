var mongoose = require('mongoose');
var shortId     =require("shortid");
var Schema = mongoose.Schema;

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
    AssetCategory:{
        type:String, 
        ref:'Configs'
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
            UpdatedBy:{
                type:String, 
                ref:'Profiles'
            },        
            UpdatedOn:{type:Date},
            Description: {type:String},
            Notify:{type:Boolean}
        }
    ],
    UpdatedBy:{
        type:String, 
        ref:'Profiles'
    },
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
    Paths:[
        {type:String}
    ],
});

var createConfigIfNew =  function(model, data){
    var query = {
        "Name":data.Name
        ,"Category":data.Category
    },
    update = { data},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    
    // Find the document
    model.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) {
            console.info("Err :" + error.toString());
            return};
        if(result.isNew){
            console.info("Creted document: " + result.Name);
        }else{
            console.info("Updated document: " + result.Name);    
        }
        
                
    });
    
     // Find the document
    // model.findOne(query, function(error, result) {
    //     if (error) {
    //         console.error(error);
    //         return;}
        
    //     if(result){
    //         data._id = result._id;
    //         var m = model(data);
    //         m.save(function(e,d){
    //             if(e){
    //                 console.info("Updated document: " + e.toString());
    //             }
    //             else{
    //                 console.info("Updated document: " + d.Name);
    //             }     
    //         });
    //     } 
    //     else if(result == null){
    //         var m = model(data);
    //         m.save(function(e,d){
    //             if(e){
    //                 console.info("Created document: " + e.toString());
    //             }
    //             else{
    //                 console.info("Created document: " + d.Name);
    //             }
                    
    //         });
    //     }       
    // });
}
    module.exports = function(dbConfig){
        var _assetModel = dbConfig.conn.model("Assets", assetSchema);
        
        
        var init = function (){
        };
       
        init();
        return { 
            assetModel: _assetModel,
            
        };
    }
