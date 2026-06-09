(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });

        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
                document.body.classList.toggle("menu-lock", nav.classList.contains("is-open"));
            });
        }

        document.querySelectorAll(".quick-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });

        var hero = document.querySelector(".hero");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }
            hero.querySelectorAll("[data-hero-next]").forEach(function (button) {
                button.addEventListener("click", function () {
                    show(current + 1);
                });
            });
            hero.querySelectorAll("[data-hero-prev]").forEach(function (button) {
                button.addEventListener("click", function () {
                    show(current - 1);
                });
            });
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            show(0);
            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        var filterPanel = document.querySelector(".filter-panel");
        if (filterPanel) {
            var params = new URLSearchParams(window.location.search);
            var queryInput = filterPanel.querySelector(".filter-search");
            if (queryInput && params.get("q")) {
                queryInput.value = params.get("q");
            }
            var controls = Array.prototype.slice.call(filterPanel.querySelectorAll("input, select"));
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title], .rank-row[data-title]"));
            var emptyState = document.querySelector(".empty-state");
            function applyFilters() {
                var keyword = normalize(queryInput && queryInput.value);
                var region = normalize(filterPanel.querySelector("[data-filter='region']") && filterPanel.querySelector("[data-filter='region']").value);
                var type = normalize(filterPanel.querySelector("[data-filter='type']") && filterPanel.querySelector("[data-filter='type']").value);
                var year = normalize(filterPanel.querySelector("[data-filter='year']") && filterPanel.querySelector("[data-filter='year']").value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                        matched = false;
                    }
                    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        shown += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("active", shown === 0);
                }
            }
            controls.forEach(function (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            });
            applyFilters();
        }

        document.querySelectorAll(".player-card").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var button = player.querySelector(".play-button");
            var status = player.querySelector(".player-status");
            var stream = player.dataset.stream;
            var started = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function startPlayback() {
                if (!video || !stream || started) {
                    return;
                }
                started = true;
                overlay && overlay.classList.add("is-hidden");
                setStatus("正在播放");
                if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {
                                setStatus("点击画面继续播放");
                            });
                        });
                    } else {
                        video.play().catch(function () {
                            setStatus("点击画面继续播放");
                        });
                    }
                    if (window.Hls.Events && window.Hls.Events.ERROR) {
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus("播放失败，请稍后再试");
                            }
                        });
                    }
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.play().catch(function () {
                        setStatus("点击画面继续播放");
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {
                        setStatus("播放失败，请稍后再试");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", startPlayback);
            }
            if (overlay) {
                overlay.addEventListener("click", startPlayback);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        startPlayback();
                    }
                });
                video.addEventListener("play", function () {
                    overlay && overlay.classList.add("is-hidden");
                    setStatus("正在播放");
                });
            }
        });
    });
}());
