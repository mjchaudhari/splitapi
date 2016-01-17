var mongoose = require('mongoose');
var shortId     =require("shortid");

var Schema = mongoose.Schema;

//Define schema for user
    var userSchema=new Schema({
        _id: {
            type: String,
            unique: true,
            default: shortId.generate
        },
        UserName:{type:String, unique:true, required:true},
        FirstName:{type:String},
        LastName:{type:String},
        EmailId:{type:String},
        AlternateEmail:{type:String},
        Picture:{type:String},
        CreatedOn:{type:Date},
        Status:{type:String},
        Address : {type:String},
        City : {type:String},
        Country : {type:String},
        ZipCode : {type:String},
    });
    
    var accountSchema=new Schema({
        _id: {
            type: String,
            unique: true,
            default: shortId.generate
        },
        User:{
            type:String, 
            ref:'Profiles'},        
        Secret:{type:String},
        SecretsUsed:[{type:String}],       
        LastLogin:{type:Date},
        ForceReset:{type:Boolean},
        FailureAttempt:{type:Number},
        CreatedOn:{type:Date},
        AccessToken : {type: String},
        RefreshToken : {type: String},
        Status:{type:String}
    });
    
 /*   
module.exports = function(conn){
    return conn.model("Client", clientSchema);
}
*/

module.exports = function(dbConfig){
    var init = function (){
    };
    
    init();
    
    return { 
        userModel: dbConfig.conn.model("Profiles", userSchema),
        accountModel: dbConfig.conn.model("Accounts", accountSchema)
    };
}
/*
module.exports = function(conn){
    return conn.model("Role", roleSchema);
}
*/
