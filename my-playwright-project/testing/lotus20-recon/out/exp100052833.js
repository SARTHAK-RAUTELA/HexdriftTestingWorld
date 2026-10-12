function(convertContext){ 
(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-lotus-16";

    var VARIATION_CSS = `
html[lang="en-us" i].cre-t-lotus-16-recommended-mode section[data-slice-type="fleet_category"] h2.text-2xl.font-semibold.leading-6.text-foreground:not(.cre-t-lotus-16-recommended-heading) {
  display: none !important;
}

html body .cre-t-lotus-16-recommended-heading {
  display: none !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode .cre-t-lotus-16-recommended-heading {
  display: block !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode .cre-t-lotus-16-hidden {
  display: none !important;
}

html body [data-cre-t-lotus-16-feed] {
  display: none !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode [data-cre-t-lotus-16-feed][data-cre-t-lotus-16-ready] {
  display: flex !important;
}

html body [data-cre-t-lotus-16-clone] {
  display: none !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode [data-cre-t-lotus-16-feed][data-cre-t-lotus-16-ready] [data-cre-t-lotus-16-clone] {
  display: flex !important;
}

html body [data-cre-t-lotus-16-banner-clone] {
  display: none !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode [data-cre-t-lotus-16-feed][data-cre-t-lotus-16-ready] [data-cre-t-lotus-16-banner-clone] {
  display: block !important;
}

html body .cre-t-lotus-16-group-label {
  display: none !important;
}

html[lang="en-us" i].cre-t-lotus-16-recommended-mode .cre-t-lotus-16-group-label {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  display: inline-flex !important;
  justify-content: center;
  align-items: center;
  border-radius: 9999px;
  background: #F4F4F5;
  padding: 2px 16px;
  color: #18181B;
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11.4px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  white-space: nowrap;
}

html[lang="en-us" i] .cre-t-lotus-16-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

html[lang="en-us" i] .cre-t-lotus-16-lightbox.cre-t-lotus-16-lightbox-open {
  display: flex !important;
}

html[lang="en-us" i] [data-cre-t-lotus-16-gallery-single] {
  cursor: zoom-in;
}
`;

    function injectVariationStyles() {
      var styleEl = document.createElement("style");
      styleEl.setAttribute("data-cre-t-lotus-16-style", "");
      styleEl.textContent = VARIATION_CSS;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    injectVariationStyles();

    /* all Pure helper functions */

    function hideElement(element, className) {
      if (!element) return;
      if (className) addClass(element, className);
      element.style.display = "none";
    }

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

    /* capturing-phase click delegation, so it still fires even if the
       target gets removed by the click itself */
    function live(selector, event, callback, context) {
      if (typeof callback !== "function") return;
      context = context || document;

      context.addEventListener(event, function (e) {
        var target = e.target.nodeType === 3 ? e.target.parentNode : e.target;
        if (!target || !target.closest) return;

        var el = target.closest(selector);
        if (el) callback.call(el, e);
      }, true);
    }

    function debounce(func, timeout = 300) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }

    function observeSelector(selector, callback, options = {}) {
      const document = options.document || window.document;
      const processed = new Map();

      if (options.timeout || options.onTimeout) {
        throw `observeSelector options \`timeout\` and \`onTimeout\` are not yet implemented.`;
      }

      let obs;
      let isDone = false;

      const done = () => {
        if (obs) obs.disconnect();
        isDone = true;
      };

      const processElement = (el) => {
        if (!processed.has(el)) {
          processed.set(el, true);
          callback(el);
          if (options.once) {
            done();
            return true;
          }
        }
        return false;
      };

      const lookForSelector = () => {
        const elParent = document.documentElement;
        if (elParent.matches(selector) || elParent.querySelector(selector)) {
          const elements = elParent.querySelectorAll(selector);
          for (const el of elements) {
            if (isDone || processElement(el)) break;
          }
        }
      };

      const debouncedLookForSelector = debounce(() => {
        lookForSelector();
      }, 100);

      lookForSelector();

      if (!isDone) {
        obs = new MutationObserver(() => {
          debouncedLookForSelector();
        });

        obs.observe(document, {
          attributes: false,
          childList: true,
          subtree: true,
        });
      }

      return done;
    }

    function append(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.appendChild(html);
      }
    }

    function insertBefore(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("beforebegin", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforebegin", html);
      }
    }

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (element.classList) {
        element.classList.add(className);
      } else if (!element.className.match(new RegExp("\\b" + className + "\\b"))) {
        element.className += " " + className;
      }
    }

    /* Variation functions */

    var FLEET_SECTION_SELECTOR = 'section[data-slice-type="fleet_category"]';
    var TOP_RATED_NAMES = ["Kia Sportage", "Toyota Rav4", "Dacia Duster"];

    /* Client added data-badge-type="top-rated" on the site's own "Top Rated"
       badge — every card carrying it is pinned; the named cars above are a
       priority within that group, not a separate requirement. */
    var TOP_RATED_BADGE_SELECTOR = '[data-badge-type="top-rated"]';
    var BOOK_NOW_SELECTOR = '[data-button-type="booked-a-car"]';
    var RECOMMENDED_MODE_CLASS = "cre-t-lotus-16-recommended-mode";
    /* Client added data-testid="fleet-filter-bar" on the Car Type /
       Transmission / Passengers / Sort row */
    var FILTER_FIELDS_ROW_SELECTOR = '[data-testid="fleet-filter-bar"]';
    var FROADS_SWITCH_SELECTOR = '[role="switch"][data-slot="switch"]';
    var FILTER_DEFAULT_CAR_TYPE_TEXT = "Car Type";
    var FILTER_DEFAULT_TRANSMISSION_TEXT = "Transmission";
    var FILTER_DEFAULT_PASSENGERS_TEXT = "Passengers";
    var FILTER_DEFAULT_SORT_TEXT = "Low price first";
    var FILTER_DEFAULT_FROADS_CHECKED = "false";
    var lastRecommendedModeState = null;

    /* Client added data-field="rental-time" on the value element */
    var RENTAL_TIME_VALUE_SELECTOR = '[data-field="rental-time"]';

    function getRentalTimeValueElement() {
      return document.querySelector(RENTAL_TIME_VALUE_SELECTOR);
    }

    var MONTH_ABBREVIATIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    /* "16 Sep 2026 12:00 PM" -> "2026-09-16 12:00" */
    function parseDisplayDateTime(displayText) {
      var parts = displayText.trim().split(" ");
      if (parts.length !== 5) return null;

      var day = parts[0];
      var monthIndex = MONTH_ABBREVIATIONS.indexOf(parts[1]);
      var year = parts[2];
      var timeParts = parts[3].split(":");
      var meridiem = parts[4];

      if (monthIndex === -1 || timeParts.length !== 2) return null;

      var hour = parseInt(timeParts[0], 10);
      var minute = timeParts[1];

      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      var paddedDay = day.length === 1 ? "0" + day : day;
      var paddedMonth = monthIndex + 1 < 10 ? "0" + (monthIndex + 1) : String(monthIndex + 1);
      var paddedHour = hour < 10 ? "0" + hour : String(hour);

      return year + "-" + paddedMonth + "-" + paddedDay + " " + paddedHour + ":" + minute;
    }

    function parseRentalTimeRange(rentalTimeText) {
      var rangeParts = rentalTimeText.split(" - ");
      if (rangeParts.length !== 2) return null;

      var pickupAt = parseDisplayDateTime(rangeParts[0]);
      var dropoffAt = parseDisplayDateTime(rangeParts[1]);
      if (!pickupAt || !dropoffAt) return null;

      return { pickupAt: pickupAt, dropoffAt: dropoffAt };
    }

    function getSelectedCurrency() {
      var currencyButton = document.querySelector('button[aria-label="Currency"]');
      if (!currencyButton) return "ISK";

      var currencyText = currencyButton.textContent.trim();
      return currencyText === "" ? "ISK" : currencyText;
    }

    /* vehicle Id -> GroupName, from the fetch — also doubles as the
       availability list (see isCardCurrentlyAvailable) */
    var vehicleGroupById = {};

    /* Replaced, not merged, on every fetch — a car that's no longer
       available for the current dates must actually disappear from here */
    function storeVehicleGroups(response) {
      var vehicles = response && response.cars;
      if (!vehicles || typeof vehicles.forEach !== "function") return;

      vehicleGroupById = {};
      vehicles.forEach(function (vehicle) {
        if (!vehicle || typeof vehicle.Id === "undefined") return;
        vehicleGroupById[vehicle.Id] = vehicle.GroupName || "";
      });
    }

    function fetchVehicles(rentalTimeText) {
      var range = parseRentalTimeRange(rentalTimeText);
      if (!range) return;

      var requestBody = {
        pickupAt: range.pickupAt,
        dropoffAt: range.dropoffAt,
        currency: getSelectedCurrency(),
        mergeEurEditorial: true
      };

      fetch("https://www.lotuscarrental.is/api/caren/vehicles", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(requestBody),
        credentials: "include"
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (vehicles) {
          if (debug) console.log("cre-t-lotus-16: vehicles response", vehicles);
          storeVehicleGroups(vehicles);
          if (debug) console.log("cre-t-lotus-16: stored groups for", Object.keys(vehicleGroupById).length, "vehicles", vehicleGroupById);
          applyOnceCarsExist();
        })
        .catch(function (error) {
          if (debug) console.log("cre-t-lotus-16: vehicles fetch failed", error);
        });
    }

    /* car-921 -> "921" */
    function getCardIdNumber(card) {
      var idParts = card.id.split("-");
      return idParts[1];
    }

    /* Our own fetch is the source of truth for "available now" — if it
       hasn't returned anything yet, nothing gets filtered out by default */
    function isCardCurrentlyAvailable(card) {
      var hasAnyData = Object.keys(vehicleGroupById).length > 0;
      if (!hasAnyData) return true;
      return typeof vehicleGroupById[getCardIdNumber(card)] !== "undefined";
    }

    function addGroupLabelToCard(card) {
      var cardIdNumber = getCardIdNumber(card);
      var groupName = vehicleGroupById[cardIdNumber];

      if (!groupName) {
        if (debug) console.log("cre-t-lotus-16: no group match for", card.id, "(looked up key", cardIdNumber, ")");
        return;
      }
      if (card.querySelector(".cre-t-lotus-16-group-label")) return;

      var labelHtml = `<span class="cre-t-lotus-16-group-label" style="display:none">${groupName}</span>`;
      append(card, labelHtml);
    }

    function getCardName(card) {
      var nameElement = card.querySelector('[data-field="vehicle-name"]');
      if (!nameElement) return "";
      return nameElement.textContent.trim();
    }

    function cardHasTopRatedBadge(card) {
      return card.querySelector(TOP_RATED_BADGE_SELECTOR) !== null;
    }

    /* tier 0 = named cars (both Rav4 variants count), ordered by
       TOP_RATED_NAMES; tier 1 = any other badged car. Unavailable and
       Roof Tent/camper cars are excluded from both. */
    function getTopRatedRank(card) {
      if (!isCardCurrentlyAvailable(card)) return null;

      var groupName = vehicleGroupById[getCardIdNumber(card)];
      if (groupName === "Campers") return null;
      if (!cardHasTopRatedBadge(card)) return null;

      var cardName = getCardName(card).toLowerCase();
      var nameIndex;
      for (nameIndex = 0; nameIndex < TOP_RATED_NAMES.length; nameIndex++) {
        var targetName = TOP_RATED_NAMES[nameIndex].toLowerCase();
        if (cardName.indexOf(targetName) === 0) return { tier: 0, order: nameIndex };
      }

      return { tier: 1, order: 0 };
    }

    function getFleetWrapperElement() {
      var firstSection = document.querySelector(FLEET_SECTION_SELECTOR);
      if (!firstSection) return null;
      return firstSection.parentElement;
    }

    /* Client added data-slice-type="promo_banner" on each banner. :scope >
       keeps this to direct children only, so a banner clone sitting inside
       our own feed container (a grandchild, not a direct child) never
       matches here — even though cloneNode copies this same attribute onto
       it (see createBannerClone's own stripping too). */
    function getBannersInOrder() {
      var wrapper = getFleetWrapperElement();
      if (!wrapper) return [];
      return Array.prototype.slice.call(wrapper.querySelectorAll(':scope > [data-slice-type="promo_banner"]'));
    }

    /* {tier, order} -> "tier-order" string, for inspecting the DOM while
       debugging only — plays no part in positioning */
    function formatRankForDebug(rank) {
      if (!rank) return "none";
      return String(rank.tier) + "-" + String(rank.order);
    }

    /* cre-t-11 (a separate test on this page) turns a card's plain photo
       into a Flickity gallery, reading images from data-images on the real
       card. We rebuild the same gallery from that same source data rather
       than scraping its rendered output, so this works regardless of which
       test's script runs first. We can't reuse its actual Flickity instance
       or its lightbox (both private to its own script) — swipe/prev-next
       works in our clone, opening the lightbox doesn't. */
    var THIRD_PARTY_GALLERY_MAIN_OPTIONS = {
      cellAlign: "left",
      contain: true,
      pageDots: false,
      prevNextButtons: true,
      wrapAround: true
    };

    var THIRD_PARTY_GALLERY_THUMB_OPTIONS = {
      cellAlign: "left",
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      groupCells: false,
      wrapAround: true
    };

    /* Every gallery Flickity instance from the current rebuild — resized
       once the feed is visible (built while hidden, so initial sizing is
       wrong), destroyed at the start of the next rebuild so nothing leaks */
    var thirdPartyFlickityInstances = [];

    function destroyThirdPartyFlickityInstances() {
      thirdPartyFlickityInstances.forEach(function (instance) {
        instance.destroy();
      });
      thirdPartyFlickityInstances = [];
    }

    function resizeThirdPartyFlickityInstances() {
      thirdPartyFlickityInstances.forEach(function (instance) {
        instance.resize();
      });
    }

    /* Bounded poll for window.Flickity (cre-t-11 loads it from a CDN on its
       own timer) — once it's there, one follow-up rebuild upgrades any
       cards stuck on the plain-image fallback */
    var thirdPartyFlickityWaitInProgress = false;

    function waitForThirdPartyFlickityThenRebuild() {
      if (thirdPartyFlickityWaitInProgress) return;
      thirdPartyFlickityWaitInProgress = true;

      var interval = setInterval(function () {
        if (typeof Flickity === "undefined") return;
        clearInterval(interval);
        thirdPartyFlickityWaitInProgress = false;
        processAllCards();
      }, 200);

      setTimeout(function () {
        clearInterval(interval);
        thirdPartyFlickityWaitInProgress = false;
      }, 10000);
    }

    function escapeThirdPartyGalleryAttr(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    /* Same data-images attribute and ordering rule cre-t-11 itself uses:
       1) primary card image, 2) trunk_open image, 3) remaining gallery images. */
    function getThirdPartyGalleryImageUrls(card) {
      var raw = card.dataset.images;
      if (!raw) return [];

      var parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return [];
      }
      if (!Array.isArray(parsed) || !parsed.length) return [];

      var img = card.querySelector("img");
      var primaryUrl = img ? (img.currentSrc || img.src || "") : "";

      var trunkUrl = null;
      var otherUrls = [];
      parsed.forEach(function (item) {
        if (!item || !item.url) return;
        if (!trunkUrl && item.key === "trunk_open") {
          trunkUrl = item.url;
        } else {
          otherUrls.push(item.url);
        }
      });

      var images = [];
      if (primaryUrl) images.push(primaryUrl);
      if (trunkUrl) images.push(trunkUrl);
      images = images.concat(otherUrls);
      return images;
    }

    function buildThirdPartyMainCellsHtml(urls, name) {
      var html = "";
      urls.forEach(function (url, index) {
        html += `<div class="cre-t-11-main-cell"><img class="cre-t-11-main-image" src="${url}" alt="${name} photo ${index + 1}" loading="lazy"></div>`;
      });
      return html;
    }

    function buildThirdPartyThumbCellsHtml(urls, name) {
      var html = "";
      urls.forEach(function (url, index) {
        html += `<div class="cre-t-11-thumb-cell" aria-label="Photo ${index + 1} of ${name}"><img class="cre-t-11-thumb-image" src="${url}" alt="" loading="lazy"></div>`;
      });
      return html;
    }

    /* Our own copies of cre-t-11's lightbox arrow/close icons — no way to
       reach into its closure to reuse the originals */
    var THIRD_PARTY_LIGHTBOX_ARROW_PREV_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-5 lg:size-6"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg>';
    var THIRD_PARTY_LIGHTBOX_ARROW_NEXT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-5 lg:size-6"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>';
    var THIRD_PARTY_LIGHTBOX_CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-6"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>';

    var thirdPartyLightboxEl = null;
    var thirdPartyLightboxMainFlkty = null;
    var thirdPartyLightboxThumbFlkty = null;

    /* Our own lightbox — a different outer class from cre-t-11's own
       ".cre-t-11-lightbox" singleton, so its ensureLightbox() never adopts
       (or gets adopted by) ours; whichever ran first would otherwise end up
       missing the other's backdrop/close/keydown bindings. The inner pieces
       reuse cre-t-11's exact class names, since its already-loaded CSS
       styles those without requiring that specific outer ancestor class. */
    function ensureThirdPartyLightbox() {
      if (thirdPartyLightboxEl) return thirdPartyLightboxEl;

      var existing = document.querySelector("[data-cre-t-lotus-16-lightbox]");
      if (existing) {
        thirdPartyLightboxEl = existing;
        return thirdPartyLightboxEl;
      }

      var html =
        '<div class="cre-t-lotus-16-lightbox" data-cre-t-lotus-16-lightbox aria-hidden="true">' +
        '<div class="cre-t-11-lightbox-backdrop"></div>' +
        '<span class="cre-t-11-lightbox-counter"></span>' +
        `<button type="button" class="cre-t-11-lightbox-close" aria-label="Close photo viewer">${THIRD_PARTY_LIGHTBOX_CLOSE_SVG}</button>` +
        '<div class="cre-t-11-lightbox-content" role="dialog" aria-modal="true" aria-label="Photo viewer">' +
        '<div class="cre-t-11-lightbox-stage">' +
        `<button type="button" class="cre-t-11-lightbox-arrow cre-t-11-lightbox-arrow-prev" aria-label="Previous photo">${THIRD_PARTY_LIGHTBOX_ARROW_PREV_SVG}</button>` +
        '<div class="cre-t-11-lightbox-main"></div>' +
        `<button type="button" class="cre-t-11-lightbox-arrow cre-t-11-lightbox-arrow-next" aria-label="Next photo">${THIRD_PARTY_LIGHTBOX_ARROW_NEXT_SVG}</button>` +
        "</div>" +
        '<div class="cre-t-11-lightbox-thumbs"></div>' +
        "</div>" +
        "</div>";

      document.body.insertAdjacentHTML("beforeend", html);
      thirdPartyLightboxEl = document.querySelector("[data-cre-t-lotus-16-lightbox]");

      thirdPartyLightboxEl.querySelector(".cre-t-11-lightbox-backdrop").addEventListener("click", closeThirdPartyLightbox);
      thirdPartyLightboxEl.querySelector(".cre-t-11-lightbox-close").addEventListener("click", closeThirdPartyLightbox);

      thirdPartyLightboxEl.querySelector(".cre-t-11-lightbox-arrow-prev").addEventListener("click", function () {
        if (thirdPartyLightboxMainFlkty) thirdPartyLightboxMainFlkty.previous();
      });

      thirdPartyLightboxEl.querySelector(".cre-t-11-lightbox-arrow-next").addEventListener("click", function () {
        if (thirdPartyLightboxMainFlkty) thirdPartyLightboxMainFlkty.next();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && thirdPartyLightboxEl.classList.contains("cre-t-lotus-16-lightbox-open")) {
          closeThirdPartyLightbox();
        }
      });

      return thirdPartyLightboxEl;
    }

    function closeThirdPartyLightbox() {
      if (!thirdPartyLightboxEl) return;

      thirdPartyLightboxEl.classList.remove("cre-t-lotus-16-lightbox-open");
      thirdPartyLightboxEl.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cre-t-11-lightbox-lock");

      if (thirdPartyLightboxMainFlkty) {
        thirdPartyLightboxMainFlkty.destroy();
        thirdPartyLightboxMainFlkty = null;
      }
      if (thirdPartyLightboxThumbFlkty) {
        thirdPartyLightboxThumbFlkty.destroy();
        thirdPartyLightboxThumbFlkty = null;
      }
    }

    /* rawName is escaped here, same as cre-t-11's own openLightbox — pass
       the raw (unescaped) name in, not an already-escaped one */
    function openThirdPartyLightbox(urls, rawName, startIndex) {
      if (!urls || !urls.length || typeof Flickity === "undefined") return;

      var box = ensureThirdPartyLightbox();
      var name = escapeThirdPartyGalleryAttr(rawName);

      if (thirdPartyLightboxMainFlkty) {
        thirdPartyLightboxMainFlkty.destroy();
        thirdPartyLightboxMainFlkty = null;
      }
      if (thirdPartyLightboxThumbFlkty) {
        thirdPartyLightboxThumbFlkty.destroy();
        thirdPartyLightboxThumbFlkty = null;
      }

      var mainCellsHtml = "";
      urls.forEach(function (url, index) {
        mainCellsHtml += `<div class="cre-t-11-lightbox-main-cell"><img src="${url}" alt="${name} photo ${index + 1}" loading="lazy"></div>`;
      });
      box.querySelector(".cre-t-11-lightbox-main").innerHTML = mainCellsHtml;

      var mainEl = box.querySelector(".cre-t-11-lightbox-main");
      var thumbEl = box.querySelector(".cre-t-11-lightbox-thumbs");
      var hasMultiple = urls.length > 1;

      if (hasMultiple) {
        var thumbCellsHtml = "";
        urls.forEach(function (url, index) {
          thumbCellsHtml += `<div class="cre-t-11-lightbox-thumb-cell" aria-label="Photo ${index + 1} of ${name}"><img src="${url}" alt="" loading="lazy"></div>`;
        });
        thumbEl.innerHTML = thumbCellsHtml;
      } else {
        thumbEl.innerHTML = "";
      }

      box.classList.add("cre-t-lotus-16-lightbox-open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("cre-t-11-lightbox-lock");

      var prevBtn = box.querySelector(".cre-t-11-lightbox-arrow-prev");
      var nextBtn = box.querySelector(".cre-t-11-lightbox-arrow-next");
      if (prevBtn) prevBtn.style.display = hasMultiple ? "" : "none";
      if (nextBtn) nextBtn.style.display = hasMultiple ? "" : "none";

      var counterEl = box.querySelector(".cre-t-11-lightbox-counter");
      var updateCounter = function (index) {
        if (counterEl) counterEl.textContent = (index + 1) + " / " + urls.length;
      };
      updateCounter(startIndex);

      thirdPartyLightboxMainFlkty = new Flickity(mainEl, {
        cellAlign: "left",
        contain: true,
        pageDots: false,
        prevNextButtons: false,
        wrapAround: hasMultiple,
        arrowKeys: "left-right",
        initialIndex: startIndex
      });

      thirdPartyLightboxMainFlkty.on("change", updateCounter);

      if (hasMultiple) {
        thirdPartyLightboxThumbFlkty = new Flickity(thumbEl, {
          contain: true,
          pageDots: false,
          prevNextButtons: false,
          groupCells: false,
          asNavFor: mainEl,
          initialIndex: startIndex
        });
      }
    }

    /* Set only when a card had 2+ photos to carousel but Flickity wasn't
       loaded yet — checked at the end of rebuildRecommendedFeed */
    var flickityMissingDuringLastBuild = false;

    /* Rebuilds cre-t-11's gallery in a card clone from data-images —
       replacing any dead gallery already cloned in, or adding one fresh.
       A single photo has nothing to carousel, so it's left as the plain
       original image. */
    function rebuildThirdPartyGallery(clone, sourceCard) {
      var originalImage = clone.querySelector("img");
      if (!originalImage) return;

      var wrapper = originalImage.parentElement;
      if (!wrapper) return;

      var existingGallery = wrapper.querySelector(".cre-t-11-gallery");
      if (existingGallery) wrapper.removeChild(existingGallery);

      var urls = getThirdPartyGalleryImageUrls(sourceCard);
      var rawName = originalImage.alt || "";

      if (urls.length < 1) {
        originalImage.classList.remove("cre-t-11-control-img");
        originalImage.style.display = "";
        return;
      }

      /* cre-t-11 genuinely isn't running this page load — never build any
         part of the gallery (or the lightbox, which depends on its CSS
         being loaded to look right). window.cre_11_events is set early in
         cre-t-11's own init(), a direct signal rather than inferring its
         presence from window.Flickity alone, which some unrelated script
         could coincidentally also define. */
      if (!window.cre_11_events) {
        originalImage.classList.remove("cre-t-11-control-img");
        originalImage.style.display = "";
        return;
      }

      if (typeof Flickity === "undefined") {
        /* cre-t-11 is running but hasn't finished loading Flickity yet —
           worth retrying once it does */
        flickityMissingDuringLastBuild = true;
        originalImage.classList.remove("cre-t-11-control-img");
        originalImage.style.display = "";
        return;
      }

      if (urls.length === 1) {
        originalImage.classList.remove("cre-t-11-control-img");
        originalImage.style.display = "";
        originalImage.setAttribute("data-cre-t-lotus-16-gallery-single", "");
        return;
      }

      var name = escapeThirdPartyGalleryAttr(rawName);
      var galleryHtml =
        `<div class="cre-t-11-gallery" data-cre-t-11-car-id="${sourceCard.id}">` +
        `<div class="cre-t-11-main-carousel">${buildThirdPartyMainCellsHtml(urls, name)}</div>` +
        `<div class="cre-t-11-thumb-carousel" aria-hidden="true">${buildThirdPartyThumbCellsHtml(urls, name)}</div>` +
        `</div>`;

      originalImage.classList.add("cre-t-11-control-img");
      wrapper.insertAdjacentHTML("beforeend", galleryHtml);

      var gallery = wrapper.querySelector(".cre-t-11-gallery");
      if (!gallery) return;

      var mainEl = gallery.querySelector(".cre-t-11-main-carousel");
      var thumbEl = gallery.querySelector(".cre-t-11-thumb-carousel");

      var mainFlkty = new Flickity(mainEl, THIRD_PARTY_GALLERY_MAIN_OPTIONS);
      thirdPartyFlickityInstances.push(mainFlkty);

      var thumbOptions = {
        cellAlign: THIRD_PARTY_GALLERY_THUMB_OPTIONS.cellAlign,
        contain: THIRD_PARTY_GALLERY_THUMB_OPTIONS.contain,
        pageDots: THIRD_PARTY_GALLERY_THUMB_OPTIONS.pageDots,
        prevNextButtons: THIRD_PARTY_GALLERY_THUMB_OPTIONS.prevNextButtons,
        groupCells: THIRD_PARTY_GALLERY_THUMB_OPTIONS.groupCells,
        wrapAround: THIRD_PARTY_GALLERY_THUMB_OPTIONS.wrapAround,
        asNavFor: mainEl
      };
      var thumbFlkty = new Flickity(thumbEl, thumbOptions);
      thirdPartyFlickityInstances.push(thumbFlkty);

      /* clicking a cell (not dragging) opens our own lightbox — matches
         cre-t-11's own staticClick behavior on the real gallery */
      function handleThirdPartyStaticClick(event, pointer, cellElement, cellIndex) {
        var index = typeof cellIndex === "number" ? cellIndex : mainFlkty.selectedIndex;
        openThirdPartyLightbox(urls, rawName, index);
      }

      mainFlkty.on("staticClick", handleThirdPartyStaticClick);
      thumbFlkty.on("staticClick", handleThirdPartyStaticClick);
    }

    function createCloneOfCard(card) {
      var clone = document.createElement("cre-t-lotus-16-card");
      var attributeIndex;

      for (attributeIndex = 0; attributeIndex < card.attributes.length; attributeIndex++) {
        var attribute = card.attributes[attributeIndex];
        if (attribute.name === "id") continue;
        clone.setAttribute(attribute.name, attribute.value);
      }

      clone.innerHTML = card.innerHTML;
      clone.classList.remove("cre-t-lotus-16-hidden");
      clone.setAttribute("data-cre-t-lotus-16-clone", "");
      clone.setAttribute("data-cre-t-lotus-16-source", card.id);
      clone.setAttribute("data-cre-t-lotus-16-rank", formatRankForDebug(getTopRatedRank(card)));
      rebuildThirdPartyGallery(clone, card);
      return clone;
    }

    /* Deep-cloned as-is — banners have no per-instance state or click
       handlers to forward */
    function createBannerClone(banner) {
      var clone = banner.cloneNode(true);
      clone.removeAttribute("data-slice-type");
      clone.setAttribute("data-cre-t-lotus-16-banner-clone", "");
      return clone;
    }

    /* Every pinned card, sorted tier first, then name order within tier 0,
       then page order */
    function getTopRatedCardsInOrder() {
      var candidates = [];
      var cards = document.querySelectorAll('[id^="car-"]');
      var originalIndex = 0;

      cards.forEach(function (card) {
        var rank = getTopRatedRank(card);
        if (rank !== null) {
          candidates.push({ card: card, rank: rank, originalIndex: originalIndex });
        }
        originalIndex++;
      });

      candidates.sort(function (a, b) {
        if (a.rank.tier !== b.rank.tier) return a.rank.tier - b.rank.tier;
        if (a.rank.order !== b.rank.order) return a.rank.order - b.rank.order;
        return a.originalIndex - b.originalIndex;
      });

      return candidates;
    }

    var SIZE_GROUP_ORDER = ["Small", "Medium", "Large", "Luxury and Vans", "Campers"];

    /* Ranked by GroupName from our own fetch, not by DOM position — an
       unrecognized GroupName sorts last instead of breaking */
    function getSizeGroupRank(card) {
      var groupName = vehicleGroupById[getCardIdNumber(card)];
      var rank = SIZE_GROUP_ORDER.indexOf(groupName);
      if (rank === -1) return SIZE_GROUP_ORDER.length;
      return rank;
    }

    /* Pinned cards first, then everything else ordered by size */
    function getAllCardsInFeedOrder() {
      var topRatedCandidates = getTopRatedCardsInOrder();
      var orderedCards = [];
      var topRatedCardList = [];

      topRatedCandidates.forEach(function (candidate) {
        orderedCards.push(candidate.card);
        topRatedCardList.push(candidate.card);
      });

      var remainingCandidates = [];
      var allCards = document.querySelectorAll('[id^="car-"]');
      var originalIndex = 0;

      allCards.forEach(function (card) {
        if (topRatedCardList.indexOf(card) === -1 && isCardCurrentlyAvailable(card)) {
          remainingCandidates.push({ card: card, sizeRank: getSizeGroupRank(card), originalIndex: originalIndex });
        }
        originalIndex++;
      });

      remainingCandidates.sort(function (a, b) {
        if (a.sizeRank !== b.sizeRank) return a.sizeRank - b.sizeRank;
        return a.originalIndex - b.originalIndex;
      });

      remainingCandidates.forEach(function (candidate) {
        orderedCards.push(candidate.card);
      });

      return orderedCards;
    }

    var FEED_CARDS_PER_GROUP = 6;
    /* only the first group is smaller, so the first banner shows after 3
       cards instead of 6 */
    var FEED_CARDS_IN_FIRST_GROUP = 3;

    /* Reads the real grid's own classes live, so our layout always matches
       the site's without hardcoding fragile Tailwind strings */
    function getFeedStructure() {
      var firstSection = document.querySelector(FLEET_SECTION_SELECTOR);
      if (!firstSection) return null;

      var firstCard = firstSection.querySelector('[id^="car-"]');
      if (!firstCard) return null;

      var grid = firstCard.parentElement;
      var maxWidthWrapper = grid.parentElement.parentElement;

      return {
        firstSection: firstSection,
        gridClassName: grid.className,
        maxWidthClassName: maxWidthWrapper ? maxWidthWrapper.className : ""
      };
    }

    function buildFeedGroup(cards, structure) {
      var outer = document.createElement("div");
      outer.className = structure.maxWidthClassName;

      var grid = document.createElement("div");
      grid.className = structure.gridClassName;

      cards.forEach(function (card) {
        grid.appendChild(createCloneOfCard(card));
      });

      outer.appendChild(grid);
      return outer;
    }

    /* Empties the feed the instant dates are confirmed, before the new
       fetch even starts, so stale clones are never shown even briefly.
       Dropping "ready" (not just clearing content) avoids a flash of an
       empty gap. */
    function clearRecommendedFeed() {
      var feedContainer = document.querySelector("[data-cre-t-lotus-16-feed]");
      if (!feedContainer) return;

      feedContainer.removeAttribute("data-cre-t-lotus-16-ready");
      feedContainer.innerHTML = "";
    }

    /* Clones every card and banner and rebuilds the whole feed from scratch
       every time — simpler than incrementally patching, and no
       feedback-loop risk since nothing watches the feed container itself.
       Real sections/banners stay hidden via the same reversible class +
       mode gate used everywhere else. */
    function rebuildRecommendedFeed() {
      var structure = getFeedStructure();
      if (!structure) return;

      var sections = document.querySelectorAll(FLEET_SECTION_SELECTOR);
      sections.forEach(function (section) {
        addClass(section, "cre-t-lotus-16-hidden");
      });

      var banners = getBannersInOrder();
      banners.forEach(function (banner) {
        addClass(banner, "cre-t-lotus-16-hidden");
      });

      /* queried fresh, not cached — self-heals if more than one is ever
         found instead of silently piling up */
      var existingFeedContainers = document.querySelectorAll("[data-cre-t-lotus-16-feed]");
      if (debug) console.log("cre-t-lotus-16: rebuild found", existingFeedContainers.length, "existing feed container(s)");

      var feedContainer;
      var extraIndex;
      if (existingFeedContainers.length > 0) {
        feedContainer = existingFeedContainers[0];
        for (extraIndex = 1; extraIndex < existingFeedContainers.length; extraIndex++) {
          if (debug) console.log("cre-t-lotus-16: removing extra feed container");
          existingFeedContainers[extraIndex].parentElement.removeChild(existingFeedContainers[extraIndex]);
        }
      } else {
        feedContainer = document.createElement("div");
        feedContainer.setAttribute("data-cre-t-lotus-16-feed", "");
        insertBefore(structure.firstSection, feedContainer);
        if (debug) console.log("cre-t-lotus-16: created a new feed container");
      }

      destroyThirdPartyFlickityInstances();
      flickityMissingDuringLastBuild = false;

      feedContainer.className = getFleetWrapperElement().className;
      feedContainer.removeAttribute("data-cre-t-lotus-16-ready");
      /* same max-width wrapper as a real section's heading, so it aligns */
      feedContainer.innerHTML = `<div class="${structure.maxWidthClassName}"><h2 class="cre-t-lotus-16-recommended-heading text-2xl font-semibold leading-6 text-foreground">Recommended</h2></div>`;

      var orderedCards = getAllCardsInFeedOrder();
      var bannerIndex = 0;
      var cardIndex = 0;
      var isFirstGroup = true;

      while (cardIndex < orderedCards.length) {
        var groupSize = FEED_CARDS_PER_GROUP;
        if (isFirstGroup) groupSize = FEED_CARDS_IN_FIRST_GROUP;

        var groupCards = orderedCards.slice(cardIndex, cardIndex + groupSize);
        feedContainer.appendChild(buildFeedGroup(groupCards, structure));
        cardIndex += groupSize;
        isFirstGroup = false;

        var moreCardsRemain = cardIndex < orderedCards.length;
        var bannerAvailable = bannerIndex < banners.length;
        if (moreCardsRemain && bannerAvailable) {
          feedContainer.appendChild(createBannerClone(banners[bannerIndex]));
          bannerIndex++;
        }
      }

      /* any banner left over (more real banners than gaps between groups)
         is appended at the end instead of dropped */
      while (bannerIndex < banners.length) {
        feedContainer.appendChild(createBannerClone(banners[bannerIndex]));
        bannerIndex++;
      }

      feedContainer.setAttribute("data-cre-t-lotus-16-ready", "");

      /* galleries were sized while hidden/detached — resize now that the
         feed is actually visible */
      resizeThirdPartyFlickityInstances();

      if (flickityMissingDuringLastBuild) {
        waitForThirdPartyFlickityThenRebuild();
      }
    }

    function watchCurrencyChange() {
      if (window.cre_lotus_16_currency_watched) return;

      var currencyButton = document.querySelector('button[aria-label="Currency"]');
      if (!currencyButton) return;

      window.cre_lotus_16_currency_watched = true;

      var debouncedRefresh = debounce(function () {
        /* the site's own price recalculation across every card isn't
           instant, and how long it actually takes isn't something we can
           observe directly (no exposed completion signal, and watching the
           cards themselves for it would mean the broad card-observer
           already ruled out elsewhere) — so this rebuilds twice: once at
           500ms, once more at 1500ms to catch any card whose price hadn't
           finished updating the first time. A heuristic, not a verified
           fix, given there's nothing concrete to poll for instead. */
        setTimeout(processAllCards, 500);
        setTimeout(processAllCards, 1500);
      }, 100);

      var observer = new MutationObserver(debouncedRefresh);

      observer.observe(currencyButton, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }

    /* Clone Book Now buttons have no click handler of their own (cloneNode
       doesn't copy React's), so forward the click to the real button */
    function bindCloneBookNowForwarding() {
      if (window.cre_lotus_16_events_bound) return;
      window.cre_lotus_16_events_bound = true;

      live("[data-cre-t-lotus-16-clone] " + BOOK_NOW_SELECTOR, "click", function () {
        var cloneCard = this.closest("[data-cre-t-lotus-16-clone]");
        if (!cloneCard) return;

        var sourceId = cloneCard.getAttribute("data-cre-t-lotus-16-source");
        if (!sourceId) return;

        var originalCard = document.getElementById(sourceId);
        if (!originalCard) return;

        var originalButton = originalCard.querySelector(BOOK_NOW_SELECTOR);
        if (!originalButton) return;

        originalButton.click();
      });
    }

    /* Matches cre-t-11's own click-to-lightbox behavior for a single-photo
       card, which has no carousel of its own to bind a staticClick to */
    function bindThirdPartyGallerySingleImageClick() {
      if (window.cre_lotus_16_gallery_single_bound) return;
      window.cre_lotus_16_gallery_single_bound = true;

      live("[data-cre-t-lotus-16-gallery-single]", "click", function () {
        openThirdPartyLightbox([this.src], this.alt || "", 0);
      });
    }

    /* Shared by isFiltersAtDefaultState and getFilterStateSignature.
       Client added data-filter="car-type"/"transmission"/"passengers"/"sort"
       on each button directly. */
    function readFilterFieldValues() {
      var fieldsRow = document.querySelector(FILTER_FIELDS_ROW_SELECTOR);
      if (!fieldsRow) return null;

      var carTypeButton = fieldsRow.querySelector('[data-filter="car-type"]');
      var transmissionButton = fieldsRow.querySelector('[data-filter="transmission"]');
      var passengersButton = fieldsRow.querySelector('[data-filter="passengers"]');
      var sortButton = fieldsRow.querySelector('[data-filter="sort"]');

      if (!carTypeButton) return null;
      if (!transmissionButton) return null;
      if (!passengersButton) return null;
      if (!sortButton) return null;

      var fRoadsSwitch = document.querySelector(FROADS_SWITCH_SELECTOR);
      var checkedValue = null;
      if (fRoadsSwitch) {
        checkedValue = fRoadsSwitch.getAttribute("aria-checked");
      }

      return {
        carTypeText: carTypeButton.textContent.trim(),
        transmissionText: transmissionButton.textContent.trim(),
        passengersText: passengersButton.textContent.trim(),
        sortText: sortButton.textContent.trim(),
        fRoadsChecked: checkedValue
      };
    }

    function isFiltersAtDefaultState() {
      var fallbackState = true;
      if (lastRecommendedModeState !== null) {
        fallbackState = lastRecommendedModeState;
      }

      var values = readFilterFieldValues();
      if (!values) return fallbackState;

      if (values.carTypeText !== FILTER_DEFAULT_CAR_TYPE_TEXT) return false;
      if (values.transmissionText !== FILTER_DEFAULT_TRANSMISSION_TEXT) return false;
      if (values.passengersText !== FILTER_DEFAULT_PASSENGERS_TEXT) return false;
      if (values.sortText !== FILTER_DEFAULT_SORT_TEXT) return false;
      if (values.fRoadsChecked !== null) {
        if (values.fRoadsChecked !== FILTER_DEFAULT_FROADS_CHECKED) return false;
      }

      return true;
    }

    /* Tells a real filter change apart from a dropdown merely
       opening/closing (also mutates the toolbar without changing values) */
    function getFilterStateSignature() {
      var values = readFilterFieldValues();
      if (!values) return null;

      return [values.carTypeText, values.transmissionText, values.passengersText, values.sortText, values.fRoadsChecked].join("|");
    }

    function syncRecommendedMode() {
      var isDefault = isFiltersAtDefaultState();

      if (isDefault) {
        addClass(document.documentElement, RECOMMENDED_MODE_CLASS);
      } else {
        document.documentElement.classList.remove(RECOMMENDED_MODE_CLASS);
      }

      if (debug && isDefault !== lastRecommendedModeState) {
        console.log("cre-t-lotus-16: recommended mode is now", isDefault);
      }
      lastRecommendedModeState = isDefault;

      return isDefault;
    }

    /* Only used for the filter-toolbar trigger (skipIfUnchanged) — date and
       currency changes always rebuild regardless */
    var lastFilterSignature = null;

    function processAllCards(options) {
      var skipIfUnchanged = options && options.skipIfUnchanged;

      var isRecommended = syncRecommendedMode();
      if (!isRecommended) {
        lastFilterSignature = null;
        return;
      }

      if (skipIfUnchanged) {
        var currentSignature = getFilterStateSignature();
        if (currentSignature !== null && currentSignature === lastFilterSignature) {
          if (debug) console.log("cre-t-lotus-16: filter state unchanged, skipping rebuild");
          return;
        }
        lastFilterSignature = currentSignature;
      } else {
        lastFilterSignature = getFilterStateSignature();
      }

      /* labels go on the real cards first — createCloneOfCard copies
         innerHTML, so the label rides along into the clone */
      var cards = document.querySelectorAll('[id^="car-"]');
      cards.forEach(function (card) {
        addGroupLabelToCard(card);
      });

      rebuildRecommendedFeed();
    }

    function applyOnceCarsExist(options) {
      observeSelector('[id^="car-"]', function () {
        setTimeout(function () {
          processAllCards(options);
        }, 400);
      }, { once: true });
    }

    function logRentalTime(valueElement) {
      var rentalTimeText = valueElement.textContent.trim();
      fetchVehicles(rentalTimeText);
    }

    function getFilterToolbarElement() {
      var fieldsRow = document.querySelector(FILTER_FIELDS_ROW_SELECTOR);
      if (!fieldsRow) return null;
      return fieldsRow.parentElement;
    }

    /* skipIfUnchanged lets a dropdown merely opening/closing fall through
       as a no-op instead of rebuilding the feed */
    function watchFilterToolbar(toolbarElement) {
      var debouncedRecheck = debounce(function () {
        applyOnceCarsExist({ skipIfUnchanged: true });
      }, 100);

      var observer = new MutationObserver(debouncedRecheck);

      observer.observe(toolbarElement, {
        attributes: true,
        attributeFilter: ["aria-checked", "data-checked", "data-unchecked"],
        characterData: true,
        childList: true,
        subtree: true
      });
    }

    /* Variation Init */
    function init() {
      var valueElement = getRentalTimeValueElement();
      if (!valueElement) return;
      logRentalTime(valueElement);
      bindCloneBookNowForwarding();
      bindThirdPartyGallerySingleImageClick();
      watchCurrencyChange();

      var filterToolbar = getFilterToolbarElement();
      if (filterToolbar) watchFilterToolbar(filterToolbar);

      if (!window.cre_t_16_event_trigger) {
        window.cre_t_16_event_trigger = true;

        /* Client added data-action="confirm-dates" on both the desktop
           "Update" button and the mobile "Check the fleet" link */
        document.addEventListener("click", function (event) {
          var target = event.target.closest('[data-action="confirm-dates"]');
          if (!target) return;

          if (debug) console.log("cre-t-lotus-16: date confirm clicked");

          clearRecommendedFeed();

          setTimeout(function () {
            var valueElement = getRentalTimeValueElement();
            if (valueElement) logRentalTime(valueElement);
          }, 400);
        }, true);
      }
    }

    /* Initialise variation */
    waitForElement(RENTAL_TIME_VALUE_SELECTOR, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}