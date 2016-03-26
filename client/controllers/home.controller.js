(function (){
    angular.module("app")
    .controller("homeController",homeController);
    
    homeController.$inject = ["$scope", "$log", "$q", "$localStorage", "$state" ,"dataService", 
        "config","$mdSidenav","authService","$mdDialog"];
    
    function homeController($scope, $log, $q, $localStorage, $state, dataService, 
        config, $mdSidenav, authService, $mdDialog){
        
        //bindable mumbers
        $scope.title  = "index";
        $scope.nextTheme = _nextTheme
        $scope.themes = config.themes,
        $scope.theme = $localStorage.theme;
        $scope.user = $localStorage.__splituser;
        //$scope.fabOpen = false;
        $scope.groupsList = [];
        $scope.promices = {};
        
        if($scope.theme == undefined){
            $scope.theme = 0;
        }
        
        $scope.logoff = function(ev){
            //TODO; Ask for confirmation here
            
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                  .title('Log off')
                  .textContent('Unsaved data will be lost. Are you sure you want to logoff?')
                  .ariaLabel('Lucky day')
                  .targetEvent(ev)
                  .ok('Yes, Log off.')
                  .cancel('No, Do not logoff');

            $mdDialog.show(confirm)
            .then(function() {
                authService.logOut();
                $state.go("landing")
                }, 
                function() {
                    $scope.status = 'You decided to keep your debt.';
                });
           
        }
        $scope.toggleLeft = function(){
            return $mdSidenav('left')
            .toggle();
        }

        function _toggleLeft(){
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                  .title('Log off')
                  .textContent('Unsaved data will be lost. Are you sure you want to logoff?')
                  .ariaLabel('Lucky day')
                  .targetEvent(ev)
                  .ok('Yes, Log off.')
                  .cancel('No, Do not logoff');

            $mdDialog.show(confirm)
            .then(function() {
                authService.logOut();
                $state.go("landing")
                }, 
                function() {
                    $scope.status = 'You decided to keep your debt.';
                });
           
        }
        $scope.toggleSideBar = function(id){
            return $mdSidenav(id)
            .toggle();
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

        function getGroups (){
            $scope.promices.groupsPromice = dataService.getGroups()
            .then(function(d){
                angular.copy(d.data.data, $scope.groupsList);
            },
            function(e){

            });
            return $scope.promices.groupsPromice;
        }

        var preInit = function(){
            var tasks = [];
            tasks.push(getGroups());
            $q.all([
                tasks
            ])
            .then(function(){
                init()
            });
        }

        var init = function(){

        };

        preInit();

    }//conroller ends
})();