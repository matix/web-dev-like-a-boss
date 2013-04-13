(function (global, step) {
  var initialized = false;

  function init() {
      
    var socket = io.connect('http://localhost:8001');

    var console_ui = step.querySelector(".console")
        output_ui = console_ui.querySelector(".output"),
        input_ui = console_ui.querySelector("#cursor"),
        status_ui = step.querySelector(".repl-status");

    status_ui.innerHTML = "[Connecting...]";

    socket.on("connect", function () {
      status_ui.innerHTML = "[OK]";
    });

    socket.on('stdout', function (data) {
      output_ui.innerHTML += '<li class="log">' + data + '</li>';
      console_ui.scrollByLines(9999);
    });

    socket.on('stderr', function (data) {
      output_ui.innerHTML += '<li class="error">' + data + '</li>';
      console_ui.scrollByLines(9999);
    });

    socket.on('connect_failed', function () {
      status_ui.innerHTML = "[Could not reach REPL socket...]";
    });

    socket.on('error', function () {
      status_ui.innerHTML = "[Could not reach REPL socket...]";
    });

    function exec (cmd) {
      socket.emit("exec", cmd);
    }

    input_ui.addEventListener("keyup", function (e) {
      if(!e.shiftKey && e.keyCode == 13 /*ENTER*/) {
        var command = input_ui.textContent.toString();
        output_ui.innerHTML += '<li class="command">' + command + '</li>';
        input_ui.innerHTML = " ";
        input_ui.focus();
        exec(command);
      }
      else if (e.keyCode == 38 /*UP*/){
        if(input_ui.textContent.indexOf("\n") == -1) {
          var commands = output_ui.querySelectorAll("li.command"),
              last = commands.length>0 && commands[commands.length-1];
          if(last) {
            input_ui.innerHTML = last.textContent;
          }
        }
      }
    });
  }

  step.addEventListener("impress:stepenter", function () {
    if(!initialized) {
      init();
      initialized = true;
    }
  })

})(window, document.querySelector(".step#nodejs-demo"));