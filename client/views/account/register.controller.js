angular.module("app")
.controller("registerController", function($scope, $log, $state, storageService, dataService, authService){
  $scope.title = "Register";
  $scope.registerModel = {};
  $scope.blockUI = false;
  
  $scope.saveRegistration = function(){
    
    var model = {
        firstName: $scope.registerModel.fn
      , lastName: $scope.registerModel.ln
      , userName: $scope.registerModel.mobileNo
      , clientKey: $scope.registerModel.clientId
      , picture : $scope.registerModel.Thumbnail
    };
    
    authService.register(model).then(
      function(d){
        if(d.data.isError){

          return;
        }
        //toaster.pop('success', 'Registration successful', 'You will shortly recieve the authentication code via SMS.');
        var message = " Please enter your authorization code'";
        
        storageService.add('user',model);
        storageService.add('status',"REQUESTED");
        $state.go("account.registrationSuccess");
      },
      function (e){
        //$scope.addAlert(e.message,"danger");
        //toaster.pop('error', '', e.message);
      });
  }
  
});

