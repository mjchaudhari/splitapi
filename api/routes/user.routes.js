
//User routes
var userCtrl = require("./../controllers/account.controller.js");
var models = require("./../response.models.js").models;
var _dir = process.cwd();

module.exports = function(dbConfig, auth, app) {
	var v1=new userCtrl.v1(dbConfig);
	
	app.get("/v1/user/search/:term?", function(req, res){
		v1.searchUsers(req, function(data){
			res.json(data);
		});
	})
	
	/**
     * @api {post} /v1/users Create new user
     * @apiName Create or register user
     * @apiGroup User		
     *
     * 
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
    */
	app.post('/v1/user', function(req, res) {
		console.log(req.body);
		v1.registerUser(req, function (d){
			if(d.isError){
				res.status(400).send(d);
				return;
			}
			
			if(!d.secret)
			{
				log.debug("Secret not generated");
				res.status(400).send("Error while creating user");
			}
			d.Secret = undefined;
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
	
	
	// route middleware to ensure user is logged in
	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		res.redirect('/');
	};
}