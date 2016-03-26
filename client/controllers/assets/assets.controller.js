
(function (){
    angular.module("app")
    .controller("assetsController",assetsController);
    
    assetsController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state" ,"dataService", "config","authService"];
    
    function assetsController($scope, $rootScope,  $log, $q, $localStorage, $state, dataService, config, authService){
        
        //bindable mumbers
        $scope.title = "Assets";

        $scope.groups={
            selected : null
        }
        $scope.assets.tree = {
            "_id":0,
            "Name":"My Groups",
            "Children":$scope.groupsList
        }
        
        $scope.assets.treeOpts = {
            "idAttrib":"_id",
            "nameAttrib":"Name",
            "childrenAttrib":"Children"
        }
        
    }//conroller ends
})();