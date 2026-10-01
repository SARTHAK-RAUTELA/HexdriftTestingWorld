(function () {
    try {
        var debug = 1;
        var variation_name = "cre-t-276-control";

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
                if (window.CRE276_helpers) {
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

            const updatedCart = await fetch("/cart/add.js", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ id: targetVariant.id, quantity }] }),
            }).then((res) => res.json());

            return updatedCart;
        }

        function modalInsertion() {
            var modalHtml = `
        <div class="cre-t-276-modal-overlay" role="dialog" aria-label="Free limited-time offer" style="display: none;"></div>
        <div class="cre-t-276-modal-container" role="dialog" aria-label="Free limited-time offer" style="display: none;">
          <div class="cre-t-276-modal-wrapper">
            <div class="cre-t-276-snow-bg cre-t-276-snow-top-left"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLeft.svg" alt="Snowflake decoration1" /></div>
            <div class="cre-t-276-snow-bg cre-t-276-snow-top-large"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopLarge.svg" alt="Snowflake decoration2" /></div>
            <div class="cre-t-276-snow-bg cre-t-276-snow-top-right"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowTopRight.svg" alt="Snowflake decoration3" /></div>
            <div class="cre-t-276-snow-bg cre-t-276-snow-bottom-large"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomLarge.svg" alt="Snowflake decoration4" /></div>
            <div class="cre-t-276-snow-bg cre-t-276-snow-bottom-right"><img src="https://v2.crocdn.com/Winkbed/WIN257/snowBottomRight.svg" alt="Snowflake decoration5" /></div>
            <div class="cre-t-276-modal-close" role="button" tabindex="0"><img src="https://v2.crocdn.com/Winkbed/WIN257/Close.svg" alt="Close" /></div>
            <div class="cre-t-276-content">
              <div class="cre-t-276-content-wrap">
                <div class="cre-t-276-eyebrow" role="text">FREE LIMITED-TIME OFFER</div>
                <div class="cre-t-276-title" role="heading">We'll upgrade your mattress with Frost&trade; Cooling Fabric Free</div>
                <div class="cre-t-276-description" role="text">Complete your order today and we'll upgrade your mattress with our premium cooling fabric, designed to <span class="cre-t-276-description__bold">sleep up to 20% cooler</span> with advanced cooling fibers sewn directly into the cover.</div>
                <div class="cre-t-276-price-line" role="text">Regularly <span class="cre-t-276-price-line__strike">$125</span>. Yours free. Ends tonight at 11:59 PM.</div>
                <div class="cre-t-276-cta" role="button" tabindex="0">
                  <div class="cre-t-276-cta-text">UPGRADE MY MATTRESS FOR FREE</div>
                  <div class="cre-t-276-spinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

            if (!document.querySelector(".cre-t-276-modal-overlay")) {
                insertBeforeEnd("body", modalHtml);
                // WIN276 goal 100334580 is pushed from init(); WIN257's 100334268 removed (BUG-09).
            }
        }

        function eventHandler() {
            live(".cre-t-276-modal-close", "click", function () {
                document.body.classList.remove("cre-t-276-modal-open");
            });
            live(".cre-t-276-modal-overlay", "click", function () {
                document.body.classList.remove("cre-t-276-modal-open");
            });
            live(".cre-t-276-cta", "click", async function () {
                document.body.classList.add("cre-t-276-cta-clicked");
                await upgradeWinkbedToFrostCooling();
                window.location.href = "https://www.winkbeds.com/discount/FROST8UYR31?redirect=/checkout";
            });
        }

        function init() {
            waitForHelpers(function () {
                if (window.CRE276_helpers.cameFromCheckout()) {
                    if (document.body.classList.contains(variation_name)) return;
                    document.body.classList.add(variation_name);
                    document.body.classList.add("cre-t-276-modal-open");
                    modalInsertion();
                    window._conv_q = window._conv_q || [];
                    _conv_q.push(["triggerConversion", "100334580"]);

                    if (!window.cre276ControlEventHandler) {
                        window.cre276ControlEventHandler = true;
                        eventHandler();
                        window.CRE276_helpers.removeCheckoutCookie();
                    }
                }
            });
        }

        waitForElement("body", init, 50, 15000);
    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();