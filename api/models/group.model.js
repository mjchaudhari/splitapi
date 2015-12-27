var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var groupSchema = new Schema({
    
    Name:{type:String, required:true},
    Description:{type:String},
    Locale : {
        type:String,
        default:"en-us"
    }, 
    Status : {type:String},
    Thumbnail:{type:String},
    Url:{type:String},
    GroupType:{type:String},
    Members : [{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Profiles'
    }],
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
            
        };
       
        init();
    return { 
        groupModel: dbConfig.conn.model("Groups", groupSchema)
    };
}
