(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".player-start");
        var cover = shell.querySelector(".player-cover");
        var url = shell.getAttribute("data-video-url");
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded || !video || !url) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            attach();
            shell.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!loaded) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll(".player-shell[data-video-url]").forEach(bindPlayer);
    });
})();
