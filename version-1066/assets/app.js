document.addEventListener("DOMContentLoaded", function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
      document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")));
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    var input = panel.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
    var grid = panel.parentElement.querySelector("[data-filter-grid]");
    var selected = "all";

    function apply() {
      if (!grid) {
        return;
      }
      var query = input ? input.value.trim().toLowerCase() : "";
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      cards.forEach(function(card) {
        var matchesQuery = !query || card.getAttribute("data-search").indexOf(query) !== -1;
        var matchesFilter = selected === "all" || card.getAttribute("data-category") === selected;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        selected = button.getAttribute("data-filter");
        buttons.forEach(function(item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  });
});
