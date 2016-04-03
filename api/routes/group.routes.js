
//User routes
var groupCtrl = require("./../controllers/group.controller.js");
//var authCtrl        = require('./../controllers/auth.controller.js');

module.exports = function(dbConfig, auth,app) {
	var v1=new groupCtrl.v1(dbConfig);
	/**
     * @api {get} /v1/groups get groups
     * @apiDescription Get the groups of the logged in user has created and the groups he is member of.
     * @apiGroup Group
     * @apiParam {number} id [optional] of the group
	 * @apiParam {string} name [optional] of the group
	 * @apiParam {string} status [options] of the group
     * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/groups?id=123&name=abcd&status=active

	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
	 * @apiSuccess {String} array of groups matching to the criteria .
	 * @successExample {
			"isError": false,
			"data": [
				{
				
				"Name": "Group1",
				"Description": "Group 1 Description2",
				"Status": "Active",
				"Url": "www.google.com",
				"Thumbnail": "https://wiki.kuali.org/download/attachments/338958416/group.jpeg?version=1&modificationDate=1402938706000&api=v2",
				"UpdatedBy": "56113b23f0cbf2da328ae271",
				"Stat": {
					"Comments": 0,
					"Likes": 0,
					"Feedbacks": 0,
					"Views": 0
				},
				"UpdatedOn": "2015-10-09T19:01:51.853Z",
				"CreatedOn": "2015-10-07T18:51:17.220Z",
				"Members": [],
				"Locale": "en-us"
				}]
			}
    */
	app.get('/v1/groups', auth.isBearerAuth,function(req, res) {
	  	v1.getGroups(req, function(d){
	  		if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
	  	}); 
		//res.json('okay');
	});

	
	/**
     * @api {post} /v1/group Create the posted group 
     * @apiName Save Group 
     * @apiGroup Group
     *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {object} group object      *
 
    */
	app.post('/v1/group', auth.isBearerAuth,function(req, res) {
		//console.log(req.body);
		v1.save(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	
	// show the home page (will also have our login links)
	/**
     * @api {post} /v1/group/members Add memember in group
     * @apiName Add member 
     * @apiGroup Group
     * @apiParam {number} groupId 
     * @apiParam {number} members comma separated string of user Ids e.g. "5" OR "5,6,7,8"  
     *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {group} group object.
    */
	app.post('/v1/group/members', auth.isBearerAuth,function(req, res) {
		v1.addMembers(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	/**
     * @api {post} /v1/group/members/delete remove memember in group
     * @apiName remove members
     * @apiGroup Group
     * @apiParam {number} groupId 
     * @apiParam {number} members comma separate list of user Ids e.g. "5" OR "5,6,7,8"  
     *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     }      
     *
     * @apiSuccess {group} group object.
    */
	app.post('/v1/group/members/remove', auth.isBearerAuth, function(req, res) {
		v1.removeMembers(req, function (d){
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
    app.get('/v1/group/membership', auth.isBearerAuth, function(req, res) {
        
		v1.checkGroupMembership (req.user.User._id,req.query.groupId, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
    
    
}