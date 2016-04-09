(function() {
  
  var module ;
  try {
        module = angular.module('ezDirectives');;
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }
    
  this.scrollTemplate = [
//         '<span class="initials-circle" style="background: blueviolet;" >',
//             '<span style="color: whitesmoke;margin:0;">{{initials}}</span>',
//         '</span> ',
        '<div >',
          '<img ng-if="img!=null" src="{{img}}" class="md-avatar avatar-small" /> ',
          '<div ng-if="img==null" class="circle accent  md-title">{{initials}}</div>',
        '</div>',
    ].join('\n');
    
  module.directive('ezScroll', [
    '$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: this.scrollTemplate,
        replace: true,
        scope: {
          height: '=',
        },
        //controller start
        controller: ["$scope", function ($scope) {
          $scope.initials = "";

          var init = function(){
            
          }
          $scope.$watch('height', function(newValue, oldValue){
              if(newValue)
              {
                  init()
              }
          });
          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends