(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-272";

    /* control anchor — the order form the HSA/FSA line is appended into */
    var orderFormSelector = "#orderForm";

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

    function append(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.appendChild(html);
      }
    }

    /* Variation functions */

    var hsaEligibilityMarkup = `<div class="cre-t-272-container">
      <div class="cre-t-272-hsa-text">
        <span class="cre-t-272-hsa-label">HSA/FSA eligible </span>
        <span class="cre-t-272-hsa-with">with</span>
        <span class="cre-t-272-hsa-logo-wrapper">
          <img class="cre-t-272-hsa-logo" src="https://v2.crocdn.com/Winkbed/WIN272/Truemed%20Logo%202.svg" alt="Truemed">
        </span>
      </div>
    </div>`;

    function addHsaEligibilityLine() {
      if (document.querySelector(".cre-t-272-container")) return;
      append(orderFormSelector, hsaEligibilityMarkup);
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);

      addHsaEligibilityLine();
    }

    /* Initialise variation */
    waitForElement(orderFormSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();