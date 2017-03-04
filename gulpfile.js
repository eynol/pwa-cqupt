var gulp =require('gulp');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');

gulp.task('default',function(){
  console.log('default task');

});


gulp.task('watch',function(){
 
  gulp.watch('./stylus/**/*',['stylus']);

})
gulp.task('stylus',function(){
  return gulp.src('./stylus/**/*')
              .pipe(plumber())
              .pipe(stylus())
              .pipe(gulp.dest('./public/css'))

})

gulp.task('dep',['dep:vue','dep:semantic','dep:zepto']);

gulp.task('dep:vue',function(){
return  gulp.src('node_modules/vue/dist/**/*')
      .pipe(gulp.dest('public/lib/vue')).on('error',function(e){
        console.log(e);
      });
})

gulp.task('dep:semantic',function(){
return  gulp.src('node_modules/semantic-ui/dist/**/*')
      .pipe(gulp.dest('public/lib/semantic-ui')).on('error',function(e){
        console.log(e);
      });
})

gulp.task('dep:zepto',function(){
return  gulp.src('node_modules/zepto/dist/**/*')
      .pipe(gulp.dest('public/lib/zepto')).on('error',function(e){
        console.log(e);
      });
})
