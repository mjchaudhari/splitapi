(function() {
  
  var module = null;
  try {
        module = angular.module('ezDirectives');
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }

    
  
  this.ezImageUploadTemplate = [
      '<div layout="column" layout-align="center center" ng-click="openThumbnailDialog($event)">',
      '  <div class="thumbnail-card" >',
      //'    <img ng-hide="{{img!=null}}" src ng-src="{{defaultImage}}" class="md-avatar thumbnail-img"  md-click="openThumbnailDialog($event)" /> ',
      '    <img   src ng-src="{{img||defaultImage}}" class="md-avatar thumbnail-img"  md-click="openThumbnailDialog($event)" /> ',
      '  </div>',
//       '  <md-button ng-hide class="md-icon-button" ng-click="openThumbnailDialog($event)">',
//       '     <i class="material-icons">edit</i>',
//       '  </md-button>',
      '</div>'
        
    ].join('\n');

    
    this.ezImageUploadModalTemplate = [
       
          '<md-dialog flex="100" style="height:100vh" aria-label="List dialog">',
             '<md-dialog-content>',
                '<md-toolbar md-scroll-shrink="false">',
                  '<div class="md-toolbar-tools">',
                      '<md-button class="md-icon-button" ng-click="cancelDialog()"  aria-label="close">',
                        '<ng-md-icon icon="cancel"></ng-md-icon> ',
                      '</md-button>',
                      '<span flex>{{title}}</span>',
                      '<div ng-show="uploading" class="" layout="row" layout-align="end">',
                          '<img style="height:40px;width:40px" class="rotating" src="./content/images/cp.png" />',
                      '</div>',
                      '<md-button class="md-icon-button" ng-click="closeDialog()"  aria-label="close">',
                        '<ng-md-icon icon="save"></ng-md-icon> ',
                      '</md-button>',
                  '</div>',
                '</md-toolbar>',
                '<div layout-padding>',
                  '<md-switch ng-model="thumb.isCircle" aria-label="Use circular cropper area:" ng-change="areaChange(thumb.isCircle)" class="md-warn">',
                       'Use square cropper area',
                  '</md-switch>',
                  '<div layout="column" layout-align="center center" class="crop-area md-whiteframe-1dp">',
                      '<ng-md-icon icon="camera_alt" size="64" ngf-select ngf-capture="\'camera\'"', 
                          'ng-model="thumb.sourceFile" accept="image/*"></ng-md-icon> ',
                      '<img-crop image="thumb.sourceFile | ngfDataUrl" area-type="{{thumb.cropperGuide}}"',
                      '    area-min-size="thumb.cropperMinSize" result-image-size="thumb.resultSize" ',
                      '    result-image="thumb.croppedDataUrl" >',
                      '</img-crop>',
                      '<h3>Preiew</h3>',
                      '<img src="{{thumb.croppedDataUrl}}" />',
                  '</div>',

              '</div>',
             '</md-dialog-content>',
         '</md-dialog>',
    ].join('\n');

    
  module.directive('ezImageUpload', ['$timeout', 
    function($timeout) {
      return {
        restrict: 'AE',
        template: this.ezImageUploadTemplate,
        replace: true,
        scope: {
          img: '=',
          defaultImage: "=?"
        },
        //controller start
        controller: ["$scope","Upload",'$mdDialog', function ($scope, Upload,$mdDialog) {
          var originalImg = $scope.img;
          var thumb = {
              croppedDataUrl:'',
              sourceFile:'',
              croppedDataUrl:'',
              cropperMinSize : 80,
              resultSize : 100,
              cropperGuide : 'circle'
          }
          $scope.defaultImage = "./content/images/group-default3.png";
          
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
          
          $scope.openThumbnailDialog = function($event){
               var parentEl = angular.element(document.body);
               $mdDialog.show({
                 parent: parentEl,
                 targetEvent: $event,
                 template:ezImageUploadModalTemplate,
                 locals: {
                   items: $scope.items,
                   thumb : $scope.thumb,
                 },
                 controller: DialogController
              }).then(function(dataUrl){
                $scope.img = dataUrl;
              },function(){

              });
              
              function DialogController($scope, $mdDialog, items, Upload) {
                $scope.items = items;
                $scope.sourceFile = "";
                scope = $scope;
                $scope.thumb = thumb;
                $scope.openSelectFile = function(dataUrl ){
                    console.info(dataUrl);
                }
                $scope.areaChange=function (model){
                  if(!model){
                    $scope.thumb.cropperGuide = "circle";
                  }else{
                    $scope.thumb.cropperGuide = "square";
                  }
                }
                $scope.closeDialog = function() {
                  $mdDialog.hide($scope.thumb.croppedDataUrl);
                }
                $scope.cancelDialog = function() {
                  $mdDialog.cancel();
                }
              }
          }

          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends