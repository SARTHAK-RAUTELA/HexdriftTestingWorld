(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-269-d";
    var scrollOffset = 160;

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
      return `<div role="listitem" class="cre-t-269-item cre-t-269-item-${index + 1}">
        <div class="cre-t-269-link-container">
          <a href="${benefit.href}" class="cre-t-269-link" data-cre-target="${benefit.target}">
            <span class="cre-t-269-icon-container"><img class="cre-t-269-icon" src="${benefit.icon}" alt="${benefit.alt}" height="24" /></span>
            <span class="cre-t-269-text">${benefit.text}</span>
          </a>
        </div>
      </div>`;
    }

    function addBenefits() {
      if (document.querySelector(".cre-t-269-container")) return;

      var benefits = [
        {
          target: "trial",
          href: "#shopify-section-shop-the-winkbed-warranty",
          text: "365-Night Home Trial",
          alt: "365 night home trial icon",
          icon: "https://v2.crocdn.com/Winkbed/Win262/moon-new.svg",
        },
        {
          target: "shipping",
          href: "#shopify-section-faq-content",
          text: "Free Shipping &amp; Returns",
          alt: "Free shipping and returns icon",
          icon: "https://v2.crocdn.com/Winkbed/Win262/truck-right-new.svg",
        },
        { target: "showrooms", href: "#shopify-section-shop-frames", text: "150+ Showrooms", alt: "150+ showrooms icon", icon: "https://v2.crocdn.com/Winkbed/Win262/location.svg" },
        { target: "warranty", href: "#shopify-section-shop-promise", text: "Lifetime Warranty", alt: "Lifetime warranty icon", icon: "https://v2.crocdn.com/Winkbed/Win262/shield-new.svg" },
        { target: "usa", href: "#shopify-section-shop-hi-touch", text: "Handmade in the U.S.A.", alt: "Handmade in the U.S.A. icon", icon: "https://v2.crocdn.com/Winkbed/test269/homeFinal.svg" },
        { target: "rating", href: "#shopify-section-testimonials", text: "Rated 4.8 stars", alt: "Rated 4.8 stars icon", icon: "https://v2.crocdn.com/Winkbed/Win262/start.svg" },
      ];

      var benefitsHtml = "";
      benefits.forEach(function (benefit, index) {
        benefitsHtml += getBenefitHtml(benefit, index);
      });

      var html = `<div class="cre-t-269-container">
        <div class="cre-t-269-wrapper">
          <div role="list" class="cre-t-269-main">${benefitsHtml}</div>
        </div>
      </div>`;

      var benefitsSection = document.querySelector(".order__benefits");
      if (!benefitsSection) return;
      benefitsSection.insertAdjacentHTML("afterbegin", html);
    }

    /* scroll destinations, same as the live mobile test (WIN282) */
    function firstVisible(selectors) {
      for (var i = 0; i < selectors.length; i++) {
        var element = document.querySelector(selectors[i]);
        if (element && element.getBoundingClientRect().height > 0) return element;
      }
      return null;
    }

    /* smooth scroll, then re-measure: content above the target (box section, WIN248 section) changes height while scrolling */
    var scrollTimers = [];
    function scrollToPosition(getTop) {
      scrollTimers.forEach(clearTimeout);
      scrollTimers = [];

      var userScrolled = false;
      var stop = function () {
        userScrolled = true;
      };
      ["wheel", "touchstart", "keydown"].forEach(function (evt) {
        window.addEventListener(evt, stop, { once: true, passive: true });
      });

      window.scrollTo({ top: getTop(), behavior: "smooth" });

      [600, 1200, 2000].forEach(function (delay) {
        scrollTimers.push(
          setTimeout(function () {
            if (userScrolled) return;
            if (Math.abs(window.pageYOffset - getTop()) > 5) {
              window.scrollTo({ top: getTop(), behavior: "smooth" });
            }
          }, delay),
        );
      });
    }

    function scrollToElement(element) {
      if (!element) return;
      scrollToPosition(function () {
        return Math.max(0, Math.round(element.getBoundingClientRect().top + window.pageYOffset - scrollOffset));
      });
    }

    function findFaqQuestion(text) {
      var titles = document.querySelectorAll("#faq-content .concertina__title");
      for (var i = 0; i < titles.length; i++) {
        if (titles[i].textContent.trim().toLowerCase().indexOf(text) === 0) return titles[i];
      }
      return null;
    }

    function openFaqCategory(panel) {
      if (panel.classList.contains("current")) return;

      var categories = document.querySelectorAll("#faq-content .faq__cat");
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].textContent === panel.getAttribute("data-cat")) {
          categories[i].click();
          break;
        }
      }
    }

    function scrollToFaqQuestion(text) {
      var title = findFaqQuestion(text);
      if (!title) {
        scrollToElement(document.querySelector("#shopify-section-faq-content"));
        return;
      }

      var panel = title.closest(".faq__panel");
      if (panel) openFaqCategory(panel);

      var item = title.closest(".concertina");
      if (item) item.classList.add("concertina--open");

      setTimeout(function () {
        scrollToElement(title);
      }, 350);
    }

    function scrollToSectionBottom(selector) {
      var section = document.querySelector(selector);
      if (!section) return;

      scrollToPosition(function () {
        return Math.max(0, Math.round(section.getBoundingClientRect().bottom + window.pageYOffset - 100));
      });
    }

    function scrollToBenefit(target) {
      if (target === "shipping") {
        scrollToFaqQuestion("can i return or exchange");
      } else if (target === "showrooms") {
        scrollToSectionBottom("#shopify-section-shop-frames");
      } else if (target === "rating") {
        scrollToElement(firstVisible(["#shopify-section-testimonials", "#shopify-section-winkbed-featured-review", "#yotpo-reviews"]));
      } else if (target === "usa") {
        scrollToElement(document.querySelector("#shopify-section-shop-hi-touch"));
      } else if (target === "trial") {
        scrollToElement(document.querySelector("#shopify-section-shop-the-winkbed-warranty"));
      } else if (target === "warranty") {
        scrollToElement(document.querySelector("#shopify-section-shop-promise"));
      }
    }

    /* Convert goals: one per benefit + one for any benefit */
    function triggerBenefitGoals(target) {
      var goalIds = {
        rating: "100334805",
        usa: "100334804",
        trial: "100334790",
        shipping: "100334791",
        warranty: "100334793",
        showrooms: "100334792",
      };
      var anyBenefitGoalId = "100334665";

      window._conv_q = window._conv_q || [];
      window._conv_q.push(["triggerConversion", anyBenefitGoalId]);

      if (goalIds[target]) {
        window._conv_q.push(["triggerConversion", goalIds[target]]);
      }

      console.log("[cre-269] benefit clicked:", target, "| any-benefit goal:", anyBenefitGoalId, "| goal:", goalIds[target] || "NOT FOUND", "| _conv_q:", window._conv_q);
    }

    function bindEvents() {
      if (window.cre_269_d_events_bound) return;
      window.cre_269_d_events_bound = true;

      /* capture phase, so the site's own "#" link handler can't change the URL hash */
      document.addEventListener(
        "click",
        function (e) {
          var link = e.target.closest(".cre-t-269-link");
          if (!link) return;

          e.preventDefault();
          e.stopPropagation();
          var target = link.getAttribute("data-cre-target");
          triggerBenefitGoals(target);
          setTimeout(function () {
            scrollToBenefit(target);
          }, 250);
        },
        true,
      );
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