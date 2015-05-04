'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        browserify: {
            dist: {
                src: [ 'client.js' ],
                dest: 'dist/langeroids.js'
            }
        },

        watch: {
            app: {
                files: [
                    'lib/**/*.js'
                ],
                tasks: [ 'browserify:dist' ]
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/langeroids.min.js': [ '<%= browserify.dist.dest %>' ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', [ 'browserify:dist', 'uglify:dist' ]);
    grunt.registerTask('dev', [ 'browserify:dist', 'watch' ]);

};