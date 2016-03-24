
(function (){
    angular.module("app")
    .controller("dashoardController",dashoardController);
    
    dashoardController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function dashoardController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Dashboard";
        
        
    }//conroller ends
})();