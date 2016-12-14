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
    frameworks: ['jasmine'],
    plugins: [
        'karma-phantomjs-launcher',
        //'karma-chrome-launcher',
        'karma-junit-reporter',
        'karma-html-reporter',
        'karma-jasmine',
        'karma-coverage',
        'karma-ng-html2js-preprocessor'
    ],
    exclude: [
    ],
    browsers : ['PhantomJS'],
    reporters: ['progress', 'html', 'coverage'],

    htmlReporter: {
        outputDir: 'test-reports/result-html/',
    },
    coverageReporter: {
        type: 'html',
        dir: 'test-reports/coverage/'
    },
  });
};