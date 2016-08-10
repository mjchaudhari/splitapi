
(function (){
    angular.module("app")
    .controller("assetEditController",assetEditController);
    
    assetEditController.$inject = ["$scope", "$rootScope", "$log", "$q", "$timeout",  "$state", "$stateParams", "dataService", "config","authService","$mdConstant","$mdToast", "Upload"];
    
    function assetEditController($scope, $rootScope,  $log, $q,$timeout, $state, $stateParams, dataService, 
            config, authService, $mdConstant, $mdToast, Upload){
        
        //bindable mumbers
        $scope.title    = "Edit Assets";
        $scope.assetId  = $stateParams.a;
        $scope.groupId  = $stateParams.g;
        $scope.parentId = $stateParams.p == undefined ? $stateParams.g : $stateParams.p;
        $scope.assetType = $stateParams.type;
        $scope.groupMembers = [];
        $scope.types = [];
        $scope.tempData = {
                "Owners":[],
                "Accessibility":[]
        };
        $scope.errorMessage=[];
        $scope.file=null;
        $scope.promises = {};

        $scope.taskStatuses = [
            "Pending",
            "In Progress",
            "Completed",
            "Closed"
        ]
        $scope.taskUpdateMessage = "";

        $scope.asset = {
            "_id":$scope.assetId,
            "AssetType" : $scope.assetType,
            "AssetTypeId" : $scope.assetType != null ? $scope.assetType : null,
            "Name":"",
            "Description":"",
            "Thumbnail":"",
            "Urls":"",
            "GroupId":$scope.groupId,
            "ParentIds":[$scope.parentId],
            "AllowLike":true,
            "AllowComment":true,
            "Publish":true,
            "ActivateOn":new Date(),
            "AssetCategory":null,
            "Accessibility" : []
        };
        
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
            var typePromise = getTypes();
            var membersPromise = _getUsers();
            
            $q.all([
                assetPromise,typePromise,membersPromise
            ])
            .then(function(){
                if($scope.asset.AssetTypeId == "type_task"){
                    if($scope.asset.Owners == null){
                            $scope.asset.Owners = [];
                    }
                }
                init();
            });
        }
    
        var init = function(){
            $log.debug("Init executed")
            
                var assetType = _.find($scope.types,{ "_id": $scope.assetType});
                $scope.asset.AssetType = assetType;
            
            
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
                    if($scope.asset.Accessibility == null){
                        $scope.asset.Accessibility= []
                    }

                    $scope.asset.Accessibility.forEach(function(m){
                        m._name = m.FirstName + ' ' + m.LastName;
                    })
                    
                    if($scope.asset.Files != null && $scope.asset.Files.length >= 0){
                            var thumbnails = _.pluck($scope.asset.Files, "thumbnailLink")
                            $scope.asset._thumbnails = thumbnails;
                    }else{
                            //$scope.asset._thumbnials = [$scope.asset.Thumbnail];
                    }
                
                    angular.copy($scope.asset.Accessibility, $scope.tempData.Accessibility); 
                    angular.copy($scope.asset.Owners, $scope.tempData.Owners); 
                    
                    defer.resolve($scope.asset);    
                },
                function(e){
                    defer.reject();
                });    
            }
            return defer.promise;
        }
        function getTypes (){
            var defer = $q.defer();
            $scope.promises.types = dataService.getConfigCategories(null,"AssetType")
            .then(function(d){
                $scope.types = angular.copy(d.data.data);
                $log.debug("getCategories resolved");
                defer.resolve(d.data.data);    
            },
            function(e){
                defer.reject();
            });    
            return defer.promise;
        }
        
        function _getUsers(){
            var defer = $q.defer();
            dataService.getGroupMembers($scope.groupId)
            .then(function(d){   
                var users = [];
                d.data.data.forEach(function(m){
                    m._name = m.FirstName + ' ' + m.LastName;
                })

                angular.copy(d.data.data, $scope.groupMembers);
                defer.resolve($scope.groupMembers);
            });
            return defer.promise;
        }
        $scope.querySearchWorking = function (term){
            $scope.searchResult=[];
            if(term && term.length > 0){

            }
            var defer = $q.defer();
            dataService.getUsers(term)
            .then(function(d){
                var result = [];
                angular.copy(d.data.data, result);
                result.forEach(function(u){
                    u._name = u.FirstName + ' ' + u.LastName;
                    //check if this user is alredy added
                    var exist = _.findWhere($scope.asset.Accessibility,{"_id":u._id});
                    if(exist){
                        u.__added = true;
                    }
                })
                var sorted = _.sortBy(result,"_name");
                //angular.copy(sorted,$scope.searchResult)
                defer.resolve(sorted)
            }, function(){
              defer.reject()  ;
            });
            return defer.promise;
        }
        $scope.querySearch = function(term){
            $scope.searchResult=[];
            if(term && term.length > 0){

            }
            var defer = $q.defer();
            $timeout(function(){
                var regex = new RegExp(term,"i");
                var members = _.filter($scope.groupMembers,function(m){
                    return m._name.match(regex);
                });
                members.forEach(function(u){
                    u._name = u.FirstName + ' ' + u.LastName;
                    //check if this user is alredy added
                    var exist = _.findWhere($scope.asset.Accessibility,{"_id":u._id});
                    if(exist){
                        u.__added = true;
                    }
                });
                defer.resolve(members)
            },100)
                
            return defer.promise;
        }
        $scope.cancel = function() {
            $scope.$back();
        };
        $scope.toggleComentSetting = function(){
            $scope.asset.AllowComment = !$scope.asset.AllowComment; 
        }
        $scope.toggleLikeSetting = function(){
            $scope.asset.AllowLike = !$scope.asset.AllowLike; 
        }
        $scope.saveAsset = function(){

            // if($scope.file){
            //     _uploadAssetFile().then(function (f) {
            //         //get file names and add to the asset
            //         $scope.asset.Urls = f.fileName;
            //         return _saveAssetData()
            //     });
            // }
            // else{
            //     return _saveAssetData()
            // }
            return _saveAssetData();
        }
        
        function _saveAssetData(){
            if($scope.asset.ParentIds == undefined ){
                $scope.asset.ParentIds = [$scope.parentId];
            } 
            else if($scope.asset.ParentIds.length == 0){
                $scope.asset.ParentIds = [$scope.parentId];
            }
            
            if($scope.asset.ExpireOn && isNaN($scope.asset.ExpireOn.getDate())){
                $scope.asset.ExpireOn = new Date(9999,12,31)
            }
            
            //get owners and Accessibility data
            if($scope.tempData.Accessibility){
                $scope.asset.Accessibility = _.pluck($scope.tempData.Accessibility, "_id");        
            }

            if($scope.tempData.Owners){
                $scope.asset.Owners = _.pluck($scope.tempData.Owners, "_id");        
            }
            

            var defer = $q.defer();
            // upload on file select or drop
            Upload.upload({
                url: config.apiBaseUrl + "/v1/asset",
                data: $scope.asset
            }).then(function (d) {
                $scope.asset = d.data.data;
                    if($scope.asset.Accessibility == null){
                        $scope.asset.Accessibility =[];
                    }
                    if(d.data.data.ExpireOn){
                        $scope.asset.ExpireOn = new Date(d.data.data.ExpireOn);
                        $scope.asset.neverExpire = false;
                    }
                    else{
                        $scope.asset.neverExpire = true;
                    }
                    $scope.asset.Accessibility.forEach(function(m){
                        m._name = m.FirstName + ' ' + m.LastName;
                    })
                defer.resolve(d.data.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
                defer.resolve(resp);
            }, function (evt) {

                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + $scope.progressPercentage + '% ' );
                console.log(evt);
            });
            return defer.promise;
        }
        function _uploadAssetFile (){
            var defer = $q.defer();
            // upload on file select or drop
            Upload.upload({
                url: config.apiBaseUrl + "/v1/asset",
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
        $scope.addUpdate = function(){
            if($scope.taskUpdateMessage != null && $scope.taskUpdateMessage != ""){
                if($scope.asset.TaskUpdates == null){
                    $scope.asset.TaskUpdates = []
                }
                $scope.asset.TaskUpdates.push({
                    Update : $scope.taskUpdateMessage,
                    UpdatedOn : new Date(),
                    UpdatedBy : "Me"

                });
            }
        }
        preInit();
    }//conroller ends
})();