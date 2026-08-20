(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-262";

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

    function addElement() {
      var html = `<div class="animated_text-scroll-wrapper cre-t-262-container">
  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-1">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/moon-new.svg" alt="120 Night Home Trial icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>120-Night Trial</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-2">
    <div class="benefit-image">
      <img src="https://v2.crocdn.com/Winkbed/Win262/location.svg" alt="100+ Showrooms Nationwide" width="100%" height="100%" />
    </div>
    <div class="benefit-content">
      <p>100+ Showrooms</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-3">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/truck-right-new.svg" alt="Free Shipping Icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Free Shipping &amp; Returns</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-4">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/shield-new.svg" alt="Lifetime Warranty icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Lifetime Warranty</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-5">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/start.svg" alt="Rating Icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Rated 4.8 stars</p>
    </div>
  </div>
  <div class="benefit-content-inside animated_text-scroll-title cre-t-262-section-6">
    <div class="benefit-image">
      <img src="https://v2.crocdn.com/Winkbed/Win262/home.svg" alt="Handmade in the USA icon" width="100%" height="100%" />
    </div>
    <div class="benefit-content">
      <p>Made in the U.S.A.</p>
    </div>
  </div>
</div>

`;

      if (!document.querySelector(".cre-t-262-container")) {
        document.querySelector(".animated_text-scroll").insertAdjacentHTML("beforeend", html);
      }
    }

    function customGoal() {
      window._conv_q = window._conv_q || [];

      const anyBenefitGoalId = "100334334";

      const benefitGoals = [
        {
          text: "rated 4.8 stars",
          goalId: "100334327",
        },
        {
          text: "made in the u.s.a.",
          goalId: "100334328",
        },
        {
          text: "120-night trial",
          goalId: "100334329",
        },
        {
          text: "free shipping & returns",
          goalId: "100334330",
        },
        {
          text: "lifetime warranty",
          goalId: "100334331",
        },
        {
          text: "financing available",
          goalId: "100334332",
        },
        {
          text: "100+ showrooms",
          goalId: "100334333",
        },
      ];

      live(".benefit-content-inside", "click", function (e) {
        const benefit = e.target.closest(".benefit-content-inside");

        if (!benefit) return;

        const benefitName = benefit
          .querySelector(".benefit-content p")
          ?.textContent.replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        if (!benefitName) return;

        console.log("Benefit clicked:", benefitName);

        // Fire "Clicks on any Benefit"
        window._conv_q.push(["triggerConversion", anyBenefitGoalId]);

        const matchedGoal = benefitGoals.find(function ({ text }) {
          return benefitName.includes(text);
        });

        if (matchedGoal) {
          console.log(`Conversion triggered: "${benefitName}" — Goal ID: ${matchedGoal.goalId}`);

          window._conv_q.push(["triggerConversion", matchedGoal.goalId]);
        } else {
          console.warn("No matching goal found for:", benefitName);
        }
      });
    }

    /* Initialize variation */
    function init() {
      // Add the variation class to the body
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);
      addElement();

      if (!window.cre_262_custom) {
        window.cre_262_custom = true;
        customGoal();
      }
    }

    /* Wait for element to load and initialize */
    waitForElement(".animated_text-scroll", init, 25, 25000);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();