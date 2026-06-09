(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initImages() {
    document.querySelectorAll("img[data-soft-image]").forEach(function (img) {
      img.addEventListener("error", function () {
        var shell = img.closest(".poster-shell");
        if (shell) {
          shell.classList.add("is-empty");
        }
        img.remove();
      });
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === active);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCatalogFilters() {
    document.querySelectorAll(".catalog-filter").forEach(function (panel) {
      var search = panel.querySelector("[data-filter-search]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var grid = document.querySelector(panel.getAttribute("data-target"));
      var empty = document.querySelector(panel.getAttribute("data-empty"));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      function apply() {
        var query = text(search && search.value);
        var typeValue = type ? type.value : "all";
        var yearValue = year ? year.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var typeOk = typeValue === "all" || card.dataset.type === typeValue;
          var yearOk = yearValue === "all" || card.dataset.year === yearValue;
          var queryOk = !query || haystack.indexOf(query) !== -1;
          var show = typeOk && yearOk && queryOk;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [search, type, year].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var mount = document.querySelector("#search-results");
    if (!mount || !window.siteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = text(params.get("q") || "");
    var summary = document.querySelector(".search-summary");
    var input = document.querySelector(".search-panel input[name='q']");
    if (input && query) {
      input.value = params.get("q");
    }
    if (!query) {
      if (summary) {
        summary.textContent = "输入片名、题材、地区或年份，查找想看的影视内容。";
      }
      return;
    }
    var results = window.siteMovies.filter(function (movie) {
      return text(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags + " " + movie.oneLine).indexOf(query) !== -1;
    }).slice(0, 120);
    if (summary) {
      summary.textContent = results.length ? "搜索结果已为你整理如下。" : "暂时没有匹配内容，换个关键词再试。";
    }
    mount.innerHTML = results.map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster-link" href="' + movie.file + '">',
        '<div class="poster-shell"><img src="./' + movie.image + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-soft-image><div class="poster-glow"></div></div>',
        '<span class="score-badge">' + movie.score + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h2><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(movie.genre.split(/[，,、/]/)[0] || movie.type) + '</span></div>',
        '<a class="watch-link" href="' + movie.file + '">立即观看</a>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
    initImages();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[match];
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-wrap").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector(".play-overlay");
      var status = wrap.querySelector(".player-status");
      if (!video || !button) {
        return;
      }
      var stream = video.dataset.stream;
      var hls = null;
      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }
      function attach() {
        if (!stream || video.dataset.ready === "1") {
          return Promise.resolve();
        }
        video.dataset.ready = "1";
        setStatus("正在加载播放源...");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setStatus("视频暂时无法加载，请稍后重试。");
              }
            }
          });
          return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          setStatus("");
          return Promise.resolve();
        }
        setStatus("当前环境暂不支持该播放格式。");
        return Promise.resolve();
      }
      function play() {
        attach().then(function () {
          var result = video.play();
          if (result && result.then) {
            result.then(function () {
              button.classList.add("is-hidden");
            }).catch(function () {
              button.classList.remove("is-hidden");
            });
          } else {
            button.classList.add("is-hidden");
          }
        });
      }
      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        button.classList.remove("is-hidden");
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initCatalogFilters();
    initSearchPage();
    initPlayers();
  });
})();
