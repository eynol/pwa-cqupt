var gulp = require('gulp');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var strip = require('gulp-strip-debug');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
 gulp.start(['js:index','dep','stylus'])
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


gulp.task('dep', ['dep:vue']);

gulp.task('dep:vue', function () {
  return gulp
    .src('node_modules/vue/dist/**/*')
    .pipe(gulp.dest('public/lib/vue'))
    .on('error', function (e) {
      console.log(e);
    });
})

