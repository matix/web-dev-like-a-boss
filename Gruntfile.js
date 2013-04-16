/*global module:false require:false console:false process:false*/
module.exports = function(grunt) {

  var exec = require('child_process').exec;

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
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
      "main": {
        paths: ["css/"],
        files: {
          "css/main.css": "css/main.less"
        }
      }
    },
    concat: {
      "js": {
        options: {
          separator: ';'
        },
        src: [
          'node_modules/codemirror/lib/codemirror.js',
          'node_modules/codemirror/mode/shell/shell.js',
          'node_modules/codemirror/mode/less/less.js',
          'node_modules/codemirror/mode/xml/xml.js',
          'node_modules/codemirror/mode/css/css.js',
          'node_modules/codemirror/mode/javascript/javascript.js',
          'node_modules/codemirror/mode/coffeescript/coffeescript.js',
          'node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
          'node_modules/less/dist/less-1.3.3.js',
          'node_modules/socket.io-client/dist/socket.io.js',
          'js/lib/coffee-script.js',
          'js/codemirror.bootstrap.js',
          'js/slide.menu.js'
        ],
        dest: 'js/bundle.js'
      },
      "css":{
        src: [
          'node_modules/codemirror/lib/codemirror.css',
          'node_modules/codemirror/theme/lesser-dark.css',
          'css/main.css'
        ],
        dest:"css/bundle.css"
      }
    },
    connect: {"default":{ keepalive:true}},
    watch: {
      "gruntfile": {
        files: ['Gruntfile.js'],
        tasks: ['jshint']
      },
      "less": {
        files: ['css/**.less'],
        tasks: ["less"]
      },
      "js": {
        files: "<%= concat.js.src%>",
        tasks: ["concat:js"]
      },
      "css": {
        files: ["css/main.css"],
        tasks: ["concat:css"]
      }
    },
    publish: {
      "gh-pages": {
        dest: "gh-pages",
        src: [
          "img/*.*",
          "css/bundle.css",
          "js/bundle.js",
          "js/demos/**.js",
          "js/impress.preprocess.js",
          "js/lib/impress.js",
          "index.html",
          "less-demo.html",
          "README.md"
        ]
      }
    }
  });

  // Default task.
  grunt.registerTask('build', ['less', 'concat']);

  // Start static server
  grunt.registerTask('start', ['connect:default:keepalive']);

  // Publish distrubution files
  grunt.registerMultiTask("publish", function () {
      this.files.forEach(function (file) {

        file.src.forEach(function (srcfile) {
          grunt.file.copy(srcfile, file.dest + "/" + srcfile);
        });

      });
  });

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
    
    if(dev || !grunt.file.exists("js/bundle.js")) {
      run("grunt build");
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
