(function (){
    angular.module("app")
    .controller("accountController",accountController);
    
    accountController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$mdToast" ,"dataService", "config","authService"];
    
    function accountController($scope, $rootScope,  $log, $q, $localStorage, $state, $mdToast, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Accounts";
        
        $scope.message = "";
        $scope.loginModel = {
            userName:"",
            password:"",
            confirmPassword:""
        }
        $scope.signIn = function(){
            authService.login($scope.loginModel.userName, $scope.loginModel.password)
            .then(function(d){
                $mdToast.show(
                    $mdToast.simple()
                      .content("Authenticated")
                      .hideDelay(3000)
                );
                $rootScope.$emit("evtLogged");
            },
            function(e){
               $mdToast.show(
                    $mdToast.simple()
                      .content("Failed to authenticat")
                      .hideDelay(3000)
                ); 
            });
        }
        
        
    }//conroller ends
})();