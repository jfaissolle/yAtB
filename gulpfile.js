/* jshint node: true */
var gulp = require('gulp'),
    compass = require('gulp-compass'),
    react = require('gulp-react'),
    util = require('gulp-util');

gulp.task('compass', function() {
  util.log('compass');
  gulp.src('sass/*.scss')
    .pipe(compass({
      config_file: 'config.rb',
      css: 'stylesheets'
    }))
    .pipe(gulp.dest('stylesheets'))
    .pipe(gulp.dest('dist/stylesheets'));
});

gulp.task('react', function() {
  util.log('react');
  gulp.src('src/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('scripts'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('default', function() {
  gulp.run('compass');
  
  gulp.watch('sass/*.scss', function() {
    gulp.run('compass');
  });
  
  gulp.watch('scripts/*.jsx', function() {
    gulp.run('react');
  });
});

gulp.task('dist', function() {
  gulp.run('react', 'compass', function(err) {
    if (err) {
      return console.error(err);
    }
        
    gulp.src('index.html')
      .pipe(gulp.dest('dist'));
  
    gulp.src('libs/*')
      .pipe(gulp.dest('dist/libs'));
  });
  
});