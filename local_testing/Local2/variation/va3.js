(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = 'lotus-22';

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

    // Prevent double execution if the script is injected twice
    if (window.__lotus22Loaded) return;
    window.__lotus22Loaded = true;

    /* config */
    const TIME_RE = /\d{1,2}:\d{2}\s?(AM|PM)/i;
    const LIST_SELECTOR = '[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto';
    const LABEL_ATTR = 'data-lotus22-label';

    // 12:00 AM = Midnight, 12:00 PM = Noon
    const LABELS = {
      '12:00 AM': 'Midnight',
      '12:00 PM': 'Noon',
    };
    const LABEL_VALUES = Object.values(LABELS);

    /* all Pure helper functions */

    function log(e) {
      if (debug) console.log(e, 'error in Test ' + variation_name);
    }

    // Wrap callbacks so errors inside observers / rAF are still logged
    function safe(fn) {
      return function (...args) {
        try {
          return fn.apply(this, args);
        } catch (e) {
          log(e);
        }
      };
    }

    function normalizeTime(text) {
      return text.trim().toUpperCase().replace(/\s+/g, ' ');
    }

    function isVisible(el) {
      return el.isConnected && el.getClientRects().length > 0;
    }

    /* Variation functions */

    // Swap "12:00 AM" / "12:00 PM" for "Midnight" / "Noon".
    // Edits the existing text node's nodeValue (instead of textContent) so React
    // keeps its reference to the node and can still update it later.
    function relabelSpan(span) {
      if (span.childElementCount > 0) return;
      const node = span.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || span.childNodes.length !== 1) return;

      const text = normalizeTime(node.nodeValue);
      const label = LABELS[text];

      if (label) {
        // React wrote a 12:00 time -> replace it with the label
        node.nodeValue = label;
        span.setAttribute(LABEL_ATTR, text); // keep the original time for reference
      } else if (span.hasAttribute(LABEL_ATTR) && !LABEL_VALUES.includes(node.nodeValue.trim())) {
        // React changed the time to something else -> remove the marker
        span.removeAttribute(LABEL_ATTR);
      }
    }

    // Covers both the dropdown options and the pick-up / drop-off fields.
    // Only spans whose full text is exactly "12:00 AM" / "12:00 PM" are relabelled.
    function relabelAll() {
      document.querySelectorAll('button span').forEach(relabelSpan);
    }

    function isTimeList(list) {
      return Array.from(list.querySelectorAll('button span')).some((span) => TIME_RE.test(span.textContent));
    }

    // Lists currently open and already scrolled (WeakSet = no memory leak)
    const scrolledLists = new WeakSet();

    function scrollToSelected(list) {
      if (!isVisible(list)) {
        // Closed/hidden -> allow scrolling again next time it opens
        scrolledLists.delete(list);
        return;
      }
      if (scrolledLists.has(list)) return;

      const selected = Array.from(list.querySelectorAll('button')).find((btn) => btn.classList.contains('bg-accent'));
      if (!selected) return;

      // Center the selected option inside the list without scrolling the page
      const listRect = list.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      const offset = itemRect.top - listRect.top + list.scrollTop;
      list.scrollTop = offset - list.clientHeight / 2 + selected.offsetHeight / 2;

      scrolledLists.add(list);
    }

    function run() {
      relabelAll();

      document.querySelectorAll(LIST_SELECTOR).forEach((list) => {
        if (!isTimeList(list)) return;
        scrollToSelected(list);
      });
    }

    // Run at most once per frame, always before paint -> no flash
    let scheduled = false;
    const safeRun = safe(() => {
      scheduled = false;
      run();
    });

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(safeRun);
    }

    /* Initialise variation */
    function init() {
      run();

      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true, // selected time text changes in the fields
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'data-state'], // dropdown shown/hidden without remounting
      });
    }

    // Start after load so we never interfere with React hydration
    waitForElement('body', function () {
      safe(init)();
    });
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();