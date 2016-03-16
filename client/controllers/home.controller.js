(function (){
    angular.module("app")
    .controller("homeController",homeController);
    
    homeController.$inject = ["$scope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService","$mdSidenav"];
    
    function homeController($scope, $log, $q, $localStorage, $state, dataService, config, authService, $mdSidenav){
        
        //bindable mumbers
        $scope.title  = "index";
        $scope.toggleLeft = _toggleLeft;
        $scope.nextTheme = _nextTheme
        $scope.themes = config.themes,
        $scope.theme = $localStorage.theme;
        if($scope.theme == undefined){
            $scope.theme = 0;
        }
        function _toggleLeft(){
            
        }
        //Set next theme
        function _nextTheme (){
            if(($scope.theme + 1) >= config.themes.length){
                $scope.theme = 0;
            }
            else{
                $scope.theme++;
            }
            
            //storageService.add("theme",$scope.theme) ;	
            
            
        }
        $scope.toggleLeft = function(){
            return $mdSidenav('left')
            .toggle();
        }
    }//conroller ends
})();