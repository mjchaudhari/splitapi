

(function (){
    angular.module("app")
    .controller("assetLstController",assetLstController);
    
    assetLstController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService","$mdConstant","$mdToast"];
    
    function assetLstController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast ){
        
        //bindable mumbers
        $scope.title = "Assets Crtl";
        $scope.groupId = $stateParams.id;
        $scope.parentId = $stateParams.pId;
        $scope.promices = {};
        $scope.assets = [];
        $scope.searchText ="";
        $scope.searchResult = [];
        
        $scope.filter = {
            groupId:$scope.groupId,
            parentId:$scope.parentId,
            count:null,
            from:null
        };

        function showSimpleToast (message) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(message)
                .position('top')
                .hideDelay(3000)
                .action('OK')
            );
        };

        var preInit = function(){
            var tasks = [];
            tasks.push(getAssets());
            $q.all([
                tasks
            ])
            .then(function(){
                init()
            });
        }

        var init = function(){

        };

        function getAssets (){
            
            $scope.promices.assetList = dataService.getAssets($scope.filter)
            .then(function(d){
                angular.copy(d.data.data, $scope.assets);
                
            },
            function(e){

            });
            return $scope.promices.assetList;
        }

        preInit();


    }//conroller ends
})();