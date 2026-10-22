function(convertContext){ 
(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-166-goal";

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


    function eventHandler() {
      console.log("eventHandler");
      // SWF166 - Outbound clicks on Lemonade
      // [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] [data-unique="outbound-partner-see-plans-button"]
      live('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] > .plan-box, [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] .rating-bar, [data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] > .plan-box', "mousedown", function () {
        console.log("SWF166 - Outbound clicks on Lemonade");
        window._conv_q = window._conv_q || [];  
        _conv_q.push(["triggerConversion", "100038330"]);
      });

      // SWF166 - Outbound clicks on Liberty Mutual
      // [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] [data-unique="outbound-partner-see-plans-button"]
       live('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] > .plan-box, [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .rating-bar, [data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] > .plan-box','.button.Liberty_Mutual.rt-aff-link', "mousedown", function () {
        console.log("SWF166 - Outbound clicks on Liberty Mutual");
        window._conv_q = window._conv_q || [];  
        _conv_q.push(["triggerConversion", "100038331"]);
      });
    }
    /* Variation functions */

    /* Variation Init */
    function init() {
      if (!window.cre166FEventHandlerGoal) {
          window.cre166FEventHandlerGoal = true;
        eventHandler();
      }
      if (debug) console.log(variation_name + " initialized");
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}
////
