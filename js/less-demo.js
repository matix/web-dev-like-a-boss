(function (step) {
  var parser = new less.Parser(),
      menu = step.querySelector(".menu"),
      code_less , code_css;

  function syncEditors () {
      try {
          parser.parse(code_less.getValue(), function (error, result) {
              if(!error) {
                  code_css.setValue(result.toCSS());
              }
          });
      }
      catch(e){ /* WHAT ERROR?! */}
   }

  getCMEditor(document.querySelector("#lesscss-demo #code-less"), function (editor) {
    code_less = editor;
    code_less.on("change", syncEditors);
  });

  getCMEditor(document.querySelector("#lesscss-demo #code-css"), function (editor) {
    code_css = editor;
    syncEditors();
  });

  menu.addEventListener("itemSelected", function (event) {
      var item = event.detail.item;
      if(item.dataset.loadTemplate) {
          var template = document.querySelector("script#"+item.dataset.loadTemplate);
          if(template) {
              code_less.setValue(formatTemplate(template.textContent));
              syncEditors();
          }
      }
  });

})(document.querySelector(".step#lesscss-demo"));