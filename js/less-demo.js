(function (cm, menu) {
  var parser = new less.Parser();

  var code_less_src = document.querySelector("#lesscss-demo #code-less"),
      code_less_src_val = code_less_src.textContent;

  code_less_src.innerHTML = "";

  var code_less = cm(code_less_src, {
      value: formatTemplate(code_less_src_val),
      theme: "lesser-dark",
      lineNumbers : true,
      onKeyEvent: syncEditors
    });

   var code_css = cm(document.querySelector("#lesscss-demo #code-css"), {
      theme: "lesser-dark",
      lineNumbers : true
    });

   function formatTemplate (template) {
      template = template.replace(/^\n/g,"")
      var lines = template.split(/[\r\n|\n]/),
          margin = lines[0].search(/\S/);

      lines = lines.map(function (line) {
          return line.substr(margin);
      });

      template = lines.join("\n");

      return template;
   }

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

   syncEditors();

})(CodeMirror, document.querySelector("#lesscss-demo .menu"));