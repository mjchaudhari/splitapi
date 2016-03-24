
'use strict';

angular.module('app').factory('httpInterceptor', ['$q', '$location', '$injector', '$localStorage','$log',
function ($q, $location, $injector , $localStorage, $log) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        if (config.url.search('authenticate') == -1 && config.url.search('resend')=='-1') {
                                
            config.headers = config.headers || {};

            var authData = $localStorage.__splituserat;
            if (authData) {
                
                config.headers.Authorization = 'Bearer ' + authData;
            }
        }
        return config;
    }

    // On request failure
    var _requestError= function (rejection) {
        return $q.reject(rejection);
    }

    // On response success
    var _response= function (response) {
        return response || $q.when(response);
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            if ($location.$$path.indexOf("login") <= -1  )
            {
                //$log.info('Unauthenticated...redirecting to login page.');
                //$injector.get('$state').go("account.login");
                $rootScope.$emit("onUnauthenticatedAccess");
            }
        }
        else {
            
            //$log.error('Status: ' + rejection.status + ' , Message: ' + rejection.statusText);
            //$log.debug( 'Response Error: - ' + JSON.stringify(rejection));
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.requestError = _requestError;
    authInterceptorServiceFactory.response = _response;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);