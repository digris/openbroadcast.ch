'use strict';

var config = require('./settings.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');


var sassPaths = [
  'website/site-static/sass/lib/fd-6.2',
  'website/site-static/sass/lib/motion-ui'
];


// not so elegant. apps added separately to have our common path schema
var nunjucksPaths = [
    'website/apps/achat/static/**/nj/*.html',
    'website/apps/bplayer/static/**/nj/*.html',
    'website/apps/onair/static/**/nj/*.html',
    'website/apps/remotelink/static/**/nj/*.html'
];

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4'
];

gulp.task('proxy', ['styles'], function () {
    browserSync.init({
        notify: false,
        port: config.local_port,
        host: config.hostname,
        open: false,
        proxy: {
            target: "127.0.0.1:" + config.proxy_port
        },
        ui: {
            port: config.local_port + 1,
            weinre: {
                port: config.local_port + 2
            }
        }
    });
    gulp.watch("website/site-static/sass/**/*.sass", ['styles']);
    gulp.watch("website/site-static/js/**/*.coffee", ['scripts']);
    gulp.watch(nunjucksPaths, ['templates']);
});

gulp.task('styles', function () {
    return gulp.src([
            'website/site-static/sass/screen.sass',
            'website/site-static/sass/print.sass'
        ])
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: sassPaths,
            outputStyle: 'expanded',
            precision: 10
            //onError: logSASSError
        }))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('website/site-static/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .pipe($.size({title: 'styles'}));
});


gulp.task('admin', function () {
    return gulp.src([
            'website/site-static/sass/slick-admin-styles.sass'
        ])
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: './node_modules/django-slick-admin-styles/sass/',
            outputStyle: 'expanded',
            precision: 10
        }))
        .pipe($.concat('django-slick-admin.css'))
        .pipe(gulp.dest('website/site-static/django_slick_admin/css/'))
        .pipe($.size({title: 'admin'}));
});




gulp.task('babel', function () {
    return gulp.src([
            'website/site-static/js/lib/fd-6.2/*.js'
        ])
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('website/site-static/js/fd-6.2/'))
        .pipe($.size({title: 'babel'}));
});


//Concat and minify scripts
gulp.task('scripts', function () {
    return gulp.src([
            'website/site-static/js/**/*.coffee',
            'website/**/*.coffee'
        ])
        .pipe($.coffee({bare: true}).on('error', gutil.log))
        .pipe($.flatten({ includeParents: 2} ))
        .pipe(gulp.dest('website/site-static/dist/js/'));
});

// precompile nunjucks templates
gulp.task('templates', function () {
    return gulp.src(nunjucksPaths)
        .pipe($.nunjucks.precompile().on('error', gutil.log))
        .pipe($.concat('templates.js'))
        //.pipe($.minify())
        .pipe($.size({title: 'templates'}))
        .pipe(gulp.dest('website/site-static/dist/nj/'));
});


gulp.task('dist', ['styles'], function() {
    return gulp.src('website/site-static/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie10'}))
        .pipe($.size({title: 'dist'}))
        .pipe(gulp.dest('website/site-static/dist/css/'));
});


gulp.task('default', ['proxy']);
gulp.task('watch', ['proxy']);

