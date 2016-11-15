var gulp = require('gulp');
var gulpUtil = require("gulp-util");
var webpack = require('gulp-webpack');
var spawn = require('child_process').spawn;
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var stylelint = require('gulp-stylelint');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssSimpleVars = require('postcss-simple-vars');
var cssImport = require('postcss-import');

/* ***** */
/* Paths */
/* ***** */

var paths = {
  src: {
    js: {
      entry: 'src/js/index.js',
      config: {
        dev: './webpack.dev.config.js',
        prod: './webpack.prod.config.js'
      }
    },
    workers: {
      entry: 'src/js/workers/serialist-player-worker.js',
      config: {
        dev: './webpack.workers.dev.config.js',
        prod: './webpack.workers.prod.config.js'
      }
    },
    css: 'src/css/**/*'
  },
  dist: 'dist/'
};

/* ******* */
/* Logging */
/* ******* */

function logMessage(message) {
  gulpUtil.log(gulpUtil.colors.blue(message));
}

function logError(message) {
  gulpUtil.log(gulpUtil.colors.red(message));
}

/* ********* */
/* CSS Tasks */
/* ********* */

function cssBaseTask() {
  return gulp.src(paths.src.css)
    .pipe(stylelint({
      reporters: [{
        formatter: 'string',
        console: true
      }]
    }))
    .pipe(sourcemaps.init())
    .pipe(concat('index.css', {newLine: '\n\n'}))
    .pipe(postcss([
      cssImport(),
      cssSimpleVars(),
      cssnext({
        autoprefixer: {
          browsers: [
            'last 10 versions',
            'ie >= 11'
          ]
        }
      })
    ]));
}

gulp.task('css-dev', function() {
  return cssBaseTask()
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: css-dev');
    });
});

gulp.task('css-prod', function() {
  return cssBaseTask()
    .pipe(minifycss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: css-prod');
    });
});

/* ***************** */
/* Development Tasks */
/* ***************** */

gulp.task('webpack-js', function() {
  var config = require(paths.src.js.config.dev);

  return gulp.src(paths.src.js.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: webpack-js');
    });
});

gulp.task('webpack-workers', function() {
  var config = require(paths.src.workers.config.dev);

  return gulp.src(paths.src.workers.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: webpack-workers');
    });
});

gulp.task('default', [
  'webpack-js',
  'webpack-workers',
  'css-dev'
]);

/* **************** */
/* Production Tasks */
/* **************** */

gulp.task('production-js', function() {
  var config = require(paths.src.js.config.prod);

  return gulp.src(paths.src.js.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('production-workers', function() {
  var config = require(paths.src.workers.config.prod);

  return gulp.src(paths.src.workers.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('production', [
  'production-js',
  'production-workers',
  'css-prod'
]);

/* ******** */
/* Watchers */
/* ******** */

function webpackWatchJs() {
  var config = require(paths.src.js.config.dev);
  config.watch = true;

  return gulp.src(paths.src.js.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: webpack-js');
    });
}

function webpackWatchWorkers() {
  var config = require(paths.src.workers.config.dev);
  config.watch = true;

  return gulp.src(paths.src.workers.entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(paths.dist))
    .on('finish', function() {
      logMessage('Completed task: webpack-workers');
    });
}

gulp.task('watch', function() {
  gulp.watch(paths.src.css.app, ['css-dev']);
  webpackWatchJs();
  webpackWatchWorkers();
});