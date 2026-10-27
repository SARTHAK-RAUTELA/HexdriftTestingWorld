function(convertContext){ 
(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-270";

    var config = {
      // WIN-255: Luxury Firm panel copy (desktop tab content + mobile accordion)
      luxuryFirmItems: ['[data-attribute="Luxury Firm"]', '[mobile-data-attribute="Luxury Firm"]'],
    };

    var luxuryFirmCopyHTML = `<div class="cre-t-255-wrapper">
      <div class="cre-t-255-main-subHeader">
        Our most popular model, designed to exceed the performance of the finest luxury hotel mattresses.
      </div>
      <div class="cre-t-255-customer-chosen-copy">
        Chosen by 74% of customers
      </div>
    </div>`;

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

    /* =====================================================================
       LUXURY FIRM COPY (WIN-255) - new sub-header + "Chosen by 74% of customers"
       ===================================================================== */

    // Adds the new copy after the original sub-header (hidden via CSS once ours is in, R6)
    function addLuxuryFirmCopy(item) {
      if (!item || item.querySelector(".cre-t-255-wrapper")) return;
      var subHeader = item.querySelector("div.winkbed-construction__content-bottom-main-item-top-left-sub-header");
      if (!subHeader) return;
      subHeader.insertAdjacentHTML("afterend", luxuryFirmCopyHTML);
      item.classList.add(variation_name + "-lf-updated");
    }

    function initLuxuryFirmCopy() {
      config.luxuryFirmItems.forEach(function (itemSelector) {
        waitForElement(
          itemSelector + " div.winkbed-construction__content-bottom-main-item-top-left-sub-header",
          function (subHeader) {
            addLuxuryFirmCopy(subHeader.closest(itemSelector));
          },
          25,
          25000
        );
      });
    }

    function init() {
      document.body.classList.add(variation_name);
      waitForElement(".winkbed-construction__content-section", initLuxuryFirmCopy);
    }

    /* Initialize control */
    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}