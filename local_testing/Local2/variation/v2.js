(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-164";

    /* Only this array changes between V1-V6. Order IS rank: index 0 = rank 1, index 9 = rank 10. */
    var partnerRatingData = [
      { dataLabel: "outbound-partner-clicks-Fetch-Listing-Only", total: "9.6", classification: "Exceptional", popularity: "8.6", valueForMoney: "8.3", reviews: "8.5", popularityPercentage: "86%", valueForMoneyPercentage: "83%", reviewsPercentage: "85%" },
      { dataLabel: "outbound-partner-clicks-Embrace-Listing-Only", total: "8.5", classification: "Excellent", popularity: "8.4", valueForMoney: "8.7", reviews: "8.3", popularityPercentage: "84%", valueForMoneyPercentage: "87%", reviewsPercentage: "83%" },
      { dataLabel: "outbound-partner-clicks-Pumpkin-Listing-Only", total: "8.1", classification: "Very Good", popularity: "7.9", valueForMoney: "8.0", reviews: "8.3", popularityPercentage: "79%", valueForMoneyPercentage: "80%", reviewsPercentage: "83%" },
      { dataLabel: "outbound-partner-clicks-Figo-Listing-Only", total: "7.4", classification: "Very Good", popularity: "7.1", valueForMoney: "7.7", reviews: "7.5", popularityPercentage: "71%", valueForMoneyPercentage: "77%", reviewsPercentage: "75%" },
      { dataLabel: "outbound-partner-clicks-Liberty Mutual-Listing-Only", total: "6.7", classification: "Good", popularity: "5.2", valueForMoney: "4.7", reviews: "5.3", popularityPercentage: "52%", valueForMoneyPercentage: "47%", reviewsPercentage: "53%" },
      { dataLabel: "outbound-partner-clicks-Trupanion-Listing-Only", total: "6.5", classification: "Good", popularity: "6.7", valueForMoney: "7.6", reviews: "6.5", popularityPercentage: "67%", valueForMoneyPercentage: "76%", reviewsPercentage: "65%" },
      { dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only", total: "5.9", classification: "Good", popularity: "10.0", valueForMoney: "9.8", reviews: "9.0", popularityPercentage: "100%", valueForMoneyPercentage: "98%", reviewsPercentage: "90%" },
      { dataLabel: "outbound-partner-clicks-Odie-Listing-Only", total: "4.8", classification: "Average", popularity: "4.1", valueForMoney: "4.5", reviews: "5.7", popularityPercentage: "41%", valueForMoneyPercentage: "45%", reviewsPercentage: "57%" },
      { dataLabel: "outbound-partner-clicks-ASPCA-Listing-Only", total: "4.5", classification: "Average", popularity: "8.5", valueForMoney: "8.4", reviews: "8.7", popularityPercentage: "85%", valueForMoneyPercentage: "84%", reviewsPercentage: "87%" },
      { dataLabel: "outbound-partner-clicks-AKC-Listing-Only", total: "4.3", classification: "Average", popularity: "4.2", valueForMoney: "4.2", reviews: "4.5", popularityPercentage: "42%", valueForMoneyPercentage: "42%", reviewsPercentage: "45%" }
    ];

    /* ===== helpers: waitForElement, live, insertAfter, observeSelector ===== */


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


    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

    function debounce(func, delay = 20) {
      let timeout;
      return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
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

      const processElement = el => {
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
          elements.forEach(el => processElement(el));
        }
      };

      const debouncedLookForSelector = debounce(() => {
        lookForSelector();
      }, 100);

      // Initial check for the selector on page load
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





    /* ===== state ===== */
    var defaultClass = "cre-t-164-default";
    var listenerInterval = null;
    var currentContextKey = null;
    var lastKnownRevert = false;
    var pristineChildOrder = null;
    var pendingNativeQuotes = null;


    var toggleButtonHtml = `<a class="oxy-read-more-link cre-t-164-toggle" href="javascript:void(0)" style="display: none;"><span class="oxy-read-more-link_text cre-t-164-toggle-text" style="visibility: visible;">Show More</span></a>`;


    var crossIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.05375 13.3075L0 12.2538L5.6 6.65375L0 1.05375L1.05375 0L6.65375 5.6L12.2537 0L13.3075 1.05375L7.7075 6.65375L13.3075 12.2538L12.2537 13.3075L6.65375 7.7075L1.05375 13.3075Z" fill="white" fill-opacity="0.6"></path></svg>`;


    function parseParamsFromUrl(url) {
      var u;
      try {
        u = new URL(url, window.location.origin);
      } catch (e) {
        return { petType: "", breed: "", zipCode: "" };
      }
      return {
        petType: u.searchParams.get("petType") || "",
        breed: u.searchParams.get("breed") || "",
        zipCode: u.searchParams.get("zipCode") || ""
      };
    }

    function getUrlParamsFromLocation() {
      var params = new URLSearchParams(window.location.search);
      return {
        petType: params.get("petType") || "",
        breed: params.get("breed") || "",
        zipCode: params.get("zipCode") || ""
      };
    }
    function paramsKey(params) {
      return params.petType + "|" + params.breed + "|" + params.zipCode;
    }
    function shouldRevert(params) {
      return !!(params.breed || params.zipCode);
    }
    function isQuotesEndpoint(url) {
      return typeof url === "string" && url.indexOf("/wp-json/insurance-finder/v1/quotes") !== -1;
    }


    function getContainer() {
      return document.querySelector('.plan-repeater[data-unique="comparison-table"]');
    }

    function isReorderableCard(node) {
      if (!node || node.nodeType !== 1) return false;
      var dataUnique = node.getAttribute && node.getAttribute("data-unique");
      if (!dataUnique || dataUnique.indexOf("outbound-partner-clicks-") !== 0) return false;
      if (node.querySelector(".best-overall-bubble")) return false;
      return true;
    }

    function getSlotCards() {
      var container = getContainer();
      if (!container) return [];
      return Array.prototype.filter.call(container.children, isReorderableCard);
    }

    function getCardsByPartner(container) {
      var map = {};
      Array.prototype.forEach.call(container.children, function (node) {
        if (!isReorderableCard(node)) return;
        var key = node.getAttribute("data-unique");
        if (key) map[key] = node;
      });
      return map;
    }

    function reorderContainerChildren(container, desiredCardNodesInOrder) {

      var currentCards = getSlotCards();

      for (var i = 0; i < desiredCardNodesInOrder.length; i++) {
        var desiredNode = desiredCardNodesInOrder[i];
        if (!desiredNode) continue;
        if (currentCards[i] === desiredNode) continue;

        var referenceCard = currentCards[i] || null;
        container.insertBefore(desiredNode, referenceCard);
        currentCards = getSlotCards();
      }
    }

    function applyRankOrder(container) {
      var cardsByPartner = getCardsByPartner(container);
      var desired = partnerRatingData
        .map(function (d) { return cardsByPartner[d.dataLabel]; })
        .filter(Boolean);
      reorderContainerChildren(container, desired);
    }

    function applyNativeOrderFromQuotes(container, quotesJson) {
      if (!quotesJson || !Array.isArray(quotesJson.quotes)) return;
      var cardsByPartner = getCardsByPartner(container);
      var desired = quotesJson.quotes
        .map(function (q) { return cardsByPartner["outbound-partner-clicks-" + q.providerName + "-Listing-Only"]; })
        .filter(Boolean);
      reorderContainerChildren(container, desired);
    }

    function restorePristineOrder(container) {
      if (!pristineChildOrder) return;
      var stillAllPresent = pristineChildOrder.every(function (node) { return node.parentNode === container; });
      if (!stillAllPresent) return;

      var current = Array.prototype.slice.call(container.children);
      for (var i = 0; i < pristineChildOrder.length; i++) {
        if (current[i] === pristineChildOrder[i]) continue;
        container.insertBefore(pristineChildOrder[i], current[i] || null);
        current = Array.prototype.slice.call(container.children);
      }
    }

    /* ===== native show-more forwarding -- NEW ===== */

    function getNativeToggleButton() {
      var container = getContainer();
      if (!container) return null;
      return container.querySelector('.oxy-read-more-link:not(.cre-t-164-toggle)');
    }

    function ensureNativeExpanded() {
      var nativeButton = getNativeToggleButton();
      if (nativeButton && nativeButton.textContent.trim() === "Show More") {
        nativeButton.click();
      }
    }



    function injectToggleButton() {
      var container = getContainer();
      if (!container) return;
      var nativeButton = container.querySelector('.oxy-read-more-link:not(.cre-t-164-toggle)');
      if (!nativeButton) return;
      var ourToggle = container.querySelector('.cre-t-164-toggle');
      if (!ourToggle) {
        insertAfter(nativeButton, toggleButtonHtml);
        return;
      }
      if (ourToggle.previousElementSibling !== nativeButton) {
        insertAfter(nativeButton, ourToggle);
      }
    }

    function updateOurToggleText() {
      var ourText = document.querySelector('.cre-t-164-toggle-text');
      if (!ourText) return;
      ourText.textContent = document.body.classList.contains("cre-t-164-collapsed") ? "Show More" : "Show Less";
    }

    function handleToggleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.toggle("cre-t-164-collapsed");
      updateOurToggleText();
      startRetryLoop(lastKnownRevert);
    }

    function findTrupanionIndex() {
      for (var i = 0; i < partnerRatingData.length; i++) {
        if (partnerRatingData[i].dataLabel.indexOf("Trupanion") !== -1) return i;
      }
      return partnerRatingData.length - 1;
    }

    function markBelowTrupanionCards(slots) {
      var cutoff = findTrupanionIndex();
      slots.forEach(function (card, index) {
        if (index > cutoff) card.classList.add("cre-t-164-below-trupanion");
        else card.classList.remove("cre-t-164-below-trupanion");
      });
    }

    function clearBelowTrupanionMarks(slots) {
      slots.forEach(function (card) {
        card.classList.remove("cre-t-164-below-trupanion");
      });
    }



    function getRatingWidgetHtml(data) {
      return `<div class="cre-t-164-container" data-unique="${data.dataLabel}">
  <div class="cre-t-164-wrapper">
    <div class="cre-t-164-reviews">
      <div class="cre-t-164-review-top">
        <div class="cre-t-164-top-content1">
          <div class="cre-t-164-top-content1-text">
            <span class="cre-t-164-total">${data.total}</span>
            <span class="cre-t-164-star">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                <path d="M3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#00C481"></path>
              </svg>
            </span>
            <span class="cre-t-164-classification">${data.classification}</span>
          </div>
          <div class="cre-t-164-top-content1-mobile">
            <div class="cre-t-164-classification">${data.classification}</div>
            <div class="cre-t-164-top-content2-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
                <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="cre-t-164-top-content2">
          <div class="cre-t-164-top-content2-text">Pet Insurance Gurus Score</div>
          <div class="cre-t-164-top-content2-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
              <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="cre-t-164-review-dropdown">
        <div class="cre-t-164-dropdown-wrapper">
          <div class="cre-t-164-cross">${crossIconSvg}</div>
          <div class="cre-t-164-dropdown-top">
            <div class="cre-t-164-dropdown-content cre-t-164-dropdown-content1">
              <div class="cre-t-164-dropdown-info1">
                <div class="cre-t-164-dropdown-info1-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                    <path d="M0 13V4.33333H3.85V13H0ZM5.075 13V0H8.925V13H5.075ZM10.15 13V5.77778H14V13H10.15Z" fill="#EEA650"></path>
                  </svg>
                </div>
                <div class="cre-t-164-dropdown-info1-text">Popularity</div>
              </div>
              <div class="cre-t-164-dropdown-info2">
                <div class="cre-t-164-dropdown-info2-bar"><div class="cre-t-164-dropdown-bar" style="width:${data.popularityPercentage}"></div></div>
                <div class="cre-t-164-dropdown-info2-score">${data.popularity}</div>
              </div>
              <div class="cre-t-164-dropdown-info3">Based on sales in the last 7 days</div>
            </div>
            <div class="cre-t-164-dropdown-content cre-t-164-dropdown-content2">
              <div class="cre-t-164-dropdown-info1">
                <div class="cre-t-164-dropdown-info1-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                    <path d="M9.8 6.15789C9.99833 6.15789 10.1646 6.09232 10.2987 5.96118C10.4329 5.83004 10.5 5.66754 10.5 5.47368C10.5 5.27982 10.4329 5.11732 10.2987 4.98618C10.1646 4.85504 9.99833 4.78947 9.8 4.78947C9.60167 4.78947 9.43542 4.85504 9.30125 4.98618C9.16708 5.11732 9.1 5.27982 9.1 5.47368C9.1 5.66754 9.16708 5.83004 9.30125 5.96118C9.43542 6.09232 9.60167 6.15789 9.8 6.15789ZM4.2 4.78947H7.7V3.42105H4.2V4.78947ZM1.75 13C1.35333 11.7 0.9625 10.4029 0.5775 9.10855C0.1925 7.81425 0 6.4886 0 5.13158C0 4.08246 0.373333 3.19298 1.12 2.46316C1.86667 1.73333 2.77667 1.36842 3.85 1.36842H7.35C7.68833 0.935088 8.09958 0.598684 8.58375 0.359211C9.06792 0.119737 9.59 0 10.15 0C10.4417 0 10.6896 0.0997807 10.8938 0.299342C11.0979 0.498904 11.2 0.741228 11.2 1.02632C11.2 1.08333 11.1708 1.21447 11.1125 1.41974C11.0658 1.54518 11.0221 1.67346 10.9812 1.80461C10.9404 1.93575 10.9083 2.06974 10.885 2.20658L12.4775 3.76316H14V8.53553L12.0225 9.16842L10.85 13H7V11.6316H5.6V13H1.75Z" fill="#5DC087"></path>
                  </svg>
                </div>
                <div class="cre-t-164-dropdown-info1-text">Value for Money</div>
              </div>
              <div class="cre-t-164-dropdown-info2">
                <div class="cre-t-164-dropdown-info2-bar"><div class="cre-t-164-dropdown-bar" style="width:${data.valueForMoneyPercentage}"></div></div>
                <div class="cre-t-164-dropdown-info2-score">${data.valueForMoney}</div>
              </div>
              <div class="cre-t-164-dropdown-info3">Based on features &amp; benefits for the price</div>
            </div>
            <div class="cre-t-164-dropdown-content cre-t-164-dropdown-content3">
              <div class="cre-t-164-dropdown-info1">
                <div class="cre-t-164-dropdown-info1-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M0 14V1.4C0 1.015 0.137083 0.685417 0.41125 0.41125C0.685417 0.137083 1.015 0 1.4 0H12.6C12.985 0 13.3146 0.137083 13.5887 0.41125C13.8629 0.685417 14 1.015 14 1.4V9.8C14 10.185 13.8629 10.5146 13.5887 10.7887C13.3146 11.0629 12.985 11.2 12.6 11.2H2.8L0 14ZM4.9525 8.575L7 7.3325L9.0475 8.575L8.505 6.2475L10.325 4.6725L7.9275 4.48L7 2.275L6.0725 4.48L3.675 4.6725L5.495 6.2475L4.9525 8.575Z" fill="#5AACF5"></path>
                  </svg>
                </div>
                <div class="cre-t-164-dropdown-info1-text">Reviews</div>
              </div>
              <div class="cre-t-164-dropdown-info2">
                <div class="cre-t-164-dropdown-info2-bar"><div class="cre-t-164-dropdown-bar" style="width:${data.reviewsPercentage}"></div></div>
                <div class="cre-t-164-dropdown-info2-score">${data.reviews}</div>
              </div>
              <div class="cre-t-164-dropdown-info3">Based on third-party ratings like Trustpilot</div>
            </div>
          </div>
          <div class="cre-t-164-dropdown-bottom">For more details see our <span class="cre-t-164-dropdown-bottom-link">ranking methodology</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
    }

    function updateRatingWidget(container, data) {
      if (!container || !data) return;

      if (container.getAttribute("data-unique") !== data.dataLabel) {
        container.setAttribute("data-unique", data.dataLabel);
      }

      var totalEl = container.querySelector(".cre-t-164-total");
      if (totalEl && totalEl.textContent !== data.total) {
        totalEl.textContent = data.total;
      }

      container.querySelectorAll(".cre-t-164-classification").forEach(function (el) {
        if (el.textContent !== data.classification) el.textContent = data.classification;
      });

      var blocks = [
        { selector: ".cre-t-164-dropdown-content1", score: data.popularity, pct: data.popularityPercentage },
        { selector: ".cre-t-164-dropdown-content2", score: data.valueForMoney, pct: data.valueForMoneyPercentage },
        { selector: ".cre-t-164-dropdown-content3", score: data.reviews, pct: data.reviewsPercentage }
      ];

      blocks.forEach(function (block) {
        var blockEl = container.querySelector(block.selector);
        if (!blockEl) return;

        var scoreEl = blockEl.querySelector(".cre-t-164-dropdown-info2-score");
        if (scoreEl && scoreEl.textContent !== block.score) scoreEl.textContent = block.score;

        var barEl = blockEl.querySelector(".cre-t-164-dropdown-bar");
        if (barEl && barEl.style.width !== block.pct) barEl.style.width = block.pct;
      });
    }

    function insertRatingWidget(cardWrapper, data) {
      if (!cardWrapper || !data) return;
      var existing = cardWrapper.querySelector(".cre-t-164-container");
      if (existing) {
        updateRatingWidget(existing, data);
        return;
      }

      var nativeContainer = cardWrapper.querySelector(".cre-t-135-container");
      if (!nativeContainer) {
        const controlContainer = cardWrapper.querySelector('.plan-col-1 > .oxy-dynamic-list:first-child > div');
        if (controlContainer) controlContainer.insertAdjacentHTML("beforeend", getRatingWidgetHtml(data));
      } else {
        insertAfter(nativeContainer, getRatingWidgetHtml(data));
      }
    }

    function applyRatingWidgets() {
      partnerRatingData.forEach(function (data) {
        var cardWrapper = document.querySelector(
          '.plan-repeater[data-unique="comparison-table"] > [data-unique="' + data.dataLabel + '"]'
        );

        insertRatingWidget(cardWrapper, data);

        const bestOverallCard = document.querySelector(
          '.plan-repeater[data-unique="comparison-table"] > [data-unique="' + data.dataLabel + '"]:has(.best-overall-text)'
        );

        if (bestOverallCard) {
          insertRatingWidget(bestOverallCard, data);
        }

      });


    }

    function creScrollToMethodology(selector) {
      var target = document.querySelector(selector);
      if (!target) return;
      var scrollTop = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: scrollTop, behavior: "smooth" });
    }

    function closeAllRatingDropdowns() {
      document.querySelectorAll(".cre-t-164-container").forEach(function (item) {
        item.classList.remove("cre-t-164-dropdown-active");
      });
    }

    function bindRatingWidgetEvents() {
      if (window.cre_164_rating_events_bound) return;
      window.cre_164_rating_events_bound = true;

      live(".cre-t-164-dropdown-bottom span", "click", function () {
        creScrollToMethodology("#content-section");
        closeAllRatingDropdowns();
      });

      live(".cre-t-164-review-top", "click", function () {
        if (window.innerWidth >= 992) return;
        var parent = this.closest(".cre-t-164-container");
        if (!parent) return;
        if (parent.classList.contains("cre-t-164-dropdown-active")) {
          parent.classList.remove("cre-t-164-dropdown-active");
        } else {
          closeAllRatingDropdowns();
          parent.classList.add("cre-t-164-dropdown-active");
        }
      });

      live(".cre-t-164-cross", "click", function () {
        closeAllRatingDropdowns();
      });

      live("body", "click", function (e) {
        if (window.innerWidth >= 992) return;
        if (e.target.closest(".cre-t-164-review-top")) return;
        if (e.target.closest(".cre-t-164-cross")) return;
        if (e.target.closest(".cre-t-164-container")) return;
        closeAllRatingDropdowns();
      });
    }


    function getBestOverallCard() {
      return document.querySelector(
        '.plan-repeater[data-unique="comparison-table"] > [data-unique^="outbound-partner-clicks-"]:has(.best-overall-bubble)'
      );
    }

    function getPartnerCard(partnerSlug) {
      return document.querySelector(
        '.plan-repeater[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-' + partnerSlug + '-Listing-Only"]:not(:has(.best-overall-bubble))'
      );
    }

    function syncBestOverall() {
      var rankOne = partnerRatingData[0];
      if (!rankOne) return;
      var rankOneSlug = rankOne.dataLabel.replace("outbound-partner-clicks-", "").replace("-Listing-Only", "");

      var bestOverallCard = getBestOverallCard();
      if (!bestOverallCard) return;

      var sourceCard = getPartnerCard(rankOneSlug);
      if (!sourceCard) return;

      var col1 = bestOverallCard.querySelector(".plan-col-1");
      var col2 = bestOverallCard.querySelector(".plan-col-2");
      var sourceCol1 = sourceCard.querySelector(".plan-col-1");
      var sourceCol2 = sourceCard.querySelector(".plan-col-2");
      var ratingBar = bestOverallCard.querySelector(".rating-bar");

      if (bestOverallCard.getAttribute("data-unique") !== rankOne.dataLabel) {
        bestOverallCard.setAttribute("data-unique", rankOne.dataLabel);
      }
      if (col1 && sourceCol1 && col1.innerHTML !== sourceCol1.innerHTML) col1.innerHTML = sourceCol1.innerHTML;
      if (col2 && sourceCol2 && col2.innerHTML !== sourceCol2.innerHTML) col2.innerHTML = sourceCol2.innerHTML;

      if (rankOneSlug === "Lemonade") {
        if (ratingBar) ratingBar.classList.remove("cre-t-164-hide-rating-bar");
      } else {
        if (ratingBar) ratingBar.classList.add("cre-t-164-hide-rating-bar");
      }

      insertRatingWidget(bestOverallCard, rankOne);
    }





    function copyAttribute(fromEl, toEl, attr) {
      if (!fromEl || !toEl) return;
      var value = attr === "text" ? fromEl.textContent : fromEl.getAttribute(attr);
      if (value === null) return;
      if (attr === "text") toEl.textContent = value;
      else toEl.setAttribute(attr, value);
    }

    function syncExitModal(modalEl, targetSlug) {
      if (!modalEl) return;

      var logoImg = modalEl.querySelector(".exit-modal-inner img");
      var headlineStrong = modalEl.querySelector(".exit-modal-inner p.large strong");
      var ctaLink = modalEl.querySelector(".exit-modal-inner a.rt-aff-link");

      stashOriginal(logoImg, "src", "data-old-src");
      stashOriginal(headlineStrong, "text", "data-old-text");
      stashOriginal(ctaLink, "href", "data-old-href");
      stashOriginal(ctaLink, "text", "data-old-text");

      if (targetSlug && targetSlug !== "Lemonade") {
        var sourceCard = getPartnerCard(targetSlug);
        if (sourceCard) {
          copyAttribute(sourceCard.querySelector(".provider-logo"), logoImg, "src");
          copyAttribute(sourceCard.querySelector(".see-plans-button"), ctaLink, "href");
          if (headlineStrong) headlineStrong.textContent = targetSlug + " is the best overall option";
          if (ctaLink) ctaLink.textContent = "Visit " + targetSlug;
        }
      }

      document.body.classList.add("cre-t-164-exit-ready");
    }

    function initExitModal() {
      observeSelector(".exit-modal", function (modalEl) {
        syncExitModal(modalEl, getFirstVisiblePartnerSlug(), currentContextKey);
      });
    }

    function stashOriginal(el, attr, dataKey) {
      if (!el) return;
      if (el.hasAttribute(dataKey)) return;
      var current = attr === "text" ? el.textContent : el.getAttribute(attr);
      el.setAttribute(dataKey, current || "");
    }

    function getFirstVisiblePartnerSlug() {
      var cards = getSlotCards();
      if (!cards.length) return null;
      var firstCard = null;
      var firstTop = null;
      cards.forEach(function (card) {
        if (!card.offsetParent) return;
        var rect = card.getBoundingClientRect();
        if (firstTop === null || rect.top < firstTop) {
          firstTop = rect.top;
          firstCard = card;
        }
      });
      if (!firstCard) return null;
      var dataUnique = firstCard.getAttribute("data-unique") || "";
      return dataUnique.replace("outbound-partner-clicks-", "").replace("-Listing-Only", "");
    }



    function updateAppliedClass(revert) {
      if (revert) document.body.classList.remove(defaultClass);
      else document.body.classList.add(defaultClass);
    }


    function runCycle(revert) {
      lastKnownRevert = revert;
      updateAppliedClass(revert);

      var container = getContainer();
      if (!container) return;
      if (revert) {
        if (pendingNativeQuotes) {
          applyNativeOrderFromQuotes(container, pendingNativeQuotes);
        } else {
          restorePristineOrder(container);
        }
        var revertedSlots = getSlotCards();
        clearBelowTrupanionMarks(revertedSlots);
        updatePlanNumbers(revertedSlots);
        return;
      }

      injectToggleButton();
      updateOurToggleText();
      ensureNativeExpanded();

      var slots = getSlotCards();
      if (slots.length !== partnerRatingData.length) return;
      applyRankOrder(container);
      var reordered = getSlotCards();
      updatePlanNumbers(reordered);
      applyRatingWidgets();
      markBelowTrupanionCards(reordered);
      syncBestOverall();
    }

    function startRetryLoop(revert) {
      if (listenerInterval) clearInterval(listenerInterval);
      listenerInterval = setInterval(function () {
        runCycle(revert);
      }, 250);
      setTimeout(function () {
        if (listenerInterval) clearInterval(listenerInterval);
      }, 5000);
    }


    var latestRequestToken = 0;

    function interceptFetch() {
      if (window.cre_164_fetch_patched) return;
      window.cre_164_fetch_patched = true;

      var nativeFetch = window.fetch;
      window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        var promise = nativeFetch.apply(this, arguments);

        if (isQuotesEndpoint(url)) {
          var params = parseParamsFromUrl(url);
          var revert = shouldRevert(params);
          var key = paramsKey(params);
          var myToken = ++latestRequestToken;

          if (key !== currentContextKey) {
            currentContextKey = key;
            document.body.classList.add("cre-t-164-collapsed");
          }

          promise.then(function (response) {
            if (revert && response && typeof response.clone === "function") {
              response.clone().json()
                .then(function (json) {
                  if (myToken !== latestRequestToken) return;
                  pendingNativeQuotes = json;
                })
                .catch(function () {
                  if (myToken === latestRequestToken) pendingNativeQuotes = null;
                })
                .then(function () {
                  if (myToken === latestRequestToken) startRetryLoop(revert);
                });
            } else {
              if (myToken === latestRequestToken) {
                pendingNativeQuotes = null;
                startRetryLoop(revert);
              }
            }
          }).catch(function () {
            // network failure -- leave whatever's currently on screen alone
          });
        }

        return promise;
      };
    }

    function updatePlanNumbers(slots) {
      slots.forEach(function (card, index) {
        var numberEl = card.querySelector(".plan-number");
        if (!numberEl) return;
        var rank = String(index + 1);
        if (numberEl.textContent.trim() !== rank) {
          numberEl.textContent = rank;
        }
      });
    }



    function init() {
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);
      document.body.classList.add("cre-t-164-collapsed");

      var container = getContainer();
      if (container) {
        pristineChildOrder = Array.prototype.slice.call(container.children);
      }

      bindRatingWidgetEvents();
      initExitModal();
      interceptFetch();

      live(".cre-t-164-toggle", "click", handleToggleClick);

      var initialParams = getUrlParamsFromLocation();
      currentContextKey = paramsKey(initialParams);
      startRetryLoop(shouldRevert(initialParams));
    }

    waitForElement('.plan-repeater[data-unique="comparison-table"]', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();