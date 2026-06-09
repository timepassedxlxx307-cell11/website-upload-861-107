(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('.js-menu-toggle');
  var mobileNav = $('.js-mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dots button');
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize($('.js-search-input') && $('.js-search-input').value);
    var selectedType = normalize($('.js-type-filter') && $('.js-type-filter').value);
    var cards = $all('.searchable-card');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region')
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedType = !selectedType || cardType === selectedType;
      var matched = matchedQuery && matchedType;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var empty = $('.no-results');
    if (empty) {
      empty.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    }
  }

  $all('.js-search-input').forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  $all('.js-type-filter').forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  var player = $('.js-player');
  if (player) {
    var video = $('video', player);
    var button = $('.js-play-button', player);
    var payload = $('#playerPayload');
    var playUrl = '';
    var attached = false;

    try {
      playUrl = payload ? JSON.parse(payload.textContent).url : '';
    } catch (error) {
      playUrl = '';
    }

    function attachVideo() {
      if (!video || !playUrl || attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          var hls = new window.Hls({
            maxBufferLength: 36,
            backBufferLength: 24
          });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }

      video.src = playUrl;
      return Promise.resolve();
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      player.classList.add('is-playing');
      attachVideo().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        player.classList.remove('is-playing');
      }
    });
  }
})();
