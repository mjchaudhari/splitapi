(function (){
    angular.module("app")
    .controller("indexController",indexController);
    
    indexController.$inject = ["$scope", "$log", "$state" ,"dataService", "config","authService","$mdSidenav"];
    
    function indexController($scope, $log, $state, dataService, config, authService, $mdSidenav){
        
        function init(){
                authService.isAuthenticated()
                .then( function(d){
                    if(d.isError){
                        
                    }
                }, function(e){
                    
                })
        }
        init();
    }//conroller ends
})();