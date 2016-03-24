
angular.module('app').factory('authService', ['$http', '$log','$q','config' ,'$localStorage', 'CacheFactory','dataService',
	function ($http, $log, $q, config, $localStorage, CacheFactory,dataService) {

    var authServiceFactory = {
        get isLoggedIn () {
            return _isLoggedIn;
        }

    };
    var _isLoggedIn = false;
    var _UserDetail = {
    };
	/**
    Register yourself
    */
    var _register = function( registerModel){
      var url = config.apiBaseUrl + "/v1/user";
      
      return $http.post(url, registerModel);
    }
    
    var _resendPin = function( data){
      var url = config.apiBaseUrl + "/v1/pin/resend";
      return $http.post(url, data);
    }
    var _login = function (userName, password) {
        var deferred = $q.defer();
        var model = {
            UserName: userName
            , Secret: password
        };
        var url = config.apiBaseUrl + "/v1/authenticate";
        $http.post(url, model).then(
        function(d){
        	dataService.clearCache();
            $localStorage.__splituser = d.data.data;
            $localStorage.__splituserat = d.data.data.AccessToken;
            _UserDetail = d.data.data;
            _isLoggedIn = true;
            deferred.resolve(d.data.data);
        },
        function (e){
            _logOut();
              deferred.reject(e);
          });
        return deferred.promise;
    };
     
    var _logOut = function () {
    	var deferred = $q.defer();
    	$q.all(
			$localStorage.__splituser = null,
			$localStorage.__splituserat=null
            
    	).then(function(){
    		dataService.clearCache();
            _isLoggedIn = false;
    		deferred.resolve();
    	});
		return deferred.promise;
    };

    var _isAuthenticated = function () {
        var url = config.apiBaseUrl + "/v1/isAuthenticated";
        return $http.post(url).then(function(f){
            _isLoggedIn = !f.data.isError;
        })
    };
    

    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.isAuthenticated = _isAuthenticated;
    
    authServiceFactory.UserDetail = _UserDetail;
    authServiceFactory.resendPin = _resendPin;
    authServiceFactory.register = _register;
    
    function init(){
    	_isAuthenticated().then(function(){
			
	});
	
    }
    

    //init();
    return authServiceFactory;	
}])

