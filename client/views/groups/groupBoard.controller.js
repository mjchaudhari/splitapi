
(function (){
    angular.module("app")
    .controller("groupBoardController",groupBoardController);
    
    groupBoardController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService","$mdConstant","$mdToast"];
    
    function groupBoardController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast ){
        
        //bindable mumbers
        $scope.title = "Group Details";
        $scope.promices = {};
        $scope._id = $stateParams.g;
        $scope.group = null;
        $scope.groupCopy = null;

        $scope.selectedMembers = null;
        
        $scope.view = $stateParams.v;
        
        $scope.searchText ="";
        $scope.searchResult = [];
        
        function showSimpleToast (message) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(message)
                .position('bottom')
                .hideDelay(3000)
                .action('OK')
            );
        };

        var preInit = function(){
            var tasks = [];
            tasks.push(getGroupDetail());
            tasks.push(getTopics());
            $q.all([
                tasks
            ])
            .then(function(){
                init()
            });
        }

        var init = function(){

        };

        function getGroupDetail (){
            $scope.promices.groupBoard = dataService.getGroup($scope._id)
            .then(function(d){
                $scope.group = angular.copy(d.data.data[0]);
                if($scope.group.members){
                    $scope.group.members.forEach(function(m){
                        m._name = m.firstName + ' ' + m.lastName;
                    })
                }
                $scope.groupCopy = angular.copy($scope.group);
            },
            function(e){

            });
            return $scope.promices.groupPromice;
        }
        function getTopics (){
            $scope.promices.groupTopics = dataService.getAssets({groupId:$scope._id})
            .then(function(d){
                $scope.topics = angular.copy(d.data.data[0]);
            },
            function(e){

            });
            return $scope.promices.groupPromice;
        }

        preInit();


    }//conroller ends
})();