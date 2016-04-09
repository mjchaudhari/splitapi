
(function (){
    angular.module("app")
    .controller("assetEditController",assetEditController);
    
    assetEditController.$inject = ["$scope", "$rootScope", "$log", "$q", "$timeout", "dataService", "config","authService","$mdConstant","$mdToast","$mdDialog", "params"];
    
    function assetEditController($scope, $rootScope,  $log, $q,$timeout, dataService, config, authService, $mdConstant, $mdToast, $mdDialog, params ){
        
        //bindable mumbers
        $scope.title    = "Edit Assets";
        $scope.id       = params.id;
        $scope.groupId  = params.groupId;
        $scope.parentId = params.pId;
        
        $scope.promices = {};
        $scope.asset = {
            "_id":$scope.id,
            //"CategoryId" : $scope.selectedCategory._id,
            "Name":"",
            "Description":"",
            "Thumbnail":"",
            "Urls":"",
            "GroupId":$scope.groupId,
            "ParentId":$scope.parentId
        }
        
        $scope.uploadedFiles=null;
        
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
            tasks.push(getAsset($scope.id));
            $q.all([
                tasks
            ])
            .then(function(){
                init()
            });
        }
    
        var init = function(){
        
        };
        
        function getAsset (id){
            var defer = $q.defer();
            
            if(id == null || id== 0){
                $timeout(function(){
                    defer.resolve();
                },100)
            }
            else{
                $scope.promices.assetList = dataService.getAsset($scope.id)
                .then(function(d){
                    $scope.asset = angular.copy(d.data.data);
                    defer.resolve();    
                },
                function(e){
                    defer.reject();
                });    
            }
            return $scope.promices.asset;
        }

        preInit();
    }//conroller ends
})();