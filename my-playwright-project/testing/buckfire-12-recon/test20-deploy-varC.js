function(convertContext){ 
(function () {
  try {
    var debug = 1;
    var variation_name = "Variation C";

    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    /* ============================================================
       1. Update Google reviews count: 847 -> 927
       ============================================================ */
    function updateReviewCount() {
      waitForElement(".number-review p", function () {
        document.querySelectorAll(".number-review p").forEach(function (el) {
          el.innerHTML = el.innerHTML.replace("847", "927");
        });
      });
    }

    /* ============================================================
       2. Update case results heading
       ============================================================ */
    function updateCaseResultsHeading() {
      waitForElement(".landing-case-results-wraper .h4", function () {
        document.querySelector(".landing-case-results-wraper .h4").textContent = "Our Michigan Medical Negligence Case Results";
      });
    }

    /* ============================================================
       3. Update "What Happened" form label
       ============================================================ */
    function updateFormLabel() {
      waitForElement("label.text-field-label", function () {
        document.querySelector("label.text-field-label").innerHTML = "Briefly tell us what happened. Our team will call to get the full story.*";
      });
    }

    /* ============================================================
       4. Add "What Happens Next" (Melanie) video
       Ported from variationB's video component/modal.
       ============================================================ */
    const videoTeaserHTML = `
      <div class="cre-t-20-video-teaser-block">
        <div class="cre-t-20-hero-video-wrapper">
          <div class="cre-t-20-hero-video-content1">
            <div class="cre-t-20-hero-video-left">
              <img src="https://v2.crocdn.com/BuckfireLaw/test09/thumb-icon.png" alt="video thumbnail" class="cre-t-20-hero-video-thumb-img" />
              <span class="cre-t-20-hero-video-play">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="26.5" stroke="#FFF" stroke-width="3" fill="rgba(0,0,0,0.15)" />
                  <path d="M23 19L38 28L23 37V19Z" fill="#FFF" />
                </svg>
              </span>
            </div>
            <div class="cre-t-20-hero-video-right">
              <div class="cre-t-20-hero-video-right-header">What Happens Next?</div>
              <div class="cre-t-20-hero-video-right-content-one">See how the process works in 60 seconds.</div>
              <div class="cre-t-20-hero-video-right-content-two">Learn exactly what to expect after reaching out and how our team helps evaluate your case.</div>
            </div>
          </div>
          <div class="cre-t-20-hero-video-right-content-two cre-t-20-hero-video-right-content-two1">Learn exactly what to expect after reaching out and how our team helps evaluate your case.</div>
        </div>
      </div>
    `;

    const videoModalHTML = `
      <div id="cre-t-20-video-modal" class="cre-t-20-modal-overlay">
        <div class="cre-t-20-modal-content">
          <img src="https://v2.crocdn.com/BuckfireLaw/test09/cross%20(1).svg" class="cre-t-20-modal-close" alt="close modal" />
          <div class="cre-t-20-video-wrapper">
            <div class="cre-t-20-video-thumbnail-container">
              <img src="https://v2.crocdn.com/BuckfireLaw/test09/thumb-icon.png" class="cre-t-20-video-thumb" alt="video thumbnail" />
              <img src="https://v2.crocdn.com/BuckfireLaw/test09/play-icon.svg" class="cre-t-20-video-play-btn" alt="play video" />
            </div>
            <video id="cre-t-20-video-player" controls playsinline preload="auto"></video>
          </div>
        </div>
      </div>
    `;

    function updateVideoSection() {
      if (!window.Hls) {
        var hlsScript = document.createElement("script");
        hlsScript.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
        document.head.appendChild(hlsScript);
      }

      const modalTriggerBtn = document.querySelector(".cre-t-20-hero-video-wrapper");
      const videoModal = document.getElementById("cre-t-20-video-modal");
      const closeModalBtn = document.querySelector(".cre-t-20-modal-close");
      const thumbContainer = document.querySelector(".cre-t-20-video-thumbnail-container");
      const videoElement = document.getElementById("cre-t-20-video-player");
      let hlsInstance = null;
      const videoSrc = "https://v2.crocdn.com/BuckfireLaw/intake_video_files/output.m3u8";

      if (!modalTriggerBtn || !videoModal) return;

      modalTriggerBtn.addEventListener("click", () => {
        videoModal.style.display = "flex";
        if (window.Hls && Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(videoSrc);
            hlsInstance.attachMedia(videoElement);
          }
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          if (!videoElement.src) {
            videoElement.src = videoSrc;
          }
        }
      });

      thumbContainer.addEventListener("click", () => {
        videoElement.play();

        // goal for Video Watched
        // window._conv_q = window._conv_q || [];
        // _conv_q.push(["triggerConversion", "100037996"]);
      });

      videoElement.addEventListener("playing", () => {
        thumbContainer.style.display = "none";
      });

      function closeAndResetVideo() {
        videoModal.style.display = "none";
        videoElement.pause();
        thumbContainer.style.display = "flex";
      }

      closeModalBtn.addEventListener("click", closeAndResetVideo);
      videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) closeAndResetVideo();
      });
    }

    function addWhatHappensNextVideo() {
      waitForElement(".landing-banner-image", function () {
        if (document.querySelector(".cre-t-20-video-teaser-block")) return;
        document.querySelector(".landing-banner-image").insertAdjacentHTML("beforeend", videoTeaserHTML);

        if (!document.getElementById("cre-t-20-video-modal")) {
          document.body.insertAdjacentHTML("beforeend", videoModalHTML);
        }
        updateVideoSection();
      });
    }

    function init() {
      if (debug) console.log(variation_name + " initialized");
      updateReviewCount();
      updateCaseResultsHeading();
      updateFormLabel();
      addWhatHappensNextVideo();
    }

    waitForElement("body", init);
  } catch (e) {
    console.error(e);
  }
})();
}
/*----*/
