function(convertContext){ 
(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = 'cre-t-255';


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


    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

    

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }

    var tabContentHtml = `<div class="cre-t-255-wrapper">
          <div class="cre-t-255-main-subHeader">
            Our most popular model, designed to exceed the performance of the finest luxury hotel mattresses.
          </div>
          <div class="cre-t-255-customer-chosen-copy">
            Chosen by 74% of customers
          </div>
        </div>`;

    function updateSubHeader(parentSelector) {
      var subHeaderSelector = parentSelector + ' div.winkbed-construction__content-bottom-main-item-top-left-sub-header';
      waitForElement(
        subHeaderSelector,
        function () {
          var luxuryFirmSubHeader = document.querySelector(subHeaderSelector);
          var alreadyExist = document.querySelector(parentSelector + ' .cre-t-255-wrapper');
          
          if (!alreadyExist && luxuryFirmSubHeader) {
            insertAfter(luxuryFirmSubHeader, tabContentHtml);
          }
        },
        25,
        25000
      );
    }

    /* Variation functions */

    /* Variation Init */
    function init() {
      addClass('body', variation_name);
      updateSubHeader('[data-attribute="Luxury Firm"]');
      updateSubHeader('[mobile-data-attribute="Luxury Firm"]');

      if (debug) console.log(variation_name + ' initialized');
    }

    /* Initialise variation */
    waitForElement(
      '.winkbed-construction__content-section',
      init,
      50,
      15000
    );
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();
}