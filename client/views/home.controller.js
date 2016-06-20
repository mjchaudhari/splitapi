(function (){
    angular.module("app")
    .controller("homeController",homeController);
    
    homeController.$inject = ["$scope", "$log", "$q", "$localStorage", "$mdToast",  "$state","$stateParams" ,"dataService", 
        "config","$mdSidenav","authService","$mdDialog","$mdBottomSheet"];
    
    function homeController($scope, $log, $q, $localStorage, $mdToast, $state, $stateParams, dataService, 
        config, $mdSidenav, authService, $mdDialog,$mdBottomSheet){
        
        //bindable mumbers
        $scope.title  = "index";
        $scope.nextTheme = _nextTheme
        $scope.themes = config.themes,
        $scope.theme = $localStorage.theme;
        $scope.user = $localStorage.__splituser;
        //$scope.fabOpen = false;
        $scope.groupsList = [];
        
        $scope.options = {
            idAttrib        : "Id",
            nameAttrib      :"Name",
            childrenAttrib  : "Children",
        };
        $scope.nodeParentTrail=[];
        $scope.selectedMenu = null;
        $scope.menu = null;
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
                var sectionHeader = {
                        Id: 'Groups',
                        Name: 'Groups',
                        Children: [],
                        icon:'group'
                }

                

                //build menu sections
                $scope.groupsList.forEach(function(g){
                   
                   var section = {
                       Id:g._id,
                       Name: g.Name,
                       icon:'people_outline',
                       Children:[
                           {
                                Id:g._id+1,
                                Name: 'Info',
                                icon:'info',
                                parentId:g._id
                            },
                            {
                                Id:g._id + 2,
                                Name: 'Assets',
                                icon:'list',
                                parentId:g._id
                            },
                            {
                                Id:g._id + 3,
                                Name: 'Analytics',
                                icon:'assessment',
                                parentId:g._id
                            }
                            
                       ] 
                   };
                   sectionHeader.Children.push(section);
                });
                
                $scope.menu = sectionHeader;
            },
            function(e){

            });
            return $scope.promices.groupsPromice;
        }
        $scope.onSelect = function(node){
            $log.debug(node);
            $scope.selectedMenu = node;

            switch (node.Name) {
                case "Info":{
                    $state.go("home.group.detail", {"g":node.parentId});
                    break;
                }
                case "Assets":{
                    $state.go("home.group.assets", {"g":node.parentId, "p":node.parentId});
                    break;
                }
                case "Analytics":{
                    $state.go("home.group.analytics",{"g":node.parentId});
                    break;
                }
            }
            
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