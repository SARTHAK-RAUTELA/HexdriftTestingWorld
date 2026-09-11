(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-143";
    var discountPercent = 0.135;
    var priceSelector = '[data-unique="comparison-table"] .plan-detail-content .ct-span:not(.cre-t-143-discounted-price)';
    var quotesEndpoint = "insurance-finder/v1/quotes";
    var optionsEndpoint = "insurance-finder/v1/options";
    var discountByProvider = {};

    /**
     * Polls the DOM until a specific element exists
     * @param {string} selector - CSS selector to watch for
     * @param {Function} trigger - Callback function to run when element is found
     * @param {number} delayInterval - Polling frequency in ms (default: 50)
     * @param {number} delayTimeout - Stop checking after this many ms (default: 15000)
     *
     * Usage Example:
     * waitForElement('.success-message', function() {
     * console.log('Element found! Running logic...');
     * });
     */
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

    function debounce(func, delay = 100) {
      if (typeof func !== "function") return function () {};
      var timeout;

      return function () {
        var context = this;
        var args = arguments;

        clearTimeout(timeout);
        timeout = setTimeout(function () {
          func.apply(context, args);
        }, delay);
      };
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

    function removeClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (element.classList) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp("\\b" + className + "\\b", "g"), "");
      }
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

    function getPriceValue(text) {
      var match = text.trim().match(/^\$(\d+(?:\.\d+)?)\/mo$/);
      if (!match) return null;
      return parseFloat(match[1]);
    }

    function formatPriceValue(value) {
      return "$" + value.toFixed(2) + "/mo";
    }

    function getRequestUrl(resource) {
      if (typeof resource === "string") return resource;
      if (resource && typeof resource.url === "string") return resource.url;
      return "";
    }

    function isBreedSelectedInUrl() {
      var params = new URLSearchParams(window.location.search);
      var breedParam = params.get("breed");

      if (breedParam === null) return false;
      if (breedParam.trim() === "") return false;
      return true;
    }

    function isBreedSelectedInResponseData(data) {
      if (!data) return false;
      if (typeof data.breed !== "string") return false;
      if (data.breed.trim() === "") return false;
      return true;
    }

    function getProviderNameForElement(element) {
      var planBox = element.closest(".plan-box");
      if (!planBox) return null;

      var logo = planBox.querySelector(".provider-logo");
      if (!logo) return null;

      var altText = logo.getAttribute("alt");
      if (!altText) return null;

      return altText.replace(/\s*Logo\s*$/i, "").trim();
    }

    function clearDiscountMap() {
      discountByProvider = {};
    }

    function updateDiscountMapFromQuoteList(quotes) {
      if (!quotes) return;

      quotes.forEach(function (quote) {
        if (!quote.providerName) return;

        var priceValue = getPriceValue(quote.standardPlanCost);
        if (priceValue === null) return;

        var discountedValue = priceValue * (1 - discountPercent);
        discountByProvider[quote.providerName] = formatPriceValue(discountedValue);
      });
    }

    function handleQuotesResponse(response) {
      var clonedResponse = response.clone();

      clonedResponse
        .json()
        .then(function (data) {
          if (isBreedSelectedInResponseData(data)) {
            clearDiscountMap();
          } else {
            updateDiscountMapFromQuoteList(data.quotes);
          }
          syncAllPriceElements();
        })
        .catch(function () {});
    }

    function handleOptionsResponse(response) {
      var clonedResponse = response.clone();

      clonedResponse
        .json()
        .then(function (data) {
          if (isBreedSelectedInUrl()) {
            clearDiscountMap();
          } else if (data.options) {
            updateDiscountMapFromQuoteList(data.options.initialQuotes);
          }
          syncAllPriceElements();
        })
        .catch(function () {});
    }

    function patchFetchForPriceDiscount() {
      if (window.cre_t_143_fetchPatched) return;
      window.cre_t_143_fetchPatched = true;

      var originalFetch = window.fetch;

      window.fetch = function () {
        var requestArgs = arguments;
        var requestUrl = getRequestUrl(requestArgs[0]);
        var fetchPromise = originalFetch.apply(window, requestArgs);

        fetchPromise.then(function (response) {
          if (requestUrl.indexOf(quotesEndpoint) > -1) handleQuotesResponse(response);
          if (requestUrl.indexOf(optionsEndpoint) > -1) handleOptionsResponse(response);
        });

        return fetchPromise;
      };
    }

    function computeFallbackDiscountedText(priceValue) {
      if (isBreedSelectedInUrl()) return null;

      var discountedValue = priceValue * (1 - discountPercent);
      return formatPriceValue(discountedValue);
    }

    function syncPriceElement(element) {
      var priceValue = getPriceValue(element.textContent);
      if (priceValue === null) return;

      var parent = element.parentElement;
      if (!parent) return;

      var providerName = getProviderNameForElement(element);
      var discountedText = null;
      if (providerName) discountedText = discountByProvider[providerName];
      if (!discountedText) discountedText = computeFallbackDiscountedText(priceValue);

      var discountedElement = parent.querySelector(".cre-t-143-discounted-price");

      if (!discountedText) {
        if (discountedElement) discountedElement.remove();
        removeClass(element, "cre-t-143-price-original-hidden");
        return;
      }

      if (discountedElement && discountedElement.textContent === discountedText) return;

      if (discountedElement) {
        discountedElement.textContent = discountedText;
      } else {
        var discountedHTML = `<span class="ct-span cre-t-143-discounted-price">${discountedText}</span>`;
        insertAfter(element, discountedHTML);
      }

      addClass(element, "cre-t-143-price-original-hidden");
    }

    function syncAllPriceElements() {
      var priceElements = document.querySelectorAll(priceSelector);
      priceElements.forEach(function (element) {
        syncPriceElement(element);
      });
    }

    function startPriceDomObserver() {
      var debouncedSync = debounce(syncAllPriceElements, 100);
      var priceObserver = new MutationObserver(function () {
        debouncedSync();
      });

      priceObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    function init() {
      if (window.cre_t_143_priceObserverStarted) return;
      window.cre_t_143_priceObserverStarted = true;

      patchFetchForPriceDiscount();
      syncAllPriceElements();
      startPriceDomObserver();
    }

    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();