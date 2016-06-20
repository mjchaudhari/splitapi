

(function (){
    angular.module("app")
    .controller("assetLstController",assetLstController);
    
    assetLstController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService","$mdConstant","$mdToast", "$mdBottomSheet"];
    
    function assetLstController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast, $mdBottomSheet ){
        
        //bindable mumbers
        $scope.title = "Assets Crtl";
        $scope.groupId = $stateParams.g;
        $scope.parentId = $stateParams.p;
        $scope.breadcrumb = [];
        $scope.promices = {};
        $scope.parent = null;
        $scope.assets = [];
        
        $scope.hierarchy = null;
        $scope.selectedNode = null;
        $scope.nodeParentTrail = null;

        $scope.searchText ="";
        $scope.searchResult = [];
        
        $scope.isAllChecked = false;
        $scope.isIndeterminate = false;
        $scope.filter = {
            groupId:$scope.groupId,
            parentId:$scope.parentId,
            count:null,
            from:null
        };

        $scope.hierarchyTreeOptions = {
            idAttrib        : "_id",
            nameAttrib      : "Name",
            childrenAttrib  : "Children"
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
       
        $scope.selectAllChecked = function() {
            var selected = _.where($scope.assets,{"__isSelected":true});
            $scope.toggleAll()
            return selected.length === $scope.assets.length;
        };
        $scope.toggle = function (asset) {
            if(asset.__isSelected){
                asset.__isSelected = !asset.__isSelected;    
            }
            else{
                asset.__isSelected = true;
            }
            determineSelectAll()
        };

        $scope.toggleAll = function() {
            var status = $scope.isAllChecked;
            _.forEach($scope.assets, function(a){
                a.__isSelected = status;
            });        
        };
        
        $scope.createAsset = function($event){
            // var parentEl = angular.element(document.body);
            // var params = {
            //         id: 0,
            //         groupId : $scope.groupId,
            //         parentId:$scope.parentId
            //     };
            // $mdDialog.show({
            //     parent: parentEl,
            //     targetEvent: $event,
            //     templateUrl:"./views/groups/asset.edit.html",
            //     fullscreen:true,
            //     locals: {params},
            //     controller: 'assetEditController'
            // })
            
        }
        
        $scope.view = function(a){
            $mdBottomSheet.hide();    
        }
        
        $scope.edit = function(a,assetType){
            var params = {
                    assetId: a._id,
                    groupId : a.GroupId,
                    parentId:a.ParentId,
                    assetType : assetType
                };
            $mdBottomSheet.show({
                templateUrl: './views/assets/asset.edit.html',
                controller: 'assetEditController',
                clickOutsideToClose: false,
                locals  : {params}
                })
                .then(function(result) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent("Done")
                        .position('top right')
                        .hideDelay(1500)
                    );
                    //Update the folder in tree
                    var asset = result.data.data;
                    if(asset.AssetTypeId == "type_collection"){
                        getAssetHierarchy();
                    }
                    init();
                    $state.transitionTo("home.group.assets",{"g":$scope.groupId, "p" : $scope.parentId}, {"notify":false});
                    
                });
        }

        $scope.onAssetSelected = function(node){
            
            $scope.selectedAsset = node;
            $scope.parentId = node._id;
            $scope.filter.parentId = node._id;
            init();

            $state.transitionTo("home.group.assets",{"g":$scope.groupId, "p" : $scope.parentId}, {"notify":false});
        }
        
        $scope.onRowSelected = function (asset){
            
            $log.debug("dbl clicked!" + asset._id);
            
            if(asset.AssetTypeId == "type_collection"){
                //open folder
                $scope.parentId = asset._id;
                $scope.filter.parentId = asset._id;
                init();
                
                $state.transitionTo("home.group.assets",{"g":$scope.groupId, "p" : $scope.parentId}, {"notify":false});
            }
            else{
                //openInviewer(asset._id);
                $log.debug('open in viewer');
            }
        }
        $scope.createNewAsset = function(type,$event){
            var params = {
                    //assetId: a._id,
                    groupId : $scope.groupId,
                    parentId: $scope.ParentId,
                    assetType: type
            };
            $mdBottomSheet.show({
                templateUrl: './views/assets/asset.edit.html',
                controller: 'assetEditController',
                clickOutsideToClose: false,
                locals: {params}
            })
            .then(function(clickedItem) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('clicked!')
                    .position('top right')
                    .hideDelay(1500)
                );
                //Update the folder in tree
                var asset = result.data.data;
                if(asset.AssetTypeId == "type_collection"){
                    getAssetHierarchy();
                }
                init();
                $state.transitionTo("home.group.assets",{"g":$scope.groupId, "p" : $scope.parentId}, {"notify":false});
                
            });
        }
        function determineSelectAll(){
            var selected = _.where($scope.assets,{"__isSelected":true});
            $scope.isAllChecked = selected.length === $scope.assets.length;
            if(selected.length == 0 ||
                selected.length === $scope.assets.length){
                $scope.isIndeterminate = false;    
            }
            else{
                $scope.isIndeterminate = selected.length != $scope.assets.length;    
            }

        }
        var preInit = function(){
               var tasks = [];
            tasks.push(getAssetHierarchy());
            $q.all([
                tasks
            ])
            .then(function(){
                init();      
                
            });
            
        }
    
        var init = function(){
            var tasks = [];
            tasks.push(getAssets());  
            
            $q.all([
                tasks
            ])
            .then(function(){
                  //set selectedNode
                  
            });
        };
        function getAssets (){
            
            $scope.promices.assetList = dataService.getAssetTree($scope.filter)
            .then(function(d){
                $scope.parent = d.data.data;
                $scope.breadcrumb = [d.data.data];
                setParent($scope.parentId);
                angular.copy(d.data.data.Children, $scope.assets);                
            },
            function(e){
            });
            return $scope.promices.assetList;
        }

        function getAssetHierarchy(){
            
            var filter = {
                parentId : $scope.filter.groupId,
                groupId : $scope.filter.groupId,
                structureOnly : true
            }
            $scope.promices.hierarchy = dataService.getAssetTree(filter)
            .then(function(d){
                $scope.parent = d.data.data;
                $scope.breadcrumb = [d.data.data];
                $scope.hierarchy = angular.copy(d.data.data);   
                
                //setTree($scope.parent._id);
            },
            function(e){

            });
            return $scope.promices.hierarchy;
        }

        function setParent(parentId){
            //Select node from tree t highlight
            _hlp.treeWalker($scope.hierarchy, function(n){
                if(n && n ._id == parentId){
                    $scope.selectedNode = n;
                }
            });
        }

        preInit();


    }//conroller ends
})();