(function () {
  var variation_name = "cre-t-151";
  var debug = 1;
  try {
    /* VARIATION 2 - identical to vB.js except DEFAULT_SORT_MODE; keep the two files in step.
       Sort field UI + "Lowest Price" ordering + the pinned card mirroring whichever listing is #1. */

    /* ---- config (edit these selectors if the markup changes) ---- */
    var SECTION_SELECTOR = "#comparison-section";
    var FILTERS_ROW_SELECTOR = ".filter-options"; // pet-type tabs + breed + zip row
    var FILTERS_FIELDS_SELECTOR = ".filter-options .additional-filters"; // breed + zip group; sort field goes here
    // Matches both "Showing prices for {breed}..." and "Showing prices in {zip}".
    var SITE_COPY_PREFIX = "showing prices";
    var SITE_COPY_CLASS = "search-details"; // the site's own class for that line - borrowed when standalone
    var ZIP_INPUT_SELECTOR = ".zip-textinput input";
    var ZIP_SHORT_PLACEHOLDER = "ZIP code"; // shortened on mobile so 3 fields fit one row
    var ZIP_SHORT_MAX_WIDTH = 767;
    var FIELD_HEIGHT_REF_SELECTOR = ".zip-textinput .MuiInputBase-root, .breed-select .MuiInputBase-root";
    var DEFAULT_SORT_MODE = "lowest-price"; // V2 loads already in the Lowest Price state
    var LABELS = { "best-rated": "Best Rated", "lowest-price": "Lowest Price" };
    var COPY_LABELS = { "best-rated": "best rated", "lowest-price": "lowest price" };

    /* ---- ordering config ---- */
    var REPEATER_SELECTOR = ".plan-repeater";
    var LISTING_ITEM_SELECTOR = '[data-unique$="-Listing-Only"]'; // each provider block
    var BEST_OVERALL_MARKER = ".best-overall-bubble"; // marks the pinned card, which is never re-ordered
    var BEST_OVERALL_TEXT_SELECTOR = ".best-overall-text"; // the label inside that pinned card's bubble
    var BEST_OVERALL_DEFAULT_LABEL = "Best Overall"; // what the site itself puts there
    var BEST_OVERALL_LOWEST_PRICE_LABEL = "Lowest Price"; // what it reads while Lowest Price is active
    var RANK_BUBBLE_SELECTOR = ".plan-number"; // the 1 / 2 / 3 ... bubble on each listing
    // Matching on aria-label catches both tooltip triggers on a card (the "?" beside Average Plan
    // Cost and the "i" beside the money-back guarantee) without depending on either structure.
    var POPOVER_TRIGGER_SELECTOR = 'button[aria-label="Open popover"]';
    var POPOVER_SLOT_CLASS = "cre-t-151-popover-slot"; // placeholder marking where a trigger belongs
    var PRICE_COLUMN_HEADING = "average plan cost"; // identifies the price column by its heading text
    // Two live 100%-traffic tests ADD a price span beside the control `.ct-span` rather than replace
    // it, so a <body> class decides which one shows. cre-t-111 wins if both are ever present.
    var PRICE_OVERRIDE_TESTS = [
      { bodyClass: "cre-t-111-toolTipContentChange", priceClass: "cre-t-111-price-update" },
      { bodyClass: "cre-t-116-toolTipContentChange", priceClass: "cre-t-116-price-update" },
    ];
    /* Copy hold: the site only rewrites "Showing prices for ..." at the end of its own transition,
       so our copy waits on its `loading` / `reload` markers, with SITE_BUSY_MAX_MS as the cap. */
    var SITE_BUSY_CLASSES = ["loading", "reload"];
    var COPY_BUSY_CLASS = "cre-t-151-copy-busy";
    var SITE_BUSY_MAX_MS = 3000;

    var SORT_FADE_CLASS = "cre-t-151-sorting"; // the opacity target
    var SORT_FADE_ENABLE_CLASS = "cre-t-151-fading"; // carries our duration + easing, briefly
    var SORT_FADE_MS = 700; // must equal the CSS duration - times the re-rank and the hand-back

    /* ---- state ---- */
    var currentMode = DEFAULT_SORT_MODE;
    var copyEl = null; // our "Sorted by ___" copy + "i" icon
    var originalZipPlaceholder = null;
    var refreshTimer = null;
    var resizeTimer = null;
    var fadeTimer = null; // pending re-rank at the end of the fade-out
    var fadeEndTimer = null; // pending hand-back of the transition once the fade-in has finished
    var copyFrame = null; // pending leading-edge copy re-attach (see scheduleCopySync)
    var busyObserver = null; // watches the site's loading/reload markers on the repeater
    var busyObserverTarget = null; // the repeater that observer is currently attached to
    var busyMaxTimer = null; // SITE_BUSY_MAX_MS safety cap
    var domObserver = null; // the MutationObserver instance
    var cachedSiteLine = null; // memoized result of findSiteCopyLine()
    var lastSiteLineText = null; // the site's own sentence text as of the last ensureCopy() pass
    var originalOrder = []; // the sortable listings in the site's own (native) order, i.e. DOM order
    var bestOverallCard = null; // the pinned card at the bottom of the list
    var lastClonedCol1Html = null; // markup the pinned card's clone currently mirrors - see syncBestOverallCard()
    var lastClonedCol2Html = null;
    var dataUniqueOverridden = false; // true once we have rewritten the pinned card's data-unique
    var isApplying = false; // true while WE are the ones mutating the DOM

    /* ---- pure helpers ---- */
    // Debounce - collapses a burst of calls into one, delayInterval ms after the last call.
    function debounce(fn, delayInterval) {
      var timeoutId;
      return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          fn.apply(context, args);
        }, delayInterval);
      };
    }
    // Fires `callback(el)` for each match now and on every DOM change (debounced 100ms) until done().
    // Observes the whole document, so it is only safe for a short-lived "wait until this appears".
    function observeSelector(selector, callback, options) {
      options = options || {};
      var doc = options.document || window.document;
      var processed = new Map();
      var obs;
      var isDone = false;
      var done = function () {
        if (obs) obs.disconnect();
        isDone = true;
      };
      var processElement = function (el) {
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
      var lookForSelector = function () {
        var elParent = doc.documentElement;
        if (elParent.matches(selector) || elParent.querySelector(selector)) {
          var elements = elParent.querySelectorAll(selector);
          elements.forEach(function (el) {
            processElement(el);
          });
        }
      };
      var debouncedLookForSelector = debounce(function () {
        processed.clear();
        lookForSelector();
      }, 100);
      lookForSelector();
      if (!isDone) {
        obs = new MutationObserver(function () {
          debouncedLookForSelector();
        });
        obs.observe(doc, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      return done;
    }
    // Event delegation - listen for events on dynamically added elements.
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
    // Writes only on a real change: textContent always rebuilds the text node, which the observer
    // would read as a mutation and re-trigger forever. This guard is what makes refresh() terminate.
    function setTextIfChanged(el, text) {
      if (el && el.textContent !== text) el.textContent = text;
    }
    // Attribute twin of setTextIfChanged - keeps us from rewriting an attribute with its own value.
    function setAttrIfChanged(el, name, value) {
      if (el && value && el.getAttribute(name) !== value) el.setAttribute(name, value);
    }
    // Smooth scroll that clears the overlay header. pageYOffset is required - getBoundingClientRect
    // is viewport-relative, so without it an already-scrolled page lands in the wrong place.
    function smoothScrollTo(el) {
      if (!el) return;
      var header = document.querySelector(".oxy-header-wrapper");
      var headerHeight = 0;
      if (header) {
        // Only reserve header space when it stays on screen - this one scrolls away, so subtracting
        // its height would overshoot.
        var position = window.getComputedStyle(header).position;
        if (position === "fixed" || position === "sticky") headerHeight = header.getBoundingClientRect().height;
      }
      var top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
    }
    // Finds the "Ranking Methodology" section by heading text, not a hardcoded selector - this site
    // uses <h3>, other Guru sites use <h2>.
    function findRankingMethodologyTarget() {
      var headings = document.querySelectorAll("h2, h3, h4");
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].textContent.trim().toLowerCase().indexOf("ranking methodology") !== -1) {
          return headings[i].closest("section") || headings[i];
        }
      }
      return null;
    }

    /* ---- price reading ---- */
    function isVisible(el) {
      if (!el) return false;
      var style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    }
    // The price the user can actually SEE. The <body> class is checked before the span, because the
    // control `.ct-span` stays readable underneath an override and would give the wrong number.
    function getDisplayedPriceText(contentEl) {
      for (var i = 0; i < PRICE_OVERRIDE_TESTS.length; i++) {
        if (!document.body.classList.contains(PRICE_OVERRIDE_TESTS[i].bodyClass)) continue;
        var override = contentEl.querySelector("." + PRICE_OVERRIDE_TESTS[i].priceClass);
        if (override && isVisible(override)) return override.textContent;
      }
      var control = contentEl.querySelector(".ct-span") || contentEl;
      return control.textContent;
    }
    // Pulls the number out of the "Average Plan Cost" column, e.g. "$23.44/mo" -> 23.44. Anything
    // unreadable returns Infinity so a broken card sorts to the bottom rather than to the top.
    function getPrice(item) {
      var columns = item.querySelectorAll(".plan-detail-column");
      for (var i = 0; i < columns.length; i++) {
        var heading = columns[i].querySelector(".plan-detail-heading");
        if (heading && heading.textContent.trim().toLowerCase().indexOf(PRICE_COLUMN_HEADING) !== -1) {
          var contentEl = columns[i].querySelector(".plan-detail-content");
          if (contentEl) {
            var match = getDisplayedPriceText(contentEl).replace(/,/g, "").match(/[\d.]+/);
            return match ? parseFloat(match[0]) : Infinity;
          }
        }
      }
      return Infinity;
    }

    /* ---- ordering ---- */
    // Direct children of the repeater only, so nested markup carrying the same data-unique value can
    // never be picked up twice.
    function getListingItems() {
      var repeater = document.querySelector(SECTION_SELECTOR + " " + REPEATER_SELECTOR);
      if (!repeater) return [];
      return Array.prototype.filter.call(repeater.children, function (el) {
        return el.matches && el.matches(LISTING_ITEM_SELECTOR);
      });
    }
    // Snapshots the site's native order. Stays truthful forever because ranking uses CSS `order` and
    // never moves nodes - moving them made later captures read our own sorted order back as native.
    function captureOrder(items) {
      cachedSiteLine = null; // stale after a fresh render - force findSiteCopyLine() to re-query
      bestOverallCard = null;
      originalOrder = items.filter(function (el) {
        if (el.querySelector(BEST_OVERALL_MARKER)) {
          bestOverallCard = el; // the pinned card - never re-ranked, mirrored instead
          return false;
        }
        return true;
      });
    }
    // Drops cloned ids so the page never ends up with two elements sharing one - the source card
    // keeps its own at its live position.
    function stripIds(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll("[id]"), function (el) {
        el.removeAttribute("id");
      });
    }
    /* Oxygen binds popover triggers once at load, so a cloned one is inert. We move the pinned
       card's two real triggers into the clone and back - listeners survive a DOM move. */
    function makeSlot() {
      var slot = document.createElement("span");
      slot.className = POPOVER_SLOT_CLASS;
      return slot;
    }
    // Freshly cloned markup: throw the inert copies away, leaving a slot where each one sat.
    function replaceTriggersWithSlots(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll(POPOVER_TRIGGER_SELECTOR), function (btn) {
        btn.parentNode.replaceChild(makeSlot(), btn);
      });
    }
    // The pinned card's own columns: park a permanent slot in front of each real trigger, so we
    // always know where to put it back. Idempotent - a second pass finds the slots already there.
    function ensureSlotsBeforeTriggers(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll(POPOVER_TRIGGER_SELECTOR), function (btn) {
        var prev = btn.previousElementSibling;
        if (prev && prev.classList.contains(POPOVER_SLOT_CLASS)) return;
        btn.parentNode.insertBefore(makeSlot(), btn);
      });
    }
    // Moves the live, bound triggers out of one column and into the other's waiting slots. Both
    // sides keep their slots, so this can be run in either direction, repeatedly.
    function movePopoverTriggers(fromScope, toScope) {
      if (!fromScope || !toScope) return;
      var triggers = fromScope.querySelectorAll(POPOVER_TRIGGER_SELECTOR);
      var slots = toScope.querySelectorAll("." + POPOVER_SLOT_CLASS);
      var count = Math.min(triggers.length, slots.length);
      for (var i = 0; i < count; i++) {
        slots[i].parentNode.insertBefore(triggers[i], slots[i]);
      }
    }
    // Mirrors the #1 card into the pinned card and swaps its badge. The pinned card's real columns
    // are never written to - a clone is shown instead, which also keeps the CTA tracking intact.
    function syncBestOverallCard(mode, ranked) {
      if (!bestOverallCard) return;
      var box = bestOverallCard.querySelector(".plan-box");
      if (!box) return;
      var badge = bestOverallCard.querySelector(BEST_OVERALL_TEXT_SELECTOR);
      var origCol1 = box.querySelector(".plan-col-1:not(.cre-t-151-clone)");
      var origCol2 = box.querySelector(".plan-col-2:not(.cre-t-151-clone)");
      if (!origCol1 || !origCol2) return;
      var cloneCol1 = box.querySelector(".plan-col-1.cre-t-151-clone");
      var cloneCol2 = box.querySelector(".plan-col-2.cre-t-151-clone");

      if (mode !== "lowest-price") {
        // Hand the real tooltip triggers back before the clone goes away.
        movePopoverTriggers(cloneCol1, origCol1);
        movePopoverTriggers(cloneCol2, origCol2);
        // Back to the control: the site's own columns visible, our clone hidden, badge restored.
        origCol1.style.removeProperty("display");
        origCol2.style.removeProperty("display");
        if (cloneCol1) cloneCol1.style.display = "none";
        if (cloneCol2) cloneCol2.style.display = "none";
        // Only restore the identity if we changed it - a Best Rated-only session never writes it.
        if (dataUniqueOverridden && ranked.length) {
          setAttrIfChanged(bestOverallCard, "data-unique", ranked[0].getAttribute("data-unique"));
          dataUniqueOverridden = false;
        }
        setTextIfChanged(badge, BEST_OVERALL_DEFAULT_LABEL);
        return;
      }

      var top = ranked[0];
      if (!top) return;
      var sourceCol1 = top.querySelector(".plan-col-1");
      var sourceCol2 = top.querySelector(".plan-col-2");
      if (!sourceCol1 || !sourceCol2) return;
      if (!cloneCol1) {
        cloneCol1 = document.createElement("div");
        cloneCol1.className = "ct-div-block plan-col-1 cre-t-151-clone";
        origCol1.insertAdjacentElement("afterend", cloneCol1);
      }
      if (!cloneCol2) {
        cloneCol2 = document.createElement("div");
        cloneCol2.className = "ct-div-block plan-col-2 cre-t-151-clone";
        origCol2.insertAdjacentElement("afterend", cloneCol2);
      }
      // Keyed on the source MARKUP, not on which provider is #1 - the same insurer can stay cheapest
      // while its own price moves. Re-clones only on a real change, so the observer stays asleep.
      var sourceHtml1 = sourceCol1.innerHTML;
      var sourceHtml2 = sourceCol2.innerHTML;
      if (sourceHtml1 !== lastClonedCol1Html || sourceHtml2 !== lastClonedCol2Html) {
        // Rescue the real triggers first - the overwrite below would destroy them, and they are the
        // only bound ones we have.
        movePopoverTriggers(cloneCol1, origCol1);
        movePopoverTriggers(cloneCol2, origCol2);
        cloneCol1.innerHTML = sourceHtml1;
        stripIds(cloneCol1);
        replaceTriggersWithSlots(cloneCol1);
        cloneCol2.innerHTML = sourceHtml2;
        stripIds(cloneCol2);
        replaceTriggersWithSlots(cloneCol2);
        lastClonedCol1Html = sourceHtml1;
        lastClonedCol2Html = sourceHtml2;
      }
      // Fall back to the site's own card if the clone is empty or detached, rather than rendering an
      // empty box. Checked BEFORE the hand-over below, which would strand the real triggers off-DOM.
      var cloneUsable =
        cloneCol1.isConnected &&
        cloneCol2.isConnected &&
        cloneCol1.children.length > 0 &&
        cloneCol2.children.length > 0;
      if (!cloneUsable) {
        origCol1.style.removeProperty("display");
        origCol2.style.removeProperty("display");
        cloneCol1.style.display = "none";
        cloneCol2.style.display = "none";
        lastClonedCol1Html = null; // force a fresh clone attempt on the next refresh
        lastClonedCol2Html = null;
        if (dataUniqueOverridden && originalOrder.length) {
          setAttrIfChanged(bestOverallCard, "data-unique", originalOrder[0].getAttribute("data-unique"));
          dataUniqueOverridden = false;
        }
        setTextIfChanged(badge, BEST_OVERALL_DEFAULT_LABEL);
        if (debug) console.log(variation_name + " pinned-card clone unusable - showing the control card");
        return;
      }
      // Park a slot in front of each real trigger, then move them across into the clone. Both are
      // no-ops once the triggers are already in the clone, so this is safe on every refresh tick.
      ensureSlotsBeforeTriggers(origCol1);
      ensureSlotsBeforeTriggers(origCol2);
      movePopoverTriggers(origCol1, cloneCol1);
      movePopoverTriggers(origCol2, cloneCol2);
      origCol1.style.display = "none";
      origCol2.style.display = "none";
      cloneCol1.style.removeProperty("display");
      cloneCol2.style.removeProperty("display");
      // Listing-level click tracking reads data-unique off this wrapper, so it has to follow the
      // content the card now shows or the click is attributed to the wrong partner.
      setAttrIfChanged(bestOverallCard, "data-unique", top.getAttribute("data-unique"));
      dataUniqueOverridden = true;
      setTextIfChanged(badge, BEST_OVERALL_LOWEST_PRICE_LABEL);
    }
    // Ranks the listings visually and renumbers the rank bubbles. "lowest-price" assigns each child
    // a CSS `order`; "best-rated" removes them, dropping back to DOM order - the control, untouched.
    function reorder(mode) {
      var container = originalOrder[0].parentElement;
      if (!container) return;
      var children = Array.prototype.slice.call(container.children);

      if (mode !== "lowest-price") {
        children.forEach(function (el) {
          if (el.style.order) el.style.removeProperty("order");
        });
        // DOM order is the native order, so numbering by it reproduces the control's own bubbles -
        // setTextIfChanged then makes every one of these writes a no-op.
        originalOrder.forEach(function (item, index) {
          setTextIfChanged(item.querySelector(RANK_BUBBLE_SELECTOR), String(index + 1));
        });
        syncBestOverallCard(mode, originalOrder);
        return;
      }

      // Prices are read ONCE, up front: getPrice calls getComputedStyle, and a comparator that
      // re-reads live DOM can also see a value change mid-sort and produce an unstable ordering.
      var priceByItem = new Map();
      originalOrder.forEach(function (item) {
        priceByItem.set(item, getPrice(item));
      });
      var sorted = originalOrder.slice().sort(function (a, b) {
        return priceByItem.get(a) - priceByItem.get(b);
      });
      // Refill only the slots the sortable cards already occupy, so everything else in the repeater
      // ("Show More", the pinned card) keeps exactly the position it has now.
      var visual = children.slice();
      var slot = 0;
      children.forEach(function (el, i) {
        if (originalOrder.indexOf(el) !== -1) visual[i] = sorted[slot++];
      });
      // Written to every child, not just the sorted ones: `order` defaults to 0, so leaving the
      // pinned card and "Show More" unset would float them above cards we gave a positive order.
      visual.forEach(function (el, i) {
        if (el.style.order !== String(i)) el.style.order = String(i);
      });
      sorted.forEach(function (item, index) {
        setTextIfChanged(item.querySelector(RANK_BUBBLE_SELECTOR), String(index + 1));
      });
      syncBestOverallCard(mode, sorted);
    }
    // isApplying is what stops our own DOM writes from coming back through the MutationObserver as
    // "the site re-rendered". try/finally so a throw can never leave it stuck on.
    function applySort(mode) {
      if (!originalOrder.length) return;
      isApplying = true;
      try {
        reorder(mode);
      } catch (sortError) {
        if (debug) console.log(sortError, "error while sorting in " + variation_name);
      } finally {
        isApplying = false;
      }
    }
    /* Fade out, re-rank while invisible, fade back in. Called ONLY on a real click - refresh() uses
       applySort() directly, since it runs on every re-render and would strobe the list. */
    function applySortAnimated(mode) {
      var container = originalOrder.length ? originalOrder[0].parentElement : null;
      // Reduced motion is handled here, not in CSS: killing the transition alone would snap the list
      // to opacity 0 and leave it invisible for the whole SORT_FADE_MS.
      if (!container || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        applySort(mode);
        return;
      }
      // Cleared up front so a fast double-click cancels the pending re-rank instead of overlapping.
      clearTimeout(fadeTimer);
      clearTimeout(fadeEndTimer);
      container.classList.add(SORT_FADE_ENABLE_CLASS);
      // Forced reflow: commits the transition declaration on its own, so the opacity change below is
      // seen as transitionable rather than as part of the same recalc.
      void container.offsetWidth;
      container.classList.add(SORT_FADE_CLASS);
      fadeTimer = setTimeout(function () {
        try {
          applySort(mode);
        } finally {
          container.classList.remove(SORT_FADE_CLASS); // fades back in over the same duration
          // Hand the transition back only once the fade-in has finished - removing it early would
          // cut the fade-in short at the site's own 0.5s.
          fadeEndTimer = setTimeout(function () {
            container.classList.remove(SORT_FADE_ENABLE_CLASS);
          }, SORT_FADE_MS);
        }
      }, SORT_FADE_MS);
    }

    /* ---- selection state ---- */
    function closeMenu() {
      var dropdown = document.getElementById("cre-t-151-sort-dropdown");
      if (dropdown) dropdown.classList.remove("cre-t-151-is-open");
      var toggle = document.getElementById("cre-t-151-sort-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    // Updates the "Sorted by ___" copy. Guarded by setTextIfChanged - see that function for why
    // an unconditional write here would be an infinite refresh loop.
    function updateSortCopy(mode) {
      var valueEl = document.querySelector(".cre-t-151-sort-value");
      setTextIfChanged(valueEl, COPY_LABELS[mode] || COPY_LABELS[DEFAULT_SORT_MODE]);
    }
    // Applies a chosen option: moves the checkmark, updates the pill's value and the copy line,
    // closes the menu, and re-ranks the listings.
    function selectSortOption(mode) {
      if (!LABELS[mode]) mode = DEFAULT_SORT_MODE;
      currentMode = mode;
      var options = document.querySelectorAll(".cre-t-151-sort-option");
      Array.prototype.forEach.call(options, function (opt) {
        var isSelected = opt.getAttribute("data-value") === mode;
        opt.classList.toggle("cre-t-151-is-selected", isSelected);
        opt.setAttribute("aria-selected", String(isSelected));
      });
      var valueEl = document.querySelector(".cre-t-151-sort-toggle-value");
      setTextIfChanged(valueEl, LABELS[mode]);
      closeMenu();
      updateSortCopy(mode);
      applySortAnimated(mode);
    }

    /* ---- injection / DOM sync ---- */
    // Builds the sort pill. Styled in CSS to match the existing breed / zip filter fields.
    function buildSortField() {
      var wrap = document.createElement("div");
      wrap.className = "cre-t-151-sort-dropdown";
      wrap.id = "cre-t-151-sort-dropdown";
      wrap.innerHTML = [
        '<button type="button" class="cre-t-151-sort-toggle" id="cre-t-151-sort-toggle" aria-haspopup="listbox" aria-expanded="false">',
        '<span class="cre-t-151-sort-toggle-label">Sort by:</span>',
        '<span class="cre-t-151-sort-toggle-value">' + LABELS[DEFAULT_SORT_MODE] + "</span>",
        '<svg class="cre-t-151-sort-caret" focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>',
        "</button>",
        // The open menu shows only the two values, no "Sort by:" prefix, per spec. The checkmark is
        // driven by DEFAULT_SORT_MODE so it always matches whichever mode loads first.
        '<ul class="cre-t-151-sort-menu" role="listbox" aria-label="Sort plans">',
        '<li class="cre-t-151-sort-option' +
          (DEFAULT_SORT_MODE === "best-rated" ? " cre-t-151-is-selected" : "") +
          '" role="option" data-value="best-rated" aria-selected="' +
          (DEFAULT_SORT_MODE === "best-rated") +
          '">',
        '<span class="cre-t-151-sort-check">&#10003;</span>Best Rated</li>',
        '<li class="cre-t-151-sort-option' +
          (DEFAULT_SORT_MODE === "lowest-price" ? " cre-t-151-is-selected" : "") +
          '" role="option" data-value="lowest-price" aria-selected="' +
          (DEFAULT_SORT_MODE === "lowest-price") +
          '">',
        '<span class="cre-t-151-sort-check">&#10003;</span>Lowest Price</li>',
        "</ul>",
      ].join("");
      return wrap;
    }
    function ensureSortField() {
      var fields = document.querySelector(SECTION_SELECTOR + " " + FILTERS_FIELDS_SELECTOR);
      if (!fields) return;
      var existing = document.getElementById("cre-t-151-sort-dropdown");
      if (existing && existing.parentElement === fields) return;
      if (!existing) existing = buildSortField();
      fields.appendChild(existing);
    }
    // Our copy fragment. The "i" icon is an inline SVG rather than a <use> reference or a hosted
    // asset, so it can never go missing if the site's sprite or a CDN path changes.
    function buildCopy() {
      var el = document.createElement("span");
      el.className = "cre-t-151-sort-copy";
      el.id = "cre-t-151-sort-copy";
      el.innerHTML = [
        '<span class="cre-t-151-sort-copy-sep">.</span> Sorted by ',
        '<strong class="cre-t-151-sort-value">' + COPY_LABELS[DEFAULT_SORT_MODE] + "</strong>",
        // Both full stops are spans so CSS can drop them per placement - standing alone the line is
        // not a sentence, so it gets neither.
        '<span class="cre-t-151-sort-copy-end">.</span>',
        '<button type="button" class="cre-t-151-sort-tooltip" data-cre-t-151-tooltip aria-label="View ranking methodology">',
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"></path>',
        '<path d="M12 10a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1Zm0-3.3a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"></path>',
        "</svg></button>",
      ].join("");
      return el;
    }
    // Returns the deepest element holding the site's "Showing prices ..." line (document order, so
    // the last match is innermost). Memoized - ensureCopy() runs on every refresh.
    function findSiteCopyLine() {
      if (cachedSiteLine && cachedSiteLine.isConnected) return cachedSiteLine;
      var scope = document.querySelector(SECTION_SELECTOR) || document.body;
      var nodes = scope.querySelectorAll("div, p, span");
      var match = null;
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.id === "cre-t-151-sort-copy" || el.closest("#cre-t-151-sort-copy")) continue;
        if ((el.textContent || "").trim().toLowerCase().indexOf(SITE_COPY_PREFIX) !== 0) continue;
        match = el;
      }
      cachedSiteLine = match;
      return match;
    }
    // The site's own sentence text with our copy excluded - reading textContent directly would
    // include ours and change on every sort, firing the fade for the wrong reason.
    function siteLineTextWithoutCopy(line) {
      var out = "";
      for (var i = 0; i < line.childNodes.length; i++) {
        if (line.childNodes[i] === copyEl) continue;
        out += line.childNodes[i].textContent || "";
      }
      return out.trim();
    }
    // Restarts the copy's fade-in. Re-adding a class that is already present does not restart a CSS
    // animation, so the removal has to be flushed with a forced reflow in between.
    function playCopyFade() {
      if (!copyEl || !copyEl.isConnected) return;
      copyEl.classList.remove("cre-t-151-copy-animate");
      void copyEl.offsetWidth; // forced reflow - commits the removal before the re-add below
      copyEl.classList.add("cre-t-151-copy-animate");
    }
    // The site's line ends in a trailing space, which would render as "Cats . Sorted by ..." once
    // our copy is appended - so strip it off the last real text node first.
    function trimTrailingSpace(container) {
      var node = container.lastChild;
      if (node === copyEl) node = node.previousSibling;
      while (node) {
        if (node.nodeType !== 3) return; // last meaningful node is an element - nothing to trim
        var trimmed = node.nodeValue.replace(/\s+$/, "");
        if (trimmed !== node.nodeValue) node.nodeValue = trimmed;
        if (trimmed) return;
        node = node.previousSibling; // node was whitespace-only, keep walking back
      }
    }
    // True while the site is mid-filter-transition, i.e. its own copy line has not settled yet.
    function isSiteBusy() {
      var repeater = document.querySelector(SECTION_SELECTOR + " " + REPEATER_SELECTOR);
      if (!repeater) return false;
      for (var i = 0; i < SITE_BUSY_CLASSES.length; i++) {
        if (repeater.classList.contains(SITE_BUSY_CLASSES[i])) return true;
      }
      return false;
    }
    // Hides our copy during the site's filter transition and reveals it once at the end. The
    // busy === wasBusy early-out keeps it idempotent - otherwise the fade restarts on every tick.
    function syncCopyBusy() {
      if (!copyEl) return;
      var busy = isSiteBusy();
      var wasBusy = copyEl.classList.contains(COPY_BUSY_CLASS);
      if (busy === wasBusy) return;
      clearTimeout(busyMaxTimer);
      if (busy) {
        copyEl.classList.add(COPY_BUSY_CLASS);
        busyMaxTimer = setTimeout(function () {
          if (!copyEl) return;
          copyEl.classList.remove(COPY_BUSY_CLASS);
          playCopyFade();
          if (debug) console.log(variation_name + " site stayed busy for " + SITE_BUSY_MAX_MS + "ms - showing the copy anyway");
        }, SITE_BUSY_MAX_MS);
        return;
      }
      copyEl.classList.remove(COPY_BUSY_CLASS);
      playCopyFade();
    }
    // Keeps the class watch pointed at the live repeater - the site can replace that element, and an
    // observer on a detached node never fires again. Re-observes only on a genuinely new element.
    function ensureBusyObserver() {
      if (!window.MutationObserver) return;
      var repeater = document.querySelector(SECTION_SELECTOR + " " + REPEATER_SELECTOR);
      if (!repeater || repeater === busyObserverTarget) return;
      if (busyObserver) busyObserver.disconnect();
      busyObserverTarget = repeater;
      busyObserver = new MutationObserver(syncCopyBusy);
      // Attributes only, and only `class` - this must not react to the site patching card content,
      // and it deliberately ignores our own cre-t-151-sorting / -fading classes on the same element.
      busyObserver.observe(repeater, { attributes: true, attributeFilter: ["class"] });
    }
    // Appends our copy to the site's line when it exists, otherwise renders it standalone under the
    // filters. React re-renders wipe the appended node, which is why the observer re-runs this.
    function ensureCopy() {
      // Adopt a copy element already on the page rather than injecting a second one.
      if (!copyEl) copyEl = document.getElementById("cre-t-151-sort-copy") || buildCopy();

      // One layout at every width (client request): the copy always continues the site's own
      // sentence. The earlier >=992px header-row placement is gone.
      var siteLine = findSiteCopyLine();
      if (siteLine) {
        var siteText = siteLineTextWithoutCopy(siteLine);
        var isReattach = copyEl.parentNode !== siteLine;
        try {
          trimTrailingSpace(siteLine);
          if (isReattach) siteLine.appendChild(copyEl);
        } catch (appendError) {
          if (debug) console.log(appendError, "could not append copy in " + variation_name);
        }
        copyEl.classList.remove("cre-t-151-sort-copy--standalone");
        // SITE_COPY_CLASS is only worn while standalone - inline it would duplicate the real line.
        copyEl.classList.remove(SITE_COPY_CLASS);
        // Fade away the flicker: a filter change either replaces the whole sentence (taking our copy
        // with it) or patches its text in place, and both need the re-entry animated.
        if (isReattach || siteText !== lastSiteLineText) playCopyFade();
        lastSiteLineText = siteText;
      } else {
        var filters = document.querySelector(SECTION_SELECTOR + " " + FILTERS_ROW_SELECTOR);
        var didMove = false;
        if (filters && copyEl.previousElementSibling !== filters) {
          filters.insertAdjacentElement("afterend", copyEl);
          didMove = true;
        }
        copyEl.classList.add("cre-t-151-sort-copy--standalone");
        copyEl.classList.add(SITE_COPY_CLASS);
        if (didMove) playCopyFade();
        lastSiteLineText = null; // the site renders no sentence in this state - nothing to compare
      }
      updateSortCopy(currentMode);
      // Last, so a copy that was just (re)attached mid-transition starts out hidden rather than
      // appearing beside the site's not-yet-updated sentence.
      syncCopyBusy();
    }
    // Matches the sort pill's height to the real filter fields instead of hardcoding a value.
    function syncFieldHeight() {
      var ref = document.querySelector(SECTION_SELECTOR + " " + FIELD_HEIGHT_REF_SELECTOR);
      if (!ref) return;
      var height = Math.round(ref.getBoundingClientRect().height);
      if (height > 20) document.documentElement.style.setProperty("--cre-t-151-sort-field-h", height + "px");
    }
    // Shortens the zip placeholder on mobile so breed + zip + sort fit on one row.
    function syncZipPlaceholder() {
      var input = document.querySelector(SECTION_SELECTOR + " " + ZIP_INPUT_SELECTOR);
      if (!input) return;
      if (originalZipPlaceholder === null) {
        originalZipPlaceholder = input.getAttribute("placeholder") || "Enter Zip Code";
      }
      var next = window.innerWidth <= ZIP_SHORT_MAX_WIDTH ? ZIP_SHORT_PLACEHOLDER : originalZipPlaceholder;
      if (input.getAttribute("placeholder") !== next) input.setAttribute("placeholder", next);
    }
    // Re-asserts our UI and our ranking after a React re-render wipes them. Every step is a no-op
    // when nothing has moved, which is what stops the observer from re-triggering itself forever.
    function refresh() {
      if (isApplying) return;
      ensureSortField();
      ensureBusyObserver(); // before ensureCopy, so the busy state is known when the copy is placed
      ensureCopy();
      syncFieldHeight();
      syncZipPlaceholder();
      var items = getListingItems();
      if (!items.length) return;
      // Has to re-run every tick: per-provider prices keep arriving after the initial render, so
      // Lowest Price must re-rank against whatever is displayed now.
      captureOrder(items);
      applySort(currentMode);
    }
    function scheduleRefresh() {
      if (isApplying) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 150);
    }
    /* Puts our copy back on the LEADING edge of a re-render - refresh() debounces behind the site's
       whole burst, so the copy used to arrive ~1.4s after the sentence it belongs to. */
    function scheduleCopySync() {
      if (copyFrame || isApplying || !copyEl) return;
      copyFrame = requestAnimationFrame(function () {
        copyFrame = null;
        if (isApplying || !copyEl) return;
        // The :not() matters - our own element wears the site's `search-details` class standalone.
        var line = document.querySelector(
          SECTION_SELECTOR + " ." + SITE_COPY_CLASS + ":not(#cre-t-151-sort-copy)"
        );
        // No sentence yet, or we are already inside it - nothing to do. The standalone fallback
        // stays with refresh(), where it belongs: it is not time-critical.
        if (!line || copyEl.parentNode === line) return;
        ensureCopy();
      });
    }

    function eventListeners() {
      // toggle dropdown open/close
      live("#cre-t-151-sort-toggle", "click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dropdown = document.getElementById("cre-t-151-sort-dropdown");
        if (!dropdown) return;
        var isOpen = dropdown.classList.contains("cre-t-151-is-open");
        dropdown.classList.toggle("cre-t-151-is-open", !isOpen);
        this.setAttribute("aria-expanded", String(!isOpen));
      });
      // pick an option
      live(".cre-t-151-sort-option", "click", function (e) {
        e.stopPropagation();
        selectSortOption(this.getAttribute("data-value"));
      });
      // click outside closes the menu ("html" matches every click target)
      live("html", "click", function (e) {
        var dropdown = document.getElementById("cre-t-151-sort-dropdown");
        if (dropdown && dropdown.classList.contains("cre-t-151-is-open") && !dropdown.contains(e.target)) {
          closeMenu();
        }
      });
      // Escape closes the menu
      live("html", "keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
      // "i" icon -> smooth scroll to the "Ranking Methodology" section, found by heading text
      live("[data-cre-t-151-tooltip]", "click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScrollTo(findRankingMethodologyTarget());
      });
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          syncFieldHeight();
          syncZipPlaceholder();
          ensureCopy(); // cheap idempotent re-assert - re-attaches the copy if a resize re-rendered the line
        }, 150);
      });
      // Scoped to the section, not the document: a document-wide observer would react to every
      // unrelated mutation on the page.
      var observeTarget = document.querySelector(SECTION_SELECTOR);
      if (observeTarget && window.MutationObserver) {
        // Two speeds off one observer: the copy returns next frame (scheduleCopySync), the heavier
        // re-assert stays debounced behind the burst (scheduleRefresh).
        domObserver = new MutationObserver(function () {
          scheduleCopySync();
          scheduleRefresh();
        });
        domObserver.observe(observeTarget, { childList: true, subtree: true });
        // The observer must live as long as the section, so the page going away is the only sound
        // disconnect. pagehide, not unload - unload is unreliable and blocks the bfcache.
        window.addEventListener("pagehide", function () {
          if (domObserver) {
            domObserver.disconnect();
            domObserver = null;
          }
          clearTimeout(refreshTimer);
          clearTimeout(resizeTimer);
          if (busyObserver) {
            busyObserver.disconnect();
            busyObserver = null;
            busyObserverTarget = null;
          }
          clearTimeout(fadeTimer);
          clearTimeout(fadeEndTimer);
          clearTimeout(busyMaxTimer);
          if (copyFrame) cancelAnimationFrame(copyFrame);
        });
      }
    }

    /* Variation Init */
    function init() {
      // Hard guard: only the very first call may run any of the logic below.
      if (window.cre_151_initialized) return;
      window.cre_151_initialized = true;

      // Tags <body> with the variation name so CSS/analytics can target this test specifically.
      if (document.body) document.body.classList.add(variation_name);

      /* start your code here */
      refresh();
      if (!window.cre_151_events) {
        window.cre_151_events = true;
        eventListeners();
      }
      if (debug) console.log(variation_name + " initialized");
    }

    // Wait for BOTH the filter field group (where the pill goes) and at least one listing (so the
    // very first captureOrder has something real to snapshot) before injecting.
    if (!window.CRE_151_OBSERVER) {
      window.CRE_151_OBSERVER = true;
      // observeSelector's first scan is SYNCHRONOUS, so on an already-rendered page this callback
      // fires while stopWaitingForReady is still undefined. The flag covers the sync and async paths.
      var stopWaitingForReady = null;
      var readyFired = false;
      stopWaitingForReady = observeSelector(SECTION_SELECTOR + " " + FILTERS_FIELDS_SELECTOR, function () {
        if (readyFired || getListingItems().length === 0) return;
        readyFired = true;
        init();
        if (stopWaitingForReady) stopWaitingForReady();
      });
      if (readyFired && stopWaitingForReady) stopWaitingForReady();
      // Safety net: observeSelector has no built-in timeout, so a markup change would otherwise leave
      // a whole-document observer running for the page's lifetime. Cap it at 25s, same as before.
      setTimeout(function () {
        if (!window.cre_151_initialized) {
          stopWaitingForReady();
          if (debug) console.log(variation_name + " gave up waiting for the filter row after 25s");
        }
      }, 25000);
    }
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
