(function (){
    angular.module("app")
    .controller("accountController",accountController);
    
    accountController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function accountController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
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
                $rootScope.$emit("evtLogged");
            },
            function(e){
                
            });
        }
        
        
    }//conroller ends
})();