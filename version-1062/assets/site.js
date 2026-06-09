(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function escapeHTML(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
            document.body.classList.toggle("menu-open", menu.classList.contains("open"));
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("open");
                document.body.classList.remove("menu-open");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function initFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var clear = document.querySelector("[data-filter-clear]");
        function run() {
            var filters = {};
            selects.forEach(function (select) {
                if (select.value) {
                    filters[select.getAttribute("data-filter")] = select.value;
                }
            });
            cards.forEach(function (card) {
                var visible = Object.keys(filters).every(function (key) {
                    return card.getAttribute("data-" + key) === filters[key];
                });
                card.classList.toggle("is-hidden", !visible);
            });
        }
        selects.forEach(function (select) {
            select.addEventListener("change", run);
        });
        if (clear) {
            clear.addEventListener("click", function () {
                selects.forEach(function (select) {
                    select.value = "";
                });
                run();
            });
        }
        run();
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\" data-region=\"" + escapeHTML(item.region) + "\" data-type=\"" + escapeHTML(item.type) + "\" data-year=\"" + escapeHTML(item.year) + "\">" +
            "<a class=\"poster\" href=\"./" + escapeHTML(item.file) + "\" aria-label=\"" + escapeHTML(item.title) + "\">" +
            "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-missing')\">" +
            "<span class=\"poster-shade\"></span><span class=\"quality-badge\">高清</span></a>" +
            "<div class=\"card-body\"><div class=\"meta-line\"><span>" + escapeHTML(item.year) + "</span><span>" + escapeHTML(item.region) + "</span><span>" + escapeHTML(item.type) + "</span></div>" +
            "<h3><a href=\"./" + escapeHTML(item.file) + "\">" + escapeHTML(item.title) + "</a></h3>" +
            "<p>" + escapeHTML(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        if (!form || !input || !results || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var startQuery = params.get("q") || "";
        input.value = startQuery;
        function render(query) {
            var q = query.trim().toLowerCase();
            if (!q) {
                title.textContent = "精选推荐";
                results.innerHTML = window.SEARCH_DATA.slice(0, 24).map(cardTemplate).join("");
                return;
            }
            var found = window.SEARCH_DATA.filter(function (item) {
                var words = [item.title, item.region, item.type, item.year, item.genre, item.oneLine].concat(item.tags || []).join(" ").toLowerCase();
                return words.indexOf(q) !== -1;
            }).slice(0, 160);
            title.textContent = "搜索结果";
            if (!found.length) {
                results.innerHTML = "<div class=\"empty-state\">没有匹配到相关影片，可以换一个关键词继续搜索。</div>";
                return;
            }
            results.innerHTML = found.map(cardTemplate).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
            window.history.replaceState(null, "", url);
            render(query);
        });
        render(startQuery);
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
}());
