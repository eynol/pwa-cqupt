var gulp = require('gulp');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var strip = require('gulp-strip-debug');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
  console.log('default task');

});

gulp.task('watch', function () {
  gulp.watch('./stylus/**/*', ['stylus']);
  gulp.watch('./public/js/index.js',['js:index'])
})
gulp.task('stylus', function () {
  return gulp
    .src('./stylus/**/*')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus({
      compress:true,
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))

})

gulp.task('js:index', function () {
  return gulp
    .src('./public/js/index.js')
    .pipe(strip())
    .pipe(rename("index.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
});


gulp.task('dep', ['dep:vue', 'dep:semantic', 'dep:zepto']);

gulp.task('dep:vue', function () {
  return gulp
    .src('node_modules/vue/dist/**/*')
    .pipe(gulp.dest('public/lib/vue'))
    .on('error', function (e) {
      console.log(e);
    });
})

gulp.task('dep:semantic', function () {
  return gulp
    .src('node_modules/semantic-ui/dist/**/*')
    .pipe(gulp.dest('public/lib/semantic-ui'))
    .on('error', function (e) {
      console.log(e);
    });
})

gulp.task('dep:zepto', function () {
  return gulp
    .src('node_modules/zepto/dist/**/*')
    .pipe(gulp.dest('public/lib/zepto'))
    .on('error', function (e) {
      console.log(e);
    });
})
