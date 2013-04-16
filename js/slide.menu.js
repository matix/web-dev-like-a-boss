(function () {
    var $ = function (selector, base) {
        base = base || document;
        return Array.prototype.slice.call(base.querySelectorAll(selector));
    }
    
    document.addEventListener("DOMContentLoaded", function () {
       $(".slide .menu").forEach(function (menu) {
            var content = $(".content", menu)[0];

            content.style.display = "none";

            menu.addEventListener("mouseover", function () {
                content.style.display = "block";
                menu.classList.add("open");
            });
            menu.addEventListener("mouseout", function () {
                content.style.display = "none";
                menu.classList.remove("open");
            });
            menu.addEventListener("itemSelected", function () {
                content.style.display = "none";
                menu.classList.remove("open");
            });

            $(".item", content).forEach(function (item) {
                item.addEventListener("click", function () {
                    var event = document.createEvent("CustomEvent");
                    event.initCustomEvent("itemSelected", true, true, {item: item});
                    menu.dispatchEvent(event);
                });
            });
        }); 
    });
})();