var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('watch', function() {
  //gulp.watch(paths.sass, ['sass']);
  //gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.js, ['test','lint']);
});
