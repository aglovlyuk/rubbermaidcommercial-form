'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require("browser-sync");
const cleanCSS = require('gulp-clean-css');
const cheerio = require('gulp-cheerio');
const del = require('del');
const imagemin = require('gulp-imagemin');
const path = require('path');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const posthtmlAttrsSorter = require('posthtml-attrs-sorter');
const rigger = require('gulp-rigger');
const replace = require('gulp-replace');
const runSequence = require('gulp4-run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const svgmin = require('gulp-svgmin');
const reload = browserSync.reload;
const webp = require('gulp-webp');

const srcFolder = 'src/';
const distFolder = 'dist/';

// Plugins options
// fetch command line arguments
const arg = (argList => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;

})(process.argv);

if (typeof arg.p === "boolean" || typeof arg.p === 'undefined') {
    arg.p = '';
} else {
    arg.p = arg.p + '/';
}

const options = {
    src: { // Source paths
        html: arg.p + 'src/*.html',
        js: arg.p + 'src/js/**/*.js',
        style: arg.p + 'src/scss/**/*.scss',
        img: arg.p + 'src/images/**/*.{svg,png,jpg}',
        favicon: arg.p + 'src/images/favicon/*.*',
        uploads: arg.p + 'src/uploads/**/*.*',
        svg: arg.p + 'src/images/svg-icons/**/*.svg',
        fonts: arg.p + 'src/fonts/**/*',
        static: arg.p + 'src/media/**/*'
    },
    watch: { // Watch files
        html: arg.p + 'src/**/*.html',
        js: arg.p + 'src/js/**/*.js',
        style: arg.p + 'src/scss/**/*.scss',
        img: arg.p + 'src/images/**/*.*',
        uploads: arg.p + 'src/uploads/**/*.*',
        svg: arg.p + 'src/images/svg-icons/*.svg',
        fonts: arg.p + 'src/fonts/**/*',
        static: arg.p + 'src/media/**/*'
    },
    dist: { // Dist paths
        html: arg.p + 'dist/',
        js: arg.p + 'dist/js/',
        css: arg.p + 'dist/css/',
        img: arg.p + 'dist/images/',
        favicon: arg.p + 'dist/images/favicon/',
        fonts: arg.p + 'dist/fonts/**/*',
        uploads: arg.p + 'dist/uploads/',
        icons: arg.p + 'src/templates-parts/'
    },

    svgSprite: {
        title: 'Icon %f',
        id: 'icon-%f',
        className: 'icon-%f',
        svgClassname: 'icons-sprite',
        templates: [
            path.join(__dirname, arg.p + 'src/' + '/template-icon/icons-template.scss'),
            path.join(__dirname, arg.p + 'src/' + '/template-icon/icons-template.svg')
        ]
    },

    imagemin: {
        images: [
            $.imagemin.gifsicle({
                interlaced: true,
                optimizationLevel: 3
            }),
            $.imagemin.mozjpeg({
                quality: 91,
                progressive: true
            }),
            $.imagemin.optipng({
                optimizationLevel: 5
            }),
            $.imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {removeDimensions: true},
                    {cleanupIDs: false}
                ]
            })
        ],

        icons: [
            $.imagemin.svgo({
                plugins: [
                    {removeTitle: false},
                    {removeStyleElement: false},
                    {removeAttrs: {attrs: ['id', 'class', 'data-name', 'fill', 'fill-rule']}},
                    {removeEmptyContainers: true},
                    {sortAttrs: true},
                    {removeUselessDefs: true},
                    {removeEmptyText: true},
                    {removeEditorsNSData: true},
                    {removeEmptyAttrs: true},
                    {removeHiddenElems: true},
                    {transformsWithOnePath: true}
                ]
            })
        ],

        del: [
            'dist',
            'tmp'
        ],

        plumber: {
            errorHandler: errorHandler
        }
    },

    posthtml: {
        plugins: [
            posthtmlAttrsSorter({
                order: [
                    'class',
                    'id',
                    'name',
                    'data',
                    'ng',
                    'src',
                    'for',
                    'type',
                    'href',
                    'values',
                    'title',
                    'alt',
                    'role',
                    'aria'
                ]
            })
        ],
        options: {}
    },

    htmlPrettify: {
        indent_char: ' ',
        indent_size: 4
    }
};

// configuration for localhost
var configServer = {
    server: {
        baseDir: distFolder + "/"
    },
    host: 'localhost',
    port: 8080,
    open: true,
    logPrefix: "Frontend",
    notify: false
};

/* All tasks */

// Error handler for gulp-plumber
function errorHandler(err) {
    $.util.log([(err.name + ' in ' + err.plugin).bold.red, '', err.message, ''].join('\n'));

    this.emit('end');
}

gulp.task('cleanup', function (cb) {
    return del(options.del, cb);
});

// livereload
gulp.task('webserver', function () {
    browserSync(configServer);
});

