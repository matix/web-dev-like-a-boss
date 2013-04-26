(function (global, step) {
  var initialized = false;

  function init() {
    if(initialized) {
      return;
    }
      
    var SERVER = 'http://localhost:8002',
        socket = io.connect(SERVER), 
        online = false;

    var console_ui = step.querySelector(".console")
        output_ui = console_ui.querySelector(".output"),
        input_ui = console_ui.querySelector("#cursor"),
        status_ui = step.querySelector(".repl-status");

    status_ui.innerHTML = "[Connecting...]";
    
    var statusTimeout = -1;

    function safeOutput (output) {
      return output && output.toString()
                             .replace("<", "&lt;")
                             .replace(">", "&gt;")
                             .replace("&", "&amp;")
                             .replace('"', "&quot;");
    }

    function disableInput() {
      input_ui.style.display = "none";
    }

    function enableInput() {
      input_ui.style.display = "";
      input_ui.focus();
    }

    function log (message) {
      output_ui.innerHTML += '<li class="log">'+safeOutput(message)+'</li>';
      console_ui.scrollByLines(9999);
    }

    function error (errorMessage) {
      output_ui.innerHTML += '<li class="error">' + safeOutput(errorMessage) + '</li>';
      console_ui.scrollByLines(9999);
    }

    function command (commandMessage) {
      output_ui.innerHTML += '<li class="command">' + safeOutput(commandMessage) + '</li>';
      console_ui.scrollByLines(9999);
    }

    function statusWait (errorMessage, callback) {
      if(statusTimeout == -1) {
        statusTimeout = setTimeout(function () {
          status_ui.innerHTML = errorMessage || "[LOST CONNECTION TO NODE REPL SERVER]";
          statusTimeout = -1;
          online = false;
          typeof callback == "function" && callback();
        },3000);
      }
    }

    function statusOK (argument) {
      if(statusTimeout != -1) {
        clearTimeout(statusTimeout);
        statusTimeout = -1;
        status_ui.innerHTML = '<span class="ok">[OK]</span>';
        online = true;
      }
    }

    var exec = function () {
      output_ui.innerHTML += '<li class="log">Still connecting...</li>';
    },
      kill = function () {
        output_ui.innerHTML += '<li class="log">Still connecting...</li>';
      }

    socket.on("connect", function () {
      statusOK();

        socket.on('stdout', function (data) {
          log(data);
          statusOK();
        });

        socket.on('stderr', function (data) {
          error(data);
          console_ui.scrollByLines(9999);
          statusOK();
        });

        socket.on("exec_init", function () {
          statusOK();
        });

        socket.on("exec_end", function () {
          statusOK();
        });

        socket.on("kill_ok", function () {
          statusOK();
        });

        exec = function (cmd) {
          command(cmd);
          socket.emit("exec", cmd);
          statusWait();
        }

        kill = function () {
          socket.emit("kill");
          statusWait();
        }
    });

    
    statusWait("[COULD NOT ESTABLISH CONNECTION TO A LOCAL NODE SERVER: "+SERVER+"]"+
                "<br>Please note that this example is intended to run locally.",
      function () {
        socket.disconnect();
      });

    var history_step = 0;

    input_ui.addEventListener("keyup", function (e) {
      if(!e.shiftKey && e.keyCode == 13 /*ENTER*/) {
        var command = input_ui.textContent.toString().split("\n").join("");
        input_ui.innerHTML = " ";
        input_ui.focus();
        history_step = 0;
        exec(command);
        e.preventDefault();
      }
      else if (e.keyCode == 38 /*UP*/) {
        if(input_ui.textContent.indexOf("\n") == -1) {
          var commands = output_ui.querySelectorAll("li.command"),
              last = commands.length>0 && commands.length>history_step && commands[commands.length - 1 - history_step];
          if(last) {
            input_ui.innerHTML = last.textContent;
            history_step++;
            e.preventDefault();
          }
        }
      } 
      else if (e.keyCode == 40 /*DOWN*/) {
        if(history_step && input_ui.textContent.indexOf("\n") == -1) {
          var commands = output_ui.querySelectorAll("li.command"),
              last = commands.length>0 && commands[commands.length - history_step];
          if(last) {
            input_ui.innerHTML = last.textContent;
            history_step--;
            e.preventDefault();
          }
        }
      }
      else if (e.keyCode == 67 /*C*/ && e.ctrlKey){
        kill();
      }
    });

    initialized = true;
  }

  step.addEventListener("impress:stepenter", init);

})(window, document.querySelector(".step#npm-demo"));