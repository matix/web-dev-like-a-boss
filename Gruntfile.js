/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {},
      files: ['Gruntfile.js']
    },
    less: {
      "default": {
        paths: ["css/"],
        files: {
          "css/main.css": "css/main.less"
        }
      }
    },
    watch: {
      "js": {
        files: '<%= jshint.files %>',
        tasks: ['jslint']
      },
      "less": {
        files: 'css/**.less',
        tasks: ["less"]
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'less']);

};
