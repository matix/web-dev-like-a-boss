(function (menu, runButton) {
  var code_cs , code_js;

  var display = runButton.style.display;

  function syncEditors () {
      try {
        code_js.setOption("mode", "javascript");
        code_js.setValue(CoffeeScript.compile(code_cs.getValue()));
        runButton.style.display = display;
      }
      catch(e){ /* WHAT ERROR?! */}
   }

  getCMEditor(document.querySelector("#coffeescript-demo #code-cs"), function (editor) {
    code_cs = editor;
    code_cs.on("change", syncEditors);
  });

  getCMEditor(document.querySelector("#coffeescript-demo #code-js"), function (editor) {
    code_js = editor;
    syncEditors();
  });

  menu.addEventListener("itemSelected", function (event) {
      var item = event.detail.item;
      if(item.dataset.loadTemplate) {
          var template = document.querySelector("script#"+item.dataset.loadTemplate);
          if(template) {
              code_cs.setValue(formatTemplate(template.textContent));
              syncEditors();
          }
      }
  });

  var consoleBuffer = "",
      consoleWrapper  = {
        log: function() {
          var args = Array.prototype.slice.call(arguments);
          console.log.apply(console, args);
          consoleBuffer += args.join(",") + "\n";
        },
        error: function () {
          var args = Array.prototype.slice.call(arguments);
          alert("ERROR:" + args.join(","));
          console.error.apply(console, args);          
        }
      }

  function run (code) {
      var runner = new Function("console", code);
      runner(consoleWrapper);
      code_js.setOption("mode", "");
      code_js.setValue(consoleBuffer);
      consoleBuffer = "";
  }

  runButton.addEventListener("click", function (e) {
    event.preventDefault();
    try {
      run(code_js.getValue());
      runButton.style.display = "none";
    } catch(e) {
      consoleWrapper.error(e);
    }
  });

})(document.querySelector("#coffeescript-demo .menu"), document.querySelector("#coffeescript-demo .run"));