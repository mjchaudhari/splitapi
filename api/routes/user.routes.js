
//User routes
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;

var userCtrl = require("./../controllers/account.controller.js");
var models = require("./../response.models.js").models;
var user = require("./../classes/API.User.js");
var _dir = process.cwd();

module.exports = function(dbConfig, auth, app) {
	var v1=new userCtrl.v1(dbConfig);
	
	/**
	 * @apiName /v1/user/search/:term? Get users
	 * @apiDescription Get the groups of the logged in user has created and the groups he is member of.
     * @apiGroup Group
     *
     * @apiParam {number} id [optional] of the group
	 * @apiExample {curl} Example usage:
 	 *     curl -i http://localhost/v1/user/search?term=mahesh
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
					"FirstName": string,
					"LastName": string,
					"UserName":string,
					"Status": string",
					"CreatedOn": date string,
					"EmailId": string
					}]
				}
	 */
	app.get("/v1/user/search:term?", function(req, res){
		v1.searchUsers(req, function(data){
			res.json(data);
		});
	})
	
	/**
     * @api {post} /v1/users Create user
     * @apiName Create or register user
     * @apiGroup User		
     *
     * 
     *
	 * * @apiSuccess {String} groups object [{Firstname:"", LastName : "", UserName:"", "Status":"", CreatedOn : "", EmailId:"",Picture:""}]
    */
	app.post('/v1/user', function(req, res) {
		//console.log(req.body);
		v1.createUser(req, function (d){
			if(d.isError){
				//res.status(400).send(d);
				res.json(d);
				return;
			}
			
			if(!d.data.Secret)
			{
				console.log("Secret not generated");
				res.status(500).send("Error while creating user");
			}
			d.data.Secret = undefined;
			res.json(d);
		});
	});
    
    /**
     * @api {post} /v1/users save profile
     * @apiName save user
     * @apiGroup User		
     *
     * 
     *
	 * * @apiSuccess {String} groups object [{Firstname:"", LastName : "", UserName:"", "Status":"", CreatedOn : "", EmailId:"",Picture:""}]
    */
	app.post('/v1/profile', function(req, res) {
		
		v1.saveUser(req, function (d){
			if(d.isError){
				res.json(d);
				return;
			}
            res.json(d);
		});
	});
	
	/**
     * @api {get} /v1/authenticate Authenticate the user and get access token
     * @apiName Authenticate user secret
     * @apiGroup User
     * @apiParam {number} userName 
     * @apiParam {number} secret
	 *
     * @apiSuccess on success returns the authentication token which should be validated with each subsequent request
    */
	app.post('/v1/authenticate', function(req, res) {
		console.log("authenticate");
		//console.log(req.body);
		v1.authenticate(req, function (d){
			if(d.isError){
				res.status(401).send(d);
				return;
			}
			
			res.json(d);
		});
	});
	/**
     * @api {get} /v1/resend 
     * @apiName Resend the pin
     * @apiGroup User
     * @apiParam {number} userName 
	 *
     * @apiSuccess on success returns the authentication token
    */
	app.post('/v1/pin/resend', function(req, res) {
		console.log("resend pin");
		console.log(req.body);
		v1.resetPasword(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			if(d.data && !d.data.Secret)
			{
				log.debug("Secret not generated");
				var e = new models.error("Internal error while resetting credentials.")
				res.status(400).send(d);
			}
			//Send email here
			var m = new models.success("Password reset.");
			res.json( m);
		});
	});
	
	/**
     * @api {get} /v1/isauthenticated 
     * @apiName Check if user is authenticated
     * @apiGroup User
     * @apiParam {number} userName 
	 *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     } 
     * @apiSuccess on success returns the authentication token
    */
	app.post('/v1/isauthenticated', auth.isBearerAuth,function(req, res) {
		console.log('isAuthenticated');
		if (req.isAuthenticated())
			res.json(new models.success('Authenticated'));
		else	
			res.json(new models.error("Unauthenticated user."));
	});
    
	/**
     * @api {get} /v1/isLoggedIn 
     * @apiName Check if user is authenticated
     * @apiGroup User
     * @apiParam {number} userName 
	 *
	 * @apiHeader {String} Authorization the security token
	 * @apiHeaderExample {json} Header-Example:
	 *     {
	 *       "Authorization": "Bearer xajksdhfkalsduwerb7879fasdf--"
	 *     } 
     * @apiSuccess on success returns the authentication token
    */
	app.post('/v1/isLoggedIn', function(req, res) {
		console.log('isLoggedIn');
		if (req.isAuthenticated())
			res.json(new models.success('true'));
		else	
			res.json(new models.error("false"));
	});
	
	
    // route middleware to ensure user is logged in
	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		res.redirect('/');
	};

	app.get("/v1/user/:username?", function(req, res){
		var u = new user(mongo, dbConfig);
		u.init(req.params.username, function(err, data){
			if(err){
				res.json(new models.error(err));
			}
			res.json(new models.success());
		});
	})
}