(function (step) {
  var parser = new less.Parser(),
      menu = step.querySelector(".menu"),
      showPreviewButton = step.querySelector(".action#show-hide-preview"),
      showCSSButton = step.querySelector(".action#show-hide-css"),
      preview = step.querySelector(".preview"),
      previewFrame = preview.querySelector("#preview-frame"),
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

   function injectCSS () {
      previewFrame.contentWindow.injectCSS(code_css.getValue());
   }

  getCMEditor(step.querySelector("#code-less"), function (editor) {
    code_less = editor;
    panels["less"] = editor;
    code_less.on("change", syncEditors);
    doLayout();
  });

  getCMEditor(step.querySelector("#code-css"), function (editor) {
    code_css = editor;
    panels["css"] = editor;
    code_css.on("change", injectCSS);
    syncEditors();
    doLayout();
  });

  var panels = {}

  panels["preview"] = preview;

  function getPanelElement (panel) {
    var elmt = panels[panel];
    if(elmt && elmt.getWrapperElement){
      elmt = panels[panel].getWrapperElement();
    }
    return elmt;
  }

  function display (panel, display) {
    var elmt = getPanelElement(panel);
    if(elmt){
      elmt.style.display = display;      
      doLayout();
      if(display === "") {
        panels[panel].refresh && panels[panel].refresh();
      }
    }
  }

  function doLayout () {
    var visible = Object.keys(panels).map(getPanelElement).filter(function(panel){
      return panel.style.display !== "none";
    });

    visible.forEach(function (panel) {      
      panel.style.width = Math.round(100/(visible.length||1)) + "%";
    });
  }

  menu.addEventListener("itemSelected", function (event) {
      var item = event.detail.item;
      if(item.dataset.loadTemplate) {
          var template = step.querySelector("script#"+item.dataset.loadTemplate);
          if(template) {
              code_less.setValue(formatTemplate(template.textContent));
              syncEditors();
          }
      }
  });

  showPreviewButton.addEventListener("click", function () {
    if(showPreviewButton.dataset.hidden === "true") {
      display("preview", "");
      showPreviewButton.dataset.hidden = "";
      showPreviewButton.textContent = "Hide Preview";
    }
    else {
      display("preview", "none");
      showPreviewButton.dataset.hidden = "true";
      showPreviewButton.textContent = "Show Preview";
    }
  });

  showCSSButton.addEventListener("click", function () {
    if(showCSSButton.dataset.hidden === "true") {
      display("css", "");
      showCSSButton.dataset.hidden = "";
      showCSSButton.textContent = "Hide CSS";
    }
    else {
      display("css", "none");
      showCSSButton.dataset.hidden = "true";
      showCSSButton.textContent = "Show CSS";
    }
  });

  display("preview", "none");
  showPreviewButton.dataset.hidden = "true";

})(document.querySelector(".step#lesscss-demo"));