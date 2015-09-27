var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var artifactSchema = new Schema({
    ExternalId:{type:Number, unique:true, required:true,},//This id will be used as public facing Id
    Name:{type:String, required:true},
    Account:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Account'
    },
    Description:{type:String},
    Locale : {
        type:String,
        default:"en-us"
    }, 
    IsCollection:{type:Boolean},
    Version : {type:Number},
    Status : {type:String},
    Thumbnail:{type:String},
    Url:{type:String},
    allowDownload:{type:Boolean, default:true},
    ArtifactType:{type:String},
    ParentIds:{type:[Number]},
    Path:{type:[String]},
    
    CreatedBy:
    {
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Profiles'
    },
    CreatedOn : {type:Date, default:Date.now()   },
    UpdatedBy:
    {
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Profiles'
    },
    UpdatedOn : {type:Date,default:Date.now()},
    Stat:{
        Views: {type:Number, default:0},
        Feedbacks:{type:Number, default:0},
        Likes:{type:Number, default:0},
        Comments:{type:Number, default:0},
    }
    
});

module.exports = function(dbConfig){
        var init = function (){
            artifactSchema.plugin(  autoIncrement.plugin, { model: 'Artifacts', "field":"ExternalId", startAt: 1, incrementBy: 1 });
        };
       
        init();
    return { 
        artifactModel: dbConfig.conn.model("Artifacts", artifactSchema)
    };
}
