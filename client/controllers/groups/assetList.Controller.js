

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
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
              list.splice(idx, 1);
            }
            else {
              list.push(item);
            }
        };
        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        $scope.isIndeterminate = function() {
            return ($scope.selected.length !== 0 &&
                $scope.selected.length !== $scope.items.length);
        };
        $scope.isChecked = function() {
            var selected = _.find($scope.assets,"isSelected:true");
            
            return selected.length === $scope.assets.length;
        };
        $scope.toggleAll = function() {
            if ($scope.selected.length === $scope.items.length) {
              $scope.selected = [];
            } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
              $scope.selected = $scope.items.slice(0);
            }
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