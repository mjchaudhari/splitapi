

(function (){
    angular.module("app")
    .controller("fileLstController",fileLstController);
    
    fileLstController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService","$mdConstant","$mdToast", "$mdDialog", "$mdBottomSheet"];
    
    function fileLstController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast, $mdDialog, $mdBottomSheet ){
        
        //bindable mumbers
        $scope.title = "Uploaded Files";
        $scope.groupId = $stateParams.g;
        $scope.parentId = $stateParams.p;
        $scope.breadcrumb = [];
        $scope.promices = {};
        
        $scope.hierarchy = null;
        $scope.selectedNode = null;
        
        $scope.searchText ="";
        $scope.searchResult = [];
        
        $scope.hierarchyTreeOptions = {
            idAttrib        : "id",
            nameAttrib      : "name",
            childrenAttrib  : "children"
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
       
        
        $scope.onAssetSelected = function (asset){
            $log.debuf(asset.Name);
            
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
            tasks.push(getFiles());  
            
            $q.all([
                tasks
            ])
            .then(function(){
                  //set selectedNode
                  
            });
        };
        function getFiles (){
            
            $scope.promices.tree = dataService.getFileTree($scope.groupId)
            .then(function(d){
                $scope.parent = d.data.data;
                $scope.breadcrumb = [d.data.data];
                setParent($scope.parentId);
                angular.copy(d.data.data.Children, $scope.assets);                
            },
            function(e){
            });
            return $scope.promices.tree;
        }

        function getAssetHierarchy(){
            $scope.promices.hierarchy = dataService.getFileTree($scope.groupId)
            .then(function(d){
                $scope.breadcrumb = [d.data.data];
                $scope.hierarchy = angular.copy(d.data.data);   
                $scope.selectedNode = $scope.hierarchy; 
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