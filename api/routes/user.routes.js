
//User routes
var userCtrl = require("./../controllers/account.controller.js");
var _dir = process.cwd();

module.exports = function(dbConfig, auth, app) {
	var v1=new userCtrl.v1(dbConfig);
	/**
     * @api {get} /v1/users Request User information
     * @apiName GetUser
     * @apiGroup User		
     *
     * 
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
    */
	app.get('/v1/users', auth.isBearerAuth, function(req, res) {
		//var body = req.body;
	  	v1.getUsers({}, function(d){
	  		if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
	  	}); 
		//res.json('okay');
		
	})

	// show the home page (will also have our login links)
	app.get('/v1/user/:username', function(req, res) {
		var username = req.params.username;
		v1.getUser(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	//Create User
	app.post('/v1/user', function(req, res) {
		console.log(req.body);
		v1.registerUser(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	/**
     * @api {get} /v1/authenticate 
     * @apiName Authenticate user secret
     * @apiGroup User
     * @param {number} userName 
     * @param {number} secret
	 *
     * @apiSuccess on success returns the authentication token
    */
	app.post('/v1/authenticate', function(req, res) {
		console.log("authenticate");
		console.log(req.body);
		v1.authenticate(req, function (d){
			if(d.isError){
				res.status(401).send(d);
				return;
			}
			res.json(d);
		});
	});
	
	app.post('/v1/pin/resend', function(req, res) {
		console.log("resend pin");
		console.log(req.body);
		v1.resendPin(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});
//	
//	app.post('/v1/pin/verify', function(req, res) {
//		console.log(req.body);
//		v1.verifyPin(req, function (d){
//			if(d.isError){
//				res.status(400).send(d);
//				return;
//			}
//			res.json(d);
//		});
//	});
	// Create user
	app.post('/v1/user', function(req, res) {
		console.log(req.body);
		v1.postUser(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});

	//search user
	app.post('/v1/user/search', function(req, res) {
		v1.getUsers(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			res.json(d);
		});
	});

	
	// route middleware to ensure user is logged in
	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		res.redirect('/');
	};
}