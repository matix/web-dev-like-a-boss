(function (global, step) {
  var initialized = false;

  function init() {
    if(initialized) {
      return;
    }
      
    var SERVER = 'http://localhost:8001',
        socket = io.connect(SERVER), 
        online = false;

    var console_ui = step.querySelector(".console")
        output_ui = console_ui.querySelector(".output"),
        input_ui = console_ui.querySelector("#cursor"),
        suggestion_ui = console_ui.querySelector(".suggestion"),
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

    var suggestions, currentSuggestion = -1;

    function suggest (suggestions_data) {
      suggestions = suggestions_data;
      suggestion_ui.innerHTML = '<div class="entry">' + suggestions_data.map(safeOutput).join('</div><div class="entry">') + '</div>';
      console_ui.scrollByLines(9999);
    }

    function suggestCycle (delta) {
      if(suggestions) {

        currentSuggestion += delta;

        if(currentSuggestion >= suggestions.length){
          currentSuggestion = 0;
        }
        else if(currentSuggestion < 0) {
          currentSuggestion = suggestions.length-1;
        }

        input_ui.innerHTML = suggestions[currentSuggestion];
        
        [].slice.call(suggestion_ui.childNodes).forEach(function (item, i) {
          if(i == currentSuggestion) {
            item.classList.add("active");
          }
          else {
            item.classList.remove("active");
          }
        });
      }
    }

    function suggentionClear () {
      if(suggestions) {
        suggestion_ui.innerHTML = "";
        suggestions = null;
        currentSuggestion = -1;
      }
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
    }

    socket.on("connect", function () {
      statusOK();

        socket.on('stdout', function (data) {
          log(data);
          statusOK();
        });

        socket.on('suggestion', function (data) {
          if(data) {
            suggest(data);
          }
          statusOK();
        });

        socket.on('stderr', function (data) {
          error(data);
          console_ui.scrollByLines(9999);
          statusOK();
        });

        exec = function (cmd) {
          command(cmd);
          suggentionClear();
          socket.emit("exec", cmd);
          statusWait();
        }
    });

    
    statusWait("[COULD NOT ESTABLISH CONNECTION TO A LOCAL NODE SERVER: "+SERVER+"]"+
                "<br>Please note that this example is intended to run locally."+
                "<br>This console has been degraded run local javascript, just so you don't get bored :)",
      function () {
        socket.disconnect();
        var consoleWrapper = {
          log: function () {
            log([].slice.call(arguments).join(" "));
          }
        }

        exec = function (cmd) {
          command(cmd);
          try {
            var result = (new Function("console", "return " + cmd))(consoleWrapper);
            log(result);
          }
          catch(e){
            error(e);
          }
        }
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
    });

    console_ui.addEventListener("keydown", function (e) {
      if(e.keyCode == 9 /*TAB*/) {
        e.preventDefault();
        if(!online) { return; }
        if(suggestions) {
          suggestCycle(e.shiftKey?-1:1);
        }
        else {
          var exp = input_ui.textContent;
          if(exp) {
            socket.emit("suggestion_query", exp);
            statusWait();
          }
        }
      }
      else if(!(e.keyCode == 16 /*SHIFT*/) && suggestions) {
        e.preventDefault();
        suggentionClear();
      }
    });

    initialized = true;
  }

  step.addEventListener("impress:stepenter", init);

})(window, document.querySelector(".step#nodejs-demo"));