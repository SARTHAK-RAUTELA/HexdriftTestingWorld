function(convertContext){ 
(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-291-d";

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

    /* build the 6 benefit links from one list of data */
    function getBenefitHtml(benefit, index) {
      return `<div role="listitem" class="cre-t-291-item cre-t-291-item-${index + 1}">
        <div class="cre-t-291-link-container">
          <div class="cre-t-291-link" data-cre-target="${benefit.target}">
            <span class="cre-t-291-icon-container"><img class="cre-t-291-icon" src="${benefit.icon}" alt="${benefit.alt}" height="24" /></span>
            <span class="cre-t-291-text">${benefit.text}</span>
          </div>
        </div>
      </div>`;
    }

    function addBenefits() {
      if (document.querySelector(".cre-t-291-container")) return;

      var benefits = [
        {
          target: "trial",
          text: "365-Night Home Trial",
          alt: "365 night home trial icon",
          icon: "https://v2.crocdn.com/Winkbed/Win262/moon-new.svg",
        },
        {
          target: "shipping",
          text: "Free Shipping &amp; Returns",
          alt: "Free shipping and returns icon",
          icon: "https://v2.crocdn.com/Winkbed/Win262/truck-right-new.svg",
        },
        { target: "showrooms", text: "150+ Showrooms", alt: "150+ showrooms icon", icon: "https://v2.crocdn.com/Winkbed/Win262/location.svg" },
        { target: "warranty", text: "Lifetime Warranty", alt: "Lifetime warranty icon", icon: "https://v2.crocdn.com/Winkbed/Win262/shield-new.svg" },
        { target: "usa", text: "Handmade in the U.S.A.", alt: "Handmade in the U.S.A. icon", icon: "https://v2.crocdn.com/Winkbed/test269/homeFinal.svg" },
        { target: "rating", text: "Rated 4.8 stars", alt: "Rated 4.8 stars icon", icon: "https://v2.crocdn.com/Winkbed/Win262/start.svg" },
      ];

      var benefitsHtml = "";
      benefits.forEach(function (benefit, index) {
        benefitsHtml += getBenefitHtml(benefit, index);
      });

      var html = `<div class="cre-t-291-container">
        <div class="cre-t-291-wrapper">
          <div role="list" class="cre-t-291-main">${benefitsHtml}</div>
        </div>
      </div>`;

      var benefitsSection = document.querySelector(".order__benefits");
      if (!benefitsSection) return;
      benefitsSection.insertAdjacentHTML("afterbegin", html);
    }

    /* Convert goals: one per benefit + one for any benefit (click tracking only, the benefits are not links) */
    function triggerBenefitGoals(target) {
      var goalIds = {
        rating: "100334805",
        usa: "100334804",
        trial: "100334790",
        shipping: "100334791",
        warranty: "100334793",
        showrooms: "100334792",
      };
      var anyBenefitGoalId = "100334789";

      window._conv_q = window._conv_q || [];
      window._conv_q.push(["triggerConversion", anyBenefitGoalId]);

      if (goalIds[target]) {
        window._conv_q.push(["triggerConversion", goalIds[target]]);
      }

      console.log("[cre-291] benefit clicked:", target, "| any-benefit goal:", anyBenefitGoalId, "| goal:", goalIds[target] || "NOT FOUND", "| _conv_q:", window._conv_q);
    }

    function bindEvents() {
      if (window.cre_291_d_events_bound) return;
      window.cre_291_d_events_bound = true;

      document.addEventListener("click", function (e) {
        var item = e.target.closest(".cre-t-291-link");
        if (!item) return;
        triggerBenefitGoals(item.getAttribute("data-cre-target"));
      });
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains(variation_name)) return;
      addClass("body", variation_name);
      addBenefits();
      bindEvents();
    }

    /* Initialise variation */
    waitForElement(".order__benefits", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test" + variation_name);
  }
})();
}