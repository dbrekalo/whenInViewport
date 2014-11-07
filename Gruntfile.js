/* jshint node: true */
module.exports = function(grunt) {

	grunt.initConfig({

		uglify: {
			min: {
				files: [{
					expand: true,
					cwd: 'src',
					src: '**/*.js',
					dest: 'dist',
					ext: '.min.js'
				}],
				options: {

				}
			}
		},

		copy: {
			jsFiles: {
				files: [{
					expand: true,
					cwd: 'src',
					src: ['**/*.js'],
					dest: 'dist'
				}]
			}
		},

		jshint: {
			options: {
				'jshintrc': '.jshintrc'
			},
			all: ['src','Gruntfile.js']
		},

		watch: {
			jsFiles: {
				expand: true,
				files: ['src/**/*.js'],
				tasks: ['jshint', 'copy','uglify'],
				options: {
					spawn: false
				}
			}
		}

	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['jshint', 'uglify', 'copy']);

};
