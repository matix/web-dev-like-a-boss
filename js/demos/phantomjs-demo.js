(function (global, step) {
  var initialized = false;

  function init() {
    if(initialized) {
      return;
    }

    var SERVICE = "//localhost:8003/rasterize?q=",
        url = step.querySelector(".url input"),
        result = step.querySelector(".rasterized iframe")

     function getRasterized (url) {
        result.src =  SERVICE+url;
     }

     url.addEventListener("keyup", function (e) {
      if(e.keyCode == 13 /*ENTER*/) {
         var urlToRender = url.value;
         getRasterized(urlToRender);
      }
     });

    initialized = true;
  }

  step.addEventListener("impress:stepenter", init);

})(window, document.querySelector(".step#phantomjs-demo"));