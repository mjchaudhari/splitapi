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
        '<div class="circle accent  md-title">{{initials}}</div>'
    ].join('\n');
    
  module.directive('ezInitials', [
    '$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: this.ezinitialsTemplate,
        replace: true,
        scope: {
          text: '=',
        },
        //controller start
        controller: ["$scope", function ($scope) {
          $scope.initials = "";

          var init = function(){
            
            var matches = $scope.text.match(/\b(\w)/g);
            var inits = matches.join('');
            $scope.initials =  inits.substring(0,2);
          }
          
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