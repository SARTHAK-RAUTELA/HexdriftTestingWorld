(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-128";

    /* all Pure helper functions */

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

    function insertBefore(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforebegin", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforebegin", html);
      }
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

    function goalEvent() {
      // This function will fire the goal event for all the filter elements
      live(".filter-options .oxy-tabs .oxy-tab", "mousedown", function (event) {
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037760"]);
      });

      // Specifically track clicks on the breed dropdown
      live("#breed-select", "mousedown", function (event) {
        var dogsTabElement = document.querySelector(".filter-options .oxy-tabs .oxy-tab:nth-child(3)");
        var catsTabElement = document.querySelector(".filter-options .oxy-tabs .oxy-tab:nth-child(2)");
        var isCatsTabActive = catsTabElement && catsTabElement.className.includes("tab-active");
        var isDogsTabActive = dogsTabElement && dogsTabElement.className.includes("tab-active");

        if (!(isCatsTabActive || isDogsTabActive)) return;

        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037760"]);
      });

      // Specifically track clicks on the ZIP code field
      live('[placeholder="Enter Zip Code"]', "mousedown", function (event) {
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037760"]);
      });
    }

    var iconTextHTML = `<div class="cre-t-128-icon-text-wrapper">
    <div class="cre-t-128-icon-wrapper">
    <img src="https://v2.crocdn.com/SwiftTest/test128/filter.svg" alt="Filter Icon" class="cre-t-128-filter-icon" />
    </div>
    <div class="cre-t-128-icon-text">Customize results for your pet</div>
    </div>`;

    function addIconText() {
      var existingElement = document.querySelector(".cre-t-128-icon-text-wrapper");
      var filterOptionsElement = document.querySelector("#comparison-section .filter-options");
      if (!existingElement) {
        insertBefore(filterOptionsElement, iconTextHTML);
      }
    }

    /* Variation Init */
    function init() {
      addIconText();
      if (!window.creT128GoalFired) {
        window.creT128GoalFired = true;
        goalEvent();
      }
      if (debug) console.log(variation_name + " initialized");
    }

    /* Initialise variation */
    waitForElement("#comparison-section .filter-options", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();