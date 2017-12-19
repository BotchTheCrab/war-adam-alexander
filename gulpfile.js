
var gulp = require('gulp'),
	replace = require('gulp-string-replace'),
	fileinclude = require('gulp-file-include'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	uglify = require('gulp-uglify');

var paths = {
	pages: 'src/*.html',
	scripts: 'src/js/*.js',
	sass: {
		root: 'src/sass/application.scss',
		sources:  'src/sass/**/*.scss',
		destination: 'dist/css'
	},
	cards: 'src/scalable-css-playing-cards-master/'
};

////// SASS

function sassCompile(srcPath, destPath) {
	gulp.src(srcPath)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}))
		//.pipe(sass({outputStyle: 'compact'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(destPath));
};

gulp.task('Sass-Compile', function() {
	sassCompile(paths.sass.root, paths.sass.destination);
});

gulp.task('Sass-Watch', function() {
	gulp.watch(paths.sass.sources, ['Sass-Compile']);
});


////// HTML

// copy playingcards.html and convert templates from Mustache to Angular
gulp.task('PlayingCards-Copy', function () {
	gulp.src(paths.cards + 'public/img/**')
		.pipe(gulp.dest('dist/img'));
	
	gulp.src([paths.cards + 'dist/playingcards.html'])
		.pipe(replace('text/x-mustache-template', 'text/ng-template'))
		.pipe(replace('{{{', '{{')).pipe(replace('}}}', '}}'))
		.pipe(gulp.dest('dist'));
});
	
gulp.task('Html-Copy', function () {
	return gulp.src(paths.pages)
        .pipe(fileinclude({ basepath: 'dist' }))
		.pipe(gulp.dest('dist'));
});

gulp.task('Html-Watch', function() {
	gulp.watch(paths.pages, ['Html-Copy']);
});


////// JAVASCRIPT

gulp.task('JavaScript-Bundle', function() {
	// Grabs the app.js file
    return browserify('src/js/application.js')
        .bundle()
        .pipe(source('war.js'))
		.pipe(buffer())
		.pipe(uglify())
        .pipe(gulp.dest('dist/js/'));
})

gulp.task('JavaScript-Watch', function() {
	gulp.watch(paths.scripts, ['JavaScript-Bundle']);
});

gulp.task('build', ['Html-Copy', 'PlayingCards-Copy', 'Sass-Compile', 'JavaScript-Bundle']);

gulp.task('default', ['Sass-Watch', 'Html-Watch', 'JavaScript-Watch']);
