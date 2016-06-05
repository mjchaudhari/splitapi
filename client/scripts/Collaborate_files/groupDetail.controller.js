
(function (){
    angular.module("app")
    .controller("groupDetailController",groupDetailController);
    
    groupDetailController.$inject = ["$scope", "$rootScope", "$log", "$q", "$localStorage", "$state", "$stateParams" ,"dataService", "config","authService","$mdConstant","$mdToast"];
    
    function groupDetailController($scope, $rootScope,  $log, $q, $localStorage, $state, $stateParams, dataService, config, authService, $mdConstant, $mdToast ){
        
        //bindable mumbers
        $scope.title = "Group Details";
        $scope.promices = {};
        $scope._id = $stateParams.id;
        $scope.group = null;
        $scope.groupCopy = null;

        $scope.selectedMembers = null;
        
        $scope.view = $stateParams.v;
        
        $scope.searchText ="";
        $scope.searchResult = [];
        
        $scope.querySearch   = _querySearch;
        $scope.saveGroupDetails = _saveGroupDetails;

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
            $scope.promices.groupDetail = dataService.getGroup($scope._id)
            .then(function(d){
                $scope.group = angular.copy(d.data.data[0]);
                if($scope.group.Members){
                    $scope.group.Members.forEach(function(m){
                        m._name = m.FirstName + ' ' + m.LastName;
                    })
                }
                $scope.groupCopy = angular.copy($scope.group);
            },
            function(e){

            });
            return $scope.promices.groupPromice;
        }

        function _querySearch(term){
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
                    var exist = _.findWhere($scope.group.Members,{"_id":u._id});
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
        
        function _getUsers(term){
            var defer = $q.defer();
            dataService.getUsers(term)
            .then(function(d){   
                var users = [];
                d.data.data.forEach(function(u){
                    u.Name = u.FirstName + ' ' + u.LastName;
                });
                defer.resolve(d.data.data);
            });
            return defer.promise;
        }
        
        function _saveGroupDetails(){
            //basic validation
            if($scope.group.Name == ""){
                showSimpleToast("Group name requied");
                return;
            }

            dataService.saveGroup($scope.group)
            .then(function(g){
                $scope.showToast("Group saved.");
                //if this group is created by current user then allow user to manage users
                $scope.group._id = g.data._id;
                $scope.group.Members = g.data.Members;
                $scope.group.CreatedBy = g.data.CreatedBy;
                showSimpleToast("Group saved");
            },
            function(e){
                $log.error(e);
            });
        }
        

        preInit();


    }//conroller ends
})();