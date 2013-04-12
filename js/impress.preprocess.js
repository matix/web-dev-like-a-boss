(function (root) {
    var $ = function (selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var attrs = ["x", "y", "z", "rotateX", "rotateY", "rotateZ", "scale"];

    $("[data-impress-section]", root).forEach(function (section) {
        $(".step, [data-impress-section]", section).forEach(function(target){
            attrs.forEach(function (attr) {
                if(section.dataset[attr] && !target.dataset[attr]) {
                    target.dataset[attr] = section.dataset[attr];
                }
            });
        });
    });

    var resolveExpression = function(exp, prev_val) {
        return (new Function("prev", "return " + exp))(prev_val);
    }

    $(".step", root).forEach(function (step, i, steps) {
        var prev = (i-1>0)? steps[i-1] : null;
        attrs.forEach(function (attr) {
           var exp = step.dataset[attr];
           if(exp && isNaN(+exp)){
             var prev_val = prev? (prev.dataset[attr] || 0) : 0;
             try {
                step.dataset[attr] = resolveExpression(exp, +prev_val);
             }
             catch(e) {
                step.dataset[attr] = "";
             }
           }
        });
    });

})(document.getElementById("impress"));