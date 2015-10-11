
//User routes
var groupCtrl = require("./../controllers/group.controller.js");
//var authCtrl        = require('./../controllers/auth.controller.js');

module.exports = function(dbConfig, auth,app) {
	var v1=new groupCtrl.v1(dbConfig);
	/**
     * @api {get} /v1/users Request Artifact information
     * @apiName Get Artifact
     * @apiGroup User
     *
     * 
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
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
     * @api {post} /v1/artifact Request Artifact information
     * @apiName Save Artifact
     * @apiGroup User
     *
     * 
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
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
     * @api {get} /v1/users Request Artifact information
     * @apiName Get Artifact
     * @apiGroup User
     * @param {number} id [optional] [default = 0] of the asset
     * @param {number} depth [optional] [default = 0] of the children if any
	 * @param {number} structureonly [optional] [default = false] or not to fetch the collection structure and exclude  
     *
     * @apiSuccess {artifacts} artifact.
    */
	app.post('/v1/group/members', function(req, res) {
		v1.addMembers(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	/**
     * @api {post} /v1/artifact/tree/parentExternalId Request Artifact information
     * @apiName Get tree
     * @apiGroup User
     *
     * @param parentExternalId
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
    */
	// app.post('/v1/artifact/tree/:parentId', function(req, res) {
	// 	console.log(req.body);
	// 	v1.getTree(req, function (d){
	// 		if(d.isError){
	// 			res.status(400).send(d);
	// 			return;
	// 		}
	// 		res.json(d);
	// 	});
	// });
	
}