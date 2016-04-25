    //User routes

var models = require("./../response.models.js").models;
var path = require("path");
var fs = require('fs-extra'); 
var azureStorage = require("../azureStorageHelper.js")();
var fileCtrl = require("./../controllers/file.controller.js");
var utilsCtrl = require("./../controllers/utils.controller.js");
var models = require("./../response.models.js").models;
var _dir = process.cwd();




module.exports = function(dbConfig, auth, app) {
    var utils=new utilsCtrl.v1(dbConfig);
    
	var tmpUploadFolder = utils.tempUploadFolder;
	
	/**
	 * @apiName /v1/file?filename  get the file
	 * @apiDescription Get the file 
     * @apiGroup Group
     *
     * @apiParam {string} filename [optional] 
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
	 */
	app.get('/file/*', function(req, res){
		var disklocation = tmpUploadFolder + '/' + req.params[0] ;
        if(fs.existsSync(disklocation)){
		  res.download(disklocation);}
        else{
            res.status(404).send("Not found");
        }
	});
    
    /**
     * Upload file
     */
    app.post("/v1/file", auth.isBearerAuth, function(req, res){
        utils.fileUpload(req, res);
	});
    
    app.post("/v1/thumbnail", function(req, res){
        utils.fileUpload(req, res)
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
    
    
    
    app.post('/drive/upload', function(req, res){
        
        var options = {};
        
        
		
	});
    /**
	 * @apiName /v1/utils/categories/:name?/:categoryGroup Get categories
	 * @apiDescription Get asset categories
     * @apiGroup Config
     *
     * @apiParam {string} name [optional] of the config
     * @apiParam {string} categoryGroup [optional] name of the config
	 * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/utils/categories?name=Ct_Comment&categoryGroup="AssetCategory"
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
                        "_id":string,
                        "Name":string,
                        "Description":string,
                        "DisplayName":string,
                        "IsContainer":bool,
                        "IsStandard":bool,
                        "ConfigGroup":string					
				}
	 */
	app.get("/v1/config/categories",  function(req, res){
        var name = "";
        var categoryGroup = "";
        if( req.query != null ){
            name = req.query.name;
            categoryGroup = req.query.categoryGroup;
        }
		utils.getCategories(name, categoryGroup, function (e,d){
            if(e)
            {
                res.json(new models.error(e));
            }
            res.json(new models.success(d));
        });
	});
}