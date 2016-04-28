
(function (){
    angular.module("app")
    .controller("assetEditController",assetEditController);
    
    assetEditController.$inject = ["$scope", "$rootScope", "$log", "$q", "$timeout",  "$state", "$stateParams", "dataService", "config","authService","$mdConstant","$mdToast", "Upload"];
    
    function assetEditController($scope, $rootScope,  $log, $q,$timeout, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast, Upload ){
        
        //bindable mumbers
        $scope.title    = "Edit Assets";
        $scope.assetId       = $stateParams.assetId;
        $scope.groupId  = $stateParams.groupId;
        $scope.parentId = $stateParams.pId;
        $scope.categories = [];
        
        $scope.errorMessage=[];
        $scope.file=null;
        $scope.promises = {};
        $scope.asset = {
            "_id":$scope.assetId,
            //"CategoryId" : $scope.selectedCategory._id,
            "Name":"",
            "Description":"",
            "Thumbnail":"",
            "Urls":"",
            "GroupId":$scope.groupId,
            "ParentId":$scope.parentId,
            "AllowLike":true,
            "AllowComment":true,
            "Publish":true,
            "ActivateOn":new Date(),
            "AssetCategory":null
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
            tasks.push(getAsset($scope.assetId));
            tasks.push(getCategories());
            
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
                $scope.promises.assetList = dataService.getAsset(id)
                .then(function(d){
                    $scope.asset = angular.copy(d.data.data);
                    $scope.asset.ActivateOn = new Date(d.data.data.ActivateOn);
                    if(d.data.data.ExpireOn){
                        $scope.asset.ExpireOn = new Date(d.data.data.ExpireOn);
                        $scope.asset.neverExpire = false;
                    }
                    else{
                        $scope.asset.neverExpire = true;
                    }
                    defer.resolve();    
                },
                function(e){
                    defer.reject();
                });    
            }
            return $scope.promises.asset;
        }
        function getCategories (){
            var defer = $q.defer();
            $scope.promises.categories = dataService.getCategories()
            .then(function(d){
                $scope.categories = angular.copy(d.data.data);
                defer.resolve();    
            },
            function(e){
                defer.reject();
            });    
            return $scope.promises.asset;
        }
        
        $scope.cancel = function() {
            navigator.back();
        };
        $scope.toggleComentSetting = function(){
            $scope.asset.AllowComment = !$scope.asset.AllowComment; 
        }
        $scope.toggleLikeSetting = function(){
            $scope.asset.AllowLike = !$scope.asset.AllowLike; 
        }
        $scope.saveAsset = function(){
            if($scope.asset._id == null){
                _createAsset().then(
                    function (d) {
                        if($scope.file){
                            _uploadAssetFile().then(function (f) {
                                //get file names and add to the asset
                                $scope.asset.Urls = f.fileName;
                                return _saveAssetData()
                            });
                        }
                    }
                );
            }
            else{
                if($scope.file){
                    _uploadAssetFile().then(function (f) {
                        //get file names and add to the asset
                        $scope.asset.Urls = f.fileName;
                        return _saveAssetData()
                    });
                }
                else{
                    return _saveAssetData()
                }
            }
            
            
        }
        function _createAsset(){
            return dataService.createAsset($scope.asset).then(
                function(d){
                    $scope.asset._id = d.data.data._id;       
                },
                function(e){
                    
                }
            )
        }
        function _saveAssetData(){
            return dataService.saveAsset($scope.asset).then(
                function(d){
                    
                },
                function(e){
                    
                }
            )
        }
        function _uploadAssetFile (){
            var defer = $q.defer();
            // upload on file select or drop
            Upload.upload({
                url: 'v1/file',
                data: {file: $scope.file}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                defer.resolve(resp.data.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
                defer.resolve(resp);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
            return defer.promise;
        };
        
        function _saveAssetFiles(){
            var defer = $q.defer();
            if($scope.asset.files || $scope.asset.files && $scope.asset.files.length  > 0)
            {
                $timeout(function(){
                    defer.resolve();
                },500);
            }
            return defer.promise;
        }
        
        function _validateAssetData(){
            if($scope.asset.Name == ""){
                
            }
            if($scope.asset.Description == ""){
                
            }
        }
        $scope.showToast = function(msg) {
            $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position('left')
                .hideDelay(3000)
            );
        };
        
        preInit();
    }//conroller ends
})();