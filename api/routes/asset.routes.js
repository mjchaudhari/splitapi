
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