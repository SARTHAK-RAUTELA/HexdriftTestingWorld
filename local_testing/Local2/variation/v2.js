(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "BuckfireLaw_12";

    /* ─── single video url for now, change later if needed per card ─── */
    var VIDEO_URL = "https://v2.crocdn.com/BuckfireLaw/test12/Test12_video2.mp4";

    function waitForElement(selector, trigger) {
      var interval = setInterval(function () {
        if (document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, 50);

      setTimeout(function () {
        clearInterval(interval);
      }, 15000);
    }

    function live(selector, event, callback, context) {
      if (typeof callback !== "function") return;
      context = context || document;

      context.addEventListener(event, function (e) {
        var el = e.target.closest(selector);
        if (el && context.contains(el)) {
          callback.call(el, e);
        }
      });
    }

    var cre_12Testimonial_card = `<div class="testimonial-card">
    <div class="testimonial-card__video">
        <div class="testimonial-card__media">
            <video class="testimonial-card__video-el" playsinline preload="none"></video>
            <img class="testimonial-card__thumb" src="https://v2.crocdn.com/BuckfireLaw/test12/thumbnail_4.png"
                alt="Denise's testimonial video thumbnail">
        </div>
        <div class="testimonial-card__body">
            <h3 class="testimonial-card__title">Buckfire has a heart for their clients</h3>
            <p class="testimonial-card__quote">"If I could scream to the mountain tops that Buckfire Law is an amazing
                law firm, I would."</p>
            <p class="testimonial-card__author">-Denise's</p>
        </div>
    </div>
</div>`

    /* ─── click-to-load-and-play for the testimonial-card (personal-injury page) ─── */
    function playVideoInCard(mediaBox) {
      var videoEl = mediaBox.querySelector(".testimonial-card__video-el");
      var imgEl = mediaBox.querySelector(".testimonial-card__thumb");
      var playBtn = mediaBox.querySelector(".testimonial-card__play-button");

      if (imgEl) imgEl.style.display = "none";
      if (playBtn) playBtn.style.display = "none";

      videoEl.style.display = "block";

      if (!videoEl.src) {
        videoEl.src = VIDEO_URL;
        videoEl.controls = true;
        videoEl.load();
      }

      videoEl.play().catch(function (err) {
        if (debug) console.log(variation_name + ": play() blocked/failed", err);
      });

      if (debug) console.log(variation_name + ": testimonial-card clicked, video loading+playing url=" + VIDEO_URL);
    }

    function eventHandler() {
      live(".testimonial-card__thumb, .testimonial-card__play-button", "click", function () {
        var mediaBox = this.closest(".testimonial-card__media");
        if (mediaBox) playVideoInCard(mediaBox);
      });
    }

    function init() {
      document.body.classList.add(variation_name);

      waitForElement(".page-parent.page-child .section .blog-sidebar", function () {
        if (!document.querySelector(".testimonial-card")) {
          document.querySelector(".page-parent.page-child .section .blog-sidebar").insertAdjacentHTML('beforebegin', cre_12Testimonial_card);
        }
      }, 50, 15000);

      if (!window.eventHanlerAddedTest12) {
        eventHandler()
        window.eventHanlerAddedTest12 = true;
      }
    }

    waitForElement("body", init);

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();