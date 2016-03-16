(function (){
    angular.module("app")
    .controller("landingController",landingController);
    
    landingController.$inject = ["$scope", "$log", "$state" ,"dataService", "config","authService","$mdSidenav"];
    
    function landingController($scope, $log, $state, dataService, config, authService, $mdSidenav){
        
        $scope.startApp = function(){
            if(authService.isLoggedIn){
                $state.go("home.dashboard");
            }
            else{
                $state.go("account.login");
            }
        }
    }//conroller ends
})();