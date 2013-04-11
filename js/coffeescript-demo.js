(function (menu) {
  var code_cs , code_js;

  function syncEditors () {
      try {
        code_js.setValue(CoffeeScript.compile(code_cs.getValue()));
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

})(document.querySelector("#lesscss-demo .menu"));