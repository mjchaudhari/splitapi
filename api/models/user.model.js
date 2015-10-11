var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Define schema for user
    var userSchema=new Schema({
        Id:{type:Number, unique:true, required:true},//This id will be used as public facing Id
        UserName:{type:String, unique:true, required:true},
        FirstName:{type:String},
        LastName:{type:String},
        EmailId:{type:String},
        AlternateEmail:{type:String},
        CreatedOn:{type:Date},
        Status:{type:String}
    });
    
    var accountSchema=new Schema({
        User:{
            type:mongoose.Schema.Types.ObjectId, 
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
        userSchema.plugin(  dbConfig.autoIncrement.plugin, { model: 'Profiles', field: 'Id', startAt: 1, incrementBy: 1 });
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
