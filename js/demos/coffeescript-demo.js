(function (step) {
  var editors = {},
      menu = step.querySelector(".menu"), 
      runButton = step.querySelector("#coffeescript-demo .run"),
      hideButton = step.querySelector("#coffeescript-demo .show-hide");

  function syncEditors () {
      try {
        editors["js"].setValue(CoffeeScript.compile(editors["cs"].getValue()));
        hide("output");
      }
      catch(e){ /* WHAT ERROR?! */}
   }

  function show (editor) {
    var elmt = editors[editor] && editors[editor].getWrapperElement();
    if(elmt){
      elmt.style.display = "";
      doLayout();
      editors[editor].refresh();
    }
  }

  function hide(editor) {
    var elmt = editors[editor] && editors[editor].getWrapperElement();
    if(elmt){
      elmt.style.display = "none";
      doLayout();
    }
  }

  function doLayout () {
    var visible = Object.keys(editors).filter(function(editor){
      return editors[editor].getWrapperElement().style.display !== "none";
    });

    visible.forEach(function (editor) {      
      editors[editor].getWrapperElement().style.width = Math.round(100/(visible.length||1)) + "%";
    });
  }

  getCMEditor(document.querySelector("#coffeescript-demo #code-cs"), function (editor) {
    editors["cs"] = editor;
    editors["cs"].on("change", syncEditors);    
  });

  getCMEditor(document.querySelector("#coffeescript-demo #code-js"), function (editor) {
    editors["js"] = editor;
    syncEditors();
  });

  getCMEditor(document.querySelector("#coffeescript-demo #output"), function (editor) {
    editors["output"] = editor;
    hide("output");
  });

  menu.addEventListener("itemSelected", function (event) {
      var item = event.detail.item;
      if(item.dataset.loadTemplate) {
          var template = document.querySelector("script#"+item.dataset.loadTemplate);
          if(template) {
              editors["cs"].setValue(formatTemplate(template.textContent));
              syncEditors();
          }
      }
  });

  var consoleBuffer = "",
      consoleWrapper  = {
        log: function() {
          var args = Array.prototype.slice.call(arguments);
          console.log.apply(console, args);
          consoleBuffer += args.join(" ") + "\n";
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
      editors["output"].setValue(consoleBuffer);
      consoleBuffer = "";
  }

  runButton.addEventListener("click", function (e) {
    event.preventDefault();
    try {
      run(editors["js"].getValue());
    } catch(e) {
      consoleWrapper.error(e);
    }

    show("output");
  });

  hideButton.addEventListener("click", function (e) {
    e.preventDefault();

    if(hideButton.dataset.hidden == "true") {
      show("js");
      hideButton.dataset.hidden = "";
      hideButton.innerHTML = "Hide JS";
    }
    else {
      hide("js");
      hideButton.dataset.hidden = "true";
      hideButton.innerHTML = "Show JS";
    }
  });

})(document.querySelector(".step#coffeescript-demo"));