const { src, dest, series, watch, parallel } = require('gulp');
const del = require('gulp-clean');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-px2rem-converter');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');
const sassLint = require('gulp-sass-lint');

const env = process.env.NODE_ENV;

const {SRC_PATH, DIST_PATH, JQUERY} = require('./gulp.config');

const reload = browserSync.reload;

const copyImg = () => {
    return src(`${SRC_PATH}/assets/**/*.{jpg,png,svg}`)
        .pipe(dest(`${DIST_PATH}/images`))
}

const clean = () => {
    return src(`${DIST_PATH}/**/*.*`)
        .pipe(del());
}

const server = (done) => {
    browserSync.init({
        server: {
            baseDir: DIST_PATH
        }
    });
    done();
};

const compileScss = () => {
    return src(`${SRC_PATH}/styles/main.scss`)
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(sassGlob())
        .pipe(
            sass().on('error', sass.logError)
        )
        .pipe(gulpif(env === 'prod', px2rem()))
        .pipe(gulpif(env === 'prod', autoprefixer()))
        .pipe(gulpif(env === 'prod', groupMedia()))
        .pipe(gulpif(env === 'prod', cleanCSS()))
        .pipe(rename('main.min.css'))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest(`${DIST_PATH}/styles`))
        .pipe(browserSync.stream());
}

const compilePug = () => {
    return src(`${SRC_PATH}/pages/*.pug`)
        .pipe(pug({
            pretty: true,
        }))
        .pipe(dest(DIST_PATH));
}

const scripts = [
    `${SRC_PATH}/js/*.js`,
    `${SRC_PATH}/scripts/mainSlider.js`
]

const compileJS = () => {
    return src(scripts)
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(concat('main.js'))
        .pipe(gulpif(env === 'prod', babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpif(env === 'prod', uglify()))
        .pipe(rename('main.min.js'))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest(`${DIST_PATH}/js`))
        .pipe(browserSync.stream());
}

const copyVendorsAssets = () => {
    return src([
            `${SRC_PATH}/js/vendors/slick/**/*.*`,
            `!${SRC_PATH}/js/vendors/slick/*.{css,js}`
        ])
        .pipe(dest(`${DIST_PATH}/styles`));
}

const copyVendorsCSS = () => {
    return src(`${SRC_PATH}/js/vendors/slick/*.css`)
        .pipe(concat('vendors.css'))
        .pipe(cleanCSS())
        .pipe(rename('vendors.min.css'))
        .pipe(dest(`${DIST_PATH}/styles`));
}

const copyVendorsJS = () => {
    return src([
            JQUERY,
            `${SRC_PATH}/js/vendors/slick/slick.min.js`
        ])
        .pipe(concat('vendors.min.js'))
        .pipe(dest(`${DIST_PATH}/js`));
}

const lintSCSS = () => {
    return src(`${SRC_PATH}/styles/**/*.scss`)
        .pipe(sassLint({
            configFile: './.scss-config.yml'
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

const watchers = (done) => {
    watch(`${SRC_PATH}/**/*.pug`).on('all', series(compilePug, reload));
    watch(`${SRC_PATH}/styles/**/*.scss`, series(lintSCSS, compileScss));
    watch(`${SRC_PATH}/**/*.js`, series(compileJS));
    watch(`${SRC_PATH}/assets/**/*.{jpg,png,svg}`, series(copyImg, reload));
    done();
}

const build = series(
    clean,
    parallel(copyImg, compilePug, lintSCSS, compileScss, copyVendorsCSS, compileJS, copyVendorsJS, copyVendorsAssets)
);

const serve = series(
    build,
    parallel(server, watchers)
);

exports.build = build;
exports.default = serve;