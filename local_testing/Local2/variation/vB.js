(function () {
  var variation_name = "cre-t-151";
  var debug = 1;
  try {
    /* ---- Sort-feature config (edit these selectors if the markup changes) ---- */
    var SECTION_SELECTOR = "#comparison-section";
    var REPEATER_SELECTOR = ".plan-repeater";
    var LISTING_ITEM_SELECTOR = '[data-unique$="-Listing-Only"]'; // each provider block
    var BEST_OVERALL_MARKER = ".best-overall-bubble"; // marks the pinned card that must never be sorted
    var FILTERS_ROW_SELECTOR = ".filter-options"; // pet-type tabs + breed + zip row
    var FILTERS_FIELDS_SELECTOR = ".filter-options .additional-filters"; // breed + zip group; sort field goes here
    var SITE_COPY_PREFIX = "showing prices for"; // existing line we append our copy to
    var ZIP_INPUT_SELECTOR = ".zip-textinput input";
    var ZIP_SHORT_PLACEHOLDER = "ZIP code"; // shortened on mobile so 3 fields fit one row
    var ZIP_SHORT_MAX_WIDTH = 767;
    var FIELD_HEIGHT_REF_SELECTOR = ".zip-textinput .MuiInputBase-root, .breed-select .MuiInputBase-root";
    var BEST_OVERALL_DEFAULT_LABEL = "Best Overall";
    var BEST_OVERALL_LOWEST_PRICE_LABEL = "Lowest Price";
    var DEFAULT_SORT_MODE = "best-rated"; // what the page should show on first load
    var LABELS = { "best-rated": "Best Rated", "lowest-price": "Lowest Price" };
    var COPY_LABELS = { "best-rated": "best rated", "lowest-price": "lowest price" };

    /* ---- state ---- */
    var currentMode = DEFAULT_SORT_MODE;
    var originalOrder = []; // sortable listings only, in the order the site rendered them
    var knownItems = []; // every listing block seen for the current render (incl. the pinned card)
    var sortAnchor = null; // node the sorted items are inserted before, so "Show More" + pinned card stay put
    var bestOverallBadge = null; // badge on the pinned card - its text swaps with the active mode
    var copyEl = null; // our "Sorted by ___" copy + "i" icon
    var originalZipPlaceholder = null;
    var sortAnimationTimeouts = []; // pending timeout IDs for the in-flight sort animation
    var refreshTimer = null;
    var resizeTimer = null;
    var isApplying = false; // true while we are the ones mutating the DOM

    /* all Pure helper functions */
    function waitFor(check, trigger, delayInterval, delayTimeout) {
      delayInterval = delayInterval || 50;
      delayTimeout = delayTimeout || 25000;
      if (check()) {
        trigger();
        return;
      }
      var interval = setInterval(function () {
        if (check()) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }
    /**
     * Event delegation - Listen for events on dynamically added elements
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
     * Adds a CSS class to an element
     */
    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\\b" + className + "\\b"))) {
        element.className += " " + className;
      }
    }
    /**
     * Removes a CSS class from an element
     */
    function removeClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.remove(className);
      else element.className = element.className.replace(new RegExp("\\b" + className + "\\b", "g"), "");
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

    /* ---- Sort-feature logic ---- */
    // Pulls the numeric price out of the "Average Plan Cost" column, e.g. "$23.44/mo" -> 23.44
    function getPrice(item) {
      var columns = item.querySelectorAll(".plan-detail-column");
      for (var i = 0; i < columns.length; i++) {
        var heading = columns[i].querySelector(".plan-detail-heading");
        if (heading && heading.textContent.trim().toLowerCase().indexOf("average plan cost") !== -1) {
          var contentEl = columns[i].querySelector(".plan-detail-content");
          if (contentEl) {
            var match = contentEl.textContent.replace(/,/g, "").match(/[\d.]+/);
            return match ? parseFloat(match[0]) : Infinity;
          }
        }
      }
      return Infinity;
    }
    // Finds a leaf element inside `scope` whose exact text matches one of the given labels
    // (case-insensitive). Fallback for locating the pinned card's badge without relying on a class.
    function findBadgeByText(scope, labels) {
      if (!scope) return null;
      var candidates = scope.querySelectorAll("*");
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (el.children.length > 0) continue; // only leaf nodes hold the label text directly
        var text = el.textContent.trim().toLowerCase();
        for (var j = 0; j < labels.length; j++) {
          if (text === labels[j].toLowerCase()) return el;
        }
      }
      return null;
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
    // The listing blocks currently rendered. Direct children of the repeater only, so nested markup
    // carrying the same data-unique value can never be picked up twice.
    function getListingItems() {
      var repeater = document.querySelector(SECTION_SELECTOR + " " + REPEATER_SELECTOR);
      if (!repeater) return [];
      return Array.prototype.filter.call(repeater.children, function (el) {
        return el.matches && el.matches(LISTING_ITEM_SELECTOR);
      });
    }
    // Snapshots the site's own (best-rated) order. Runs on first load and again every time the
    // pet-type / breed / zip filters re-render the list, since the old element references die then.
    function captureOrder(items) {
      knownItems = items.slice();
      originalOrder = [];
      var bestOverallCard = null;
      items.forEach(function (el) {
        if (el.querySelector(BEST_OVERALL_MARKER)) bestOverallCard = el;
        else originalOrder.push(el);
      });
      // Sorted items get inserted before whatever directly follows the last sortable listing -
      // usually the "Show More" link, then the pinned card. Appending instead would drag the
      // sorted items past both of them.
      sortAnchor = originalOrder.length ? originalOrder[originalOrder.length - 1].nextSibling : null;
      bestOverallBadge = bestOverallCard
        ? bestOverallCard.querySelector(".best-overall-text") ||
          findBadgeByText(bestOverallCard, [BEST_OVERALL_DEFAULT_LABEL, BEST_OVERALL_LOWEST_PRICE_LABEL])
        : null;
    }
    // Moves the listings into the requested order and renumbers the rank bubbles.
    function reorder(mode) {
      var container = originalOrder[0].parentElement;
      if (!container) return;
      var ordered;
      if (mode === "lowest-price") {
        ordered = originalOrder.slice().sort(function (a, b) {
          return getPrice(a) - getPrice(b);
        });
      } else {
        ordered = originalOrder.slice();
      }
      // Only use the anchor if it is still actually inside this container - otherwise insertBefore
      // would throw and the cleanup in applySort() would never run.
      var anchor = sortAnchor && sortAnchor.parentNode === container ? sortAnchor : null;
      ordered.forEach(function (item, index) {
        if (anchor) container.insertBefore(item, anchor);
        else container.appendChild(item);
        var bubble = item.querySelector(".plan-number");
        if (bubble) bubble.textContent = index + 1;
      });
      if (bestOverallBadge) {
        bestOverallBadge.textContent =
          mode === "lowest-price" ? BEST_OVERALL_LOWEST_PRICE_LABEL : BEST_OVERALL_DEFAULT_LABEL;
      }
    }
    // Re-orders the listings. `instant` skips the fade - used right after a filter re-render, where
    // the site has already animated and we only need the new list to come back correctly ordered.
    function applySort(mode, instant) {
      if (!originalOrder.length) return;
      var container = originalOrder[0].parentElement;
      if (!container) return;

      // If a previous sort animation is still in flight (e.g. the default sort on load overlapping
      // with a fast user click), cancel its pending timeouts and reset the classes synchronously
      // first. Without this, two overlapping animations could leave "rt-sorting" (opacity: 0)
      // applied with no matching cleanup ever running.
      sortAnimationTimeouts.forEach(function (id) {
        clearTimeout(id);
      });
      sortAnimationTimeouts = [];
      removeClass(container, "rt-sorting");
      removeClass(container, "rt-sorted-in");

      if (instant) {
        isApplying = true;
        try {
          reorder(mode);
        } catch (instantError) {
          if (debug) console.log(instantError, "error while sorting in " + variation_name);
        } finally {
          isApplying = false;
        }
        return;
      }

      addClass(container, "rt-sorting");
      var sortTimeoutId = setTimeout(function () {
        // Wrapped in try/finally so that even if reorder() throws (e.g. a stale anchor reference),
        // "rt-sorting" always gets removed - otherwise the cards stay at opacity: 0 forever.
        isApplying = true;
        try {
          reorder(mode);
        } catch (sortError) {
          if (debug) console.log(sortError, "error while sorting in " + variation_name);
        } finally {
          isApplying = false;
          removeClass(container, "rt-sorting");
          addClass(container, "rt-sorted-in");
          var fadeTimeoutId = setTimeout(function () {
            removeClass(container, "rt-sorted-in");
          }, 400);
          sortAnimationTimeouts.push(fadeTimeoutId);
        }
      }, 220); // matches the fade-out duration in the CSS
      sortAnimationTimeouts.push(sortTimeoutId);
    }
    // Applies a chosen option: updates checkmark/label, closes menu, updates copy, re-sorts
    function selectSortOption(mode) {
      if (!LABELS[mode]) mode = DEFAULT_SORT_MODE;
      currentMode = mode;
      var options = document.querySelectorAll(".rt-sort-option");
      Array.prototype.forEach.call(options, function (opt) {
        var isSelected = opt.getAttribute("data-value") === mode;
        opt.classList.toggle("is-selected", isSelected);
        opt.setAttribute("aria-selected", String(isSelected));
      });
      var valueEl = document.querySelector(".rt-sort-toggle-value");
      if (valueEl) valueEl.textContent = LABELS[mode];
      closeMenu();
      updateSortCopy(mode);
      applySort(mode, false);
    }
    function closeMenu() {
      var dropdown = document.getElementById("rt-sort-dropdown");
      if (dropdown) dropdown.classList.remove("is-open");
      var toggle = document.getElementById("rt-sort-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    // Updates the "Sorted by ___" copy
    function updateSortCopy(mode) {
      var valueEl = document.querySelector(".rt-sort-value");
      if (valueEl) valueEl.textContent = COPY_LABELS[mode] || COPY_LABELS[DEFAULT_SORT_MODE];
    }

    /* ---- injection / DOM sync ---- */
    // Builds the sort pill. Styled in CSS to match the existing breed / zip filter fields.
    function buildSortField() {
      var wrap = document.createElement("div");
      wrap.className = "rt-sort-dropdown";
      wrap.id = "rt-sort-dropdown";
      wrap.innerHTML = [
        '<button type="button" class="rt-sort-toggle" id="rt-sort-toggle" aria-haspopup="listbox" aria-expanded="false">',
        '<span class="rt-sort-toggle-label">Sort by:</span>',
        '<span class="rt-sort-toggle-value">' + LABELS[DEFAULT_SORT_MODE] + "</span>",
        '<svg class="rt-sort-caret" focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>',
        "</button>",
        // NOTE: the open menu deliberately shows only the two values - no "Sort by:" prefix - per spec.
        '<ul class="rt-sort-menu" role="listbox" aria-label="Sort plans">',
        '<li class="rt-sort-option is-selected" role="option" data-value="best-rated" aria-selected="true">',
        '<span class="rt-sort-check">&#10003;</span>Best Rated</li>',
        '<li class="rt-sort-option" role="option" data-value="lowest-price" aria-selected="false">',
        '<span class="rt-sort-check">&#10003;</span>Lowest Price</li>',
        "</ul>"
      ].join("");
      return wrap;
    }
    function ensureSortField() {
      var fields = document.querySelector(SECTION_SELECTOR + " " + FILTERS_FIELDS_SELECTOR);
      if (!fields) return;
      var existing = document.getElementById("rt-sort-dropdown");
      if (existing && existing.parentElement === fields) return;
      if (!existing) existing = buildSortField();
      fields.appendChild(existing);
    }
    // Our copy fragment. The "i" icon is an inline SVG rather than a <use> reference or a hosted
    // asset, so it can never go missing if the site's sprite or a CDN path changes.
    function buildCopy() {
      var el = document.createElement("span");
      el.className = "rt-sort-copy";
      el.id = "rt-sort-copy";
      el.innerHTML = [
        '<span class="rt-sort-copy-sep">.</span> Sorted by ',
        '<strong class="rt-sort-value">' + COPY_LABELS[DEFAULT_SORT_MODE] + "</strong>.",
        '<button type="button" class="rt-sort-tooltip" data-rt-tooltip aria-label="View ranking methodology">',
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"></path>',
        '<path d="M12 10a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1Zm0-3.3a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"></path>',
        "</svg></button>"
      ].join("");
      return el;
    }
    // The site prints "Showing prices for Cats" / "Showing prices for Devon Rexs in 90210" under
    // the filters, but only once a filter is active. Returns the deepest element holding that copy -
    // querySelectorAll is in document order, so the last match is the innermost one.
    function findSiteCopyLine() {
      var scope = document.querySelector(SECTION_SELECTOR) || document.body;
      var nodes = scope.querySelectorAll("div, p, span");
      var match = null;
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.id === "rt-sort-copy" || el.closest("#rt-sort-copy")) continue;
        if ((el.textContent || "").trim().toLowerCase().indexOf(SITE_COPY_PREFIX) !== 0) continue;
        match = el;
      }
      return match;
    }
    // Appends our copy to the site's line ("... in 90210. Sorted by best rated.") when that line
    // exists, otherwise renders it as its own line directly under the filters. React re-renders
    // wipe the appended node, which is why this is re-run from the observer.
    function ensureCopy() {
      if (!copyEl) copyEl = buildCopy();
      var siteLine = findSiteCopyLine();
      if (siteLine) {
        if (copyEl.parentNode !== siteLine) {
          try {
            siteLine.appendChild(copyEl);
          } catch (appendError) {
            if (debug) console.log(appendError, "could not append copy in " + variation_name);
          }
        }
        copyEl.classList.remove("rt-sort-copy--standalone");
      } else {
        var filters = document.querySelector(SECTION_SELECTOR + " " + FILTERS_ROW_SELECTOR);
        if (filters && copyEl.previousElementSibling !== filters) {
          filters.insertAdjacentElement("afterend", copyEl);
        }
        copyEl.classList.add("rt-sort-copy--standalone");
      }
      updateSortCopy(currentMode);
    }
    // Matches the sort pill's height to the real filter fields instead of hardcoding a value.
    function syncFieldHeight() {
      var ref = document.querySelector(SECTION_SELECTOR + " " + FIELD_HEIGHT_REF_SELECTOR);
      if (!ref) return;
      var height = Math.round(ref.getBoundingClientRect().height);
      if (height > 20) document.documentElement.style.setProperty("--rt-sort-field-h", height + "px");
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
    // Re-syncs everything after the React filters swap the listings out.
    function refresh(force) {
      if (isApplying) return;
      ensureSortField();
      ensureCopy();
      syncFieldHeight();
      syncZipPlaceholder();
      var items = getListingItems();
      if (!items.length) return;
      var isFreshRender = !!force || items.length !== knownItems.length;
      if (!isFreshRender) {
        for (var i = 0; i < items.length; i++) {
          if (knownItems.indexOf(items[i]) === -1) {
            isFreshRender = true;
            break;
          }
        }
      }
      if (!isFreshRender) return; // just our own re-ordering - nothing to redo
      captureOrder(items);
      applySort(currentMode, true);
    }
    function scheduleRefresh() {
      if (isApplying) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () {
        refresh(false);
      }, 150);
    }

    function eventListeners() {
      // toggle dropdown open/close
      live("#rt-sort-toggle", "click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dropdown = document.getElementById("rt-sort-dropdown");
        if (!dropdown) return;
        var isOpen = dropdown.classList.contains("is-open");
        dropdown.classList.toggle("is-open", !isOpen);
        this.setAttribute("aria-expanded", String(!isOpen));
      });
      // pick an option
      live(".rt-sort-option", "click", function (e) {
        e.stopPropagation();
        selectSortOption(this.getAttribute("data-value"));
      });
      // click outside closes the menu ("html" matches every click, since every click target's
      // closest("html") is the root element)
      live("html", "click", function (e) {
        var dropdown = document.getElementById("rt-sort-dropdown");
        if (dropdown && dropdown.classList.contains("is-open") && !dropdown.contains(e.target)) {
          closeMenu();
        }
      });
      // Escape closes the menu
      live("html", "keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
      // "i" icon -> smooth scroll to the "Ranking Methodology" section (found by heading text, so
      // it keeps working even if that section's id/structure changes)
      live("[data-rt-tooltip]", "click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScrollTo(findRankingMethodologyTarget());
      });
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          syncFieldHeight();
          syncZipPlaceholder();
        }, 150);
      });
      // The pet-type / breed / zip filters re-render the whole listing list, which detaches every
      // element we captured. Watch the section and re-apply the active sort on each new render.
      var section = document.querySelector(SECTION_SELECTOR);
      if (section && window.MutationObserver) {
        new MutationObserver(scheduleRefresh).observe(section, { childList: true, subtree: true });
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
      ensureSortField();
      ensureCopy();
      syncFieldHeight();
      syncZipPlaceholder();
      refresh(true); // captures the site order and applies the default sort
      if (!window.cre_151_events) {
        window.cre_151_events = true;
        eventListeners();
      }
      if (debug) console.log(variation_name + " initialized");
    }

    waitFor(
      function () {
        return !!document.querySelector(SECTION_SELECTOR + " " + FILTERS_FIELDS_SELECTOR) && getListingItems().length > 0;
      },
      init,
      50,
      25000
    );
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
