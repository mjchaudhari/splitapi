var path = require("path");
var fs = require('fs-extra'); 
var shortid	= require("shortid");
var models = require("./../response.models.js").models;
var configModels = require("./../models/config.model.js");

/*
group module
*/
exports.v1 = function(dbConfig){
    var configModel = configModels(dbConfig).assetConfigModel;
    var _self= this;
    _self.tempUploadFolder = path.normalize(__dirname + "/../../tmpStore");

    _self.getCategories = function(name, categoryGroup, callback){
        var query = {};
        if(name){
            query.Name =  { $regex : new RegExp(name,"i") };
        }
        if(categoryGroup){
            query.ConfigGroup = { $regex : new RegExp(categoryGroup,"i") };;
        }
        
        configModel.find(query)
        .exec(function(e,g){            
            return callback(e,g);
        });
    };
    _self.fileUpload = function(req, res){
        		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
			
            fstream = fs.createWriteStream(_self.tempUploadFolder + '/' + filename);
            var options = {
					 container:"gallary",
                     saveAs:filename,
                     
            }
            options.fileStream = fstream;
            // azureStorage.uploadStream(options, function(err,result){
            //         if(err){
            //             console.error(err);    
            //         }
            //         res.json(JSON.parse(result));
                    
            // });
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);         
				var m = new models.success("File upload.");
                var fn = _self.tempUploadFolder + '/' + filename;
				options.fileName = fn;
                
                var downloadUrl = '//' + req.headers.host + '/file/'+filename;
                var s = new models.success({
                   url:downloadUrl,
                   fileName:filename
                });
                
                res.json(s);
                
            	
            });
        });
    }
}
