(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "BuckfireLaw_24";

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

    /* ─── video library — one entry per person, keyed by name ─── */
    var Cre_24_videoLibrary = {
      Denise: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Test12_video2.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Denise_new.webp',
        thumbAlt: 'Denise video thumbnail',
        quote: '"If I could scream to the mountaintops that Buckfire is an amazing law firm, I would."',
        name: '– Denise'
      },
      Jessica: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Jessica.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Jessica_new.webp',
        thumbAlt: 'Jessica video thumbnail',
        quote: '"They took all the stress out of the entire process."',
        name: '– Jessica'
      },
      Alyssa: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Test12_video1.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Alyssaa_new.webp',
        thumbAlt: 'Alyssa video thumbnail',
        quote: "\"It just felt like a relief to have somebody say, 'Yeah, we've got this.'\"",
        name: '– Alyssa'
      },
      Denita: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Test12_video3.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Denita_new.webp',
        thumbAlt: 'Denita video thumbnail',
        quote: '"Buckfire Law was a law firm, a friend, and family at the time of my need."',
        name: '– Denita'
      },
      Mike: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/mike.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/mike_new.webp',
        thumbAlt: 'Mike video thumbnail',
        quote: '"My world was turned completely upside down."',
        name: '– Mike'
      },
      Shaylynn: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/shaylynn.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/shaylynn_new.webp',
        thumbAlt: 'Shaylynn video thumbnail',
        quote: '"I do believe that I fulfilled that promise to my dad. I really do."',
        name: '– Shaylynn'
      },
      Damian: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Damian.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test12/Damian_new.webp',
        thumbAlt: 'Damian video thumbnail',
        quote: '"He told me, hold on, and I\'m going to fight for you, and we\'re going to make this right."',
        name: '– Damian'
      },
      Sandra: {
        videoUrl: 'https://v2.crocdn.com/BuckfireLaw/test24/Sandra_Ford_Testimonial.mp4',
        thumbUrl: 'https://v2.crocdn.com/BuckfireLaw/test24/sandra.webp',
        thumbAlt: 'Sandra video thumbnail',
        quote: '"They treated me like a person. They made me feel comfortable and safe."',
        name: '– Sandra'
      }
    };

    /* ─── which person shows on each case-type page, keyed by pathname ─── */
    var Cre_24_urlVideoMap = {
      '/case-types/medical-malpractice/': 'Denise',
      '/case-types/personal-injury/': 'Mike',
      '/case-types/car-accidents/': 'Denita',
      '/case-types/motorcycle-accidents/': 'Jessica',
      '/case-types/product-liability/': 'Alyssa',
      '/case-types/truck-accidents/': 'Denita',
      '/case-types/dog-bite/': 'Damian',
      '/case-types/cerebral-palsy/': 'Shaylynn',
      '/case-types/nursing-home-abuse/': 'Denise',
      '/case-types/wrongful-death/': 'Denita',
      '/case-types/slip-and-fall/': 'Sandra'
    };

    /* used when the current page's pathname isn't in the map above (e.g. QA/staging) */
    var Cre_24_defaultVideoName = 'Denise';

    function getStoryItemForCurrentPage() {
      var path = window.location.pathname;
      if (path.charAt(path.length - 1) !== '/') path += '/';

      var name = Cre_24_urlVideoMap[path];
      if (!name) {
        if (debug) console.log(variation_name + ": no video mapping for path '" + path + "', using default");
        name = Cre_24_defaultVideoName;
      }

      var item = Cre_24_videoLibrary[name];
      if (!item && debug) console.log(variation_name + ": no video in library for '" + name + "'");
      return item;
    }

    function generateCard(item) {
      return '<div class="buckfire-24-story-card">' +
          '<div class="buckfire-24-video-thumb">' +
            '<video class="buckfire-24-video" playsinline preload="none" video-url=\'' + item.videoUrl + '\'></video>' +
            '<img class="buckfire-24-thumb-img" src="' + item.thumbUrl + '" alt="' + item.thumbAlt + '" width="830" height="434" loading="lazy" decoding="async">' +
            '<div class="buckfire-24-play-button">' +
              '<svg width="12" height="14" viewBox="0 0 26 30" xmlns="http://www.w3.org/2000/svg">' +
                '<polygon points="0,0 26,15 0,30" fill="#ffffff"></polygon>' +
              '</svg>' +
            '</div>' +
          '</div>' +
          '<div class="buckfire-24-story-content">' +
            '<p>' + item.quote + '</p>' +
            '<span class="buckfire-24-name">' + item.name + '</span>' +
          '</div>' +
        '</div>';
    }

    /* ─── click-to-load-and-play for the story card ─── */
    function playVideoInThumb(thumbBox) {
      var videoEl = thumbBox.querySelector(".buckfire-24-video");
      var imgEl = thumbBox.querySelector(".buckfire-24-thumb-img");
      var playBtn = thumbBox.querySelector(".buckfire-24-play-button");

      if (imgEl) imgEl.style.display = "none";
      if (playBtn) playBtn.style.display = "none";

      if (!videoEl.src) {
        videoEl.src = videoEl.getAttribute("video-url");
        videoEl.controls = true;
        videoEl.load();

        /* goal: users who click and watch the video — fires once, when playback actually starts */
        videoEl.addEventListener("playing", function () {
          window._conv_q = window._conv_q || [];
          window._conv_q.push(["triggerConversion", "100038435"]);
          if (debug) console.log(variation_name + ": goal 100038435 fired (video watched)");
        }, { once: true });
      }

      videoEl.play().catch(function (err) {
        if (debug) console.log(variation_name + ": play() blocked/failed", err);
      });

      if (debug) console.log(variation_name + ": thumbnail clicked, video loading+playing url=" + videoEl.getAttribute("video-url"));
    }

    function eventHandler() {
      live(".buckfire-24-thumb-img, .buckfire-24-play-button", "click", function () {
        var thumbBox = this.closest(".buckfire-24-video-thumb");
        if (thumbBox) playVideoInThumb(thumbBox);
      });
    }

    function init() {
      document.body.classList.add(variation_name);

      waitForElement("#sidebar-main .sidebar_form", function () {
        if (document.querySelector(".buckfire-24-story-card")) return;

        var item = getStoryItemForCurrentPage();
        if (!item) return;

        document.querySelector("#sidebar-main .sidebar_form").insertAdjacentHTML('beforebegin', generateCard(item));
      });

      if (!window.Cre_t_24_eventHandlerAdded) {
        eventHandler();
        window.Cre_t_24_eventHandlerAdded = true;
      }
    }

    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();