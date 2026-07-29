(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "win252-control";
    var taggedFlagLightbox = "data-win252-control-lightbox";
    var taggedFlagGalleryTop = "data-win252-control-gallery-top";
    var taggedFlagGalleryThumbs = "data-win252-control-gallery-thumbs";
    /* fallback delegation helper, only used if the page doesn't already define a global live() */
    if (typeof live !== "function") {
      window.live = function (selector, event, callback) {
        document.addEventListener(event, function (e) {
          var target = e.target.closest(selector);
          if (target) callback.call(target, e);
        });
      };
    }
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      delayInterval = delayInterval || 50;
      delayTimeout = delayTimeout || 15000;
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }
    /* maps a native (unmodified) slide position to its Convert goal id. Control never injects new
       images, so "image 3/6/9/12" here is literally the page's own, already-existing slide order -
       there is no shifted/renumbered sequence to account for. */
    var GOAL_ID_BY_SLIDE_INDEX = { "3": "100334198", "6": "100334199", "9": "100334200", "12": "100334201" };
    function fireGoalForSlideIndex(slideIndex) {
      var goalId = GOAL_ID_BY_SLIDE_INDEX[String(slideIndex)];
      if (!goalId) return;
      window._conv_q = window._conv_q || [];
      window._conv_q.push(["triggerConversion", goalId]);
      if (debug) console.log("Test " + variation_name + ": triggered goal for image " + slideIndex);
    }
    // Waits for `.swiper` to actually be attached to a swiper container (it may not exist yet the
    // instant the DOM node does) before binding a listener to its Swiper instance.
    function onSwiperReady(swiperEl, callback) {
      if (!swiperEl) return;
      var attemptsLeft = 50;
      (function tryBind() {
        if (swiperEl.swiper && typeof swiperEl.swiper.on === "function") {
          callback(swiperEl.swiper);
          return;
        }
        if (--attemptsLeft <= 0) return;
        setTimeout(tryBind, 100);
      })();
    }
    /* Stamps data-slide-index 1..N onto a carousel's EXISTING slides, in their current (native) DOM
       order - no slides are created, moved, resized, or otherwise changed. This is the only DOM
       write control makes, and it's invisible: an attribute, not a rendered change. */
    function tagNativeSlideIndexes(wrapperSelector, flagAttr) {
      var wrapper = document.querySelector(wrapperSelector);
      if (!wrapper) return;
      if (wrapper.getAttribute(flagAttr) === "1") return; // already tagged, don't redo on a re-run
      var slides = wrapper.querySelectorAll(".swiper-slide");
      slides.forEach(function (slide, i) {
        slide.setAttribute("data-slide-index", i + 1);
      });
      wrapper.setAttribute(flagAttr, "1");
    }
    function eventhandlerwin252goal() {
      // only bind once, even if this script re-runs on the same page
      if (window.__win252ControlGoalHandlerBound) return;
      window.__win252ControlGoalHandlerBound = true;
      // Lightbox (desktop + mobile): click on the prev/next arrow -> check which slide becomes
      // active, then fire the matching goal.
      live(".swiper-button-white", "click", function () {
        // small delay lets Swiper finish updating the active slide before we read it
        setTimeout(function () {
          var wrapper = document.querySelector("#lightbox-slider-wrapper");
          if (!wrapper) return;
          var activeSlide = wrapper.querySelector(".swiper-slide-active");
          if (!activeSlide) return;
          fireGoalForSlideIndex(activeSlide.getAttribute("data-slide-index"));
        }, 50);
      });
      // On-page main carousel (#gallery-top-images, shared by desktop + mobile): bind straight to
      // the Swiper instance's own "slideChange" event, so this one listener covers dragging/swiping
      // the image, clicking the on-page next/prev arrows (.cre-t-251-scroller-next/-prev), and -
      // since the thumbs carousel is Swiper's usual "linked thumbnails" companion to the main
      // gallery - tapping a thumbnail on mobile too, because all of those move the active slide.
      waitForElement(".gallery-top", function () {
        onSwiperReady(document.querySelector(".gallery-top"), function (swiper) {
          swiper.on("slideChange", function () {
            // Read the new slide straight off the Swiper instance (swiper.activeIndex is exactly
            // what just changed to trigger this event) instead of querying the DOM for
            // ".swiper-slide-active" - that CSS class isn't guaranteed to have been re-applied to
            // the new slide yet at the moment "slideChange" fires, which would cause every read to
            // land on the slide BEFORE the one just reached (first image never counted, every count
            // after that off by one) - confirmed live on the variation's identical code path.
            var activeSlide = swiper.slides[swiper.activeIndex];
            if (!activeSlide) return;
            fireGoalForSlideIndex(activeSlide.getAttribute("data-slide-index"));
          });
        });
      });
      // Mobile thumbnail tap: fired directly off the tapped thumbnail's own data-slide-index too,
      // as a fallback in case the thumbs carousel isn't wired as a Swiper-linked controller of
      // gallery-top (so the slideChange listener above wouldn't fire for a thumbnail tap alone).
      live(".gallery-thumbs .swiper-slide", "click", function () {
        fireGoalForSlideIndex(this.getAttribute("data-slide-index"));
      });
    }
    /* Initialize - goal tracking only. No image injection, no counter patching, no body class:
       control renders and behaves exactly like the untouched live site. */
    function init() {
      waitForElement("#lightbox-slider-wrapper", function () {
        tagNativeSlideIndexes("#lightbox-slider-wrapper", taggedFlagLightbox);
      });
      waitForElement("#gallery-top-images", function () {
        tagNativeSlideIndexes("#gallery-top-images", taggedFlagGalleryTop);
      });
      waitForElement("#gallery-thumbs-images", function () {
        tagNativeSlideIndexes("#gallery-thumbs-images", taggedFlagGalleryThumbs);
      });
      // delegated click listeners work even before slides are tagged, so bind them right away
      eventhandlerwin252goal();
    }
    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();
