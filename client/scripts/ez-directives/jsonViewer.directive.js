(function() {
  
  var module = null;
  try {
        module = angular.module('ezDirectives');
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }

    
  
  this.viewerTemplate = [
    '<md-button class="md-icon-button" ng-click="openDialog()"  aria-label="close">',
        '<ng-md-icon icon="view"></ng-md-icon> ',
    '</md-button>',
    ].join('\n');

    
    this.viewerDialogTemplate = [
       
          '<md-dialog flex="65" style="height:80vh" aria-label="List dialog">',
             '<md-dialog-content >',
                '<md-toolbar md-scroll-shrink="false">',
                  '<div class="md-toolbar-tools">',
                      '<span flex><span>',
                      '<md-button class="md-icon-button" ng-click="closeDialog()"  aria-label="close">',
                        '<ng-md-icon icon="close"></ng-md-icon> ',
                      '</md-button>',
                  '</div>',
                '</md-toolbar>',
                '<div layout-paddings >',
                  '<div layout="column" layout-align="center center" class="md-whiteframe-1dp">',
                      '<h3>Preiew</h3>',
                      '<div >{{jsonobj | json}}<div>',
                  '</div>',
              '</div>',
             '</md-dialog-content>',
         '</md-dialog>',
    ].join('\n');

    
  module.directive('ezJsonViewer', ['$timeout', 
    function($timeout) {
      return {
        restrict: 'E',
        template: this.viewerTemplate,
        //replace: true,
        scope: {
          jsonobj: '=',
        },
        //controller start
        controller: ["$scope",'$mdDialog', function ($scope,$mdDialog) {
          var init = function(){
            
          }
          
          $scope.$watch('jsonobj', function(newValue, oldValue){
              
          });
          
          $scope.openDialog = function($event){
               var parentEl = angular.element(document.body);
               $mdDialog.show({
                 parent: parentEl,
                 targetEvent: $event,
                 template:viewerDialogTemplate,
                 locals: {
                   jsonobj: $scope.jsonobj,
                 },
                 controller: jsonvwrDialogController
              }).then(function(){
                //$scope.img = dataUrl;
              },function(){

              });
              
              function jsonvwrDialogController($scope, $mdDialog, jsonobj) {
                scope = $scope;
                $scope.jsonobj = jsonobj;
                $scope.closeDialog = function() {
                  $mdDialog.hide();
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