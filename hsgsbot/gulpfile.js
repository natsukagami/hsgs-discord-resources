const gulp = require('gulp');
const gulpBabel = require('gulp-babel');

gulp.task('default', () => {
	gulp.src('src/**/*.js')
		.pipe(gulpBabel({
			presets: ['env']
		}))
		.pipe(gulp.dest('dist'));
});