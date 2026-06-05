(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-316";

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

    // custom Goal For Add to Cart of Two-Day Two Park Ticket || Add to Cart of Three-Day || Add to Cart of Four Parks and any multi-day product
    function goalTrigger() {
      // Two-Day Two Park Ticket
      live('[data-display-name*="Two-Day Two Park Ticket"] .product-catalog-card__order-button', "click", function () {
        // console.log("Two-Day Two Park Ticket Add to Cart Clicked");

        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_two-day",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });

        //any multi-day product
        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_any_multi-day_product",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
      });

      // Add to Cart of Three-Day
      live('[data-display-name*="Three-Day, Three Park Ticket"] .product-catalog-card__order-button', "click", function () {
        // console.log("Three-Day Ticket Add to Cart Clicked");
        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_three-day",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });

        //any multi-day product
        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_any_multi-day_product",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
      });

      // Add to Cart of Four Parks
      live('[data-display-name*="Four Parks: Unlimited Visits + Free Parking"] .product-catalog-card__order-button', "click", function () {
        // console.log("Four Parks Ticket Add to Cart Clicked");

        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_four_parks",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });

        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_any_multi-day_product",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
      });

      //Add to cart of Single-Day Ticket
      live('[data-display-name*="Single-Day Ticket"] .product-catalog-card__order-button', "click", function () {
        // console.log("Single-Day Ticket Add to Cart Clicked");
        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "sea316_-_add_to_cart_of_single-day_ticket",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
      });
    }

    /* Variation functions */
    function formatPrice(priceText) {
      var priceMatch = priceText.match(/\$([\d,.]+)/);
      if (priceMatch && parseFloat(priceMatch[1].replace(/,/g, ''))) {
        return parseFloat(priceMatch[1].replace(/,/g, '')).toFixed(2);
      } else {
        return 0;
      }
    }

    function applyChanges(controlPriceContainer, multiplier) {
      // console.log(">> Applying changes for " + multiplier + "-Day Ticket");
      if (!controlPriceContainer) return;

      // Update the strike-through price
      var controlStrikeThrough = controlPriceContainer.querySelector(".product-price__price--strikethrough");
      var newStrikeThrough = 0;
      if (controlStrikeThrough) {
        newStrikeThrough = (formatPrice(controlStrikeThrough.textContent) * multiplier).toFixed(2);
      }

      // Update the price per day
      var controlPriceAmount = controlPriceContainer.querySelector(".product-price__per-day-price-total");
      var newPerDayPrice = 0;
      if (controlPriceAmount) {
        newPerDayPrice = formatPrice(controlPriceAmount.textContent);
      }

      var newPriceContainer = `
      <p class="cre-t-316-product-price__price">
        <span class="cre-t-316-product-price__price-container">
          <span class="cre-t-316-product-price__currency-symbol">$</span>
          <span class="cre-t-316-product-price__price-amount">${newPerDayPrice}</span>
          <span class="cre-t-316-product-price__price-term">/ea</span>
        </span>
        <span class="cre-t-316-product-price__price--strikethrough">$${newStrikeThrough}</span>
      </p>
      `;

      var existingPriceContainer = controlPriceContainer.querySelector(".cre-t-316-product-price__price");
      if (!existingPriceContainer && controlPriceContainer) {
        addClass(controlPriceContainer, "cre-t-316-has-price-per-day-hide");
        insertAfter(controlPriceContainer, newPriceContainer);
      }
    }
    

    /* Variation Init */
    function init() {
      /* start your code here */
      // Your logic here
      if (debug) console.log(variation_name + " initialized");

      if (document.body.classList.contains("cre-t-316")) return;
      addClass("body", "cre-t-316");

      var productCatalogCards = document.querySelectorAll(".product-catalog-card");
      productCatalogCards.forEach(function (card) {
        var title = card.querySelector(".product-catalog-card__title");
        var priceTerm = card.querySelector(".product-price__price-term");

        if (priceTerm && priceTerm.textContent.includes("/day")) {
          // Loop through all prices
          var priceAmounts = card.querySelectorAll(".product-price__price");
          priceAmounts.forEach(function (priceAmount) {
            if (title && title.textContent.includes("Two-Day")) {
              applyChanges(priceAmount, 2);
            }

            if (title && title.textContent.includes("Three-Day")) {
              applyChanges(priceAmount, 3);
            }
          });
        }
      });

      if (!window.goalTrigger316) {
        window.goalTrigger316 = true;
        goalTrigger();
      }
    }

    /* Initialise variation */
    waitForElement(".product-catalog-card .product-price__price-amount", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();