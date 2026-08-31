(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-05";

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
          elements.forEach((el) => processElement(el));
        }
      };

      const debouncedLookForSelector = debounce(() => {
        lookForSelector();
      }, 300);

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

    function addElement() {
      waitForElement(".cre-t-05-price-1", function () {
        var html1 = `<div class="cre-t-05-add-sub">
  <div class="cre-t-05-add-sub-content">We'll get to work on your greenhouse right away and ship it when it's ready (usually 2-6 weeks). Free shipping to UK mainland.</div>
  <div class="cre-t-05-add-sub-content-uk">Free shipping to UK mainland.</div>
</div>
`;

        const optionText = document.querySelector(".cre-t-05-price-1 .template__cart__deposit-opt-out__option__text");

        if (optionText) {
          const heading = optionText.querySelector("h4");

          if (heading) {
            if (!optionText.querySelector(".cre-t-05-header-content")) {
              heading.insertAdjacentHTML("beforebegin", "<div class='cre-t-05-header-content'>Order Now</div>");
            }
          }

          if (!optionText.querySelector(".cre-t-05-add-sub")) {
            optionText.insertAdjacentHTML("beforeend", html1);
          }
        }
      });

      waitForElement(".cre-t-05-price-2", function () {
        var html2 = `<div class="cre-t-05-add-sub">
  <div class="cre-t-05-add-sub-content">Pay a 10% deposit and we'll reserve your greenhouse at this price for up to 6 months, regardless of any future price increases.</div>
  <div class="cre-t-05-add-sub-content-final">Final balance is due 2 weeks before delivery.</div>
</div>
`;

        const optionText = document.querySelector(".cre-t-05-price-2 .template__cart__deposit-opt-out__option__text");

        if (optionText) {
          const heading = optionText.querySelector("h4");

          if (heading) {
            if (!optionText.querySelector(".cre-t-05-header-content")) {
              heading.insertAdjacentHTML("beforebegin", "<div class='cre-t-05-header-content'>Reserve for Later</div>");
            }
          }

          if (!optionText.querySelector(".cre-t-05-add-sub")) {
            optionText.insertAdjacentHTML("beforeend", html2);
          }
        }
      });
    }

    /* Initialize variation */
    function init() {
      // Add the variation class to the body
      document.body.classList.add(variation_name);
      addElement();
      document.querySelectorAll(".template__cart__deposit-opt-out__option__text").forEach((text, index) => {
        const option = text.closest(".template__cart__deposit-opt-out__option");

        option?.classList.add(`cre-t-05-price-${index + 1}`);
      });
    }

    if (!window.cre_05_init) {
      window.cre_05_init = true;
      observeSelector(`.template__cart__deposit-opt-out__option button`, (el) => {
        setTimeout(() => {
          el.closest(".template__cart__deposit-opt-out").classList.add("cre-t-05-order-now");
        }, 300);

        init();
      });
    }
    /* Wait for element to load and initialize */
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();