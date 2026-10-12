(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-20";

    let shuttleLink = `
      <div class="cre-t-20-Shuttle-details" style="display:none">
       <div class="cre-t-20-Shuttle-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3.875 18.125C3.29167 17.5417 3 16.8333 3 16C2.45 16 1.97933 15.8043 1.588 15.413C1.19667 15.0217 1.00067 14.5507 1 14V7C1 6.45 1.196 5.97933 1.588 5.588C1.98 5.19667 2.45067 5.00067 3 5H16.175C16.4417 5 16.696 5.05 16.938 5.15C17.18 5.25 17.3923 5.39167 17.575 5.575L22.425 10.425C22.6083 10.6083 22.75 10.821 22.85 11.063C22.95 11.305 23 11.559 23 11.825V14C23 14.55 22.8043 15.021 22.413 15.413C22.0217 15.805 21.5507 16.0007 21 16C21 16.8333 20.7083 17.5417 20.125 18.125C19.5417 18.7083 18.8333 19 18 19C17.1667 19 16.4583 18.7083 15.875 18.125C15.2917 17.5417 15 16.8333 15 16H9C9 16.8333 8.70833 17.5417 8.125 18.125C7.54167 18.7083 6.83333 19 6 19C5.16667 19 4.45833 18.7083 3.875 18.125ZM15 10H19L16 7H15V10ZM9 10H13V7H9V10ZM3 10H7V7H3V10ZM6.888 16.888C7.12933 16.646 7.25 16.35 7.25 16C7.25 15.65 7.129 15.354 6.887 15.112C6.645 14.87 6.34933 14.7493 6 14.75C5.65067 14.7507 5.35467 14.8717 5.112 15.113C4.86933 15.3543 4.74867 15.65 4.75 16C4.75133 16.35 4.87233 16.646 5.113 16.888C5.35367 17.13 5.64933 17.2507 6 17.25C6.35067 17.2493 6.64667 17.1283 6.888 16.887M18.888 16.887C19.1293 16.6457 19.25 16.35 19.25 16C19.25 15.65 19.129 15.354 18.887 15.112C18.645 14.87 18.3493 14.7493 18 14.75C17.6507 14.7507 17.3547 14.8717 17.112 15.113C16.8693 15.3543 16.7487 15.65 16.75 16C16.7513 16.35 16.8723 16.646 17.113 16.888C17.3537 17.13 17.6493 17.2507 18 17.25C18.3507 17.2493 18.6467 17.1283 18.888 16.887Z" fill="#18181B" />
          </svg>
        </div>
        <span class="cre-t-20-Shuttle-text">Free, fast shuttle</span>
      </div>
    `;

    let shuttleModalHTML = `
      <div class="cre-t-20-popup-modal" id="cre-t-20-popup__modal" style="display:none">
        <!-- overlay -->
        <!-- <div class="cre-t-20-overlay" role="presentation"></div> -->
        <section class="cre-t-20-modal" role="dialog" aria-modal="true" aria-labelledby="cre-t-20-modal-title">
          <button class="cre-t-20-close" type="button" aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 13.4L7.10005 18.3C6.91672 18.4833 6.68338 18.575 6.40005 18.575C6.11672 18.575 5.88338 18.4833 5.70005 18.3C5.51672 18.1167 5.42505 17.8833 5.42505 17.6C5.42505 17.3167 5.51672 17.0833 5.70005 16.9L10.6 12L5.70005 7.1C5.51672 6.91667 5.42505 6.68334 5.42505 6.4C5.42505 6.11667 5.51672 5.88334 5.70005 5.7C5.88338 5.51667 6.11672 5.425 6.40005 5.425C6.68338 5.425 6.91672 5.51667 7.10005 5.7L12 10.6L16.9 5.7C17.0834 5.51667 17.3167 5.425 17.6 5.425C17.8834 5.425 18.1167 5.51667 18.3 5.7C18.4834 5.88334 18.575 6.11667 18.575 6.4C18.575 6.68334 18.4834 6.91667 18.3 7.1L13.4 12L18.3 16.9C18.4834 17.0833 18.575 17.3167 18.575 17.6C18.575 17.8833 18.4834 18.1167 18.3 18.3C18.1167 18.4833 17.8834 18.575 17.6 18.575C17.3167 18.575 17.0834 18.4833 16.9 18.3L12 13.4Z" fill="black" />
            </svg>
          </button>

          <div class="cre-t-20-modal-wrapper">
            <h2 class="cre-t-20-title">Local prices, a short ride away</h2>
            <ul class="cre-t-20-list">
              <li class="cre-t-20-item">Iceland's local car rental companies are based in the rental zone just outside the airport, not in the terminal.</li>
              <li class="cre-t-20-item">It's how we keep prices lower than the international chains.</li>
              <li class="cre-t-20-item">The free shuttle gets you to our door in just five minutes.</li>
            </ul>
            <div class="cre-t-20-button">
              <span class="cre-t-20-button-text">OK, Got It</span>
            </div>
          </div>
        </section>
      </div>
    `;

    function live(selector, event, callback, context = document) {
      const addEvent = (el, type, handler) => {
        el.addEventListener(type, handler);
      };

      const liveHandler = (e) => {
        const el = e.target && e.target.closest ? e.target.closest(selector) : null;

        if (el && el !== context) {
          callback.call(el, e);
        }
      };

      addEvent(context, event, liveHandler);
    }

    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger(document.querySelector(selector));
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
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

    // Add shuttle modal---
    function addShuttleModal() {
      if (document.getElementById("cre-t-20-popup__modal")) return;
      document.body.insertAdjacentHTML("beforeend", shuttleModalHTML);
    }

    // Eventhandler----
    function eventHandler() {
      // Click on shuttle link----
      live(".cre-t-20-Shuttle-details", "click", function (e) {
        e.preventDefault();
        document.querySelector("body").classList.add("cre-t-20-showShuttleModal");
      });

      // click on close icon on modal----
      live(".cre-t-20-close", "click", function (e) {
        e.preventDefault();
        document.querySelector("body.cre-t-20-showShuttleModal")?.classList.remove("cre-t-20-showShuttleModal");
      });

      // click on button on modal----
      live(".cre-t-20-button", "click", function (e) {
        document.querySelector("body.cre-t-20-showShuttleModal")?.classList.remove("cre-t-20-showShuttleModal");
      });

      // click outside modal closes it----
      document.body.addEventListener("click", function (e) {
        const body = document.querySelector("body.cre-t-20-showShuttleModal");
        if (body && !e.target.closest(".cre-t-20-modal")) {
          body.classList.remove("cre-t-20-showShuttleModal");
        }
      });
    }

    function init() {
      if (!document.querySelector("body").classList.contains(variation_name)) {
        document.querySelector("body").classList.add(variation_name);

        observeSelector('[data-slice-type="fleet_category"] [id*="car"]>div:nth-child(3)', function () {
          let targetElements = document.querySelectorAll('[data-slice-type="fleet_category"] [id*="car"]>div:nth-child(3)');
          targetElements.forEach(function (targetElement) {
            if (!targetElement.querySelector(".cre-t-20-Shuttle-details")) {
              targetElement.insertAdjacentHTML("beforeend", shuttleLink);
            }
          });
        });

        addShuttleModal();

        eventHandler();
      }
    }

    /* Initialize variation */
    waitForElement("html[lang='en-us'] body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();