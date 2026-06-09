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

    function createCard(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="' + movie.url + '" aria-label="' + movie.title.replace(/"/g, '&quot;') + '">',
            '        <img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
            '        <span class="play-float">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line"><a href="' + movie.categoryUrl + '">' + movie.category + '</a><span>' + movie.year + '</span></div>',
            '        <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
            '        <p>' + movie.oneLine + '</p>',
            '        <div class="tag-row"><span>' + movie.region + '</span><span>' + movie.type + '</span><span>' + movie.genre.split(/[,，/、\s]+/)[0] + '</span></div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    ready(function () {
        var input = document.querySelector(".search-input-large");
        var results = document.querySelector(".search-results");
        var empty = document.querySelector(".empty-state");
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = normalize(input.value);
            var terms = query.split(/\s+/).filter(Boolean);
            var data = window.SEARCH_MOVIES;
            var matches = data.filter(function (movie) {
                if (!terms.length) {
                    return true;
                }
                var haystack = normalize([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(" "));
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 96);
            results.innerHTML = matches.map(createCard).join("");
            empty.style.display = matches.length ? "none" : "block";
        }

        input.addEventListener("input", render);
        render();
    });
})();
