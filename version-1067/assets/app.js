(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var mini = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
      mini.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    mini.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        showSlide(Number(item.getAttribute('data-hero-mini')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

  var applyFilter = function () {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';

    filterCards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
      var matchYear = !year || card.getAttribute('data-year') === year;
      card.style.display = matchKeyword && matchYear ? '' : 'none';
    });
  };

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }

  var hlsPromise = null;

  var loadHls = function () {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsPromise;
  };

  var initPlayer = function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var status = player.querySelector('.player-status');
    var source = player.getAttribute('data-src');
    var started = false;
    var hlsInstance = null;

    var setStatus = function (message) {
      if (status) {
        status.textContent = message;
      }
    };

    var play = function () {
      if (!video || !source) {
        return;
      }

      if (started) {
        video.play();
        return;
      }

      started = true;
      setStatus('正在连接播放源');

      var startNative = function () {
        video.src = source;
        video.play().then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          setStatus('');
        }).catch(function () {
          setStatus('点击播放器继续播放');
        });
      };

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        startNative();
        return;
      }

      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              if (overlay) {
                overlay.classList.add('is-hidden');
              }
              setStatus('');
            }).catch(function () {
              setStatus('点击播放器继续播放');
            });
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败');
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else {
          startNative();
        }
      }).catch(function () {
        startNative();
      });
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);

  var searchRoot = document.querySelector('[data-search-results]');

  if (searchRoot && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');

    if (input) {
      input.value = q;
    }

    var render = function (items) {
      if (!items.length) {
        searchRoot.innerHTML = '<div class="search-empty">没有找到匹配的影片</div>';
        return;
      }

      searchRoot.innerHTML = items.slice(0, 96).map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-wrap" href="./' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="score-pill">' + movie.rating + '</span>',
          '<span class="play-float">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<a class="card-title" href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '<p class="card-meta">' + escapeHtml(movie.category + ' / ' + movie.year) + '</p>',
          '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    };

    var execute = function (keyword) {
      var term = keyword.trim().toLowerCase();
      if (!term) {
        render(window.MOVIES.slice(0, 96));
        return;
      }
      render(window.MOVIES.filter(function (movie) {
        return [movie.title, movie.category, movie.genre, movie.year, movie.desc].join(' ').toLowerCase().indexOf(term) >= 0;
      }));
    };

    var form = document.querySelector('[data-search-page-form]');

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        execute(input ? input.value : '');
      });
    }

    execute(q);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
