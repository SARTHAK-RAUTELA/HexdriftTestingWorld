(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = 'SWF173';
    var CTA_SELECTOR = '.plan-repeater .plan-box .plan-button-container .see-plans-button[data-unique="outbound-partner-see-plans-button"]';

    /* URL targeting */
    var targetPaths = ['/', '/home/', '/comparison/', '/compare/', '/cat-insurance/', '/canada/'];
    var host = window.location.hostname.replace(/^www\./, '');
    var path = window.location.pathname.replace(/\/?$/, '/'); // normalise trailing slash
    if (host !== 'petinsurancegurus.com' || targetPaths.indexOf(path) === -1) {
      if (debug) console.log(variation_name + ': URL not targeted, skipping', window.location.href);
      return;
    }

    /* helpers */
    var debounce = function (func, delay) {
      var timeout;
      return function () {
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          func.apply(null, args);
        }, delay || 300);
      };
    };

    function observeSelector(selector, callback, options) {
      options = options || {};
      var documentRef = options.document || window.document;
      var processed = new Map();
      var observer;
      var isDone = false;

      var done = function () {
        if (observer) observer.disconnect();
        processed.clear();
        isDone = true;
      };

      var processElement = function (el) {
        if (!processed.has(el)) {
          processed.set(el, true);
          callback(el);
          if (options.once) done();
        }
      };

      var lookForSelector = function () {
        documentRef.documentElement.querySelectorAll(selector).forEach(processElement);
      };

      var debouncedLookForSelector = debounce(lookForSelector, options.debounceDelay || 100);

      lookForSelector();

      if (!isDone) {
        observer = new MutationObserver(function () {
          debouncedLookForSelector();
        });
        observer.observe(documentRef, { attributes: true, childList: true, subtree: true });
      }

      return done;
    }

    function getPlanCost(planBox) {
      var priceEl = planBox.querySelector('.plan-detail-column .cre-t-143-discounted-price') || planBox.querySelector('.plan-detail-column .plan-detail-content');
      if (!priceEl) return null;
      var text = priceEl.textContent.replace(/\s+/g, '').trim();
      var match = text.match(/^(\$[\d,.]+)(\/mo)?/i);
      if (!match) return null;
      return { amount: match[1], suffix: match[2] ? '/mo' : '' };
    }

    function priceHtml(price) {
      return (
        '<div class="' +
        variation_name +
        '-price">' +
        '<span class="' +
        variation_name +
        '-label">Average Plan Cost</span>' +
        '<span class="' +
        variation_name +
        '-amount">' +
        price.amount +
        (price.suffix ? '<span class="' + variation_name + '-mo">' + price.suffix + '</span>' : '') +
        '</span>' +
        '</div>'
      );
    }

    /* Variation logic */
    function addPriceToCard(cta) {
      var planBox = cta.closest('.plan-box');
      if (!planBox || planBox.querySelector('.' + variation_name + '-price')) return;

      var price = getPlanCost(planBox);
      if (!price) {
        if (debug) console.log(variation_name + ': skipped card (price missing)', planBox);
        return;
      }

      cta.insertAdjacentHTML('beforebegin', priceHtml(price));
    }

    /* Variation Init */
    function init(ctaEl) {
      if (!document.body.classList.contains(variation_name)) {
        document.body.classList.add(variation_name);
      }
      addPriceToCard(ctaEl);
      if (debug) console.log(variation_name + ' processed card', ctaEl);
    }

    if (!window.observeSelectorAddedSWF173) {
      window.observeSelectorAddedSWF173 = true;
      setTimeout(function () {
        var stopObserver = observeSelector(CTA_SELECTOR, init);
        // disconnect after 15s
        setTimeout(function () {
          stopObserver();
          if (debug) console.log(variation_name + ': observer disconnected after 15 seconds');
        }, 15000);
      }, 2000);
    }
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();