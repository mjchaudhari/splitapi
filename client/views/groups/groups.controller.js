
(function (){
    angular.module("app")
    .controller("groupsController",groupsController);
    
    groupsController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state","$stateParams" ,"dataService", "config","authService"];
    
    function groupsController($scope, $rootScope,  $log, $q, $localStorage, $state, stateParams, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Groups";
        $scope.groupsList = [];
        $scope.promices = {};
        
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