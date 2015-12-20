//User routes

var models = require("./../response.models.js").models;
var path = require("path");
var fs = require('fs-extra'); 
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
	app.post("/v1/file/upload", auth.isBearerAuth, function(req, res){
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
					url:'/files/' + filename 
				}
				res.json( m);     
                
            });
        });
	})
	
	app.get('/files/*', function(req, res){
		var path = tmpUploadFolder + '/' + req.params[0] ;
		res.sendfile(path);
	});
}