//task for js build
gulp.task('js:build', function () {
    return gulp.src(options.src.js)
    //.pipe(rigger())
    //.pipe($.sourcemaps.init())
    //.pipe($.uglify())
    //.pipe($.sourcemaps.write())
        .pipe(gulp.dest(options.dist.js))
        .pipe(reload({stream: true}));
});

//task for style build
gulp.task('style:build', function () {
    return gulp.src(options.src.style)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        //.pipe(sourcemaps.init())
        //.pipe(postcss(plugins))
        //.pipe($.combineMq({ beautify: true }))
        //.pipe(sourcemaps.write('.'))
        //.pipe($.cssmin())
        .pipe(plumber.stop())
        .pipe(gulp.dest(options.dist.css))
        .pipe(reload({stream: true}));
});

//task for style min
gulp.task('style:min', function () {
    return gulp.src(options.src.style)
        .pipe(sass().on('error', sass.logError))
        //.pipe($.combineMq({ beautify: true }))
        .pipe(cleanCSS({debug: true}, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest(options.dist.css))
});

gulp.task('html:build', function () {
    return gulp.src([options.src.html, '!' + arg.p + 'src/templates-parts/*.*'])
        .pipe(rigger())
        .pipe($.posthtml(options.posthtml.plugins, options.posthtml.options))
        //.pipe($.prettify(options.htmlPrettify))
        .pipe(gulp.dest(options.dist.html))
        .pipe(reload({stream: true}));
});

gulp.task('cleanup', function (cb) {
    return del(options.del, cb);
});

gulp.task('icons:build', function () {
    return gulp.src(options.src.svg)
        .pipe($.plumber(options.plumber))
        .pipe(cheerio({
            /*run: function ($) {
              $('[fill]').removeAttr('fill');
              $('[style]').removeAttr('style');
            },*/
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgmin({
            plugins: [{
                removeDoctype: false
            }, {
                removeComments: true
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }, {
                convertColors: {
                    names2hex: true,
                    rgb2hex: true
                }
            }]
        }))
        .pipe($.svgSymbols(options.svgSprite))
        .pipe($.if(/\.svg$/, $.rename({
            basename: "icons",
            extname: ".html"
        })))
        .pipe($.if(/\.html/, gulp.dest(options.dist.icons)));
});

gulp.task('image:webp', () =>
    gulp.src([options.src.img,
        '!**/*.svg'
        ]
    )
        .pipe(webp({
            quality: 85,
            method: 4
        }))
        .pipe(gulp.dest(options.dist.img))
);

gulp.task('image:copy', gulp.series('image:webp', () =>
    gulp.src([options.src.img,
        '!' + options.src.svg]
    )
        .pipe(gulp.dest(options.dist.img))
        .pipe(reload({stream: true}))
));

gulp.task('image:min', gulp.series('image:copy', () =>
    gulp.src([options.src.img,
            //'!' + options.src.svg,
            '!**/*.svg'
        ]
    )
        .pipe(imagemin(options.imagemin.images))
        .pipe(gulp.dest(options.dist.img))
));

//task for fonts copy
gulp.task('fonts:build', function () {
    return gulp.src(options.src.fonts)
        .pipe(gulp.dest(options.dist.fonts))
});

gulp.task('cleanup', function (cb) {
    return del(options.del, cb);
});

/*
  Tasks:
  * build (gulp build) -- start building task
  * production (gulp build) -- minification files (now - only CSS)
  * zip (gulp build) -- package to zip-archive (only markup)
  * deploy (gulp deploy) -- deploying on configured server
  * watch (gulp watch)
*/

gulp.task('build', function (cb) {
    return runSequence(
        'cleanup',
        'html:build',
        'js:build',
        'style:build',
        'image:copy',
        //'icons:build',
        'fonts:build',
        cb
    );
});

gulp.task('prod', function (cb) {
    return runSequence(
        'cleanup',
        'html:build',
        'js:build',
        'style:min',
        'image:min',
        'fonts:build',
        //'html:min',
        //'js:min',
        cb
    );
});

// watch task
gulp.task('watch', function () {
    $.watch(options.watch.html, gulp.series('html:build'));
    $.watch(options.watch.fonts, gulp.series('fonts:build'));
    $.watch(options.watch.js, gulp.series('js:build'));
    $.watch(options.watch.img, gulp.series('image:copy'));
    //$.watch(options.watch.uploads, gulp.series('uploads:build'));
    //$.watch(options.watch.svg, gulp.series('icons:build'));
    $.watch(options.watch.style, gulp.series('style:build'));
});

// watch task
gulp.task('style-w', function () {
    $.watch(options.watch.style, gulp.series('style:build'));
});

// main default task
gulp.task('default', function (cb) {
    return runSequence(
        'build',
        [
            'webserver',
            'watch'
        ],
        cb
    );
});
