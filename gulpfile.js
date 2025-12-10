const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

function copyIcons() {
	// Copy icons from nodes folders, maintaining directory structure
	src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));

	// Copy icons from credentials folders, maintaining directory structure
	return src('credentials/**/*.{png,svg}')
		.pipe(dest('dist/credentials'));
}
