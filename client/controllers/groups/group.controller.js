
(function (){
    angular.module("app")
    .controller("groupController",groupController);
    
    groupController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService"];
    
    function groupController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Groups";
        $scope.groupsList = [];
        $scope.promices = {};
        $scope._id = $stateParams.id;
        $scope.group = null;
        
        $scope.view = $stateParams.v;
        
        function getGroupDetail (){
            $scope.promices.groupDetail = dataService.getGroup($scope._id)
            .then(function(d){
                $scope.group = angular.copy(d.data.data[0]);
            },
            function(e){

            });
            return $scope.promices.groupPromice;
        }

        var preInit = function(){
            var tasks = [];
            tasks.push(getGroupDetail());
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