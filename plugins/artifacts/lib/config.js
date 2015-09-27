var mongoose = require('mongoose');
//var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var configSchema = new Schema({
    Id:{type:Number, unique:true, required:true},//This id will be used as public facing Id
    Name:{type:String, required:true},
    Description:{type:String},
    category : {type:String},
    
});

module.exports = function(dbConfig){
    configSchema.plugin(dbConfig.autoIncrement.plugin, { model:"ArtifactConfig", field:"Id",startAt:1, incrementBy:1});
    return { 
        artifactConfig: dbConfig.conn.model("ArtifactConfig", configSchema)
        
    };
}
