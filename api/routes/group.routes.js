
//User routes
var groupCtrl = require("./../controllers/group.controller.js");
//var authCtrl        = require('./../controllers/auth.controller.js');

module.exports = function(dbConfig, auth,app) {
	var v1=new groupCtrl.v1(dbConfig);
	/**
     * @api {get} /v1/groups get groups
     * @apiDescription Get the groups of the logged in user has created and the groups he is member of.
     * @apiGroup Group
     * @param {number} id [optional] of the group
	 * @param {string} name [optional] of the group
	 * @param {string} status [options] of the group
     * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/groups?id=123&name=abcd&status=active
	 * @apiSuccess {String} array of groups matching to the criteria .
	 * @successExample {
			"isError": false,
			"data": [
				{
				"ExternalId": 1,
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
     * 
     * 
     * @apiSuccess {object} group object      *
 
    */
	app.post('/v1/group', auth.isBearerAuth,function(req, res) {
		console.log(req.body);
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
     * @param {number} groupId 
     * @param {number} members comma separated string of user Ids e.g. "5" OR "5,6,7,8"  
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
     * @api {delete} /v1/group/members remove memember in group
     * @apiName remove members
     * @apiGroup Group
     * @param {number} groupId 
     * @param {number} members comma separate list of user Ids e.g. "5" OR "5,6,7,8"  
     *
     * @apiSuccess {group} group object.
    */
	app.delete('/v1/group/members', auth.isBearerAuth, function(req, res) {
		v1.removeMembers(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	
}