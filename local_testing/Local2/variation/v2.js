(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-257";

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

    /**
     * Inserts HTML content or element before a target element
     * @param {string|HTMLElement} selector - CSS selector string or target element
     * @param {string|HTMLElement} html - HTML string to insert or DOM element
     */
    function insertBeforeEnd(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforeend", html);
      }
    }

    /**
     * Event delegation - Listen for events on dynamically added elements
     * @param {string} selector - CSS selector to match child elements
     * @param {string} event - Event type (e.g., "click", "change", "submit")
     * @param {Function} callback - Function to call when event fires
     * @param {HTMLElement} context - Parent element to attach listener (default: document)
     *
     * Usage Examples:
     * live(".btn-delete", "click", function(e) { console.log("Delete clicked"); });
     * live(".menu-item", "click", function(e) { alert(this.textContent); }, document.getElementById("menu"));
     */
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

    async function upgradeWinkbedToFrostCooling() {
      // 1. Get current cart
      const cart = await fetch("/cart.js").then((res) => res.json());

      // 2. Find WinkBed items in cart — doesn't matter if it already has Frost Cooling or not
      const winkbedItems = cart.items.filter((item) => item.title.toLowerCase().includes("winkbed"));

      // 3. Safety check — abort if not exactly one match
      if (winkbedItems.length !== 1) {
        console.warn(`Found ${winkbedItems.length} WinkBed item(s) in cart. Aborting — this script only runs when there is exactly 1.`);
        return;
      }

      const item = winkbedItems[0];
      // console.log("Target item found:", item.title, "| variant:", item.variant_title);

      // 4. Parse firmness from the product title (must be done BEFORE removal, since we're
      //    about to delete this line item and its data would be gone otherwise)
      const firmnessMap = {
        softer: "Softer",
        "luxury firm": "Luxury Firm",
        firmer: "Firmer",
        plus: "Plus",
      };
      const titleLower = item.product_title.toLowerCase();
      const firmnessKey = Object.keys(firmnessMap).find((k) => titleLower.includes(k));
      if (!firmnessKey) {
        console.error("Could not determine firmness from product title:", item.product_title);
        return;
      }
      const firmness = firmnessMap[firmnessKey];

      // 5. Parse the base size — strip "with Frost Cooling Cover" if it's already there,
      //    since it doesn't matter either way, we always resolve to the Frost Cooling variant
      const baseSize = item.variant_title.replace(/\s*with\s*frost\s*cooling\s*cover\s*$/i, "").trim();

      const quantity = item.quantity;

      // console.log(`Parsed -> firmness: "${firmness}", size: "${baseSize}", qty: ${quantity}`);

      // 6. Remove the original line item NOW (before we've even looked up the replacement)
      await fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.key, quantity: 0 }),
      }).then((res) => res.json());

      // console.log(`Removed original item: ${item.title} (${item.variant_title})`);

      // 7. Fetch the full catalog (same as Vc = products.json used by the theme's Jc())
      const { products } = await fetch("/products.json?limit=150", {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Requested-With": "xmlhttprequest" },
        method: "GET",
      }).then((res) => res.json());

      // 8. Replicate Jc(): find product by handle containing firmness + "winkbed"
      const firmnessSlug = firmness.replace(/\s+/g, "-").toLowerCase();
      const product = products.find((p) => p.handle.toLowerCase().includes(firmnessSlug) && p.handle.toLowerCase().includes("winkbed"));

      if (!product) {
        console.error(`Could not find product for firmness "${firmness}" / type "winkbed". Original item was already removed — cart is now missing this mattress.`);
        return;
      }

      // 9. Replicate Jc(): find variant whose title matches the target size + Frost Cooling Cover
      const targetSize = `${baseSize} with Frost Cooling Cover`;
      const targetVariant = product.variants.find((v) => v.title.toLowerCase() === targetSize.toLowerCase());

      if (!targetVariant) {
        console.error(
          `Could not find variant "${targetSize}" on product "${product.handle}". ` + `Available variants:`,
          product.variants.map((v) => v.title),
          `Original item was already removed — cart is now missing this mattress.`,
        );
        return;
      }

      // console.log("Matched Frost Cooling variant:", targetVariant.title, targetVariant.id, "on", product.handle);

      // 10. Add the matched Frost Cooling variant with the same quantity
      const updatedCart = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: targetVariant.id, quantity }],
        }),
      }).then((res) => res.json());

      // console.log("Added Frost Cooling variant to cart.");
      // console.log("Final cart:", updatedCart);
      return updatedCart;
    }

    /* Variation functions */

    function modalInsertion() {
      var modalHtml = `
        <div class="cre-t-257-modal-overlay" role="dialog" aria-label="Free limited-time offer" style="display: none;"></div>
        <div class="cre-t-257-modal-container" role="dialog" aria-label="Free limited-time offer" style="display: none;">
          <div class="cre-t-257-modal-wrapper">
            <div class="cre-t-257-snow-bg cre-t-257-snow-top-left">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLeft.svg" alt="Snowflake decoration1" />
            </div>
            <div class="cre-t-257-snow-bg cre-t-257-snow-top-large">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLarge.svg" alt="Snowflake decoration2" />
            </div>
            <div class="cre-t-257-snow-bg cre-t-257-snow-top-right">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopRight.svg" alt="Snowflake decoration3" />
            </div>
            <div class="cre-t-257-snow-bg cre-t-257-snow-bottom-large">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomLarge.svg" alt="Snowflake decoration4" />
            </div>
            <div class="cre-t-257-snow-bg cre-t-257-snow-bottom-right">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomRight.svg" alt="Snowflake decoration5" />
            </div>

            <div class="cre-t-257-modal-close" role="button" tabindex="0">
              <img src="https://v2.crocdn.com/Winkbed/WIN257/Close.svg" alt="Close" />
            </div>
            <div class="cre-t-257-content">
              <div class="cre-t-257-content-wrap">
                <div class="cre-t-257-eyebrow" role="text">FREE LIMITED-TIME OFFER</div>
                <div class="cre-t-257-title" role="heading">We'll upgrade your mattress with Frost&trade; Cooling Fabric Free</div>
                <div class="cre-t-257-description" role="text">Complete your order today and we'll upgrade your mattress with our premium cooling fabric, designed to <span class="cre-t-257-description__bold">sleep up to 20% cooler</span> with advanced cooling fibers sewn directly into the cover.</div>
                <div class="cre-t-257-price-line" role="text">Regularly <span class="cre-t-257-price-line__strike">$125</span>. Yours free. Ends tonight at 11:59 PM.</div>
                <div class="cre-t-257-cta" role="button" tabindex="0">
                  <div class="cre-t-257-cta-text">UPGRADE MY MATTRESS FOR FREE</div>
                  <div class="cre-t-257-spinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (!document.querySelector(".cre-t-257-modal-overlay")) {
        insertBeforeEnd("body", modalHtml);
      }
    }

    function eventHandler() {
      // cre-t-257-modal-close
      live(".cre-t-257-modal-close", "click", function () {
        document.body.classList.remove("cre-t-257-modal-open");
      });

      // cre-t-257-modal-overlay
      live(".cre-t-257-modal-overlay", "click", function () {
        document.body.classList.remove("cre-t-257-modal-open");
      });

      // cre-t-257-cta
      live(".cre-t-257-cta", "click", async function () {
        // console.log("cre-t-257-cta clicked");
        document.body.classList.add("cre-t-257-cta-clicked");

        // Usage:
        await upgradeWinkbedToFrostCooling();
        window.location.href = "https://www.winkbeds.com/discount/FROST3S1CFP?redirect=/checkout";
      });
    }

    function removeSessionCookie(name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    function getSessionCookie(name) {
      const cookieString = document.cookie;
      const cookies = cookieString.split("; ");
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) {
          return cookieValue;
        }
      }
      return null;
    }

    /* Variation Init */
    function init() {
      /* start your code here */
      // Your logic here
      if (getSessionCookie("cre_257_checkout_visited") === "true") {
        if (document.body.classList.contains(variation_name)) return;
        document.body.classList.add(variation_name);
        document.body.classList.add("cre-t-257-modal-open");
        modalInsertion();

        if (!window.cre257EventHandler) {
          window.cre257EventHandler = true;
          eventHandler();
          removeSessionCookie("cre_257_checkout_visited");
        }
      }
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();