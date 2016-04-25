(function() {
  
  var module ;
  try {
        module = angular.module('ezDirectives');;
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }
    
  this.ezinitialsTemplate = [
//         '<span class="initials-circle" style="background: blueviolet;" >',
//             '<span style="color: whitesmoke;margin:0;">{{initials}}</span>',
//         '</span> ',
        '<span>',
          '<img ng-if="img!=null" src="{{img}}" class="md-avatar avatar-small" /> ',
          '<div ng-if="img==null" class="circle ">{{initials}}</div>',
        '</span>',
    ].join('\n');
    
  module.directive('ezThumb', [
    '$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: this.ezinitialsTemplate,
        replace: true,
        scope: {
          text: '=',
          img: '='
        },
        //controller start
        controller: ["$scope", function ($scope) {
          $scope.initials = "";

          var init = function(){
            if($scope.text == null){
              $scope.text = "";
            }
            var matches = $scope.text.match(/\b(\w)/g);
            if(matches){
              var inits = matches.join('');
              $scope.initials =  inits.substring(0,2);
            }
          }
          $scope.$watch('img', function(newValue, oldValue){
              if(newValue)
              {
                  $scope.img = newValue;
              }
          });
          $scope.$watch('text', function(newValue, oldValue){
              if(newValue)
              {
                  init();
              }
          });

          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends