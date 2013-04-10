/*global module:false*/
module.exports = function(grunt) {

  var exec = require('child_process').exec;

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

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
    connect: {"default":{ keepalive:true}},
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

  // Start static server
  grunt.registerTask('start', ['connect:default:keepalive']);

  // Bootstrap for development !
  grunt.registerTask('up', function () {

    grunt.log.writeln("Watching files for changes...");
    exec("grunt watch").on("exit", function() { grunt.log.writeln("Watch down!")});
    grunt.log.writeln("Starting static server...");
    exec("grunt start").on("exit", function() { grunt.log.writeln("Server down!")});;
    setTimeout(function () {
      grunt.log.writeln("Booting up chrome...");
      exec('open -a "Google Chrome" http://localhost:8000');
    }, 1000);

    this.async();
  });

};
