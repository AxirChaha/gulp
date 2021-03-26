const { src, dest, watch, series, parallel } = require('gulp');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const del = require('del');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
//=========================================================================
// Работа с html
function html() {
  return src('./src/*.html')
    .pipe(fileinclude())
    .pipe(dest('./dist/'))
    .pipe(browserSync.stream());
}
function htmlDist() {
  return src('./src/*.html')
    .pipe(fileinclude())
    .pipe(htmlmin({
      collapseWhitespace: true, // удаляем все переносы
      removeComments: true // удаляем все комментарии
    }))
    .pipe(dest('./dist/'))
    .pipe(browserSync.stream());
}
//=========================================================================
// Работа со стилями SCSS
function scss() {
  return src('./src/scss/style.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(dest('./dist/css/'))
    .pipe(dest('./src/css/'))
    .pipe(browserSync.stream());
}

function scssDist() {
  return src('./src/scss/style.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(dest('./dist/css/'))
    .pipe(src('./src/scss/style.scss'))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(dest('./dist/css/'))
    .pipe(browserSync.stream());
}
//=========================================================================
// Работа с JS файлами
function jsDist() {
  return src('./src/js/main.js')
    .pipe(uglify())
    .pipe(dest('./dist/js/'))
    .pipe(browserSync.stream());
}
//=========================================================================
// Запуск сервера
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "dist/"
    }
  });
}
//=========================================================================
// Слежение за изменениями
function see() {
  watch('src/**/*.html', html);
  watch(['dist/**/*.html', 'dist/css/*.css', 'dist/js/**/*.js']).on('change', browserSync.reload);
  watch('src/scss/**/*.scss', scss);
}
//=========================================================================
// Очистка каталога
function delDist() {
  return del('dist');
}
//=========================================================================
// Копирование
function copy() {
  return src([
    'src/fonts/**/*',
    'src/js/**/*'
  ], { base: 'src' })
    .pipe(dest('dist'));
}

function copyDist() {
  return src([
    'src/fonts/**/*'
  ], { base: 'src' })
    .pipe(dest('dist'));
}
//=========================================================================
// Работа с картинками
function images() {
  return src('src/html/images/**/*')
    .pipe(dest('dist/images'))
}

function imagesDist() {
  return src('src/html/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}
//=========================================================================
// SRC
exports.html = html;
exports.scss = scss;
exports.images = images;
exports.see = see;
exports.browsersync = browsersync;

exports.delDist = delDist;
exports.copy = copy;

exports.default = series(delDist, copy, images, scss, html, parallel(browsersync, see));
//=========================================================================
// Build
exports.htmlDist = htmlDist;
exports.scssDist = scssDist;
exports.jsDist = jsDist;
exports.imagesDist = imagesDist;
exports.copyDist = copyDist;


exports.build = series(delDist, copyDist, imagesDist, jsDist, scssDist, htmlDist);