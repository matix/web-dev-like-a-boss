/*global module:false require:false console:false*/
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
        tasks: ['jshint']
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

    function run (cmd, log, donelog) {
      grunt.log.writeln(log);
      var child = exec(cmd);

      child.stdout.on('data', function(buf) {
        process.stdout.write(buf);
      });
      child.stderr.on('data', function(buf) {
        process.stderr.write(buf);
      });
      child.on('close', function(code) {
         console.log(donelog||"");
      });

      return child;
    }

    var dev = grunt.option("dev") != null;

    if(dev) {
      run("grunt watch", "Watching files for changes...", "Watch down!");
    }
    
    if(dev || !grunt.file.exists("css/main.css")) {
      run("grunt less");
    }

    run("grunt start", "Starting static server...", "Server down!");
    run("node node/node-repl-server.js", "Starting REPL server...", "REPL Server down!");
    
    if(!grunt.option("no-launch")) {
      setTimeout(function () {
        run('open -a "Google Chrome" http://localhost:8000',"Booting up chrome...");
      }, 1000);
    }

    this.async();
  });

};
