
(function (){
    angular.module("app")
    .controller("groupsController",groupsController);
    
    groupsController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function groupsController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Groups";
        $scope.groups = [];
        $scope.promices = {};

        function getGroups (){
            $scope.promices.groupsPromice = dataService.getGroups()
            .then(function(d){
                angular.copy(d.data.data, $scope.groups);
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