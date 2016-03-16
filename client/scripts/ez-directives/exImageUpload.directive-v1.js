(function() {
  
  var module = null;
  try {
        module = angular.module('ezDirectives');;
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }
  
  this.ezImageUploadTemplate = [
      '<md-card>',
        '<md-card-content layout="row" layout-align="space-between">',
          '<img ng-if="img != null" ng-src="{{img}}" style="border:4;align-self:center;height:auto; width:auto;max-height:150px; max-width:150px;" class="md-card-image" alt="No image">',
          '<img ng-if="img == null" ng-src="{{defaultImage}}" style="border:4;align-self:center;height:auto; width:auto;max-height:150px; max-width:150px;" class="md-card-image" alt="Default">',

          '<md-card-actions layout="column" layout-align="end center">',
            '<md-button class="md-primary md-raised md-icon-button accent" aria-label="Settings"',
             'ngf-select="uploadFiles($file, $invalidFiles)" accept="image/*" ngf-max-height="1000" ngf-max-size="1MB">',
              '<i class="material-icons">add_a_photo</i>',
            '</md-button>',

            '<md-button class="md-primary md-icon-button md-raised accent" aria-label="reset" ng-click="alert();resetImage()">',
              '<i class="material-icons">restore</i>',
            '</md-button>',
          '</md-card-actions>',
        '</md-card-content>',
      '</md-card>',


    
    ].join('\n');
    
  module.directive('ezImageUpload', [
    '$timeout', function($timeout) {
      return {
        restrict: 'AE',
        template: this.ezImageUploadTemplate,
        replace: true,
        scope: {
          img: '=',
          defaultImage: "=?"
        },
        //controller start
        controller: ["$scope","Upload", function ($scope, Upload) {
          var originalImg = $scope.img;
          var img = undefined;
          //$scope.defaultImage = "./content/images/group-default3.png";
          
          var init = function(){
            
          }
          
          $scope.resetImage = function(){
                  if(originalImg ){
                          $scope.img = originalImg;
                  }
                  else if($scope.defaultImage)
                  {
                         $scope.img = $scope.defaultImage; 
                  }
          }
          $scope.uploadFiles = function(file, errFiles){
                
                if (file) {
                    var baseUrl = config.apiBaseURL
                    file.upload = Upload.upload({
                        url: config.apiBaseUrl + '/v1/file',
                        data: {file: file}
                    });

                    file.upload.then(function (response) {
                        $timeout(function () {
                            //file.result = response.data;
                            if(!response.data.isError){
                                $scope.img = response.data.url;
                            }
                        });
                    }, function (response) {
                        if (response.status > 0)
                            $scope.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        file.progress = Math.min(100, parseInt(100.0 * 
                                                 evt.loaded / evt.total));
                    });
                }
          }

          $scope.$watch('img', function(newValue, oldValue){
              if(newValue)
              {
                  $scope.img = newValue;
              }
          });
          $scope.$watch('defaultImage', function(newValue, oldValue){
              if(newValue)
              {
                  $scope.defaultImage = newValue;
              }
              else{
                $scope.defaultImage = "https://placehold.it/100x100";
              }
          });
          
          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends