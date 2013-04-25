(function (CodeMirror) {
    var editors = [];

    function initCodeMirrorInstances (target) {
        var cm_instances = Array.prototype.slice.call(target.querySelectorAll("[data-codemirror=true]"));

        cm_instances.forEach(function (element) {
            if(_getCMEditor(element)) {
                return;
            }

            var options = {};
            options.mode = element.dataset.mode || "htmlmixed";
            options.readOnly = element.dataset.readOnly == "true";
            options.theme = "lesser-dark";
            options.lineNumbers = true;

            var editor;

            if(element.nodeName == "TEXTAREA") {
                var formattedValue = formatTemplate(element.value) || "";
                editor = CodeMirror.fromTextArea(element, options);
                editor.setValue(formattedValue);
            }
            else {
                options.value = formatTemplate(element.innerHTML) || "";
                element.innerHTML = "";
                editor = CodeMirror(element, options);
            }
            
            editors.push([element, editor]);

            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("CodeMirrorReady");
            element.dispatchEvent(event);
        });
    };

   window.formatTemplate  = function (template) {
      template = template.replace(/^\n/g,"")
                         .replace(/&gt;/g, ">")
                         .replace(/lt;/g, "<")
                         .replace("&amp;", "&");
      var lines = template.split(/[\r\n|\n]/),
          margin = lines[0].search(/\S/);

      lines = lines.map(function (line) {
          return line.substr(margin);
      });

      template = lines.join("\n");

      return template;
   }

    function _getCMEditor (element) {
        var result = editors.filter(function (i) {
            return i[0] === element;
        })[0];

        return result && result[1];
    }

    window.getCMEditor = function (element, callback) {
        var editor = _getCMEditor(element);

        if(!editor) {
            element.addEventListener("CodeMirrorReady", function () {
                callback(_getCMEditor(element));
            });
        }
        else {
            callback(editor);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        var steps = Array.prototype.slice.call(document.getElementsByClassName("step"));
        steps.forEach(function (step, i) {
            step.addEventListener("impress:stepleave", function () {
                steps[i+1] && initCodeMirrorInstances(steps[i+1]);
            });
            step.addEventListener("impress:stepenter", function () {
                initCodeMirrorInstances(step);
            });
        });        
    });
})(CodeMirror);