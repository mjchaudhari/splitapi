var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Define schema for user
    var authSchema=new Schema({
        Id:{type:Number, unique:true, required:true},//This id will be used as public facing Id
        UserName:{type:String, unique:true, required:true},
        Secret:{type:String},
        SecretsUsed:[{type:String}],
        FirstName:{type:String},
        LastName:{type:String},
        EmailId:{type:String},
        LastLogin:{type:Date},
        ForceReset:{type:Boolean},
        FailureAttempt:{type:Number},
        AlternateEmail:{type:String},
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
        authSchema.plugin(  dbConfig.autoIncrement.plugin, { model: 'Profiles', field: 'Id', startAt: 1, incrementBy: 1 });
    };
    
    init();
    
    return { 
        userModel: dbConfig.conn.model("Profiles", authSchema)
    };
}
/*
module.exports = function(conn){
    return conn.model("Role", roleSchema);
}
*/
