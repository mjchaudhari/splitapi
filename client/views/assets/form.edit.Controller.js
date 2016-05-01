
(function (){
    angular.module("app")
    .controller("formEditController",formEditController);
    
    formEditController.$inject = ["$scope", "$rootScope", "$log", "$q", "$timeout",  "$state", "$stateParams", "dataService", "config","authService","$mdConstant","$mdToast", "Upload","$mdBottomSheet","params"];
    
    function formEditController($scope, $rootScope,  $log, $q,$timeout, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast, Upload,$mdBottomSheet,params ){
        
        //bindable mumbers
        $scope.title    = "Edit Assets";
        if(params == null){
            pditms = {};
        }
        $scope.assetId  = paramsEditetId;
        $scope.groupId  = params.groupId;
        $scope.parentId = params.parentId;
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
            var assetPromise = getAsset($scope.assetId);
            var categoryPromise = getCategories();
            
            $q.all([
                assetPromise,categoryPromise
            ])
            .then(function(){
                init()
            });
        }
    
        var init = function(){
            $log.debug("Init executed")
        };
        
        function getAsset (id){
            var defer = $q.defer();
            
            if(id == null || id== 0){
                $timeout(function(){
                    $log.debug("getAsset resolved");
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
                    defer.resolve(d.data.data);    
                },
                function(e){
                    defer.reject();
                });    
            }
            return defer.promise;
        }
        function getCategories (){
            var defer = $q.defer();
            $scope.promises.categories = dataService.getCategories()
            .then(function(d){
                $scope.categories = angular.copy(d.data.data);
                $log.debug("getategories resolved");
                defer.resolve(d.data.data);    
            },
            function(e){
                defer.reject();
            });    
            return defer.promise;
        }
        
        $scope.cancel = function() {
            $mdBottomSheet.hide();
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
                    $mdBottomSheet.hide(d);
                },
                function(e){
                    showToast(e.message);
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
        var showToast = function(msg,type) {
            if(type && type=="error"){
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(msg)
                    .position('left')
                    .hideDelay(3000)
                );    
            }
            else{
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(msg)
                    .position('left')
                    .hideDelay(3000)
                );
            }
            
        };
        
        preInit();
    }//conroller ends
})();