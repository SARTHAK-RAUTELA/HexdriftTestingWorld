(function () {
  try {
    /* Main Variables */
    var debug = 1;
    var variation_name = "cre-t-146";

    /* Helper Library */
    var _$;
    !(function (factory) {
      _$ = factory();
    })(function () {
      var bm = function (s) {
        if (typeof s === "string") {
          this.value = Array.prototype.slice.call(document.querySelectorAll(s));
        }
        if (typeof s === "object") {
          this.value = [s];
        }
      };
      bm.prototype = {
        eq: function (n) {
          this.value = [this.value[n]];
          return this;
        },
        each: function (fn) {
          [].forEach.call(this.value, fn);
          return this;
        },
        log: function () {
          var items = [];
          for (let index = 0; index < arguments.length; index++) {
            items.push(arguments[index]);
          }
          console && console.log(variation_name, items);
        },
        addClass: function (v) {
          var a = v.split(" ");
          return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
              if (i.classList) {
                i.classList.add(a[x]);
              } else {
                i.className += " " + a[x];
              }
            }
          });
        },
        waitForElement: function (selector, trigger, delayInterval, delayTimeout) {
          var interval = setInterval(function () {
            if (_$(selector).value.length) {
              clearInterval(interval);
              trigger();
            }
          }, delayInterval);
          setTimeout(function () {
            clearInterval(interval);
          }, delayTimeout);
        },
      };
      return function (selector) {
        return new bm(selector);
      };
    });
    var helper = _$();

    /* Live Event Listener */
    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      this &&
        this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);
      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
          if (found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    // Insurance Partners Data
    var insurancePartners;

    // Based on domain pathname adding JSON data to variable
    if (window.location.pathname === "/") {
      insurancePartners = [
        {
          dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only",
          partner: "Lemonade",
          classification: "Exceptional",
          mainScore: "4.9",
          total: "9.8",
        },
        {
          dataLabel: "outbound-partner-clicks-Liberty-Mutual-Listing-Only",
          partner: "Liberty Mutual",
          classification: "Excellent",
          mainScore: "4.7",
          total: "9.4",
        },
        {
          dataLabel: "outbound-partner-clicks-Farmers-Listing-Only",
          partner: "Farmers Insurance",
          classification: "Very Good",
          mainScore: "4.4",
          total: "8.8",
        },
        {
          dataLabel: "outbound-partner-clicks-USAA-Listing-Only",
          partner: "USAA",
          classification: "Very Good",
          mainScore: "4.4",
          total: "8.8",
        },
        {
          dataLabel: "outbound-partner-clicks-State-Farm-Listing-Only",
          partner: "State Farm",
          classification: "Good",
          mainScore: "4.2",
          total: "8.4",
        },
        {
          dataLabel: "outbound-partner-clicks-Progressive-Listing-Only",
          partner: "Progressive",
          classification: "Good",
          mainScore: "4.0",
          total: "8.0",
        },
        {
          dataLabel: "outbound-partner-clicks-Allstate-Listing-Only",
          partner: "Allstate",
          classification: "Average",
          mainScore: "3.9",
          total: "7.8",
        },
      ];
    } else if (window.location.pathname === "/home/") {
      insurancePartners = [
        {
          dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only",
          partner: "Lemonade",
          classification: "Exceptional",
          mainScore: "4.9",
          total: "9.8", // 4.9 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Liberty-Mutual-Listing-Only",
          partner: "Liberty Mutual",
          classification: "Excellent",
          mainScore: "4.7",
          total: "9.4",
        },
        {
          dataLabel: "outbound-partner-clicks-Farmers-Listing-Only",
          partner: "Farmers Insurance",
          classification: "Very Good",
          mainScore: "4.4",
          total: "8.8", // 4.4 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-USAA-Listing-Only",
          partner: "USAA",
          classification: "Very Good",
          mainScore: "4.3",
          total: "8.6", // 4.3 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-State-Farm-Listing-Only",
          partner: "State Farm",
          classification: "Very Good",
          mainScore: "4.3",
          total: "8.6", // 4.3 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Progressive-Listing-Only",
          partner: "Progressive",
          classification: "Good",
          mainScore: "4.0",
          total: "8.0", // 4.0 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Allstate-Listing-Only",
          partner: "Allstate",
          classification: "Average",
          mainScore: "3.9",
          total: "7.8", // 3.9 * 2
        },
      ];
    } else if (window.location.pathname === "/comparison/") {
      insurancePartners = [
        {
          dataLabel: "outbound-partner-clicks-Liberty-Mutual-Listing-Only",
          partner: "Liberty Mutual",
          classification: "Exceptional",
          mainScore: "4.9",
          total: "9.8", // 4.9 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only",
          partner: "Lemonade",
          classification: "Excellent",
          mainScore: "4.7",
          total: "9.4", // 4.7 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Farmers-Listing-Only",
          partner: "Farmers Insurance",
          classification: "Very Good",
          mainScore: "4.4",
          total: "8.8", // 4.4 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-USAA-Listing-Only",
          partner: "USAA",
          classification: "Very Good",
          mainScore: "4.4",
          total: "8.8", // 4.4 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-State-Farm-Listing-Only",
          partner: "State Farm",
          classification: "Good",
          mainScore: "4.2",
          total: "8.4", // 4.2 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Progressive-Listing-Only",
          partner: "Progressive",
          classification: "Good",
          mainScore: "4.0",
          total: "8.0", // 4.0 * 2
        },
        {
          dataLabel: "outbound-partner-clicks-Allstate-Listing-Only",
          partner: "Allstate",
          classification: "Average",
          mainScore: "3.9",
          total: "7.8", // 3.9 * 2
        },
      ];
    }
    /* REUSABLE HTML GENERATOR FUNCTION */
    function getInsuranceHtml(data) {
      return `
        <div class="cre-t-146-container" croDataLabel="${data.dataLabel}" croPartner="${data.partner}" crodataclassification="${data.classification}" croMainScore="${data.mainScore}" croTotal="${data.total}">
          <div class="cre-t-146-wrapper">
            <div class="cre-t-146-reviews">
              <div class="cre-t-146-review-top">
                <div class="cre-t-146-top-content1">
                  <div class="cre-t-146-top-content1-text">
                    <span class="cre-t-146-total">${data.total}</span>
                    <span class="cre-t-146-star">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                        <path d="M3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#00C481" />
                      </svg>
                    </span>
                    <span class="cre-t-146-classification">${data.classification}</span>
                  </div>
                  <div class="cre-t-146-top-content1-mobile">
                    <div class="cre-t-146-classification">${data.classification}</div>
                    <div class="cre-t-146-top-content2-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
                        <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="cre-t-146-top-content2">
                  <div class="cre-t-146-top-content2-text">Renters Insurance Gurus Score</div>
                  <div class="cre-t-146-top-content2-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
                      <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function updateInsuranceData(data, item) {
      const container = item && item.querySelector(".cre-t-146-container");
      if (!container) return;

      // Top score & classification
      container.querySelector(".cre-t-146-total").textContent = data.total;
      container.querySelectorAll(".cre-t-146-classification").forEach((el) => {
        el.textContent = data.classification;
      });
    }

    function insurancePartnersFunctionality() {
      var listItemsSection = document.querySelectorAll("#comparison-section .oxy-dynamic-list > [data-unique]");

      listItemsSection.forEach(function (item) {
        var listItemLabel = item.getAttribute("data-unique");
        if (!listItemLabel) return;

        var matchedData = insurancePartners.find(function (data) {
          return data.dataLabel === listItemLabel;
        });

        if (!matchedData) return;

        var existingContainer = item.querySelector(".cre-t-146-container");

        // If container already exists → update data
        if (existingContainer) {
          updateInsuranceData(matchedData, item);
          return;
        }

        // Otherwise → insert HTML
        var trustpilotImage = item.querySelector(".ct-image.trustpilot-image");
        if (!trustpilotImage) return;

        trustpilotImage.parentElement?.classList.add("cre-t-146-container-parent");

        var insuranceHtml = getInsuranceHtml(matchedData);
        trustpilotImage.insertAdjacentHTML("afterend", insuranceHtml);
      });
    }

    /**
     * Monitors network activity to detect dynamic content updates (AJAX/Fetch).
     * Specifically looks for '/v1/quotes' API calls. When a fetch is detected:
     * It removes any previously injected custom review containers to prevent duplicates.
     * (insurancePartnersFunctionality & renderLibertyMutual) as the new data loads into the DOM with second time force insertion.
     */
    function fetchDetect() {
      var performanceObserver = new PerformanceObserver((list) => {
        var entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "resource" && entry.initiatorType === "fetch") {
            if (entry.name.includes("/v1/quotes")) {
              var forceInsertion2 = setInterval(function () {
                insurancePartnersFunctionality();
              }, 250);

              setTimeout(function () {
                clearInterval(forceInsertion2);
              }, 5000);
            }
          }
        });
      });
      performanceObserver.observe({ entryTypes: ["resource"] });
    }

    /* Initialize Variation */
    function init() {
      _$("body").addClass(variation_name);

      if (!window.cre_t_146_EventHandler) {
        window.cre_t_146_EventHandler = true;
        // call fetchDetect to monitor network activity
        fetchDetect();

        // using setInterval to force insertion the contents of insurancePartnersFunctionality every 250ms for 10 seconds
        var forceInsertion = setInterval(function () {
          insurancePartnersFunctionality();
        }, 250);
        setTimeout(function () {
          clearInterval(forceInsertion);
        }, 10000);
      }
    }

    /* Wait for Element to Load and Initialize */
    helper.waitForElement("#comparison-section", init, 25, 25000);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();