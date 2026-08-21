(function () {
  try {
    var debug = 0;
    var variation_name = "Test_06";

    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
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

    function waitForElements(selectors, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        var allPresent = selectors.every(function (sel) {
          return document.querySelector(sel);
        });
        if (allPresent) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    var HEADING_SEL = '#brochure_content__heading';
    var BROCHURE_CONTENT_SEL = '[id*="BrochureContent-template-"]';
    var REQUEST_SECTION_SEL = "#MainContent > [id*='media_with_text']";
    var COLLECTIONS_SECTION_SEL = "#MainContent > [id*='multicolumn']";
    var VIDEO_SEL = '[id*="GalleryViewer-template-"]';
    var SUBHEADING_SEL = REQUEST_SECTION_SEL + ' .image-with-text__subheading';
    var BODYCOPY_SEL = REQUEST_SECTION_SEL + ' .image-with-text__text-item .p';

    function getBestsellersHTML() {
      var CACHE_KEY = "qaRhinoBestsellersSectionHTML";
      var SECTION_ID = "template--27460885184887__multicolumn_iprPLR";
      try {
        var cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) return Promise.resolve(cached);
      } catch (e) {
        if (debug) console.log(e, "sessionStorage read failed in " + variation_name);
      }

      return fetch("/?section_id=" + SECTION_ID, { credentials: "same-origin" })
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          var bestsellers = doc.getElementById("shopify-section-" + SECTION_ID);
          if (!bestsellers) return null;
          var outerHTML = bestsellers.outerHTML;
          try {
            sessionStorage.setItem(CACHE_KEY, outerHTML);
          } catch (e) {
            if (debug) console.log(e, "sessionStorage write failed in " + variation_name);
          }
          return outerHTML;
        });
    }

    
    function updateHeading() {
      var heroHeading = document.getElementById('brochure_content__heading');
      if (!heroHeading || heroHeading.classList.contains('qa-hero-heading-updated')) return;
      heroHeading.textContent = 'Request our free, beautiful brochure pack';
      heroHeading.classList.add('qa-hero-heading-updated');
    }

    function moveSubheading() {
      var heroHeading = document.getElementById('brochure_content__heading');
      var sourceSubheading = document.querySelector(SUBHEADING_SEL);
      if (!heroHeading || !sourceSubheading || sourceSubheading.classList.contains('qa-hero-subheading')) return;
      sourceSubheading.classList.add('qa-hero-subheading');
      heroHeading.insertAdjacentElement('afterend', sourceSubheading);
    }

    
    function moveBodyCopy() {
      var heroHeading = document.getElementById('brochure_content__heading');
      var sourceBodyCopy = document.querySelector(BODYCOPY_SEL);
      if (!heroHeading || !sourceBodyCopy || sourceBodyCopy.classList.contains('qa-hero-bodycopy')) return;
      sourceBodyCopy.classList.add('qa-hero-bodycopy');
      var anchor = document.querySelector('.qa-hero-subheading') || heroHeading;
      anchor.insertAdjacentElement('afterend', sourceBodyCopy);
    }

   
    function moveVideo() {
      var brochureContentDiv = document.querySelector(BROCHURE_CONTENT_SEL);
      var sourceVideo = document.querySelector(VIDEO_SEL);
      if (!brochureContentDiv || !sourceVideo || sourceVideo.classList.contains('qa-hero-video')) return;
      sourceVideo.classList.add('qa-hero-video');
      brochureContentDiv.insertAdjacentElement('beforebegin', sourceVideo);
    }

    function swapBestsellers() {
      if (document.getElementById('qa-bestsellers-swap-section')) return;
      var collectionsSection = document.querySelector(COLLECTIONS_SECTION_SEL);
      if (!collectionsSection) return;

      getBestsellersHTML()
        .then(function (html) {
          if (!html) {
            if (debug) console.log('Bestsellers section unavailable, leaving collections section as-is: ' + variation_name);
            return;
          }
          if (document.getElementById('qa-bestsellers-swap-section')) return;
          var wrapper = document.createElement('div');
          wrapper.innerHTML = html;
          var imported = wrapper.firstElementChild;
          imported.id = 'qa-bestsellers-swap-section';
          collectionsSection.insertAdjacentElement('afterend', imported);
          collectionsSection.classList.add('qa-hide');
        })
        .catch(function (e) {
          if (debug) console.log(e, 'error fetching bestsellers section in Test ' + variation_name);
        });
    }

    function init() {
      document.body.classList.add(variation_name);

      waitForElement(HEADING_SEL, updateHeading);
      waitForElements([HEADING_SEL, SUBHEADING_SEL], moveSubheading);
      waitForElements([HEADING_SEL, BODYCOPY_SEL], moveBodyCopy);
      waitForElements([BROCHURE_CONTENT_SEL, VIDEO_SEL], moveVideo);
      waitForElement(COLLECTIONS_SECTION_SEL, swapBestsellers);
    }

    waitForElement('body', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();