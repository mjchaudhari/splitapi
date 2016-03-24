
(function (){
    angular.module("app")
    .controller("dashoardController",accountController);
    
    dashoardController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function dashoardController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        
        
        
    }//conroller ends
})();