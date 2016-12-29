var path = require('path');

function listFiles() {
  var patterns = [
       'api/**/*.test.js',
    ];
  var files = patterns.map(function(pattern) {
    return {
      pattern: pattern
    };
  });

  return files;
}
module.exports = function(config) {
  config.set({
    files: [
      'api/**/*.test.js',
    ],
    singleRun: false,
    autoWatch: true,
    basePath: '',
    frameworks : ['jasmine'],
    plugins: [
        'karma-phantomjs-launcher',
        
    ],
    browserify: {
      debug: false,
      transform: [ 'brfs' ]
    },
    exclude: [
    ],
    browsers : ['PhantomJS'],
    
  });
};