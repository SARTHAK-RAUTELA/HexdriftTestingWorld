(function () {
  var variation_name = "cre-t-151";
  var debug = 1;
  try {
    /* =========================================================================
       VARIATION 2. Identical to V1 in every respect except DEFAULT_SORT_MODE
       below, which makes the page load already sorted by price with no user
       interaction. Keep the two files in step: any change to vB.js belongs
       here too.
       Sort field UI + "Lowest Price" ordering + the pinned card mirroring
       whichever listing is currently #1.
       Choosing a sort option fades the listings the same way the site itself
       does when a control filter is applied - see SORT_FADE_CLASS below.
       In "Best Rated" mode nothing is re-ranked and the pinned card shows the
       site's own content, so the page behaves exactly like the control.
       Every class/id/attribute/custom-property this script injects is
       prefixed `cre-t-151-` so nothing can collide with the site or with the
       other live tests on this page.
       ========================================================================= */

    /* ---- config (edit these selectors if the markup changes) ---- */
    var SECTION_SELECTOR = "#comparison-section";
    var FILTERS_ROW_SELECTOR = ".filter-options"; // pet-type tabs + breed + zip row
    var FILTERS_FIELDS_SELECTOR = ".filter-options .additional-filters"; // breed + zip group; sort field goes here
    // "Showing prices for {breed}..." when a breed is picked, "Showing prices in {zip}" when only
    // ZIP is set (no breed) - match on the invariant "showing prices" so both variants are found.
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
    // Both tooltip triggers on a card: the "?" beside Average Plan Cost (button.plan-cost-tooltip,
    // wrapped in .oxy-popover) and the "i" beside the money-back guarantee (button.oxy-popover_marker,
    // not wrapped). Matching on the aria-label covers both without depending on either structure.
    var POPOVER_TRIGGER_SELECTOR = 'button[aria-label="Open popover"]';
    var POPOVER_SLOT_CLASS = "cre-t-151-popover-slot"; // placeholder marking where a trigger belongs
    var PRICE_COLUMN_HEADING = "average plan cost"; // identifies the price column by its heading text
    // Two other tests run live at 100% traffic on this site, and each one ADDS its own price span
    // next to the site's control price rather than replacing it - the control `.ct-span` stays in
    // the DOM underneath. So which price the user actually sees is decided by a class on <body>,
    // and that is what gets checked first; the span's presence alone would not tell us. In practice
    // cre-t-116 renders on the pet-type filters with no breed/ZIP applied, and cre-t-111 renders
    // once a breed or a ZIP is applied. Order matters: cre-t-111 wins if both are ever present.
    var PRICE_OVERRIDE_TESTS = [
      { bodyClass: "cre-t-111-toolTipContentChange", priceClass: "cre-t-111-price-update" },
      { bodyClass: "cre-t-116-toolTipContentChange", priceClass: "cre-t-116-price-update" },
    ];
    /* ---- re-order transition ----
       The site already fades its own listing container whenever a control filter (pet type, breed,
       ZIP) is applied: it toggles `loading` then `reload` on .plan-repeater, and that element
       carries `transition: all 0.5s ease`, so the opacity change animates. Measured on the live
       page: 1 -> 0.6 -> 0, then 0 -> 1 once the new cards are in, ~0.5s per leg.
       The site also drifts the list down ~50px as it fades and back up as it returns (its `reload`
       class animates margin-top on the same curve).
       Choosing a sort option now does the same thing, so our filter feels like the site's own: fade
       and slide the container out, re-rank while nothing is visible, then fade and slide it back in.
       Client asked for a longer, smoother version of it than the site's own 0.5s ease, so we have to
       declare the duration/easing ourselves - and that is why there are TWO classes rather than one.
       Putting `transition` on .plan-repeater directly would replace the site's `transition: all
       0.5s ease`, which is what animates the site's OWN filter fade, so every pet-type/breed/ZIP
       change inside the variation would silently inherit our timing too. Instead
       SORT_FADE_ENABLE_CLASS carries the transition and is only on the element while our sort
       animates; the moment both legs are done it comes off and the site's own transition is back in
       charge, byte-identical to the control.
       0.7s per leg, so a sort takes ~1.4s end to end - the same overall length as the control's own
       filter transition, which spends most of its 1.4s waiting on the network rather than fading.
       SORT_FADE_MS must stay equal to the duration in the CSS: it is both how long we wait before
       re-ranking (so the re-order lands at the END of the fade-out rather than visibly during it)
       and how long we then wait before handing the transition back. */
    /* ---- waiting for the site's own filter transition ----
       Client-reported flashing, second pass. The site does not rewrite its "Showing prices for ..."
       sentence until its card transition has finished - measured live, the text only changes at
       ~1.08s, at the very end of its loading -> reload sequence. Our copy is put back into that line
       within a frame (see scheduleCopySync), so on its own that means the user reads our "Sorted by
       ..." beside the OLD sentence and then watches the sentence change underneath it. Holding our
       copy back until the site is done fixes the order: sentence settles first, then our copy appears
       beside the finished text, once.
       We watch the site's own `loading` / `reload` markers instead of hard-coding ~1.4s, so we wait
       exactly as long as the control actually takes - longer on a slow connection, shorter on a fast
       one. SITE_BUSY_MAX_MS is a safety cap: if those classes ever stick, the copy comes back anyway
       rather than staying hidden for the rest of the session. */
    var SITE_BUSY_CLASSES = ["loading", "reload"];
    var COPY_BUSY_CLASS = "cre-t-151-copy-busy";
    var SITE_BUSY_MAX_MS = 3000;

    var SORT_FADE_CLASS = "cre-t-151-sorting"; // the opacity target
    var SORT_FADE_ENABLE_CLASS = "cre-t-151-fading"; // carries our duration + easing, briefly
    var SORT_FADE_MS = 700;

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
    /**
     * Debounce - collapses a burst of calls into one, delayInterval ms after the last call.
     */
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
    /**
     * Event-driven replacement for polling: fires `callback(el)` for every element currently
     * matching `selector`, then again whenever the DOM changes (debounced 100ms), until the
     * returned `done()` function is called (or, with options.once, after the first match).
     * NOTE: it observes the WHOLE document with attributes:true - fine for a short-lived
     * "wait until this appears" check, far too broad to leave running long-term (which is why
     * the ongoing watch below uses its own narrowly-scoped observer instead).
     */
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
    /**
     * Event delegation - listen for events on dynamically added elements.
     */
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
    /**
     * Sets textContent only when the value actually differs. textContent's setter always tears
     * down and rebuilds the element's child text node - even when the string is unchanged - which
     * is a childList mutation. Since a MutationObserver is watching this section, an unguarded
     * write here would re-trigger itself on every refresh forever. This guard is what keeps the
     * refresh cycle idempotent/self-terminating instead of an infinite loop.
     */
    function setTextIfChanged(el, text) {
      if (el && el.textContent !== text) el.textContent = text;
    }
    // Attribute twin of setTextIfChanged - keeps us from rewriting an attribute with its own value.
    function setAttrIfChanged(el, name, value) {
      if (el && value && el.getAttribute(name) !== value) el.setAttribute(name, value);
    }
    /**
     * Smooth scroll that clears the overlay header. window.pageYOffset is required here:
     * getBoundingClientRect() is viewport-relative, so without it the page lands in the wrong
     * place whenever the user has already scrolled.
     */
    function smoothScrollTo(el) {
      if (!el) return;
      var header = document.querySelector(".oxy-header-wrapper");
      var headerHeight = 0;
      if (header) {
        // Only reserve space for the header when it actually stays on screen - this site's header
        // is an overlay that scrolls away, in which case subtracting its height would overshoot.
        var position = window.getComputedStyle(header).position;
        if (position === "fixed" || position === "sticky") headerHeight = header.getBoundingClientRect().height;
      }
      var top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
    }
    // Finds the "Ranking Methodology" section by its heading text rather than a hardcoded selector.
    // This site renders it as an <h3>; other Guru sites use <h2> - scan both.
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
    /**
     * The price the user can actually SEE for one plan. Checks <body> for each override test's
     * class first and only then looks for that test's span (see PRICE_OVERRIDE_TESTS). Reading the
     * control `.ct-span` blindly, or picking "whichever child happens to be visible", both go wrong
     * here: the control price stays in the DOM underneath an override, so it is always readable and
     * always the wrong number when an override test is on.
     */
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
    // The listing blocks currently rendered. Direct children of the repeater only, so nested markup
    // carrying the same data-unique value can never be picked up twice.
    function getListingItems() {
      var repeater = document.querySelector(SECTION_SELECTOR + " " + REPEATER_SELECTOR);
      if (!repeater) return [];
      return Array.prototype.filter.call(repeater.children, function (el) {
        return el.matches && el.matches(LISTING_ITEM_SELECTOR);
      });
    }
    /**
     * Snapshots the site's own (native) order into originalOrder.
     *
     * This is a plain read of DOM position, and it stays truthful forever, because ranking is
     * applied with the CSS `order` property and never by moving nodes (see reorder()). An earlier
     * version did physically move them, and could not be made correct: this site patches new
     * content into whatever physical slots already exist rather than rebuilding the list, so once
     * Lowest Price had rearranged the nodes, every later capture read our own sorted order back as
     * if it were the site's. Switching pet type a few times while sorted and then going back to
     * Best Rated left an order that no longer matched the control, with no way to recover the true
     * one client-side. Not moving the nodes at all removes that whole class of bug.
     */
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
    /* ---- keeping the pinned card's tooltips alive ------------------------------------------
       Oxygen binds every popover trigger once, at page load. A button produced later by cloning
       innerHTML is therefore inert: it looks exactly right and does nothing on click, which is
       what broke the "Average Plan Cost" and money-back tooltips on the mirrored card. Re-binding
       is not available to us, so instead we never display a cloned trigger. The pinned card
       already owns two real, bound ones, and this tooltip copy is generic rather than
       provider-specific, so those get moved into the clone while it is on screen and moved back
       when it is not. Event listeners survive a DOM move, and the popover positions itself from
       the trigger's live bounding rect, so it opens in the right place either way.
       --------------------------------------------------------------------------------------- */
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
    /**
     * Mirrors whichever card is currently #1 into the pinned card at the bottom of the list, and
     * swaps its badge to "Lowest Price".
     *
     * The pinned card's real .plan-col-1 / .plan-col-2 are NEVER written to. A separate clone of
     * those two columns is built alongside them and only the clone is shown while Lowest Price is
     * active, so in Best Rated the pinned card is still the site's own untouched element - the
     * control exactly. Cloning the rendered columns (rather than rebuilding a card) is also what
     * keeps the CTA tracking correct: the partner href, the data-unique attributes and the
     * see-plans button all come across precisely as the site rendered them on the #1 card.
     */
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
        // Only put the identity back if we were the ones who changed it - in a session that never
        // leaves Best Rated this attribute is never written to at all.
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
      // Keyed on the source MARKUP, not on which provider is #1. Gating by provider identity would
      // freeze the clone on whatever price was live the first time that insurer reached the top -
      // the same insurer can stay cheapest across a pet-type change while its own price moves.
      // Comparing the markup re-clones exactly when something really changed, and is a silent
      // no-op otherwise, which is also what keeps this from waking the observer on every tick.
      var sourceHtml1 = sourceCol1.innerHTML;
      var sourceHtml2 = sourceCol2.innerHTML;
      if (sourceHtml1 !== lastClonedCol1Html || sourceHtml2 !== lastClonedCol2Html) {
        // Rescue the real triggers first - the overwrite below would otherwise destroy them along
        // with the rest of the clone's markup, and they are the only bound ones we have.
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
      // Fallback - never blank out the control with nothing to put in its place. Checked BEFORE the
      // trigger hand-over below, because moving the real popover buttons into a detached clone
      // would take them out of the document entirely and there is no second copy of them. If the
      // clone is ever emptied or detached by a site re-render, the pinned card falls back to the
      // site's own card instead of rendering as an empty box, and the next tick rebuilds the clone.
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
      // The wrapper's identity has to follow the content it now shows: in the control the pinned
      // card and the #1 card always carry the same data-unique, and listing-level click tracking
      // reads it off this wrapper. Left alone, a click on the mirrored card would be attributed to
      // whichever partner the site happened to render here.
      setAttrIfChanged(bestOverallCard, "data-unique", top.getAttribute("data-unique"));
      dataUniqueOverridden = true;
      setTextIfChanged(badge, BEST_OVERALL_LOWEST_PRICE_LABEL);
    }
    // Ranks the listings visually and renumbers the rank bubbles.
    //
    // "lowest-price" assigns each repeater child an explicit CSS `order`; "best-rated" removes
    // every order we set, which drops the list straight back to DOM order - the site's own
    // sequence, untouched, i.e. the control. Nothing is ever detached or re-inserted.
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

      // Each price is read ONCE, up front, instead of from inside the comparator. getPrice walks
      // the columns and calls getComputedStyle, so comparator-side reads would repeat that work
      // O(n log n) times per tick; more importantly, a comparator that re-reads live DOM can see a
      // value change mid-sort and produce an inconsistent ordering.
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
    /**
     * The user-facing sort: fade the listings out, re-rank while they are invisible, fade back in.
     *
     * Called ONLY from selectSortOption(), i.e. an actual click on an option. refresh() keeps
     * calling applySort() directly, with no fade - it runs on every site re-render (the observer
     * fires on each filter change and on each late-arriving price), so fading there would leave the
     * list strobing on its own.
     *
     * The classes are toggled on the site's own .plan-repeater, which our MutationObserver watches
     * with childList only - no `attributes: true` - so this cannot feed back into scheduleRefresh().
     * try/finally guarantees the opacity class comes off even if the re-rank throws; leaving it on
     * would strand the listings at opacity 0, which is exactly how the equivalent code in cre-t-150
     * once blanked the list. Both timers are cleared up front so double-clicking two options in
     * quick succession cancels the pending re-rank instead of running two overlapping fades.
     */
    function applySortAnimated(mode) {
      var container = originalOrder.length ? originalOrder[0].parentElement : null;
      // No container, or the user has asked the OS for reduced motion: re-rank straight away. Doing
      // the reduced-motion case in CSS instead would snap the list to opacity 0 and leave it
      // invisible for the whole SORT_FADE_MS, which is worse than the fade it replaces.
      if (!container || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        applySort(mode);
        return;
      }
      clearTimeout(fadeTimer);
      clearTimeout(fadeEndTimer);
      container.classList.add(SORT_FADE_ENABLE_CLASS);
      // Forced reflow, same trick as playCopyFade(): commits the transition declaration as its own
      // style change, so the opacity below is guaranteed to be seen as a transitionable change
      // rather than as part of the same recalc that introduced the transition.
      void container.offsetWidth;
      container.classList.add(SORT_FADE_CLASS);
      fadeTimer = setTimeout(function () {
        try {
          applySort(mode);
        } finally {
          container.classList.remove(SORT_FADE_CLASS); // fades back in over the same duration
          // Hand the transition back to the site only once the fade-in has actually finished -
          // removing it early would cut the fade-in short at the site's own 0.5s.
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
        // NOTE: the open menu deliberately shows only the two values - no "Sort by:" prefix - per spec.
        // The selected state is driven by DEFAULT_SORT_MODE so the checkmark always matches whichever
        // mode actually loads first, instead of being hardcoded to "best-rated".
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
        // Both full stops are spans, not bare text, purely so CSS can drop them per placement: the
        // leading one only makes sense mid-sentence, and the trailing one only when we are finishing
        // the site's sentence. Standing on its own the line is not a sentence, so it gets neither.
        '<span class="cre-t-151-sort-copy-end">.</span>',
        '<button type="button" class="cre-t-151-sort-tooltip" data-cre-t-151-tooltip aria-label="View ranking methodology">',
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"></path>',
        '<path d="M12 10a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1Zm0-3.3a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"></path>',
        "</svg></button>",
      ].join("");
      return el;
    }
    // The site prints "Showing prices for Cats" / "Showing prices for Devon Rexs in 90210" under
    // the filters, but only once a filter is active. Returns the deepest element holding that copy -
    // querySelectorAll is in document order, so the last match is the innermost one. Memoized, since
    // ensureCopy() runs on every refresh and a full "div, p, span" scan of the section on each call
    // is wasted work once the line has been found and is still attached.
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
    // The site's own sentence text, with our appended copy excluded. Comparing this between passes
    // is how we tell "the user changed a filter and the site rewrote its line" apart from "nothing
    // happened" - reading siteLine.textContent directly would include our own copy and change
    // whenever the sort value changed, firing the fade for the wrong reason.
    function siteLineTextWithoutCopy(line) {
      var out = "";
      for (var i = 0; i < line.childNodes.length; i++) {
        if (line.childNodes[i] === copyEl) continue;
        out += line.childNodes[i].textContent || "";
      }
      return out.trim();
    }
    // Restarts the copy's fade-in. The class has to be removed, the removal flushed with a forced
    // reflow, then re-added: re-adding a class that is already present does not restart a CSS
    // animation, so without the reflow only the very first filter change would animate and every
    // one after it would flicker exactly as before.
    function playCopyFade() {
      if (!copyEl || !copyEl.isConnected) return;
      copyEl.classList.remove("cre-t-151-copy-animate");
      void copyEl.offsetWidth; // forced reflow - commits the removal before the re-add below
      copyEl.classList.add("cre-t-151-copy-animate");
    }
    /**
     * The site's line ends in a trailing space ("Showing prices for <strong>Cats</strong> ").
     * Left alone that renders as "Cats . Sorted by ..." once our copy is appended, so strip any
     * trailing whitespace off the last real text node first.
     */
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
    /**
     * Hides our copy while the site's filter transition is running and reveals it, once, when the
     * transition ends - see the SITE_BUSY_CLASSES notes above for why.
     * The busy === wasBusy early-out is what keeps this idempotent: it is called from the observer
     * and from every ensureCopy() pass, and without it the reveal fade would restart on every tick.
     */
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
    // Keeps that class watch pointed at the live repeater - the site can replace the element on a
    // re-render, and an observer left on a detached node would never fire again. Cheap and
    // idempotent: re-observes only when the repeater is genuinely a different element.
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
    // Appends our copy to the site's line ("... in 90210. Sorted by best rated.") when that line
    // exists, otherwise renders it as its own line directly under the filters. React re-renders
    // wipe the appended node, which is why this is re-run from the observer.
    function ensureCopy() {
      // DOM-level check, matching ensureSortField: adopt a copy element that is already on the page
      // rather than injecting a second one.
      if (!copyEl) copyEl = document.getElementById("cre-t-151-sort-copy") || buildCopy();

      // One layout at every width (client request): our copy always continues the site's own
      // "Showing prices for ..." sentence under the filters. An earlier build moved it top-right of
      // the "Personalize prices" header row at >=992px - that placement is gone, desktop now reads
      // exactly like mobile.
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
        // SITE_COPY_CLASS is only worn while standalone, so the clone picks up the site's own
        // typography for that line; inline it would be a duplicate of the real one.
        copyEl.classList.remove(SITE_COPY_CLASS);
        // Client-reported flicker: every pet-type / breed / ZIP change makes the site tear down and
        // rebuild its "Showing prices ..." sentence, which takes our copy out with it and pops it
        // straight back in. Fading it back in on each of those updates turns that pop into one
        // smooth transition. Two triggers, because both happen in practice: the copy was actually
        // re-attached (the site replaced the whole line), or the line survived but its own text
        // changed (the site patched "Cats" -> "Dogs" in place). See playCopyFade() for the restart.
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
    // Re-asserts our UI and our ranking after the site's React filters re-render this section - the
    // sort field and the appended copy node get wiped by those re-renders, and the listings come
    // back in the site's order. Every step is a no-op when nothing has moved, which is what stops
    // the observer below from re-triggering itself forever.
    function refresh() {
      if (isApplying) return;
      ensureSortField();
      ensureBusyObserver(); // before ensureCopy, so the busy state is known when the copy is placed
      ensureCopy();
      syncFieldHeight();
      syncZipPlaceholder();
      var items = getListingItems();
      if (!items.length) return;
      // Safe to re-run on every tick, and it has to be: the site's per-provider prices keep
      // arriving after the initial render, so Lowest Price must re-rank against whatever price is
      // CURRENTLY displayed. Re-capturing is harmless now that DOM order is never disturbed.
      captureOrder(items);
      applySort(currentMode);
    }
    function scheduleRefresh() {
      if (isApplying) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 150);
    }
    /**
     * Puts our copy back into the site's sentence on the LEADING edge of a re-render, instead of
     * waiting for refresh().
     *
     * Client-reported flashing: changing a pet type / breed / ZIP made the site's own "Showing
     * prices for Dogs in 90210" appear on its own first, with our "Sorted by ..." arriving well
     * after it. Measured on the live page, that gap was ~1.4s - because scheduleRefresh() debounces
     * 150ms behind the LAST mutation, and the site's re-render burst runs for about that long
     * (its loading -> reload -> clear sequence). So the copy could only ever land after the burst
     * ended. Worse, for part of that window the copy sat standalone under the filters while the
     * site's sentence was already on screen, reading as two separate lines.
     *
     * This runs off the same observer but on a requestAnimationFrame, so the copy is back in the
     * sentence within a frame of it being rebuilt. The querySelector before ensureCopy() is what
     * keeps it cheap enough to sit in the observer path: during a long burst this is one O(1) lookup
     * per frame, and the expensive part (ensureCopy -> findSiteCopyLine's text scan) only runs on
     * the frames where the copy genuinely is not in the line yet.
     * The :not() matters - our own element wears the site's `search-details` class while standalone,
     * so without it we would match ourselves and never re-attach.
     */
    function scheduleCopySync() {
      if (copyFrame || isApplying || !copyEl) return;
      copyFrame = requestAnimationFrame(function () {
        copyFrame = null;
        if (isApplying || !copyEl) return;
        var line = document.querySelector(
          SECTION_SELECTOR + " ." + SITE_COPY_CLASS + ":not(#cre-t-151-sort-copy)"
        );
        // No sentence rendered yet, or we are already inside it - nothing to do. The standalone
        // fallback stays with refresh(), which is where it belongs: it is not time-critical.
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
      // click outside closes the menu ("html" matches every click, since every click target's
      // closest("html") is the root element)
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
      // "i" icon -> smooth scroll to the "Ranking Methodology" section (found by heading text, so
      // it keeps working even if that section's id/structure changes)
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
      // Scoped to the section rather than the document: this only needs to notice the site's own
      // re-renders of the filters/copy area, and a document-wide observer would react to every
      // unrelated mutation on the page.
      var observeTarget = document.querySelector(SECTION_SELECTOR);
      if (observeTarget && window.MutationObserver) {
        // Two speeds off one observer: the copy goes back into the site's sentence on the next frame
        // (scheduleCopySync), while the heavier re-assert - sort field, field height, re-rank - stays
        // debounced behind the burst (scheduleRefresh).
        domObserver = new MutationObserver(function () {
          scheduleCopySync();
          scheduleRefresh();
        });
        domObserver.observe(observeTarget, { childList: true, subtree: true });
        // This observer has to live as long as the section does - the site re-renders it on every
        // filter change - so the page going away is the only sound disconnect condition. Without
        // it the observer and its pending timers stay alive in the bfcache. pagehide rather than
        // unload, since unload does not fire reliably and blocks the bfcache outright.
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
      // Hard guard: even if this script (or the waitFor trigger) somehow runs more than once on the
      // same page, only the very first call is allowed to run any of the logic below.
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
      // observeSelector runs its first scan SYNCHRONOUSLY, before it returns. On a page where the
      // filter row and the listings are already present, this callback therefore fires while
      // stopWaitingForReady is still undefined - calling it directly would throw, the outer catch
      // would swallow the throw, and we would be left with the whole-document observer running for
      // the rest of the page's life AND the timeout below never registered. Flagging the hit and
      // cleaning up immediately after the assignment covers both the sync and the async path.
      var stopWaitingForReady = null;
      var readyFired = false;
      stopWaitingForReady = observeSelector(SECTION_SELECTOR + " " + FILTERS_FIELDS_SELECTOR, function () {
        if (readyFired || getListingItems().length === 0) return;
        readyFired = true;
        init();
        if (stopWaitingForReady) stopWaitingForReady();
      });
      if (readyFired && stopWaitingForReady) stopWaitingForReady();
      // Safety net: observeSelector has no built-in timeout, unlike the old waitFor(). If our
      // selectors ever stop matching (markup change, wrong page, etc.) this would otherwise leave a
      // whole-document attributes+childList+subtree MutationObserver running for the entire page
      // lifetime, reacting to every unrelated mutation forever. Cap it at 25s, same as before.
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
