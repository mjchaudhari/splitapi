
//User routes
var groupCtrl = require("./../controllers/assets.controller.js");
//var authCtrl        = require('./../controllers/auth.controller.js');

module.exports = function(dbConfig, auth,app) {
	var v1=new groupCtrl.v1(dbConfig);




	/**
     * @api {get} /v1/group/membership?groupId check if current user is member of this group
     * @apiName Membership check
     * @apiGroup Group
     * @apiParam {number} groupId 
     *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {boolean} true if user is member of given group 
    */
    app.get('/v1/group/membership', auth.isBearerAuth, function(req, res) {
        
		v1.checkGroupMembership (req.user.User._id,req.query.groupId, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
    
    /**
     * @api {get} /v1/groupId/assets?parentId?count?updartedAfter?  check if current user is member of this group
     * @apiName Get assets
     * @apiGroup Asset
     * @apiParam {string} groupId - the group in which asset is created
     * @apiParam {string} parentId - the parant container Id in which the asset lies. OPTIONAL
     * @apiParam {int} count - count of the recorda required OPTIONAL defaults to 100
	 * @apiHeader {date} from - fetch records created/updated after this date. Optional
     * 
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {boolean} true if user is member of given group 
    */
    app.get('/v1/:groupId/assets', auth.isBearerAuth, function(req, res) {
        
		v1.getAssets(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
    
    app.get('/v1/assetconfig', auth.isBearerAuth, function(req, res) {
        v1.getAssetConfig().then(function(d){
            res.json(d);
        });
		// v1.getAssetConfig (function (d){
		// 	if(d.isError){
		// 		res.status(400).send(d);
		// 		return;
		// 	}
		// 	res.json(d);
		// });
	});
    
    
    /**
     * @api {get} /v1/asset create asset
     * @apiName Membership check
     * @apiGroup Asset
     * @apiParam {object} asset - the asset that is to be created/updated  
     * @apiParam {string} asset._id - id of an asset (only if update request)
     * @apiParam {string} asset.Name - Name of an asset 
     * @apiParam {string} asset.Description - Description
     * @apiParam {string} asset.Type - Type of the asset is to be created
     * @apiParam {string} asset.Type._id - TypeId of the type e.g. Cat_Comment
     * @apiParam {string} asset.Thumbnail - Thumbnail of the 
     * @apiParam {string} asset.URLS[] - URLS of the assets if any
     * @apiParam {string} asset.GroupId - id of the group inwhich this asset is created
     * @apiParam {string} asset.Paths[] - parent Paths of the assets. If not present it will consider group id as default path
     * @apiParam {Date}   asset.ActivateOn - Date on which this assets is activated or to be activated
     * @apiParam {Date}   asset.ExpireOn - Date on which this assets is expired. Default to null.
     * 
     * 
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {boolean} true if user is member of given group 
    */
    app.post('/v1/asset', auth.isBearerAuth, function(req, res) {
        
		v1.save (req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
    
}