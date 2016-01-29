/// <reference path="../../typings/angularjs/angular.d.ts"/>
angular.module("app").controller("assetCtrl",["$scope","$log", "$q","$http", function($scope, $log, $q, $http){
	$scope.title="Asset management";
	$scope.assets = [];
	
	var init = function(){
		var url = "/v1/artifact/tree/8";
		$scope.assets = [];
		$http.post(url,null).then(function(data){
			angular.copy(data.data.data, $scope.assets);
		});
	}
	
	init();
}]);