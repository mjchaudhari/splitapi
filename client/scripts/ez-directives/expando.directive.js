(function() {
  
  var module ;
  try {
        module = angular.module('ezDirectives');;
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }
    
  this.template = [
    '<md-card>',
      '<md-card-title class="">',
        '<div layout="row" layout-align="left center">',
          '<md-button layout="row" class="expando__icon md-icon-button " ng-class=\"{\'active\': isActive}\" ng-click="toggle()">',
            '<i class="material-icons">settings_power</i>',
          '</md-button>',
          '<span class=""  ng-bind="expandoTitle">{{expandoTitle}}</span>',
        '</div>',
      '</md-card-title>',
      '<md-card-content>',
        '<div class=""   ng-if="areaExpand">',
          '<div ng-transclude></div>', 
        '</div>',
      '</md-card-content>',
    '</md-card>'
    ].join('\n');
    
  module.directive('ezExpando', [
    '$timeout', function($timeout) {
      return {
        restrict: 'AE',
        template: this.template,
        replace: true,
        transclude: true,
        scope: {
          expandoTitle : '@',
          areaExpand : '@'
        },

        //controller start
        controller: ["$scope", function ($scope) {
          $scope.expandoTitle = "";
          $scope.areaExpand = false;
          $scope.isActive = false;
          var init = function(){
            
          }

          // Google Expando Method
          // =====================================================

          $scope.toggle =function() {
            // $(this).toggleClass('active');
            // $(this).next().toggleClass('active');
            $scope.isActive = !$scope.isActive;
            // ARIA
            $scope.areaExpand = !$scope.areaExpand;  
          }
  
          $scope.$watch('expandoTitle', function(newValue, oldValue){
              $scope.expandoTitle = newValue;
          });
          $scope.$watch('areaExpand', function(newValue, oldValue){
              $scope.areaExpand = newValue;
          });
          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends