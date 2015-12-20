// server.js
// set up ======================================================================
// get all the tools we need
var express         = require('express');
var session 		= require('express-session');
var app             = express();
var port            = process.env.PORT || 8085;
var passport        = require('passport');
var path            = require("path");
var bodyParser      = require('body-parser');
var dbConfig        = require("./api/db.connection.js");
var auth            = require("./api/auth.js");
var busboy          = require('connect-busboy');
//app.use(bodyParser.urlencoded());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/client")));
app.use(busboy());
// required for passport
app.use(session({ 	secret: 'splitit', 
					saveUninitialized: true,
					resave: true })); // session secret
					
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
});

app.get('/', function (req, res, next) {
   console.log('in route');
   
  res.sendFile('./test.html');
});



// routes ======================================================================
//require('./api/routes/auth.routes.js')(dbConfig, app, authController); // load our routes and pass in our app and fully configured passport
//require('./api/routes/oauth.routes.js')(dbConfig, app); // load our routes and pass in our app and fully configured passport
require('./api/routes/user.routes.js')(dbConfig,auth, app); // load our routes and pass in our app and fully configured passport
require('./api/routes/group.routes.js')(dbConfig, auth, app); // load our routes and pass in our app and fully configured passport
require('./api/routes/utils.routes.js')(dbConfig, auth, app); // load our routes and pass in our app and fully configured passport


// launch =====ss=================================================================
 
app.listen(port);
console.log('Start on port ' + port);
