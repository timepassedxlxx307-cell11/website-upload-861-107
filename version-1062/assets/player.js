(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var url = player.getAttribute("data-video");
            var hlsInstance = null;
            if (!video || !button || !url) {
                return;
            }
            function bind() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                video.setAttribute("data-ready", "1");
            }
            function start() {
                bind();
                player.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
            player.addEventListener("click", function (event) {
                if (!player.classList.contains("is-playing") && event.target !== video) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    });
}());
