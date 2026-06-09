(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var siteNav = document.getElementById("site-nav");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    restartHero();
  }

  var filterInput = document.querySelector(".page-filter-input");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));
  var emptyState = document.querySelector(".empty-state");

  function getQueryFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      return "";
    }
  }

  function filterCards(value) {
    var keyword = (value || "").trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || ""
      ].join(" ").toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.hidden = !matched;

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (filterInput && cards.length) {
    var initialQuery = getQueryFromUrl();

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    filterCards(filterInput.value);
    filterInput.addEventListener("input", function () {
      filterCards(filterInput.value);
    });
  }
})();
