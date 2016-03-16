(function (){
    angular.module("app")
    .controller("accountController",accountController);
    
    accountController.$inject = ["$scope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function accountController($scope, $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        
        $scope.message = "";
        $scope.loginModel = {
            userName:"",
            password:"",
            confirmPassword:""
        }
        $scope.signIn = function(){
            authService.login($scope.loginModel, $scope.passwoed)
            .then(function(d){
                
            },
            function(e){
                
            });
        }
        
        
    }//conroller ends
})();