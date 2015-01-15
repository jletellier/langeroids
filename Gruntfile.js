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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', [ 'browserify:dist' ]);
    grunt.registerTask('dev', [ 'browserify:dist', 'watch' ]);

};