(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "win252";
    var injectedFlagLightbox = "data-win252-lightbox";
    var injectedFlagGalleryTop = "data-win252-gallery-top";
    var injectedFlagGalleryThumbs = "data-win252-gallery-thumbs";
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
    /* new images to add to the carousel */
     var newImages = [
      { src: "https://v2.crocdn.com/Winkbed/Win252/1Image-V2.jpg", alt: "The WinkBed is top-ranked and has won awards from dozens of major publications & mattress review sites." },
      { src: "https://v2.crocdn.com/Winkbed/Win252/2Image-V2.jpg", alt: "The WinkBed is top-ranked and has won awards from dozens of major publications & mattress review sites." },
      { src: "https://v2.crocdn.com/Winkbed/Win252/3Image-V2.jpg", alt: "The WinkBed is top-ranked and has won awards from dozens of major publications & mattress review sites." },
      { src: "https://v2.crocdn.com/Winkbed/Win252/4Image-V2.jpg", alt: "The WinkBed is top-ranked and has won awards from dozens of major publications & mattress review sites." },
      { src: "https://v2.crocdn.com/Winkbed/Win252/5Image-V2.jpg", alt: "The WinkBed is top-ranked and has won awards from dozens of major publications & mattress review sites." }
    ];
    /* try to locate the active Swiper instance regardless of where the site stored it */
    function findSwiperInstance(wrapper) {
      if (window.swiper && typeof window.swiper.update === "function") {
        return window.swiper;
      }
      if (window.mySwiper && typeof window.mySwiper.update === "function") {
        return window.mySwiper;
      }
      var container = wrapper.closest(".swiper, .swiper-container");
      if (container && container.swiper && typeof container.swiper.update === "function") {
        return container.swiper;
      }
      return null;
    }
    /* maps the renumbered data-slide-index (shared across all 3 carousels) to its Convert goal id */
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
    function eventhandlerwin252goal() {
      // only bind once, even if this variation script re-runs on the same page
      if (window.__win252GoalHandlerBound) return;
      window.__win252GoalHandlerBound = true;
      // Lightbox (desktop + mobile): click on the prev/next arrow -> check which slide becomes
      // active, then fire the matching goal. NOTE: `this` here is the arrow button, which has no
      // data-slide-index -- we need to look at the slide Swiper just made active, not the arrow itself.
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
      // the Swiper instance's own "slideChange" event instead of one specific button class, so this
      // one listener covers dragging/swiping the image, clicking the on-page next/prev arrows
      // (.cre-t-251-scroller-next/-prev), and - since the thumbs carousel is Swiper's usual "linked
      // thumbnails" companion to the main gallery - tapping a thumbnail on mobile too, because all
      // of those move the gallery-top swiper's active slide.
      waitForElement(".gallery-top", function () {
        onSwiperReady(document.querySelector(".gallery-top"), function (swiper) {
          swiper.on("slideChange", function () {
            // Read the new slide straight off the Swiper instance (swiper.activeIndex is exactly
            // what just changed to trigger this event) instead of querying the DOM for
            // ".swiper-slide-active" - that CSS class isn't guaranteed to have been re-applied to
            // the new slide yet at the moment "slideChange" fires, which was causing every read to
            // land on the slide BEFORE the one just reached (first image never counted, every count
            // after that off by one).
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
    /* slide factories: each carousel wraps its <img> differently, so build the right markup for each */
    function createLightboxSlide(img) {
      var slide = document.createElement("img");
      slide.className = "swiper-slide " + variation_name + "-slide";
      slide.src = img.src;
      slide.alt = img.alt;
      slide.setAttribute("loading", "lazy");
      return slide;
    }
    function createGalleryTopSlide(img) {
      // on-page main carousel wraps its <img> in a div.swiper-slide
      var slide = document.createElement("div");
      slide.className = "swiper-slide " + variation_name + "-slide";
      var innerImg = document.createElement("img");
      innerImg.src = img.src;
      innerImg.alt = img.alt;
      innerImg.setAttribute("loading", "lazy");
      slide.appendChild(innerImg);
      return slide;
    }
    function createGalleryThumbSlide(img) {
      // thumbnails carousel uses a bare img.swiper-slide, same as the lightbox
      var slide = document.createElement("img");
      slide.className = "swiper-slide " + variation_name + "-slide";
      slide.src = img.src;
      slide.alt = img.alt;
      slide.setAttribute("loading", "lazy");
      return slide;
    }
    /* shared insertion logic for the lightbox, on-page gallery, and thumbnails wrappers */
    function injectSlides(wrapperSelector, createSlide, flagAttr, renumber) {
      var wrapper = document.querySelector(wrapperSelector);
      if (!wrapper) return;
      /* idempotency guard: skip if this variation already ran on this wrapper */
      if (wrapper.getAttribute(flagAttr) === "1") {
        if (debug) console.log("Test " + variation_name + ": slides already injected into " + wrapperSelector + ", skipping.");
        return;
      }
      var existingSlides = Array.prototype.slice.call(wrapper.querySelectorAll(".swiper-slide"));
      // insert the new slides right after the 4th existing slide (not at the end)
      var insertAfterPosition = 4;
      var referenceNode = existingSlides[insertAfterPosition] || null; // null = fewer than 5 slides exist, so just append
      var fragment = document.createDocumentFragment();
      newImages.forEach(function (img) {
        fragment.appendChild(createSlide(img));
      });
      if (referenceNode) {
        wrapper.insertBefore(fragment, referenceNode);
      } else {
        wrapper.appendChild(fragment);
      }
      if (renumber) {
        // renumber data-slide-index sequentially now that order has changed (goal tracking relies on this)
        var allSlides = wrapper.querySelectorAll(".swiper-slide");
        allSlides.forEach(function (slide, i) {
          slide.setAttribute("data-slide-index", i + 1);
        });
      }
      // mark wrapper so a re-run of this script won't duplicate slides
      wrapper.setAttribute(flagAttr, "1");
      // re-init/update the Swiper instance so the new slides are picked up
      var swiperInstance = findSwiperInstance(wrapper);
      if (swiperInstance) {
        swiperInstance.update();
      } else if (debug) {
        console.log("Test " + variation_name + ": could not locate Swiper instance to update for " + wrapperSelector + ".");
      }
    }
    /* the on-page carousel's "X / total" counter is owned by separate, pre-existing tests - cre-t-251
       on desktop (.cre-t-251-scroller-value-total) and cre-t-180 on mobile
       (.cre-t-180-new-scroller-value-total), each its own DOM/class despite driving the same
       .gallery-top swiper. Both read their total once at their own init and never re-check it, so
       both are left showing the old count (17) after we inject 5 more slides; patch whichever of
       the two is present to match the real slide count once injection is done. */
    function updateGalleryTopCounterTotal() {
      var galleryTopEl = document.querySelector(".gallery-top");
      if (!galleryTopEl || !galleryTopEl.swiper) return;
      var total = galleryTopEl.swiper.slides.length;
      var totalEls = document.querySelectorAll(
        ".cre-t-251-scroller-value-total, .cre-t-180-new-scroller-value-total"
      );
      totalEls.forEach(function (totalEl) {
        totalEl.textContent = total;
      });
    }
    /* Initialize variation */
    function init() {
      // Add the variation class to the body
      document.body.classList.add(variation_name);
      // Lightbox carousel (desktop + mobile): drives the goal-tracking data-slide-index
      waitForElement("#lightbox-slider-wrapper", function () {
        injectSlides("#lightbox-slider-wrapper", createLightboxSlide, injectedFlagLightbox, true);
      });
      // On-page main carousel (same markup serves desktop + mobile). renumber=true so goal
      // tracking (data-slide-index) works here too - see eventhandlerwin252goal().
      waitForElement("#gallery-top-images", function () {
        injectSlides("#gallery-top-images", createGalleryTopSlide, injectedFlagGalleryTop, true);
        updateGalleryTopCounterTotal();
      });
      // On-page thumbnails carousel (same markup serves desktop + mobile). renumber=true so the
      // mobile thumbnail-tap goal fallback in eventhandlerwin252goal() has a data-slide-index to read.
      waitForElement("#gallery-thumbs-images", function () {
        injectSlides("#gallery-thumbs-images", createGalleryThumbSlide, injectedFlagGalleryThumbs, true);
      });
      // delegated click listener works even before slides are injected, so bind it right away
      eventhandlerwin252goal();
    }
    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();