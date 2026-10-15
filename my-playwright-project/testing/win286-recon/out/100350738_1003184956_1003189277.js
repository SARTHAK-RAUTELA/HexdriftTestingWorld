function(convertContext){ 
(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-286-variation";
    var COOKIE_EXPIRY_DAYS = 30;

    /* ---------- helpers ---------- */

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

    function waitForHelpers(trigger, delayInterval = 50, delayTimeout = 10000) {
      var interval = setInterval(function () {
        if (window.CRE286_helpers) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    function insertBeforeEnd(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforeend", html);
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

    function getCookie(name) {
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    function setSessionCookie(name, value) {
      document.cookie = name + "=" + value + "; path=/;";
    }

    function setPersistentCookie(name, value, days) {
      var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = name + "=" + value + "; expires=" + expires + "; path=/;";
    }

    function clearCookie(name) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    /* ---------- upgrade flow ---------- */

    async function upgradeWinkbedToFrostCooling() {
      const cart = await fetch("/cart.js").then((res) => res.json());
      const winkbedItems = cart.items.filter((item) => item.title.toLowerCase().includes("winkbed"));
      if (winkbedItems.length !== 1) {
        console.warn(`Found ${winkbedItems.length} WinkBed item(s) in cart. Aborting.`);
        return;
      }

      const item = winkbedItems[0];
      const firmnessMap = { softer: "Softer", "luxury firm": "Luxury Firm", firmer: "Firmer", plus: "Plus" };
      const titleLower = item.product_title.toLowerCase();
      const firmnessKey = Object.keys(firmnessMap).find((k) => titleLower.includes(k));
      if (!firmnessKey) {
        console.error("Could not determine firmness from product title:", item.product_title);
        return;
      }
      const firmness = firmnessMap[firmnessKey];
      const baseSize = item.variant_title.replace(/\s*with\s*frost\s*cooling\s*cover\s*$/i, "").trim();
      const quantity = item.quantity;

      await fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.key, quantity: 0 }),
      }).then((res) => res.json());

      const { products } = await fetch("/products.json?limit=150", {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Requested-With": "xmlhttprequest" },
        method: "GET",
      }).then((res) => res.json());

      const firmnessSlug = firmness.replace(/\s+/g, "-").toLowerCase();
      const product = products.find((p) => p.handle.toLowerCase().includes(firmnessSlug) && p.handle.toLowerCase().includes("winkbed"));
      if (!product) {
        console.error(`Could not find product for firmness "${firmness}". Cart is now missing this mattress.`);
        return;
      }

      const targetSize = `${baseSize} with Frost Cooling Cover`;
      const targetVariant = product.variants.find((v) => v.title.toLowerCase() === targetSize.toLowerCase());
      if (!targetVariant) {
        console.error(`Could not find variant "${targetSize}" on product "${product.handle}".`);
        return;
      }

      return await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: targetVariant.id, quantity }] }),
      }).then((res) => res.json());
    }

    /* ---------- modal ---------- */

    function modalInsertion() {
      var modalHtml = `
        <div class="cre-t-286-modal-overlay" role="dialog" aria-label="Free limited-time offer" style="display: none;"></div>
        <div class="cre-t-286-modal-container" role="dialog" aria-label="Free limited-time offer" style="display: none;">
          <div class="cre-t-286-modal-wrapper">
            <div class="cre-t-286-snow-bg cre-t-286-snow-top-left"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLeft.svg" alt="Snowflake decoration1" /></div>
            <div class="cre-t-286-snow-bg cre-t-286-snow-top-large"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLarge.svg" alt="Snowflake decoration2" /></div>
            <div class="cre-t-286-snow-bg cre-t-286-snow-top-right"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopRight.svg" alt="Snowflake decoration3" /></div>
            <div class="cre-t-286-snow-bg cre-t-286-snow-bottom-large"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomLarge.svg" alt="Snowflake decoration4" /></div>
            <div class="cre-t-286-snow-bg cre-t-286-snow-bottom-right"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomRight.svg" alt="Snowflake decoration5" /></div>
            <div class="cre-t-286-modal-close" role="button" tabindex="0"><img src="https://v2.crocdn.com/Winkbed/WIN257/Close.svg" alt="Close" /></div>
            <div class="cre-t-286-content">
              <div class="cre-t-286-content-wrap">
                <div class="cre-t-286-eyebrow" role="text">FREE LIMITED-TIME OFFER</div>
                <div class="cre-t-286-title" role="heading">We'll upgrade your mattress with Frost&trade; Cooling Fabric Free</div>
                <div class="cre-t-286-description" role="text">Complete your order today and we'll upgrade your mattress with our premium cooling fabric, designed to <span class="cre-t-286-description__bold">sleep up to 20% cooler</span> with advanced cooling fibers sewn directly into the cover.</div>
                <div class="cre-t-286-price-line" role="text">Regularly <span class="cre-t-286-price-line__strike">$125</span>. Yours free. Ends tonight at 11:59 PM.</div>
                <div class="cre-t-286-cta" role="button" tabindex="0">
                  <div class="cre-t-286-cta-text">UPGRADE MY MATTRESS FOR FREE</div>
                  <div class="cre-t-286-spinner"></div>
                </div>
                <div class="cre-t-286-cta__disclaimer" role="text">Not ready? Close this offer. Reopen it from the side of your screen.</div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (!document.querySelector(".cre-t-286-modal-overlay")) {
        insertBeforeEnd("body", modalHtml);
      }
    }

    function showModal() {
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);
      document.body.classList.add("cre-t-286-modal-open");
      modalInsertion();

      // Counts only the automatic modal fire, not reopens from the badge
      window._conv_q = window._conv_q || [];
      _conv_q.push(["triggerConversion", ""]);

      ensureHandlers();
      if (window.CRE286_helpers.cameFromCheckout()) window.CRE286_helpers.removeCheckoutCookie();
    }

    // Reopen from the badge. Never called automatically.
    function reopenModal() {
      modalInsertion(); // no-op if already in the DOM
      document.body.classList.remove("cre-t-286-modal-closed");
      document.body.classList.add("cre-t-286-modal-open");
    }

    function dismissModal() {
      setPersistentCookie("cre286_modal_dismissed", "true", COOKIE_EXPIRY_DAYS);
      document.body.classList.remove("cre-t-286-modal-open");
      document.body.classList.add("cre-t-286-modal-closed");
      refreshBadge();
    }

    /* ---------- side badge ---------- */

    function addSideButton() {
      if (document.querySelector(".cre-t-286-side-button-container")) return;
      var sideButtonHtml = `
      <div class="cre-t-286-side-button-container">
          <div class="cre-t-286-side-button" role="button" tabindex="0">
              <div class="cre-t-286-side-button-text">Free Cooling Cover</div>
          </div>
          <div class="cre-t-286-side-button-close" role="button" tabindex="0"></div>
      </div>
      `;
      document.body.insertAdjacentHTML("beforeend", sideButtonHtml);
    }

    function isDismissed() {
      return getCookie("cre286_modal_dismissed") === "true";
    }

    // Badge shows only if: modal was dismissed earlier, user hasn't closed the badge
    // this session, and the cart still holds an eligible mattress.
    async function shouldShowBadge() {
      if (!isDismissed()) return false;
      if (getCookie("cre286_badge_hidden_session") === "true") return false;
      return await window.CRE286_helpers.cartMeetsMattressCondition();
    }

    // Slide-in plays once ever, skipped for reduced-motion users.
    function playFirstAppearance(container) {
      if (getCookie("cre286_badge_seen") === "true") return;
      setPersistentCookie("cre286_badge_seen", "true", COOKIE_EXPIRY_DAYS);
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      container.classList.add("cre-t-286-side-button-animate");
      setTimeout(function () {
        container.classList.remove("cre-t-286-side-button-animate");
      }, 300);
    }

    // Single place that decides whether the badge exists on the page.
    async function refreshBadge() {
      var show = await shouldShowBadge();
      var container = document.querySelector(".cre-t-286-side-button-container");

      if (!show) {
        if (container) container.remove();
        document.body.classList.remove("cre-t-286-modal-closed");
        return;
      }

      if (!container) {
        addSideButton();
        container = document.querySelector(".cre-t-286-side-button-container");
      }
      playFirstAppearance(container);
      document.body.classList.add("cre-t-286-modal-closed");
    }

    function hideBadgeForSession() {
      setSessionCookie("cre286_badge_hidden_session", "true");
      var container = document.querySelector(".cre-t-286-side-button-container");
      if (container) container.remove();
      document.body.classList.remove("cre-t-286-modal-closed");
    }

    // Re-check badge eligibility after any cart change on the current page.
    function watchCartChanges() {
      if (window.cre286CartWatch) return;
      window.cre286CartWatch = true;

      var endpoints = ["/cart/add.js", "/cart/add", "/cart/change.js", "/cart/update.js"];
      var origFetch = window.fetch;
      var timer;

      window.fetch = function (...args) {
        var url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
        var promise = origFetch.apply(this, args);
        if (endpoints.some(function (e) { return url.indexOf(e) !== -1; })) {
          promise
            .then(function () {
              clearTimeout(timer);
              timer = setTimeout(function () {
                if (isDismissed()) refreshBadge();
              }, 500);
            })
            .catch(function () { });
        }
        return promise;
      };
    }

    /* ---------- events ---------- */

    function eventHandler() {
      live(".cre-t-286-modal-close", "click", dismissModal);
      live(".cre-t-286-modal-overlay", "click", dismissModal);

      live(".cre-t-286-cta", "click", async function () {
        clearCookie("cre286_modal_dismissed"); // accepted, so no badge afterwards
        document.body.classList.add("cre-t-286-cta-clicked");
        await upgradeWinkbedToFrostCooling();
        window.location.href = "https://www.winkbeds.com/discount/FROST8UYR31?redirect=/checkout";
      });

      live(".cre-t-286-side-button", "click", reopenModal);
      live(".cre-t-286-side-button-close", "click", function (e) {
        e.stopPropagation();
        hideBadgeForSession();
      });
    }

    function ensureHandlers() {
      if (window.cre286VariationEventHandler) return;
      window.cre286VariationEventHandler = true;
      eventHandler();
    }

    /* ---------- init ---------- */

    function init() {

      waitForHelpers(function () {
        ensureHandlers();
        watchCartChanges();

        // Dismissed before: badge only, never auto-open the modal again.
        if (isDismissed()) {
          refreshBadge();
          return;
        }

        var cohort = window.CRE286_helpers.getActiveCohort();

        if (cohort === "1") {
          showModal();
          return;
        }

        if (cohort === "2") {
          setTimeout(async function () {
            var stillOk =
              !window.CRE286_helpers.hasReachedCheckoutEver() &&
              (await window.CRE286_helpers.cartMeetsMattressCondition());
            if (stillOk) showModal();
          }, 5000);
        }
      });
    }

    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}