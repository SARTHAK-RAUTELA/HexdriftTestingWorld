(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-269-control";

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

    function addClass(selector, className) {
      var elements = document.querySelectorAll(selector);
      elements.forEach(function (element) {
        element.classList.add(className);
      });
    }

    /* Variation functions */

    /* Convert goals: one per benefit + one for any benefit */
    function getCleanText(element) {
      return element.innerHTML
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }

    function triggerBenefitGoals(text) {
      var goals = [
        { text: "120-night risk-free trial", id: "100334659" },
        { text: "free shipping and returns", id: "100334660" },
        { text: "lifetime warranty", id: "100334662" },
        { text: "financing available", id: "100334666" },
      ];
      var anyBenefitGoalId = "100334667";

      window._conv_q = window._conv_q || [];
      window._conv_q.push(["triggerConversion", anyBenefitGoalId]);

      goals.forEach(function (goal) {
        if (text === goal.text) {
          window._conv_q.push(["triggerConversion", goal.id]);
        }
      });
    }

    function bindEvents() {
      if (window.cre_269_events_bound) return;
      window.cre_269_events_bound = true;

      document.addEventListener(
        "mousedown",
        function (e) {
          var benefit = e.target.closest(".order__benefit");
          if (!benefit) return;

          var title = benefit.querySelector(".order__benefit-title");
          triggerBenefitGoals(getCleanText(title || benefit));
        },
        true,
      );
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains(variation_name)) return;
      addClass("body", variation_name);
      bindEvents();
    }

    /* Initialise variation */
    waitForElement(".order__benefits", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test" + variation_name);
  }
})();