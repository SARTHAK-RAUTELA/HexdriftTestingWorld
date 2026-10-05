(function () {
  try {
        var debug = 1;
    var variation_name = "cre-t-282";

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
      var html = `<div class="animated_text-scroll-wrapper cre-t-282-container">
  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-1" data-cre-target="trial">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/moon-new.svg" alt="120 Night Home Trial icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>120-Night Trial</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-2" data-cre-target="showrooms">
    <div class="benefit-image">
      <img src="https://v2.crocdn.com/Winkbed/Win262/location.svg" alt="100+ Showrooms Nationwide" width="100%" height="100%" />
    </div>
    <div class="benefit-content">
      <p>100+ Showrooms</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-3" data-cre-target="shipping">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/truck-right-new.svg" alt="Free Shipping Icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Free Shipping &amp; Returns</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-4" data-cre-target="warranty">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/shield-new.svg" alt="Lifetime Warranty icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Lifetime Warranty</p>
    </div>
  </div>

  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-5" data-cre-target="rating">
    <div class="benefit-image"><img src="https://v2.crocdn.com/Winkbed/Win262/start.svg" alt="Rating Icon" width="100%" height="100%" /></div>
    <div class="benefit-content">
      <p>Rated 4.8 stars</p>
    </div>
  </div>
  <div class="benefit-content-inside animated_text-scroll-title cre-t-282-section-6" data-cre-target="usa">
    <div class="benefit-image">
      <img src="https://v2.crocdn.com/Winkbed/Win262/home.svg" alt="Handmade in the USA icon" width="100%" height="100%" />
    </div>
    <div class="benefit-content">
      <p>Made in the U.S.A.</p>
    </div>
  </div>
</div>

`;

      if (!document.querySelector(".cre-t-282-container")) {
        document.querySelector(".animated_text-scroll").insertAdjacentHTML("beforeend", html);
      }
    }

        var scrollOffset = 160;

    function firstVisible(selectors) {
      for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        if (el && el.getBoundingClientRect().height > 0) return el;
      }
      return null;
    }

    function scrollToEl(el, offset) {
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - (offset === undefined ? scrollOffset : offset),
        behavior: "smooth",
      });
    }

    function findConcertina(text) {
      var titles = document.querySelectorAll("#faq-content .concertina__title");
      for (var i = 0; i < titles.length; i++) {
        if (titles[i].textContent.trim().toLowerCase().indexOf(text) === 0) return titles[i];
      }
      return null;
    }

        function openFaq(text, done) {
      var title = findConcertina(text);
      if (!title) return done(document.querySelector("#shopify-section-faq-content"));

      var panel = title.closest(".faq__panel");
      if (panel && !panel.classList.contains("current")) {
        var cats = document.querySelectorAll("#faq-content .faq__cat");
        for (var i = 0; i < cats.length; i++) {
          if (cats[i].textContent === panel.getAttribute("data-cat")) {
            cats[i].click();
            break;
          }
        }
                if (!panel.classList.contains("current")) {
          document.querySelectorAll("#faq-content .faq__panel, #faq-content .faq__cat").forEach(function (el) {
            el.classList.remove("current");
          });
          panel.classList.add("current");
        }
      }

      var item = title.closest(".concertina");
      if (item) item.classList.add("concertina--open");

            setTimeout(function () {
        done(title);
      }, 350);
    }

    function getTarget(key) {
      switch (key) {
        case "rating":
          return firstVisible(["#shopify-section-testimonials", "#shopify-section-winkbed-featured-review", "#yotpo-reviews"]);
        case "usa":
          return document.querySelector("#shopify-section-shop-hi-touch");
        case "trial":
          return document.querySelector("#shopify-section-shop-the-winkbed-warranty");
        case "warranty":
          return document.querySelector("#shopify-section-shop-promise");
        case "shipping":
          return findConcertina("can i return or exchange") || document.querySelector("#shopify-section-faq-content");
        case "showrooms":
                    return (
            firstVisible(["#shopify-section-shop-frames", "#shopify-section-locations", "[id*='store-locator']", "[id*='showroom']", "[class*='showroom']"]) ||
            document.querySelector("#shopify-section-faq-content")
          );
      }
    }

    function smoothScrollClicks() {
      live(".cre-t-282-container .benefit-content-inside", "click", function () {
        var key = this.getAttribute("data-cre-target");

        if (key === "shipping") {
          openFaq("can i return or exchange", function (target) {
            scrollToEl(target);
          });
          return;
        }

        if (key === "showrooms") {
                    var goShowrooms = function () {
            var el = document.querySelector("#shopify-section-shop-frames") || getTarget(key);
            if (!el) return;
            var bottomY = function () {
                            return Math.round(el.getBoundingClientRect().bottom + window.pageYOffset - 100);
            };
                        window.scrollTo({ top: bottomY(), behavior: "smooth" });
            var settle = function (n) {
              var y = bottomY();
              if (Math.abs(window.pageYOffset - y) <= 5) return;
              if (n === 0) return;
                            setTimeout(function () {
                if (Math.abs(window.pageYOffset - bottomY()) > 5 && n === 1) {
                  window.scrollTo({ top: bottomY(), behavior: "smooth" });
                }
                settle(n - 1);
              }, 600);
            };
            setTimeout(function () {
              settle(1);
            }, 900);
          };
          setTimeout(goShowrooms, 250);
          return;
        }

        var target = getTarget(key);
        setTimeout(function () {
          scrollToEl(target);
        }, 250);
      });
    }

    function customGoal() {
      window._conv_q = window._conv_q || [];

      const anyBenefitGoalId = "100334595";

      const benefitGoals = [
        {
          text: "rated 4.8 stars",
          goalId: "100334588",
        },
        {
          text: "made in the u.s.a.",
          goalId: "100334589",
        },
        {
          text: "120-night trial",
          goalId: "100334590",
        },
        {
          text: "free shipping & returns",
          goalId: "100334591",
        },
        {
          text: "lifetime warranty",
          goalId: "100334592",
        },
        {
          text: "financing available",
          goalId: "100334593",
        },
        {
          text: "100+ showrooms",
          goalId: "100334594",
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

        function init() {
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);
      addElement();

      if (!window.cre_282_custom) {
        window.cre_282_custom = true;
        customGoal();
        smoothScrollClicks();
      }
    }

        waitForElement(".animated_text-scroll", init, 25, 25000);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();