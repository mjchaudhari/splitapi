
(function (){
    angular.module("app")
    .controller("assetsController",assetsController);
    
    assetsController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function assetsController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Assets";
        
        
    }//conroller ends
})();