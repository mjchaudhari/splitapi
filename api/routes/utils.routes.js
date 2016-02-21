    //User routes

var models = require("./../response.models.js").models;
var path = require("path");
var fs = require('fs-extra'); 
var azureStorage = require("../azureStorageHelper.js")();
var fileCtrl = require("./../controllers/file.controller.js");
var _dir = process.cwd();



module.exports = function(dbConfig, auth, app) {
	
	var tmpUploadFolder = path.normalize(__dirname + "/../../tmpStore");
	
	/**
	 * @apiName /v1/utils/file/upload File upload
	 * @apiDescription Get the groups of the logged in user has created and the groups he is member of.
     * @apiGroup Group
     *
     * @apiParam {number} id [optional] of the group
	 * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/utils/file/upload
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {String} array of groups matching to the criteria .
	 *
	 * @apiSuccessExample {JSON} {
				"isError": false,
				"data": [
					{
					"url": string,
					"size": string,
					}]
				}
	 */
	app.post("/v1/file1", function(req, res){
		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
			
            fstream = fs.createWriteStream(tmpUploadFolder + '/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);         
				var m = new models.success("File upload.");
				m.data = {
					FileName :path.basename(filePath),
					url: "//" + res.req.headers.host + '/file/' + path.basename(filePath) 
				}
				res.json( m);     
                
            });
        });
	})

	/**
	 * @apiName /v1/utils/file/upload File upload
	 * @apiDescription Get the groups of the logged in user has created and the groups he is member of.
     * @apiGroup Group
     *
     * @apiParam {number} id [optional] of the group
	 * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/utils/file/upload
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {String} array of groups matching to the criteria .
	 *
	 * @apiSuccessExample {JSON} {
				"isError": false,
				"data": [
					{
					"url": string,
					"size": string,
					}]
				}
	 */
	app.post("/v1/file/uploadOld", auth.isBearerAuth, function(req, res){
		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
			
            fstream = fs.createWriteStream(tmpUploadFolder + '/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);         
				var m = new models.success("File upload.");
				m.data = {
					FileName :filename,
					url: "http://" + res.req.headers.host + '/file/' + filename 
				}
				res.json( m);     
                
            });
        });
	})
	
	app.get('/file/*', function(req, res){
		var path = tmpUploadFolder + '/' + req.params[0] ;
        if(path.existsSync(path)){
		res.sendFile(path);}
        else{
            res.status(404).send("Not found");
        }
	});
   
    app.post("/v1/file", auth.isBearerAuth, function(req, res){
        fileUpload(req, res);
	});
    
    app.post("/v1/thumbnail", function(req, res){
        fileUpload(req, res);
	});
    /**
     * Upload base64 thumbnail 
     * @apiParam {string} imgUrl - image in base64 string  
     * @apiParam {string} name - file name 
     * @apiSuccess {string} url of the ploaded image
     */
    app.post("/v1/thumbnail/binary", function(req, res){
        var base64String = req.body.imgUrl;
        var fileName = req.body.fileName;
        
        fileCtrl.saveFileFromBase64(fileName, base64String, function(err, filePath){
            if(err){
                console.error(err);
                var e = new models.error(err,"");
                res.json(e);    
                return;
            };
            var downloadUrl = '//' + req.headers.host + '/file/'+fileName;
            var s = new models.success();
            s.data = fileName;
            res.json(s);
            
            // fileCtrl.uploadToAzureStorage("gallery",filePath,function(err,result){
            //     if(err){
            //         var e = new models.error(err,"");
            //         res.json(e);    
            //     }
            //     var s = new models.success(result);
            //     res.json(s);
            // });
        });
	});
    
    var fileUpload = function(req, res){
        		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
			
            fstream = fs.createWriteStream(tmpUploadFolder + '/' + filename);
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
                var fn = tmpUploadFolder + '/' + filename;
				options.fileName = fn;
            
            	azureStorage.uploadFile(options, function(err,result){
                    if(err){
                        console.error(err);    
                    }
                    res.json(result);
                    
                });
            });
        });

    }
    
    app.post('/drive/upload', function(req, res){
        
        var options = {};
        
        
		
	});
    
}