var mongoose = require("mongoose"),
    autoIncrement = require('mongoose-auto-increment'),
    //mongoURI = 'mongodb://127.0.0.1:27017/dbsplit';
    mongoURI = 'mongodb://admin:admin@ds050077.mongolab.com:50077/easyapp';
    mongoose.connect(mongoURI);
    autoIncrement.initialize(mongoose.connection, mongoose);
    var db = mongoose.connection;
    
    db.on('error',console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
    	console.log("Connected to split");
    	
    });
module.exports = {
    conn :   db
    , autoIncrement: autoIncrement
};
    
