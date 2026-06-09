(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }
        });

        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var input = panel.querySelector(".filter-input");
            var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var activeFilter = "all";

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var title = normalize(card.getAttribute("data-title"));
                    var region = normalize(card.getAttribute("data-region"));
                    var type = normalize(card.getAttribute("data-type"));
                    var genre = normalize(card.getAttribute("data-genre"));
                    var tags = normalize(card.getAttribute("data-tags"));
                    var haystack = [title, region, type, genre, tags].join(" ");
                    var textMatch = !query || haystack.indexOf(query) !== -1;
                    var filterMatch = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
                    card.classList.toggle("hidden-card", !(textMatch && filterMatch));
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("active", item === chip);
                    });
                    applyFilter();
                });
            });
        });
    });
})();
