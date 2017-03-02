var gulp =require('gulp');

gulp.task('default',function(){
  console.log('default task');

});

gulp.task('dep',['dep:weui','dep:weui.js']);

gulp.task('dep:weui',function(){
return  gulp.src('node_modules/weui/dist/**/*')
      .pipe(gulp.dest('public/lib/weui')).on('error',function(e){
        console.log(e);
      });
})
gulp.task('dep:weui.js',function(){
return  gulp.src('node_modules/weui.js/dist/**/*')
      .pipe(gulp.dest('public/lib/weui.js')).on('error',function(e){
        console.log(e);
      });
})