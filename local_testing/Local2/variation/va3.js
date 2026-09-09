(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-164";

    /* all Pure helper functions — copied as-is from helpers.js */

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

    function debounce(func, delay = 100) {
      if (typeof func !== "function") return function () { };
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

    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

    /* Variation data */
    var defaultClass = "cre-t-164-default";
    var collapsedClass = "cre-t-164-collapsed";

    /* reuses the native link's own classes + inline visibility attribute for exact visual match */
    var toggleButtonHtml = `<a class="oxy-read-more-link cre-t-164-toggle" href="javascript:void(0)" style="visibility: visible;"><span class="oxy-read-more-link_text cre-t-164-toggle-text" style="visibility: visible;">Show More</span></a>`;

    /* Variation functions */

    function hasActiveFilters() {
      var params = new URLSearchParams(window.location.search);
      if (params.get("petType")) return true;
      if (params.get("breed")) return true;
      if (params.get("zipCode")) return true;
      return false;
    }

    function injectToggleButton() {

      if (hasActiveFilters()) {
        document.body.classList.remove(defaultClass);
        return;
      }

      if (document.querySelector('.cre-t-164-toggle')) return;

      const listContainer = document.querySelector('.plan-repeater[data-unique="comparison-table"]');
      if (!listContainer) return;
      const showMoreButton = listContainer.querySelector('.oxy-read-more-link');
      if (!showMoreButton) return;
      insertAfter(showMoreButton, toggleButtonHtml);

    }

    function clickNativeButton() {

      if (hasActiveFilters()) {
        document.body.classList.remove(defaultClass);
        return;
      }

      const listContainer = document.querySelector('.plan-repeater[data-unique="comparison-table"]');
      if (!listContainer) return;
      listContainer.classList.add(collapsedClass);
      const showMoreButton = listContainer.querySelector('.oxy-read-more-link:not(.cre-t-164-toggle)');
      if (!showMoreButton) return;

      if (showMoreButton.textContent.trim() === "Show More") {
        showMoreButton.click();
      }
    }


    function toggleCollapsedState(toggleElement) {
      var listContainer = document.querySelector('.plan-repeater[data-unique="comparison-table"]');
      if (!listContainer) return;

      var textElement = toggleElement.querySelector(".cre-t-164-toggle-text");

      if (listContainer.classList.contains(collapsedClass)) {
        listContainer.classList.remove(collapsedClass);
        if (textElement) textElement.textContent = "Show Less";
      } else {
        listContainer.classList.add(collapsedClass);
        if (textElement) textElement.textContent = "Show More";
      }
    }


    /* "default" should always land expanded (matching the site's normal fully-expanded state) --
       fires a real click through our own handler rather than setting state directly, so there's
       only one code path that ever changes the collapsed/expanded state */
    function expandIfCollapsed() {
      var listContainer = document.querySelector('.plan-repeater[data-unique="comparison-table"]');
      if (!listContainer) return;

      var toggleElement = listContainer.querySelector(":scope > .cre-t-164-toggle");
      if (!toggleElement) return;

      var textElement = toggleElement.querySelector(".cre-t-164-toggle-text");
      if (!textElement) return;

      if (textElement.textContent === "Show More") {
        toggleElement.click();
      }
    }

    function updateFilterState() {
      if (hasActiveFilters()) {
        document.body.classList.remove(defaultClass);
      } else {
        document.body.classList.add(defaultClass);
        // expandIfCollapsed();
      }
    }

    /* "for now" per your instruction — a MutationObserver on the results container would be more robust
       (catches the actual DOM change regardless of which control the user touched), happy to swap this
       in if the listeners below miss a filter path */
    function eventListeners() {
      if (window.cre_164_filter_listeners_bound) return;
      window.cre_164_filter_listeners_bound = true;

      var debouncedUpdate = debounce(function () {
        injectToggleButton();
        clickNativeButton();
        updateFilterState();
      }, 300);

      let listenerInterval = null;

      live(".oxy-tab", "click", function () {
        if (listenerInterval) clearTimeout(listenerInterval);
        listenerInterval = setInterval(() => {
          debouncedUpdate();
        }, 250);

        setTimeout(() => {
          if (listenerInterval) clearTimeout(listenerInterval);
        }, 1000);
      });

      live(".breed-select", "click", function () {
        if (listenerInterval) clearTimeout(listenerInterval);
        listenerInterval = setInterval(() => {
          debouncedUpdate();
        }, 250);

        setTimeout(() => {
          if (listenerInterval) clearTimeout(listenerInterval);
        }, 1000);
      });

      live(".zip-textinput input", "change", function () {
        if (listenerInterval) clearTimeout(listenerInterval);
        listenerInterval = setInterval(() => {
          debouncedUpdate();
        }, 250);

        setTimeout(() => {
          if (listenerInterval) clearTimeout(listenerInterval);
        }, 1000);
      });


      live(".cre-t-164-toggle", "click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleCollapsedState(this);
      });

    }

    /* Variation Init */
    function init() {

      const interval = setInterval(() => {
        injectToggleButton();
        clickNativeButton();
      }, 250);
      setTimeout(() => {
        clearInterval(interval);
      }, 3000);


      eventListeners();
      updateFilterState();
    }

    /* Initialise variation */
    waitForElement('.plan-repeater[data-unique="comparison-table"]', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();