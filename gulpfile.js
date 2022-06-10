var gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')), // компилятор sass
    concat = require('gulp-concat'), // для склеивания файлов
    cssnano = require('gulp-cssnano'), // для сжатия css
    cleancss = require('gulp-clean-css'), // для удаления комментариев в css
    rename = require('gulp-rename'), // плагин для переименования файлов
    del = require('del'), // для удаления 
    ftp = require('vinyl-ftp'), // deploy проекта по FTP
    autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
    sourcemaps = require('gulp-sourcemaps'), // для создания Source Maps файлов
    cssimport = require('gulp-cssimport'),
    browserSync     = require('browser-sync'),
    reload          = browserSync.reload;
var terser = require("gulp-terser");
var config = {
    proxy: 'tracking-form',
    tunnel: false,
	// browser: ["firefox"],  // , "google chrome"
    host: 'localhost',
    port: 9000,
    logPrefix: 'tracking-form',
    // open:false
};

var IS_PROD = false; // если переменная равна "true", то обработовать файлы для продакшена                                                

gulp.task('styles', function() {
    var result = gulp.src('_dev/styles/main.scss') //берем файл
        .pipe(sourcemaps.init()) // инициализируем создание Source Maps
        .pipe(sass().on('error', sass.logError)) //компилируем файл из sass в css
        // .pipe(cssimport({
        //  skipComments: false,
        // }))
        .pipe(autoprefixer([
            'last 15 versions', '> 1%', 'ie 8', 'ie 7'
        ], {
            cascade: true
        })) // добавлем вендорные префиксы
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        })); //удалаем комментарии из css

    if (IS_PROD == true) {
        result = result.pipe(cssnano({
            zindex: false
        })); //сжимаем файл
    }

    result
        .pipe(rename(
            'style.min.css'
        ))
        .pipe(sourcemaps.write('.', {
            includeContent: false,
        })) // записываем карту файла для удобного дебага
        .pipe(gulp.dest('styles')) // выгружаем результирующий файл в указанную дирректорию
        .pipe(reload({stream: true}));
    return result;
});

gulp.task('styles-fonts', function() {
    var result = gulp.src('_dev/styles/fonts.scss') //берем файл
        .pipe(sourcemaps.init()) // инициализируем создание Source Maps
        .pipe(sass().on('error', sass.logError)) //компилируем файл из sass в css
        // .pipe(cssimport({
        //  skipComments: false,
        // }))
        .pipe(autoprefixer([
            'last 15 versions', '> 1%', 'ie 8', 'ie 7'
        ], {
            cascade: true
        })) // добавлем вендорные префиксы
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        })); //удалаем комментарии из css

    // if (IS_PROD == true) {
    //     result = result.pipe(cssnano({
    //         zindex: false
    //     })); //сжимаем файл
    // }

    result
        .pipe(rename(
            'fonts.min.css'
        ))
        .pipe(sourcemaps.write('.', {
            includeContent: false,
        })) // записываем карту файла для удобного дебага
        .pipe(gulp.dest('styles')) // выгружаем результирующий файл в указанную дирректорию
        .pipe(reload({stream: true}));
    return result;
});


// ОБЪЕДИНЕНИЕ JS БИБЛИОТЕК
// gulp.task('build-js', function() {
    // перечисляем файлы, которые будут добавлены в lib.min.js
    // порядок файлов важен!!!
    // var result = gulp.src([
            // 'scripts/sources/libs/jquery/jquery.js',
            // 'scripts/sources/libs/jquery.inputmask.bundle.js',
            // 'scripts/sources/libs/jquery-ui-1.12.1.custom/jquery-ui.js',
            // 'scripts/sources/libs/select2/dist/js/select2.full.min.js',
            // 'scripts/sources/libs/jquery-toggles/toggles.min.js',
            // 'scripts/sources/libs/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js',
            // 'scripts/sources/libs/sweetalert.min.js',
            // 'scripts/sources/libs/bootstrap.bundle.js',
            // 'scripts/sources/libs/owl.carousel.min.js',
            // 'scripts/sources/libs/jquery.fancybox.js',
            //'scripts/sources/jquery.toast.min.js',
            //'scripts/sources/jquery.ui.touch.js'      
        // ], {
            // sourcemaps: false
        // })
        // .pipe(concat('libs.min.js')); // Собираем их в кучу в новом файле libs.min.js

    //if (IS_PROD) {
        // result = result.pipe(terser()); // Сжимаем JS файл
    //}

//     result
//         .pipe(gulp.dest('scripts')); // Выгружаем в папку scripts

//     return result;
// });


// ОБРАБОТКА SCRIPT.JS
gulp.task('scripts', function() {
    var result = gulp.src([
            '_dev/scripts/script.js' 
        ], {
            sourcemaps: false
        })
        .pipe(concat('script.min.js'));

    //if (IS_PROD) {
        //result = result.pipe(terser()); // Сжимаем JS файл
    //}

    result
        // .pipe(rename({suffix: '.min'})) // дописываем суффикс .min
        .pipe(gulp.dest('scripts')) // Выгружаем в папку scripts
        .pipe(reload({stream: true}));

    return result;
});

//Запуск веб-сервера
gulp.task('webserver', function () {
    browserSync(config);
});
 
gulp.task('watch', function() {
    // наблюдаем за выбранными файлами и запускаем соответствующий таск для обработки файлов
    gulp.watch('_dev/styles/fonts.scss', gulp.parallel('styles-fonts'));
    gulp.watch('_dev/styles/**/*', gulp.parallel('styles'));
    gulp.watch('_dev/scripts/**/*', gulp.parallel('scripts'));
});

gulp.task('build-styles', gulp.series('styles'));
// gulp.task('build-scripts', gulp.series('build-js', 'scripts'));


// это таск по умолчанию. запускается из папки проекта командой "gulp".
gulp.task('default', gulp.series('styles-fonts', 'styles', 'scripts', gulp.parallel('webserver', 'watch')));
// можно запустить отдельные таски. для этого после команды "gulp"
// перечисляются таски, которые нужно запустить.