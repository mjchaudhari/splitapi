(function (){
    angular.module("app")
    .controller("indexController",indexController);
    
    indexController.$inject = ["$scope", "$rootScope","$q", "$log", "$state" ,"dataService", "config","$mdSidenav","authService"];
    
    function indexController($scope, $rootScope, $q, $log, $state, dataService, config, $mdSidenav,authService){
        $scope.initializingPromice = null;

        function init(){
            $scope.initializingPromice = authService.isAuthenticated()
            .then(function(d){
                $log.log("Initialized...")
            })
//             $scope.initializingPromice = $q.all([
//                 authService.isAuthenticated()
//             ]).then(function(d){
//                 $log.log("Initialized...")
//             })

        }
        
        $rootScope.$on("evtLogged", function(){
            $log.info("index logged in");
            if($state.params.returnUrl){

            }
            else{
                $state.go("home.dashboard");
            }
        })
        
        $rootScope.$on("onUnauthenticatedAccess", function(){
            $log.info("Require login");
            var returnUrl = ""
        })
        
        init();
    }//conroller ends
})();