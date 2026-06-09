function initMoviePlayer(videoId, maskId, source) {
  var video = document.getElementById(videoId);
  var mask = document.getElementById(maskId);
  var attached = false;
  var instance = null;

  if (!video || !mask || !source) {
    return;
  }

  function begin() {
    mask.classList.add("is-hidden");

    if (!attached) {
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && Hls.isSupported()) {
        instance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        instance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
    }

    video.play().catch(function () {});
  }

  mask.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (!attached) {
      begin();
      return;
    }
    if (video.paused) {
      video.play().catch(function () {});
    }
  });

  window.addEventListener("pagehide", function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}
