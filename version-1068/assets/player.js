(function () {
  function nativeCanPlay(video) {
    return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return Promise.resolve(null);
  }

  function attachWithHls(HlsClass, video, url) {
    return new Promise(function (resolve, reject) {
      if (!HlsClass || !HlsClass.isSupported || !HlsClass.isSupported()) {
        reject(new Error("hls unavailable"));
        return;
      }

      var hls = new HlsClass({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
        resolve();
      });
      hls.on(HlsClass.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          reject(new Error(data.type || "playback error"));
        }
      });
    });
  }

  function attachVideo(video, url) {
    if (nativeCanPlay(video)) {
      video.src = url;
      return Promise.resolve();
    }

    return loadHls()
      .then(function (HlsClass) {
        return attachWithHls(HlsClass, video, url);
      })
      .catch(function () {
        video.src = url;
      });
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");

    if (!video) {
      return;
    }

    var ready = attachVideo(video, url);

    function startPlayback() {
      if (button) {
        button.classList.add("is-hidden");
      }

      ready.then(function () {
        var playback = video.play();

        if (playback && typeof playback.catch === "function") {
          playback.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });
  };
})();
