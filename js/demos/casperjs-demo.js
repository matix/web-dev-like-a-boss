  (function (step) {

  var initialized = false;

  function initStep () {

      if(initialized) return;

      initialized = true;
        
      var script = step.querySelector("#casper-script");

      getCMEditor(script, function (editor) {
         var xhr = new XMLHttpRequest();
         xhr.open("GET", "casperjs/googlelinks.js");
         xhr.addEventListener("load", function () {
           editor.setValue(xhr.responseText);
         });
         xhr.send();
     });
  }

  step.addEventListener("impress:stepenter", initStep);

})(document.querySelector("#casperjs-demo"));