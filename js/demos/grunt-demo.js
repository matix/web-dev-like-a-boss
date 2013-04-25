(function (step) {

    var initialized = false;

    function initStep () {

        if(initialized) return;

        initialized = true;
          
        var gruntfile = step.querySelector("#gruntfile"),
            markerMenu = step.querySelector(".markers"),
            markers = [].slice.call(markerMenu.children);

        getCMEditor(gruntfile, function (editor) {
           var xhr = new XMLHttpRequest();
           xhr.open("GET", "Gruntfile.js");
           xhr.addEventListener("load", function () {
             editor.setValue(xhr.responseText);
           });
           xhr.send();

           var currentHLineA, currentHLineB;

           function restoreLines () {
             editor.display.wrapper.classList.remove("fade");
             editor.eachLine(currentHLineA, currentHLineB, function (line) {
               editor.removeLineClass(editor.doc.getLineNumber(line), "wrap", "highlight")
             });
           }

           function highlightSnippet (lineA, lineB) {
            currentHLineA = lineA-1;
            currentHLineB = lineB;

            editor.display.wrapper.classList.add("fade");

            editor.eachLine(currentHLineA, currentHLineB, function (line) {
               editor.addLineClass(editor.doc.getLineNumber(line),  "wrap", "highlight");
            });

            var lc = lineB-lineA;
            editor.scrollIntoView(1);
            if(lc > 25){
              editor.scrollIntoView( lineA + 10 );
            }
            else {
              editor.scrollIntoView( lineB );
            }
          }

          var pinned = false;

          function highlightMarker (marker) {                
            marker.dataset.pinned = "true";
            marker.classList.add("pinned");
          }

          function restoreMarker (marker) {
            marker.dataset.pinned = "";
            marker.classList.remove("pinned");
          }

          markers.forEach(function (marker, i) {
            marker.addEventListener("mouseover", function () {
              if(!pinned) {
                highlightSnippet(+marker.dataset.snippetA, +marker.dataset.snippetB);
              }
            });

            marker.addEventListener("click", function () {
              if(marker.dataset.pinned == "true") {
                pinned = false;
                restoreMarker(marker);
                restoreLines();
              }
              else {
                pinned = true;
                markers.forEach(restoreMarker);
                highlightMarker(marker);
                restoreLines();
                highlightSnippet(+marker.dataset.snippetA, +marker.dataset.snippetB);
              }
            });
          });

          markerMenu.addEventListener("mouseout", function () {
            if(!pinned) {
              restoreLines();
            }
          });
        });
    }

    step.addEventListener("impress:stepenter", initStep);

  })(document.querySelector("#grunt-demo"));