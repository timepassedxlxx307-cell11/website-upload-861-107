(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector(".js-filter-panel");
    var items = Array.prototype.slice.call(document.querySelectorAll(".js-filter-item"));
    if (!panel || !items.length) {
      return;
    }
    var input = panel.querySelector("[data-filter-text]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var empty = document.querySelector("[data-filter-empty]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var text = normalize(input ? input.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute("data-search") || item.textContent);
        var itemType = normalize(item.getAttribute("data-type"));
        var itemRegion = normalize(item.getAttribute("data-region"));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchType = !type || itemType === type;
        var matchRegion = !region || itemRegion === region;
        var show = matchText && matchType && matchRegion;
        item.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayer(source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var shell = video.closest(".player-shell");
    var hls = null;
    var attached = false;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playNow() {
      attachSource();
      if (shell) {
        shell.classList.add("is-playing");
      }
      button.hidden = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.hidden = false;
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }

    button.addEventListener("click", playNow);
    video.addEventListener("click", function () {
      if (video.paused) {
        playNow();
      }
    });
    video.addEventListener("play", function () {
      button.hidden = true;
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
