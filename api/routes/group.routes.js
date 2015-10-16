
//User routes
var groupCtrl = require("./../controllers/group.controller.js");
//var authCtrl        = require('./../controllers/auth.controller.js');

module.exports = function(dbConfig, auth,app) {
	var v1=new groupCtrl.v1(dbConfig);
	/**
     * @api {get} /v1/groups Get the groups of the logged in user has created and the groups he is member of
     * @apiName Get group(s)
     * @apiGroup Group
     *
     * @param {number} id [optional] of the group
	 * @param {string} name [optional] of the group
	 * @param {string} status [options] of the group
     *
     *
     * @apiSuccess {String} user object {Firstname:"", LastName : "", UserName:"", "Status":"", CreatedOn : "", EmailId:"",Picture:""}
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
     * @apiSuccess {object} .
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