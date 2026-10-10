(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = 'lotus-22';

    /* all Pure helper functions */

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

    /* Variation functions */
    const TIME_RE = /\d{1,2}:\d{2}\s?(AM|PM)/i;
    const LIST_SELECTOR = '[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto';

    function scrollToSelected(list) {
      // Only act on the time dropdown (options look like "12:00 PM")
      const firstText = list.querySelector('button span')?.textContent || '';
      if (!TIME_RE.test(firstText)) return;

      const selected = Array.from(list.querySelectorAll('button')).find((btn) => btn.classList.contains('bg-accent'));
      if (!selected) return;

      // Center the selected option inside the list without scrolling the page
      const listRect = list.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      const offset = itemRect.top - listRect.top + list.scrollTop;
      list.scrollTop = offset - list.clientHeight / 2 + selected.offsetHeight / 2;
    }

    /* Initialise variation */
    observeSelector(LIST_SELECTOR, (list) => {
      requestAnimationFrame(() => scrollToSelected(list));
    });
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();